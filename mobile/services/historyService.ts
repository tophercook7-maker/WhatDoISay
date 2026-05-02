import { supabase } from '../lib/supabase';
import { GeneratedReply, ReplyHistoryItem, ReplyMode, ReplyRequest } from '../types';

interface ReplyHistoryRow {
  action_type: GeneratedReply['actionType'];
  created_at: string;
  generated_reply: string;
  id: string;
  input_type: ReplyRequest['inputType'];
  mode: ReplyMode;
  pasted_message: string | null;
  user_id: string;
  user_input: string | null;
}

export async function listReplyHistory(userId: string): Promise<ReplyHistoryItem[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { data, error } = await supabase
    .from('reply_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ReplyHistoryRow[]).map(mapReplyHistory);
}

export async function saveReplyHistory(userId: string, reply: GeneratedReply): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { error } = await supabase.from('reply_history').insert({
    action_type: reply.actionType,
    generated_reply: reply.text,
    input_type: reply.request.inputType,
    mode: reply.request.mode,
    pasted_message: reply.request.pastedMessage || null,
    user_id: userId,
    user_input: reply.request.userInput || null,
  });

  if (error) {
    throw error;
  }
}

export async function deleteReplyHistoryItem(userId: string, id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { error } = await supabase.from('reply_history').delete().eq('id', id).eq('user_id', userId);

  if (error) {
    throw error;
  }
}

export async function deleteAllReplyHistory(userId: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { error } = await supabase.from('reply_history').delete().eq('user_id', userId);

  if (error) {
    throw error;
  }
}

function mapReplyHistory(row: ReplyHistoryRow): ReplyHistoryItem {
  return {
    actionType: row.action_type,
    createdAt: row.created_at,
    generatedReply: row.generated_reply,
    id: row.id,
    inputType: row.input_type,
    mode: row.mode,
    pastedMessage: row.pasted_message,
    userId: row.user_id,
    userInput: row.user_input,
  };
}
