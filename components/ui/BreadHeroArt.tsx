import React from "react";
import { Image, StyleSheet, View } from "react-native";

type Props = {
  compact?: boolean;
};

const BREAD_IMAGE = require("../../assets/ekmek-cutout-v4.png");

export default function BreadHeroArt({ compact = false }: Props) {
  return (
    <View style={[styles.shell, compact ? styles.shellCompact : null]}>
      <View style={[styles.shadowBase, compact ? styles.shadowBaseCompact : null]} />
      <Image
        source={BREAD_IMAGE}
        resizeMode="contain"
        style={[styles.breadImage, compact ? styles.breadImageCompact : null]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 136,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
  },

  shellCompact: {
    width: 76,
    height: 46,
  },

  shadowBase: {
    position: "absolute",
    bottom: 5,
    width: 88,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(101, 55, 17, 0.18)",
  },

  shadowBaseCompact: {
    width: 48,
    height: 8,
    bottom: 2,
  },

  breadImage: {
    width: 130,
    height: 76,
    transform: [{ rotate: "-6deg" }],
  },

  breadImageCompact: {
    width: 68,
    height: 40,
  },
});
