import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ScreenShell } from '../components/ScreenShell';
import { colors, spacing } from '../constants/theme';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <ScreenShell scroll={false}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>What Do I Say?</Text>
        <Text style={styles.title}>Know exactly what to say.</Text>
        <Text style={styles.subtitle}>
          Type it, paste it, or say it out loud — What Do I Say? turns messy thoughts and awkward
          messages into clear, ready-to-send replies.
        </Text>
      </View>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Simple. Private. Human.</Text>
        <Text style={styles.cardText}>
          Get copy-ready words without a chatbot dashboard, long explanations, or robotic filler.
        </Text>
        <AppButton title="Get Started" onPress={onGetStarted} style={styles.button} />
        <AppButton title="Sign In" onPress={onSignIn} variant="secondary" />
      </Card>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  kicker: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.4,
    lineHeight: 52,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 18,
    lineHeight: 27,
    marginTop: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  cardText: {
    color: colors.mutedInk,
    fontSize: 16,
    lineHeight: 23,
  },
  button: {
    marginTop: spacing.sm,
  },
});
