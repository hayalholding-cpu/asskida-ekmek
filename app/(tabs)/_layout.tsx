import { Tabs } from "expo-router";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function BreadTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.breadWrap, focused && styles.breadWrapFocused]}>
      <Text style={styles.breadEmoji}>🥖</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F97316",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 84,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: "#FFF8EE",
          borderTopWidth: 1,
          borderTopColor: "#EFDCC5",
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingHorizontal: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarLabel: "Ana Sayfa",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="harita"
        options={{
          title: "Harita",
          tabBarLabel: "Harita",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="urun-birak"
        options={{
          title: "Bırak",
          tabBarLabel: "Bırak",
          tabBarIcon: ({ focused }) => <BreadTabIcon focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="firinci"
        options={{
          title: "Fırıncı Giriş",
          tabBarLabel: "Fırıncı Giriş",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="yonetim"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  breadWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#F7C98B",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    borderWidth: 5,
    borderColor: "#FFF8EE",
    shadowColor: "#D97706",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  breadWrapFocused: {
    backgroundColor: "#F97316",
    transform: [{ scale: 1.03 }],
  },

  breadEmoji: {
    fontSize: 28,
  },
});