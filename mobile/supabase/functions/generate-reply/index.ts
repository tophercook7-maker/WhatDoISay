import { getAdminClient, requireUser } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, HttpError, jsonResponse } from '../_shared/cors.ts';
import { createReply } from '../_shared/openai.ts';
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
    console.log('[generate-reply] Function reached');
    console.log('[generate-reply] Authorization header exists:', Boolean(req.headers.get('Authorization') ?? req.headers.get('authorization')));

    if (req.method !== 'POST') {
      throw new HttpError(405, 'Use POST for this request.');
    }

    const user = await requireUser(req);
    console.log('[generate-reply] User verified:', Boolean(user));
    console.log('[generate-reply] User id:', user.id);
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

    const reply = await createReply(buildGenerateMessage({ mode, pastedMessage, userInput }));
    const updatedUsage = await incrementTextUsage(admin, usage);

    await saveReplyHistory(admin, {
      actionType: 'generate',
      generatedReply: reply,
      inputType,
      mode,
      pastedMessage,
      profile: account.profile,
      userId: user.id,
      userInput,
    });

    return jsonResponse({
      reply,
      source: 'openai',
      usage: toUsageSummary(updatedUsage, account.plan),
    });
  } catch (error) {
    return errorResponse(error);
  }
});

function buildGenerateMessage(params: { mode: string; pastedMessage: string; userInput: string }) {
  return [
    `Mode: ${params.mode}`,
    params.pastedMessage ? `Message being replied to:\n${params.pastedMessage}` : '',
    params.userInput ? `User notes:\n${params.userInput}` : '',
    'Return one final sendable message only.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function sanitize(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}
