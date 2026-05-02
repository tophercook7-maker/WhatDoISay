import { AccountPlan, SubscriptionStatus, UserProfile } from '../types';

export function isProUser(profile: UserProfile | null, subscription: SubscriptionStatus | null) {
  if (subscription?.status === 'active') {
    return subscription.plan === 'pro';
  }

  return profile?.plan === 'pro';
}

export function getAccountPlan(profile: UserProfile | null, subscription: SubscriptionStatus | null): AccountPlan {
  const pro = isProUser(profile, subscription);

  if (subscription?.status === 'active') {
    return {
      isPro: pro,
      label: pro ? 'Pro' : 'Free',
      source: 'subscription',
    };
  }

  if (profile?.plan === 'pro') {
    return {
      isPro: true,
      label: 'Pro',
      source: 'profile',
    };
  }

  return {
    isPro: false,
    label: 'Free',
    source: 'free',
  };
}
