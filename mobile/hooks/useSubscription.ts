import { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { getActiveOrLatestSubscription } from '../services/subscriptionService';
import { SubscriptionStatus } from '../types';

export function useSubscription(user: User | null) {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      setSubscription(await getActiveOrLatestSubscription(user.id));
    } catch (subscriptionError) {
      setError(subscriptionError instanceof Error ? subscriptionError.message : 'Unable to load subscription.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    error,
    loading,
    refresh,
    subscription,
  };
}
