import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ScreenShell } from '../components/ScreenShell';
import { colors, spacing } from '../constants/theme';
import { GeneratedReply, ModificationType } from '../types';

interface ResultScreenProps {
  error: string;
  loading: boolean;
  onBack: () => void;
  onModify: (type: ModificationType) => Promise<void>;
  onTryAgain: () => Promise<void>;
  reply: GeneratedReply | null;
}

const toneButtons: Array<{ label: string; type: ModificationType }> = [
  { label: 'Shorter', type: 'shorter' },
  { label: 'Softer', type: 'softer' },
  { label: 'Firmer', type: 'firmer' },
  { label: 'More Casual', type: 'casual' },
  { label: 'More Professional', type: 'professional' },
];

export function ResultScreen({ error, loading, onBack, onModify, onTryAgain, reply }: ResultScreenProps) {
  const [copied, setCopied] = useState(false);

  const copyReply = async () => {
    if (!reply) {
      return;
    }

    await Clipboard.setStringAsync(reply.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <ScreenShell>
      <AppButton title="Back" onPress={onBack} variant="ghost" />
      <Text style={styles.title}>Ready to send.</Text>
      <Card style={styles.replyCard}>
        {loading ? <ActivityIndicator color={colors.primaryDark} /> : null}
        <Text selectable style={styles.replyText}>
          {reply?.text ?? 'Your reply will appear here.'}
        </Text>
      </Card>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {copied ? <Text style={styles.copied}>Copied</Text> : null}

      <View style={styles.primaryActions}>
        <AppButton disabled={!reply} title="Copy" onPress={copyReply} />
        <AppButton disabled={loading || !reply} title="Try Again" onPress={onTryAgain} variant="secondary" />
      </View>

      <Text style={styles.sectionLabel}>Modify</Text>
      <View style={styles.toneGrid}>
        {toneButtons.map((button) => (
          <AppButton
            disabled={loading || !reply}
            key={button.type}
            title={button.label}
            onPress={() => onModify(button.type)}
            variant="secondary"
            style={styles.toneButton}
          />
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  replyCard: {
    minHeight: 210,
    justifyContent: 'center',
  },
  replyText: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 32,
  },
  copied: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 15,
    marginTop: spacing.md,
  },
  primaryActions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.sm,
    marginTop: spacing.xl,
  },
  toneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  toneButton: {
    minHeight: 46,
  },
});
