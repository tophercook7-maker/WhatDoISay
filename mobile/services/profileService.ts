import { supabase } from '../lib/supabase';
import { ReplyMode, UserProfile } from '../types';

interface ProfileRow {
  created_at: string;
  default_tone: ReplyMode;
  email: string | null;
  id: string;
  plan: 'free' | 'pro';
  save_history: boolean;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProfile(data as ProfileRow) : null;
}

export async function updateSaveHistory(userId: string, saveHistory: boolean): Promise<UserProfile> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ save_history: saveHistory })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapProfile(data as ProfileRow);
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    createdAt: row.created_at,
    defaultTone: row.default_tone,
    email: row.email,
    id: row.id,
    plan: row.plan,
    saveHistory: row.save_history,
    updatedAt: row.updated_at,
  };
}
