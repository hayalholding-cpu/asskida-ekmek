import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="firin-sec" />
      <Stack.Screen name="odeme" />
      <Stack.Screen name="basarili" />
    </Stack>
  );
}