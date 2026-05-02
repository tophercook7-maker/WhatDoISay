import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';
import { ReplyMode } from '../types';

const options: Array<{ label: string; value: ReplyMode }> = [
  { label: 'Auto', value: 'auto' },
  { label: 'Text message', value: 'text' },
  { label: 'Work/client', value: 'work' },
  { label: 'Apology', value: 'apology' },
  { label: 'Boundary', value: 'boundary' },
  { label: 'Follow-up', value: 'follow-up' },
];

interface ModeSelectorProps {
  value: ReplyMode;
  onChange: (value: ReplyMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            accessibilityRole="button"
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected ? styles.selected : null]}
          >
            <Text style={[styles.label, selected ? styles.selectedLabel : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selected: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedLabel: {
    color: colors.ink,
  },
});
