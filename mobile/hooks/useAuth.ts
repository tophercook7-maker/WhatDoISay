import { Session, User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

import { isSupabaseConfigured, supabase } from '../lib/supabase';

export interface AuthActionResult {
  ok: boolean;
  message?: string;
  needsEmailConfirmation?: boolean;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setError('Add your Supabase URL and anon key to .env to enable sign in.');
      setInitializing(false);
      return;
    }

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError(getFriendlyAuthError(sessionError));
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      setError('Supabase is not configured yet.');
      return { ok: false };
    }

    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(getFriendlyAuthError(signInError));
      return { ok: false };
    }

    return { ok: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      setError('Supabase is not configured yet.');
      return { ok: false };
    }

    setError('');
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (signUpError) {
      setError(getFriendlyAuthError(signUpError));
      return { ok: false };
    }

    if (!data.session) {
      return {
        ok: true,
        needsEmailConfirmation: true,
        message: 'Account created. Check your email to confirm your account before signing in.',
      };
    }

    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    setError('');
    setLoading(true);
    const { error: signOutError } = await supabase.auth.signOut();
    setLoading(false);

    if (signOutError) {
      setError(signOutError.message);
    }
  }, []);

  return {
    error,
    initializing,
    isConfigured: isSupabaseConfigured,
    loading,
    session,
    signIn,
    signOut,
    signUp,
    user,
  };
}

function getFriendlyAuthError(error: { message?: string; status?: number }) {
  const message = error.message || 'Something went wrong. Please try again.';
  const normalized = message.toLowerCase();

  if (normalized.includes('email rate limit exceeded') || error.status === 429) {
    return 'Supabase has temporarily limited signup emails for this project. Try again later, or disable email confirmation during development.';
  }

  return message;
}
