import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ScreenShell } from '../components/ScreenShell';
import { colors, spacing } from '../constants/theme';
import { ReplyHistoryItem } from '../types';

interface HistoryScreenProps {
  history: ReplyHistoryItem[];
  loading: boolean;
  onBack: () => void;
  onDelete: (id: string) => Promise<void>;
  saveHistory: boolean;
}

export function HistoryScreen({ history, loading, onBack, onDelete, saveHistory }: HistoryScreenProps) {
  const [copiedId, setCopiedId] = useState('');

  const copyReply = async (item: ReplyHistoryItem) => {
    await Clipboard.setStringAsync(item.generatedReply);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(''), 1400);
  };

  return (
    <ScreenShell scroll={false}>
      <AppButton title="Back" onPress={onBack} variant="ghost" />
      <Text style={styles.title}>History</Text>
      {!saveHistory ? (
        <Card>
          <Text style={styles.emptyTitle}>History is off.</Text>
          <Text style={styles.emptyText}>New replies will not be saved until you turn history back on.</Text>
        </Card>
      ) : null}
      {saveHistory && !loading && history.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No saved replies yet.</Text>
          <Text style={styles.emptyText}>Generated replies will appear here after you use the app.</Text>
        </Card>
      ) : null}
      {loading ? <Text style={styles.loadingText}>Loading history...</Text> : null}
      {saveHistory && history.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.item}>
              <Text numberOfLines={2} style={styles.inputPreview}>
                {item.userInput || item.pastedMessage || 'Tone change'}
              </Text>
              <Text numberOfLines={4} style={styles.replyPreview}>
                {item.generatedReply}
              </Text>
              {copiedId === item.id ? <Text style={styles.copied}>Copied</Text> : null}
              <View style={styles.itemActions}>
                <AppButton title="Copy" onPress={() => copyReply(item)} variant="secondary" />
                <AppButton title="Delete" onPress={() => onDelete(item.id)} variant="danger" />
              </View>
            </Card>
          )}
        />
      ) : null}
    </ScreenShell>
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
  emptyTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.mutedInk,
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 15,
    marginTop: spacing.md,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  item: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inputPreview: {
    color: colors.mutedInk,
    fontSize: 14,
    fontWeight: '800',
  },
  replyPreview: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
  },
  copied: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '900',
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
