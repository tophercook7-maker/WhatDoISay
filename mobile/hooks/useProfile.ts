import { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { getProfile, updateSaveHistory } from '../services/profileService';
import { UserProfile } from '../types';

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      setProfile(await getProfile(user.id));
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleSaveHistory = useCallback(async () => {
    if (!user || !profile) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      setProfile(await updateSaveHistory(user.id, !profile.saveHistory));
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'Unable to update settings.');
    } finally {
      setLoading(false);
    }
  }, [profile, user]);

  return {
    error,
    loading,
    profile,
    refresh,
    toggleSaveHistory,
  };
}
