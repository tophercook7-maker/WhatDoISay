import { StyleSheet, TextInput, TextInputProps } from 'react-native';

import { colors, radius, spacing } from '../constants/theme';

export function TextArea(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      multiline
      placeholderTextColor={colors.mutedInk}
      style={[styles.input, props.style]}
      textAlignVertical="top"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: 'rgba(29,37,51,0.12)',
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 17,
    lineHeight: 24,
    minHeight: 132,
    padding: spacing.md,
  },
});
