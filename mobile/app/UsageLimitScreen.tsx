import { StyleSheet, Text } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ScreenShell } from '../components/ScreenShell';
import { colors, spacing } from '../constants/theme';

interface UsageLimitScreenProps {
  onBack: () => void;
  onSettings: () => void;
}

export function UsageLimitScreen({ onBack, onSettings }: UsageLimitScreenProps) {
  return (
    <ScreenShell>
      <AppButton title="Back" onPress={onBack} variant="ghost" />
      <Text style={styles.title}>You’re out of free replies today.</Text>
      <Text style={styles.subtitle}>
        Free accounts get 5 text replies per day in this prototype. Tone changes count too.
      </Text>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Plan placeholder</Text>
        <Text style={styles.copy}>
          Paid plans and credit packs will be added later. For now, this screen proves the usage limit flow.
        </Text>
        <AppButton title="View Settings" onPress={onSettings} />
      </Card>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.9,
    lineHeight: 42,
    marginTop: spacing.xl,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 25,
    marginTop: spacing.md,
  },
  card: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  copy: {
    color: colors.mutedInk,
    fontSize: 16,
    lineHeight: 23,
  },
});
