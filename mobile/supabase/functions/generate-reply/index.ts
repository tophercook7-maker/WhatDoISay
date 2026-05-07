import { getAdminClient, requireUser } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, HttpError, jsonResponse } from '../_shared/cors.ts';
import { createRescue } from '../_shared/openai.ts';
import { GenerateReplyPayload } from '../_shared/types.ts';
import {
  assertCanUseTextReply,
  incrementTextUsage,
  loadAccount,
  saveReplyHistory,
  toUsageSummary,
} from '../_shared/usage.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new HttpError(405, 'Use POST for this request.');
    }

    const user = await requireUser(req);
    const admin = getAdminClient();
    const account = await loadAccount(admin, user.id);
    const usage = await assertCanUseTextReply(admin, user.id, account.plan);
    const body = (await req.json()) as GenerateReplyPayload;

    const userInput = sanitize(body.userInput, 4000);
    const pastedMessage = sanitize(body.pastedMessage, 4000);
    const mode = sanitize(body.mode || 'auto', 80);
    const inputType = sanitize(body.inputType || 'text', 20);
    const combinedLength = userInput.length + pastedMessage.length;

    if (combinedLength === 0) {
      throw new HttpError(400, 'Add a little context first.');
    }

    if (combinedLength > 4000) {
      throw new HttpError(400, 'That is a little too long. Shorten it and try again.');
    }

    const rescue = await createRescue(buildRescueMessage({ mode, pastedMessage, userInput }));
    const updatedUsage = await incrementTextUsage(admin, usage);

    // Save the first strategy as the canonical history row. Storing all three would
    // require a schema migration; that is a Phase 2 follow-up.
    await saveReplyHistory(admin, {
      actionType: 'generate',
      generatedReply: rescue.strategies[0]?.text ?? '',
      inputType,
      mode,
      pastedMessage,
      profile: account.profile,
      userId: user.id,
      userInput,
    });

    return jsonResponse({
      rescue,
      source: 'openai',
      usage: toUsageSummary(updatedUsage, account.plan),
    });
  } catch (error) {
    return errorResponse(error);
  }
});

function buildRescueMessage(params: { mode: string; pastedMessage: string; userInput: string }) {
  const perspectiveHints = inferPerspectiveHints(params.userInput, params.pastedMessage);

  return [
    `Mode: ${params.mode}`,
    'Perspective task: First identify who is speaking, who is receiving, who owns the issue, and what outcome is wanted. Do not reverse speaker and recipient.',
    perspectiveHints.length ? `Detected perspective hints:\n${perspectiveHints.map((hint) => `- ${hint}`).join('\n')}` : '',
    params.pastedMessage ? `Message being replied to:\n${params.pastedMessage}` : '',
    params.userInput ? `User notes:\n${params.userInput}` : '',
    'Return JSON with three strategically different replies and a "don\'t say" warning.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function inferPerspectiveHints(userInput: string, pastedMessage: string) {
  const text = `${userInput}\n${pastedMessage}`.toLowerCase();
  const hints: string[] = [];

  if (/\b(my|mine)\b/.test(text) || /\bi\s+(owe|owed|have|still have|need to|will|am|was)\b/.test(text)) {
    hints.push('First-person language is present; preserve I/my/me ownership in the reply.');
  }

  if (/\b(my|#)\s+balance\b/.test(text) || /\bbalance\b/.test(text)) {
    hints.push('A balance is mentioned; do not say "your balance" unless the recipient clearly owns it.');
  }

  if (/\b(outstanding|remaining)\s+balance\b/.test(text) || /\bowe(s|d)?\b/.test(text)) {
    hints.push('Money owed is involved; distinguish an accountable update from a payment demand.');
  }

  if (/thanks?\s+for\s+(being\s+)?patient/.test(text) || /thank you\s+for\s+(being\s+)?patient/.test(text)) {
    hints.push('The desired move includes thanking the recipient for patience.');
  }

  if (/\bby\s+(november|december|january|february|march|april|may|june|july|august|september|october)\b/.test(text)) {
    hints.push('A target month is present; preserve that timing without inventing a new deadline.');
  }

  return hints;
}

function sanitize(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}
