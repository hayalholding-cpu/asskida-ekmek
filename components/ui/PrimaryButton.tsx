import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from "../../lib/theme";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        (disabled || loading) && styles.disabled
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.button,
  },

  disabled: {
    opacity: 0.6,
  },

  text: {
    ...TYPOGRAPHY.button,
  },
});