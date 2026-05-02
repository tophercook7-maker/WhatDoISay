import { FREE_DAILY_TEXT_REPLIES, FREE_MONTHLY_VOICE_REPLIES } from '../constants/limits';
import { supabase } from '../lib/supabase';
import { UsageDaily } from '../types';

export const FREE_TEXT_REPLIES_DAILY = FREE_DAILY_TEXT_REPLIES;
export const FREE_VOICE_REPLIES_MONTHLY = FREE_MONTHLY_VOICE_REPLIES;

interface UsageRow {
  created_at: string;
  credits_used: number;
  id: string;
  text_replies_used: number;
  updated_at: string;
  usage_date: string;
  user_id: string;
  voice_replies_used: number;
}

export async function getOrCreateTodayUsage(userId: string): Promise<UsageDaily> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const usageDate = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('usage_daily')
    .upsert({ user_id: userId, usage_date: usageDate }, { onConflict: 'user_id,usage_date' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapUsage(data as UsageRow);
}

export async function incrementTextRepliesUsed(usage: UsageDaily): Promise<UsageDaily> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { data, error } = await supabase
    .from('usage_daily')
    .update({ text_replies_used: usage.textRepliesUsed + 1 })
    .eq('id', usage.id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapUsage(data as UsageRow);
}

function mapUsage(row: UsageRow): UsageDaily {
  return {
    createdAt: row.created_at,
    creditsUsed: row.credits_used,
    id: row.id,
    textRepliesUsed: row.text_replies_used,
    updatedAt: row.updated_at,
    usageDate: row.usage_date,
    userId: row.user_id,
    voiceRepliesUsed: row.voice_replies_used,
  };
}
