import React, { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from "../../lib/theme";

type Props = {
  title: string;
  children: ReactNode;
  rightContent?: ReactNode;
  warm?: boolean;
};

export default function SectionCard({
  title,
  children,
  rightContent,
  warm = false,
}: Props) {
  return (
    <View style={[styles.card, warm && styles.cardWarm]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {rightContent ? <View>{rightContent}</View> : null}
      </View>

      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS["2xl"],
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },

  cardWarm: {
    backgroundColor: COLORS.surfaceWarm,
    borderColor: COLORS.borderStrong,
    ...SHADOWS.warmCard,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  title: {
    ...TYPOGRAPHY.sectionTitle,
  },
});