import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ScreenShell } from '../components/ScreenShell';
import { colors, spacing } from '../constants/theme';
import { AccountPlan, SubscriptionStatus, UsageDaily, UserProfile } from '../types';

interface SettingsScreenProps {
  email: string;
  error: string;
  loading: boolean;
  onBack: () => void;
  onDeleteHistory: () => Promise<void>;
  onRunAiConnectionTest: () => Promise<string>;
  onRefreshAccount: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onToggleSaveHistory: () => Promise<void>;
  plan: AccountPlan;
  profile: UserProfile | null;
  textLimit: number;
  subscription: SubscriptionStatus | null;
  usage: UsageDaily | null;
}

export function SettingsScreen({
  email,
  error,
  loading,
  onBack,
  onDeleteHistory,
  onRunAiConnectionTest,
  onRefreshAccount,
  onSignOut,
  onToggleSaveHistory,
  plan,
  profile,
  textLimit,
  subscription,
  usage,
}: SettingsScreenProps) {
  const [aiDiagnostic, setAiDiagnostic] = useState('');
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const saveHistory = profile?.saveHistory ?? true;
  const textRepliesUsed = usage?.textRepliesUsed ?? 0;
  const replyUsageText = Number.isFinite(textLimit) ? `${textRepliesUsed} of ${textLimit} used` : `${textRepliesUsed} used`;
  const remainingText = Number.isFinite(textLimit) ? `${Math.max(0, textLimit - textRepliesUsed)} today` : 'Unlimited in development';

  return (
    <ScreenShell>
      <AppButton title="Back" onPress={onBack} variant="ghost" />
      <Text style={styles.title}>Settings</Text>
      <Card style={styles.card}>
        <Row label="Account email" value={profile?.email || email} />
        <Row label="Plan status" value={plan.label} />
        <Row label="Plan source" value={plan.source === 'subscription' ? 'Active subscription' : 'Profile'} />
        <Row label="Subscription status" value={subscription?.status || 'none'} />
        <Row label="Daily reply usage" value={replyUsageText} />
        <Row label="Remaining replies" value={remainingText} />
        <AppButton disabled={loading} title="Refresh account" onPress={onRefreshAccount} variant="secondary" />
      </Card>

      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.cardTitle}>Save history</Text>
            <Text style={styles.copy}>When off, new replies will not be saved.</Text>
          </View>
          <Switch
            disabled={loading || !profile}
            onValueChange={onToggleSaveHistory}
            thumbColor={saveHistory ? colors.primary : colors.muted}
            value={saveHistory}
          />
        </View>
        <AppButton disabled={loading} title="Delete All History" onPress={onDeleteHistory} variant="danger" />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>AI connection test</Text>
        <Text style={styles.copy}>
          Runs a development check against the real Edge Function path. This may count as a reply when real AI is enabled.
        </Text>
        <AppButton
          disabled={loading || diagnosticLoading}
          title={diagnosticLoading ? 'Testing...' : 'Run AI connection test'}
          onPress={async () => {
            setDiagnosticLoading(true);
            setAiDiagnostic(await onRunAiConnectionTest());
            setDiagnosticLoading(false);
          }}
          variant="secondary"
        />
        {aiDiagnostic ? <Text style={styles.diagnostic}>{aiDiagnostic}</Text> : null}
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton disabled={loading} title="Sign Out" onPress={onSignOut} variant="secondary" />
    </ScreenShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  card: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  copy: {
    color: colors.mutedInk,
    fontSize: 16,
    lineHeight: 24,
  },
  row: {
    borderBottomColor: 'rgba(29,37,51,0.1)',
    borderBottomWidth: 1,
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  rowLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  rowValue: {
    color: colors.mutedInk,
    fontSize: 16,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchCopy: {
    flex: 1,
    paddingRight: spacing.md,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  diagnostic: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(29,37,51,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
    padding: spacing.md,
  },
});
