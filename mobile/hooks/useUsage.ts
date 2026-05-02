import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  FREE_TEXT_REPLIES_DAILY,
  FREE_VOICE_REPLIES_MONTHLY,
  getOrCreateTodayUsage,
  incrementTextRepliesUsed,
} from '../services/usageService';
import { UsageDaily } from '../types';

export function useUsage(userId: string | undefined, isPro: boolean) {
  const [usage, setUsage] = useState<UsageDaily | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const textLimit = isPro ? Number.POSITIVE_INFINITY : FREE_TEXT_REPLIES_DAILY;
  const voiceLimit = isPro ? Number.POSITIVE_INFINITY : FREE_VOICE_REPLIES_MONTHLY;
  const remainingTextReplies = Math.max(0, textLimit - (usage?.textRepliesUsed ?? 0));

  const refresh = useCallback(async () => {
    if (!userId) {
      setUsage(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      setUsage(await getOrCreateTodayUsage(userId));
    } catch (usageError) {
      setError(usageError instanceof Error ? usageError.message : 'Unable to load usage.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const canUseTextReply = useCallback(
    () => Boolean(usage) && (isPro || remainingTextReplies > 0),
    [isPro, remainingTextReplies, usage],
  );

  const incrementTextReply = useCallback(async () => {
    if (!usage) {
      throw new Error('Usage is not ready yet.');
    }

    const nextUsage = await incrementTextRepliesUsed(usage);
    setUsage(nextUsage);
    return nextUsage;
  }, [usage]);

  return useMemo(
    () => ({
      canUseTextReply,
      error,
      incrementTextReply,
      loading,
      refresh,
      remainingTextReplies,
      textLimit,
      usage,
      voiceLimit,
    }),
    [
      canUseTextReply,
      error,
      incrementTextReply,
      loading,
      refresh,
      remainingTextReplies,
      textLimit,
      usage,
      voiceLimit,
    ],
  );
}
