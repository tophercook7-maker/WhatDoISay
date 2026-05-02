import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

interface CardProps {
  children: ReactNode;
  muted?: boolean;
  style?: ViewStyle;
}

export function Card({ children, muted, style }: CardProps) {
  return <View style={[styles.card, muted ? styles.muted : null, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 28,
  },
  muted: {
    backgroundColor: colors.cardMuted,
  },
});
