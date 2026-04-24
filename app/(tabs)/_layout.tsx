import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Ana Sayfa" }} />
      <Tabs.Screen name="urun-birak" options={{ title: "Ürün Bırak" }} />
      <Tabs.Screen
        name="firin-sec"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="odeme"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="basarili"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}