import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { colors, spacing } from '../constants/theme';

export function LoadingScreen() {
  return (
    <ScreenShell scroll={false}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.text}>Getting things ready...</Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.muted,
    fontSize: 16,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
