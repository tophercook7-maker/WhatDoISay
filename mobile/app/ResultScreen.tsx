import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { AppButton } from '../components/AppButton';
import { ScreenShell } from '../components/ScreenShell';
import { colors, radius, spacing } from '../constants/theme';
import { ModificationType, RescueResult, Strategy, StrategyId } from '../types';

interface ResultScreenProps {
  error: string;
  loading: boolean;
  onBack: () => void;
  onModify: (type: ModificationType) => Promise<void>;
  onSelectStrategy: (id: StrategyId) => Promise<void>;
  onTryAgain: () => Promise<void>;
  rescue: RescueResult | null;
  selectedStrategyId: StrategyId | null;
}

const refineButtons: Array<{ label: string; type: ModificationType }> = [
  { label: 'Shorter', type: 'shorter' },
  { label: 'Softer', type: 'softer' },
  { label: 'Firmer', type: 'firmer' },
  { label: 'More casual', type: 'casual' },
  { label: 'More formal', type: 'professional' },
];

export function ResultScreen({
  error,
  loading,
  onBack,
  onModify,
  onSelectStrategy,
  onTryAgain,
  rescue,
  selectedStrategyId,
}: ResultScreenProps) {
  const [copiedId, setCopiedId] = useState<StrategyId | null>(null);

  // Auto-select the first strategy on first render so refine controls are immediately available.
  useEffect(() => {
    if (rescue && !selectedStrategyId && rescue.rescue.strategies[0]) {
      onSelectStrategy(rescue.rescue.strategies[0].id);
    }
  }, [rescue, selectedStrategyId, onSelectStrategy]);

  const copyStrategy = async (strategy: Strategy) => {
    await Clipboard.setStringAsync(strategy.text);
    await onSelectStrategy(strategy.id);
    setCopiedId(strategy.id);
    setTimeout(() => setCopiedId(null), 1400);
  };

  const selectedLabel = rescue?.rescue.strategies.find((s) => s.id === selectedStrategyId)?.label ?? '';
  const lowerSelectedLabel = selectedLabel.toLowerCase();

  return (
    <ScreenShell>
      <AppButton title="Back" onPress={onBack} variant="ghost" />
      <Text style={styles.title}>Three ways to send it.</Text>
      <Text style={styles.helper}>Pick the move that fits the moment.</Text>

      {!rescue ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Working on three angles...</Text>
        </View>
      ) : null}

      {rescue?.rescue.strategies.map((strategy) => {
        const isSelected = selectedStrategyId === strategy.id;
        const isCopied = copiedId === strategy.id;
        return (
          <Pressable
            key={strategy.id}
            accessibilityRole="button"
            onPress={() => copyStrategy(strategy)}
            style={({ pressed }) => [
              styles.strategyCard,
              isSelected ? styles.strategyCardSelected : null,
              pressed ? styles.strategyCardPressed : null,
            ]}
          >
            <View style={styles.strategyHeader}>
              <Text style={styles.strategyLabel}>{strategy.label}</Text>
              <Text style={styles.strategyAction}>{isCopied ? 'Copied' : 'Tap to copy'}</Text>
            </View>
            <Text selectable style={styles.strategyText}>
              {strategy.text}
            </Text>
          </Pressable>
        );
      })}

      {rescue?.rescue.dontSay ? (
        <View style={styles.dontSayCard}>
          <Text style={styles.dontSayBadge}>Don't say</Text>
          <Text style={styles.dontSayTrap}>{rescue.rescue.dontSay.trap}</Text>
          <Text style={styles.dontSayWhy}>{rescue.rescue.dontSay.why}</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {selectedStrategyId && rescue ? (
        <>
          <Text style={styles.sectionLabel}>
            {`Refine the ${lowerSelectedLabel || 'selected'} version`}
          </Text>
          <View style={styles.refineGrid}>
            {refineButtons.map((button) => (
              <AppButton
                disabled={loading}
                key={button.type}
                title={button.label}
                onPress={() => onModify(button.type)}
                variant="secondary"
                style={styles.refineButton}
              />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.bottomActions}>
        <AppButton
          disabled={loading}
          title={loading ? 'Working...' : 'New rescue'}
          onPress={onTryAgain}
          variant="secondary"
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginTop: spacing.xl,
  },
  helper: {
    color: colors.muted,
    fontSize: 16,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xs,
    marginVertical: spacing.lg,
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13,
  },
  strategyCard: {
    backgroundColor: colors.card,
    borderColor: 'transparent',
    borderRadius: radius.lg,
    borderWidth: 2,
    marginBottom: spacing.md,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.85,
    shadowRadius: 24,
  },
  strategyCardSelected: {
    borderColor: colors.primary,
  },
  strategyCardPressed: {
    transform: [{ scale: 0.99 }],
  },
  strategyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  strategyLabel: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  strategyAction: {
    color: colors.mutedInk,
    fontSize: 12,
    fontWeight: '700',
  },
  strategyText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
  },
  dontSayCard: {
    backgroundColor: 'rgba(217, 108, 95, 0.12)',
    borderColor: 'rgba(217, 108, 95, 0.45)',
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.lg,
  },
  dontSayBadge: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  dontSayTrap: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  dontSayWhy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
    marginVertical: spacing.md,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  refineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  refineButton: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  bottomActions: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
