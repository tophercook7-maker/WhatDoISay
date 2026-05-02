import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ModeSelector } from '../components/ModeSelector';
import { ScreenShell } from '../components/ScreenShell';
import { TextArea } from '../components/TextArea';
import { colors, spacing } from '../constants/theme';
import { ReplyMode, ReplyRequest } from '../types';

interface MainInputScreenProps {
  error: string;
  loading: boolean;
  onGenerate: (request: ReplyRequest) => Promise<void>;
  onHistory: () => void;
  onSettings: () => void;
  remainingTextReplies: number;
  usageLoading: boolean;
}

export function MainInputScreen({
  error,
  loading,
  onGenerate,
  onHistory,
  onSettings,
  remainingTextReplies,
  usageLoading,
}: MainInputScreenProps) {
  const [userInput, setUserInput] = useState('');
  const [pastedMessage, setPastedMessage] = useState('');
  const [mode, setMode] = useState<ReplyMode>('auto');

  return (
    <ScreenShell>
      <View style={styles.topRow}>
        <Text style={styles.logo}>What Do I Say?</Text>
        <View style={styles.topActions}>
          <AppButton title="History" onPress={onHistory} variant="ghost" style={styles.topButton} />
          <AppButton title="Settings" onPress={onSettings} variant="ghost" style={styles.topButton} />
        </View>
      </View>
      <Text style={styles.title}>What do you need to say?</Text>
      <Text style={styles.helper}>You can be messy. We’ll clean it up.</Text>
      <Text style={styles.usageText}>
        {usageLoading ? 'Checking replies...' : `${remainingTextReplies} free replies left today`}
      </Text>

      <Card style={styles.inputCard}>
        <TextArea
          onChangeText={setUserInput}
          placeholder="Type what happened, what you’re thinking, or what you wish you could say…"
          value={userInput}
        />
        <TextArea
          onChangeText={setPastedMessage}
          placeholder="Paste the message you’re replying to…"
          style={styles.pastedInput}
          value={pastedMessage}
        />
      </Card>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.sectionLabel}>Mode</Text>
      <ModeSelector value={mode} onChange={setMode} />

      <View style={styles.actions}>
        <AppButton
          disabled={loading || usageLoading}
          title={loading ? 'Getting Reply...' : 'Get Reply'}
          onPress={() =>
            onGenerate({
              inputType: pastedMessage ? 'pasted' : 'typed',
              mode,
              pastedMessage,
              userInput,
            })
          }
        />
        <AppButton disabled title="Record" onPress={() => undefined} variant="secondary" />
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Writing a clean reply...</Text>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topActions: {
    flexDirection: 'row',
  },
  logo: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '900',
  },
  topButton: {
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: spacing.xl,
  },
  helper: {
    color: colors.muted,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  usageText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  inputCard: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  pastedInput: {
    minHeight: 96,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
  },
});
