export type AppRoute = 'welcome' | 'auth' | 'main' | 'result' | 'settings' | 'history' | 'usageLimit';

export type PlanType = 'free' | 'pro';

export type InputMode = 'auto' | 'text' | 'work' | 'apology' | 'boundary' | 'follow-up';

export type ReplyMode = InputMode;

export type ModificationType = 'shorter' | 'softer' | 'firmer' | 'casual' | 'professional';

export type ReplyActionType = 'generate' | ModificationType;

export interface ReplyRequest {
  userInput: string;
  pastedMessage?: string;
  mode: InputMode;
  inputType: 'typed' | 'pasted';
}

export interface GeneratedReply {
  id: string;
  text: string;
  request: ReplyRequest;
  actionType: ReplyActionType;
  createdAt: string;
}

export interface AiUsageSummary {
  plan: PlanType;
  remainingTextReplies: number | null;
  textRepliesLimit: number | null;
  textRepliesUsed: number;
}

export interface AiReplyResponse {
  reply: string;
  source: 'openai' | 'mock';
  usage?: AiUsageSummary;
}

export interface UserProfile {
  id: string;
  email: string | null;
  plan: PlanType;
  defaultTone: InputMode;
  saveHistory: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Profile = UserProfile;

export interface UsageDaily {
  id: string;
  userId: string;
  usageDate: string;
  textRepliesUsed: number;
  voiceRepliesUsed: number;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export type DailyUsage = UsageDaily;

export interface ReplyHistoryItem {
  id: string;
  userId: string;
  inputType: ReplyRequest['inputType'];
  userInput: string | null;
  pastedMessage: string | null;
  mode: InputMode;
  generatedReply: string;
  actionType: ReplyActionType;
  createdAt: string;
}

export interface SubscriptionStatus {
  id: string;
  userId: string;
  provider: string | null;
  status: string;
  plan: PlanType;
  renewalDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Subscription = SubscriptionStatus;

export interface AccountPlan {
  isPro: boolean;
  label: 'Free' | 'Pro';
  source: 'profile' | 'subscription' | 'free';
}

// --- Rescue types: multi-strategy replies plus "don't say" warning ---

export type StrategyId = 'a' | 'b' | 'c';

export interface Strategy {
  id: StrategyId;
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

export interface RescueResult {
  id: string;
  rescue: Rescue;
  request: ReplyRequest;
  createdAt: string;
}

export interface AiRescueResponse {
  rescue: Rescue;
  source: 'openai' | 'mock';
  usage?: AiUsageSummary;
}
