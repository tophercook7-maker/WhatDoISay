export type PlanType = 'free' | 'pro';
export type ModifyActionType = 'shorter' | 'softer' | 'firmer' | 'casual' | 'professional' | 'try-again';

export interface ProfileRow {
  id: string;
  email: string | null;
  plan: PlanType;
  default_tone: string;
  save_history: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  provider: string | null;
  status: string;
  plan: PlanType;
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageRow {
  id: string;
  user_id: string;
  usage_date: string;
  text_replies_used: number;
  voice_replies_used: number;
  credits_used: number;
  created_at: string;
  updated_at: string;
}

export interface UsageSummary {
  textRepliesUsed: number;
  textRepliesLimit: number | null;
  remainingTextReplies: number | null;
  plan: PlanType;
}

export interface GenerateReplyPayload {
  inputType?: 'text' | 'paste' | 'voice';
  mode?: string;
  pastedMessage?: string;
  userInput?: string;
}

export interface ModifyReplyPayload {
  actionType?: ModifyActionType;
  mode?: string;
  originalInput?: string;
  pastedMessage?: string;
  previousReply?: string;
}

export interface Strategy {
  id: 'a' | 'b' | 'c';
  label: string;
  text: string;
}

export interface DontSay {
  trap: string;
  why: string;
}

export interface Rescue {
  strategies: Strategy[];
  dontSay: DontSay;
}
