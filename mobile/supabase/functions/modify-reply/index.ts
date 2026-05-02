import { getAdminClient, requireUser } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, HttpError, jsonResponse } from '../_shared/cors.ts';
import { createReply } from '../_shared/openai.ts';
import { ModifyActionType, ModifyReplyPayload } from '../_shared/types.ts';
import {
  assertCanUseTextReply,
  incrementTextUsage,
  loadAccount,
  saveReplyHistory,
  toUsageSummary,
} from '../_shared/usage.ts';

const ALLOWED_ACTIONS: ModifyActionType[] = ['shorter', 'softer', 'firmer', 'casual', 'professional', 'try-again'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[modify-reply] Function reached');
    console.log('[modify-reply] Authorization header exists:', Boolean(req.headers.get('Authorization') ?? req.headers.get('authorization')));

    if (req.method !== 'POST') {
      throw new HttpError(405, 'Use POST for this request.');
    }

    const user = await requireUser(req);
    console.log('[modify-reply] User verified:', Boolean(user));
    console.log('[modify-reply] User id:', user.id);
    const admin = getAdminClient();
    const account = await loadAccount(admin, user.id);
    const usage = await assertCanUseTextReply(admin, user.id, account.plan);
    const body = (await req.json()) as ModifyReplyPayload;

    const actionType = normalizeAction(body.actionType);
    const previousReply = sanitize(body.previousReply, 4000);
    const originalInput = sanitize(body.originalInput, 4000);
    const pastedMessage = sanitize(body.pastedMessage, 4000);
    const mode = sanitize(body.mode || 'auto', 80);

    if (actionType === 'try-again' && !originalInput && !pastedMessage) {
      throw new HttpError(400, 'Add the original context before trying again.');
    }

    if (actionType !== 'try-again' && !previousReply) {
      throw new HttpError(400, 'Add a reply to modify first.');
    }

    if (previousReply.length + originalInput.length + pastedMessage.length > 4000) {
      throw new HttpError(400, 'That is a little too long. Shorten it and try again.');
    }

    const reply = await createReply(
      actionType === 'try-again'
        ? buildTryAgainMessage({ mode, originalInput, pastedMessage })
        : buildModifyMessage({ actionType, previousReply }),
    );
    const updatedUsage = await incrementTextUsage(admin, usage);

    await saveReplyHistory(admin, {
      actionType,
      generatedReply: reply,
      inputType: pastedMessage ? 'paste' : 'text',
      mode,
      pastedMessage,
      profile: account.profile,
      userId: user.id,
      userInput: originalInput || previousReply,
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

function buildModifyMessage(params: { actionType: ModifyActionType; previousReply: string }) {
  const instructions: Record<ModifyActionType, string> = {
    casual: 'Make this sound like a natural text message.',
    firmer: 'Make this more direct without being rude.',
    professional: 'Make this appropriate for work/client communication.',
    shorter: 'Make this shorter while preserving the meaning.',
    softer: 'Make this gentler but still clear.',
    'try-again': 'Generate a fresh alternate reply.',
  };

  return `${instructions[params.actionType]}\n\nPrevious reply:\n${params.previousReply}\n\nOutput only the revised sendable message.`;
}

function buildTryAgainMessage(params: { mode: string; originalInput: string; pastedMessage: string }) {
  return [
    `Mode: ${params.mode}`,
    params.pastedMessage ? `Message being replied to:\n${params.pastedMessage}` : '',
    params.originalInput ? `User notes:\n${params.originalInput}` : '',
    'Generate a fresh alternate reply. Return one final sendable message only.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function normalizeAction(value: unknown): ModifyActionType {
  if (typeof value === 'string' && ALLOWED_ACTIONS.includes(value as ModifyActionType)) {
    return value as ModifyActionType;
  }

  throw new HttpError(400, 'Choose a valid reply action.');
}

function sanitize(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}
