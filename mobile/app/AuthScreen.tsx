import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ScreenShell } from '../components/ScreenShell';
import { TextArea } from '../components/TextArea';
import { colors, spacing } from '../constants/theme';
import { AuthActionResult } from '../hooks/useAuth';

interface AuthScreenProps {
  error: string;
  loading: boolean;
  onBack: () => void;
  onSignIn: (email: string, password: string) => Promise<AuthActionResult>;
  onSignUp: (email: string, password: string) => Promise<AuthActionResult>;
}

export function AuthScreen({ error, loading, onBack, onSignIn, onSignUp }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async (action: 'signIn' | 'signUp') => {
    if (loading) {
      return;
    }

    setLocalError('');
    setNotice('');

    if (!email.trim() || password.length < 6) {
      setLocalError('Enter an email and a password with at least 6 characters.');
      return;
    }

    const result =
      action === 'signIn' ? await onSignIn(email.trim(), password) : await onSignUp(email.trim(), password);

    if (result.message) {
      setNotice(result.message);
    }
  };

  return (
    <ScreenShell>
      <AppButton title="Back" onPress={onBack} variant="ghost" />
      <Text style={styles.title}>Sign in to keep your replies.</Text>
      <Text style={styles.subtitle}>
        Create an account to track usage and optionally save reply history.
      </Text>

      <Card style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextArea
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          style={styles.singleLine}
          value={email}
        />
        <Text style={styles.label}>Password</Text>
        <TextArea
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
          style={styles.singleLine}
          value={password}
        />
        {localError || error ? <Text style={styles.errorBox}>{localError || error}</Text> : null}
        {notice ? <Text style={styles.noticeBox}>{notice}</Text> : null}
        {loading ? <ActivityIndicator color={colors.primaryDark} /> : null}
        <AppButton disabled={loading} title="Sign In" onPress={() => submit('signIn')} />
        <AppButton
          disabled={loading}
          title="Create Account"
          onPress={() => submit('signUp')}
          variant="secondary"
        />
      </Card>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 40,
    marginTop: spacing.xl,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.md,
  },
  card: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  singleLine: {
    minHeight: 56,
  },
  errorBox: {
    backgroundColor: 'rgba(217,108,95,0.12)',
    borderColor: 'rgba(217,108,95,0.35)',
    borderRadius: 14,
    borderWidth: 1,
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    padding: spacing.md,
  },
  noticeBox: {
    backgroundColor: 'rgba(120,183,165,0.16)',
    borderColor: 'rgba(120,183,165,0.4)',
    borderRadius: 14,
    borderWidth: 1,
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: spacing.md,
  },
});
