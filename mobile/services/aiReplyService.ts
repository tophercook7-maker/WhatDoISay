import { supabase } from '../lib/supabase';
import {
  AiReplyResponse,
  AiRescueResponse,
  ModificationType,
  ReplyRequest,
} from '../types';

export const useMockAi = process.env.EXPO_PUBLIC_USE_MOCK_AI === 'true';
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const isDevelopment = process.env.NODE_ENV !== 'production';

interface GenerateReplyBody {
  inputType: 'text' | 'paste';
  mode: string;
  pastedMessage?: string;
  userInput: string;
}

interface ModifyReplyBody {
  actionType: ModificationType | 'try-again';
  mode?: string;
  originalInput?: string;
  pastedMessage?: string;
  previousReply?: string;
}

export async function generateAiRescue(request: ReplyRequest): Promise<AiRescueResponse> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const body: GenerateReplyBody = {
    inputType: request.inputType === 'pasted' ? 'paste' : 'text',
    mode: request.mode,
    pastedMessage: request.pastedMessage,
    userInput: request.userInput,
  };

  return callRescueEndpoint(body);
}

export async function modifyAiReply(params: {
  actionType: ModificationType | 'try-again';
  originalRequest: ReplyRequest;
  previousReply?: string;
}): Promise<AiReplyResponse> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const body: ModifyReplyBody = {
    actionType: params.actionType,
    mode: params.originalRequest.mode,
    originalInput: params.originalRequest.userInput,
    pastedMessage: params.originalRequest.pastedMessage,
    previousReply: params.previousReply,
  };

  return callModifyEndpoint(body);
}

export async function runAiConnectionTest() {
  if (!supabase) {
    return [
      'Signed in: no',
      'Access token present: no',
      'Edge Function status: not run',
      'Message: Supabase is not configured yet.',
    ].join('\n');
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const baseLines = [
    `Signed in: ${session ? 'yes' : 'no'}`,
    `Access token present: ${session?.access_token ? 'yes' : 'no'}`,
    `User id: ${session?.user?.id ?? 'none'}`,
  ];

  if (sessionError) {
    return [
      ...baseLines,
      'Edge Function status: not run',
      'Message: Could not read your session. Please sign in again.',
    ].join('\n');
  }

  if (!session?.access_token) {
    return [
      ...baseLines,
      'Edge Function status: not run',
      'Message: You are not signed in. Please sign in again.',
    ].join('\n');
  }

  try {
    const response = await callRescueEndpoint({
      inputType: 'text',
      mode: 'auto',
      userInput: 'test message',
    });

    const ok = (response.rescue?.strategies?.length ?? 0) > 0;

    return [
      ...baseLines,
      'Edge Function status: success',
      `Message: ${ok ? 'Rescue returned' : 'No rescue returned'}`,
    ].join('\n');
  } catch (error) {
    return [
      ...baseLines,
      'Edge Function status: failed',
      `Message: ${error instanceof Error ? error.message : 'Unknown error'}`,
    ].join('\n');
  }
}

async function callRescueEndpoint(body: GenerateReplyBody): Promise<AiRescueResponse> {
  const session = await getAuthenticatedSession();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured yet.');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-reply`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
    },
    method: 'POST',
  }).catch(() => {
    throw new Error('Could not reach the AI service.');
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getFriendlyStatusError(response.status, payload?.error));
  }

  if (!payload?.rescue?.strategies?.length) {
    throw new Error('The AI service returned an empty rescue.');
  }

  return payload as AiRescueResponse;
}

async function callModifyEndpoint(body: ModifyReplyBody): Promise<AiReplyResponse> {
  const session = await getAuthenticatedSession();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured yet.');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/modify-reply`, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      apikey: supabaseAnonKey,
    },
    method: 'POST',
  }).catch(() => {
    throw new Error('Could not reach the AI service.');
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getFriendlyStatusError(response.status, payload?.error));
  }

  if (!payload?.reply) {
    throw new Error('The AI service returned an empty reply.');
  }

  return payload as AiReplyResponse;
}

async function getAuthenticatedSession() {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase!.auth.getSession();

  if (isDevelopment) {
    console.log('[aiReplyService] session exists:', Boolean(session));
    console.log('[aiReplyService] access token exists:', Boolean(session?.access_token));
    console.log('[aiReplyService] user id:', session?.user?.id ?? 'none');
  }

  if (sessionError) {
    throw new Error('Could not read your session. Please sign in again.');
  }

  if (!session) {
    throw new Error('You are not signed in. Please sign in again.');
  }

  if (!session.access_token) {
    throw new Error('Your session is missing an access token. Please sign in again.');
  }

  return session;
}

function getFriendlyStatusError(status: number, serverMessage?: string) {
  if (status === 401) {
    return 'Your session expired. Please sign out and sign back in.';
  }

  if (status === 403) {
    return 'You\u2019ve used your free replies for today.';
  }

  if (status === 500) {
    return serverMessage?.startsWith('Server configuration is missing')
      ? serverMessage
      : 'The AI service is not configured correctly yet.';
  }

  return serverMessage || 'Unable to get a reply right now.';
}
