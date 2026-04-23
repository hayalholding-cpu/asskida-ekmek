import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

function BootScreen() {
  return (
    <View style={styles.bootScreen}>
      <View style={styles.bootGlowTop} />
      <View style={styles.bootGlowBottom} />

      <Image
        source={require("../assets/images/splash-icon.png")}
        style={styles.bootLogo}
        resizeMode="contain"
      />

      <View style={styles.bootBadge}>
        <Ionicons name="shield-checkmark" size={14} color="#166534" />
        <Text style={styles.bootBadgeText}>Resmi guvence</Text>
      </View>

      <Text style={styles.bootTitle}>ASKIDA EKMEK</Text>
      <Text style={styles.bootSubtitle}>Uygulama yukleniyor</Text>

      <View style={styles.bootLoadingRow}>
        <ActivityIndicator size="small" color="#B8661F" />
        <Text style={styles.bootLoadingText}>Mahallene sicak destek hazirlaniyor</Text>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [showBootScreen, setShowBootScreen] = useState(true);

  useEffect(() => {
    let active = true;

    async function prepare() {
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (!active) return;

      setAppReady(true);
      await SplashScreen.hideAsync();
    }

    prepare();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!appReady) return;

    const timeout = setTimeout(() => {
      setShowBootScreen(false);
    }, 1100);

    return () => clearTimeout(timeout);
  }, [appReady]);

  if (!appReady || showBootScreen) {
    return <BootScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6E7D0",
    paddingHorizontal: 28,
  },

  bootGlowTop: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(249,115,22,0.12)",
  },

  bootGlowBottom: {
    position: "absolute",
    bottom: -30,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(180,83,9,0.10)",
  },

  bootLogo: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },

  bootBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(22,101,52,0.12)",
    marginBottom: 14,
  },

  bootBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#166534",
    textTransform: "uppercase",
  },

  bootTitle: {
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    color: "#4B220F",
    letterSpacing: -1.2,
    textAlign: "center",
  },

  bootSubtitle: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: "#7A4B22",
    textAlign: "center",
  },

  bootLoadingRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderWidth: 1,
    borderColor: "rgba(191,129,55,0.16)",
  },

  bootLoadingText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    color: "#6B4A2E",
  },
});
