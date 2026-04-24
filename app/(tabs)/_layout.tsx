import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F97316",
        tabBarInactiveTintColor: "#9A8A7F",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          marginTop: 2,
        },
        tabBarStyle: {
          height: Platform.OS === "ios" ? 78 : 68,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F0E2D6",
        },
      }}
    >
      {/* ANA SAYFA */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* FIRINCI GİRİŞ */}
      <Tabs.Screen
        name="firinci"
        options={{
          title: "Fırıncı Giriş",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* GİZLİ MENÜLER */}
      <Tabs.Screen name="urun-birak" options={{ href: null }} />
      <Tabs.Screen name="yonetim" options={{ href: null }} />
    </Tabs>
  );
}