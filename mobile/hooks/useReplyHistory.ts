import { useCallback, useEffect, useState } from 'react';

import {
  deleteAllReplyHistory,
  deleteReplyHistoryItem,
  listReplyHistory,
  saveReplyHistory,
} from '../services/historyService';
import { GeneratedReply, ReplyHistoryItem, UserProfile } from '../types';

export function useReplyHistory(userId: string | undefined, profile: UserProfile | null) {
  const [history, setHistory] = useState<ReplyHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!userId) {
      setHistory([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      setHistory(await listReplyHistory(userId));
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : 'Unable to load history.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveReply = useCallback(
    async (reply: GeneratedReply) => {
      if (!userId || !profile?.saveHistory) {
        return;
      }

      await saveReplyHistory(userId, reply);
      await refresh();
    },
    [profile?.saveHistory, refresh, userId],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!userId) {
        return;
      }

      await deleteReplyHistoryItem(userId, id);
      await refresh();
    },
    [refresh, userId],
  );

  const deleteAll = useCallback(async () => {
    if (!userId) {
      return;
    }

    await deleteAllReplyHistory(userId);
    await refresh();
  }, [refresh, userId]);

  return {
    deleteAll,
    deleteItem,
    error,
    history,
    loading,
    refresh,
    saveReply,
  };
}
