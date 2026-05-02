import { supabase } from '../lib/supabase';
import { PlanType, SubscriptionStatus } from '../types';

interface SubscriptionRow {
  created_at: string;
  id: string;
  plan: PlanType;
  provider: string | null;
  renewal_date: string | null;
  status: string;
  updated_at: string;
  user_id: string;
}

export async function getActiveOrLatestSubscription(userId: string): Promise<SubscriptionStatus | null> {
  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('status', { ascending: true })
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapSubscription(data as SubscriptionRow) : null;
}

function mapSubscription(row: SubscriptionRow): SubscriptionStatus {
  return {
    createdAt: row.created_at,
    id: row.id,
    plan: row.plan,
    provider: row.provider,
    renewalDate: row.renewal_date,
    status: row.status,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}
