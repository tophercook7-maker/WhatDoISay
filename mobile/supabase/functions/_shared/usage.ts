import { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { HttpError } from './cors.ts';
import { PlanType, ProfileRow, SubscriptionRow, UsageRow, UsageSummary } from './types.ts';

const FREE_TEXT_REPLY_LIMIT = 5;

export async function loadAccount(admin: SupabaseClient, userId: string) {
  const [{ data: profile, error: profileError }, { data: subscription, error: subscriptionError }] =
    await Promise.all([
      admin.from('profiles').select('*').eq('id', userId).single(),
      admin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('status', { ascending: true })
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (profileError) {
    throw profileError;
  }

  if (subscriptionError) {
    throw subscriptionError;
  }

  return {
    plan: getEffectivePlan(profile as ProfileRow, subscription as SubscriptionRow | null),
    profile: profile as ProfileRow,
    subscription: subscription as SubscriptionRow | null,
  };
}

export async function assertCanUseTextReply(admin: SupabaseClient, userId: string, plan: PlanType) {
  const usage = await getOrCreateTodayUsage(admin, userId);

  if (plan !== 'pro' && usage.text_replies_used >= FREE_TEXT_REPLY_LIMIT) {
    throw new HttpError(403, 'You’ve used your free replies for today.');
  }

  return usage;
}

export async function incrementTextUsage(admin: SupabaseClient, usage: UsageRow) {
  const { data, error } = await admin
    .from('usage_daily')
    .update({ text_replies_used: usage.text_replies_used + 1 })
    .eq('id', usage.id)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as UsageRow;
}

export function toUsageSummary(usage: UsageRow, plan: PlanType): UsageSummary {
  const limit = plan === 'pro' ? null : FREE_TEXT_REPLY_LIMIT;

  return {
    plan,
    remainingTextReplies: limit === null ? null : Math.max(0, limit - usage.text_replies_used),
    textRepliesLimit: limit,
    textRepliesUsed: usage.text_replies_used,
  };
}

export async function saveReplyHistory(
  admin: SupabaseClient,
  params: {
    actionType: string;
    generatedReply: string;
    inputType?: string;
    mode?: string;
    pastedMessage?: string;
    profile: ProfileRow;
    userId: string;
    userInput?: string;
  },
) {
  if (!params.profile.save_history) {
    return;
  }

  const { error } = await admin.from('reply_history').insert({
    action_type: params.actionType,
    generated_reply: params.generatedReply,
    input_type: params.inputType || 'text',
    mode: params.mode || 'auto',
    pasted_message: params.pastedMessage || null,
    user_id: params.userId,
    user_input: params.userInput || null,
  });

  if (error) {
    throw error;
  }
}

async function getOrCreateTodayUsage(admin: SupabaseClient, userId: string) {
  const usageDate = new Date().toISOString().slice(0, 10);
  const { data, error } = await admin
    .from('usage_daily')
    .upsert({ user_id: userId, usage_date: usageDate }, { onConflict: 'user_id,usage_date' })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as UsageRow;
}

function getEffectivePlan(profile: ProfileRow, subscription: SubscriptionRow | null): PlanType {
  if (subscription?.status === 'active' && subscription.plan === 'pro') {
    return 'pro';
  }

  return profile.plan === 'pro' ? 'pro' : 'free';
}
