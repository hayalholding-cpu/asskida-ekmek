import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BreadHeroArt from "../../components/ui/BreadHeroArt";

function TabLabel({
  children,
  focused,
}: {
  children: string;
  focused: boolean;
}) {
  return <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{children}</Text>;
}

function StandardTabIcon({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconShell, focused && styles.iconShellFocused]}>
      <Ionicons name={name} size={20} color={focused ? "#163E76" : "#96A1B5"} />
    </View>
  );
}

function CreateTabButton({ focused }: { focused: boolean }) {
  return (
    <View style={styles.createWrap}>
      <LinearGradient
        colors={focused ? ["#F8C166", "#E9A046"] : ["#F5D4A0", "#E0B36E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.createButton}
      >
        <View style={styles.createInnerRing}>
          <BreadHeroArt compact />
          <Text style={styles.createButtonText}>EKMEK{"\n"}BIRAK</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarLabel: ({ focused }) => <TabLabel focused={focused}>Ana Sayfa</TabLabel>,
          tabBarIcon: ({ focused }) => <StandardTabIcon name="home" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="harita"
        options={{
          title: "Harita",
          tabBarLabel: ({ focused }) => <TabLabel focused={focused}>Harita</TabLabel>,
          tabBarIcon: ({ focused }) => <StandardTabIcon name="map" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="urun-birak"
        options={{
          title: "Ekmek Bırak",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => <CreateTabButton focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="firinci"
        options={{
          title: "Fırıncı",
          tabBarLabel: ({ focused }) => <TabLabel focused={focused}>Fırıncı</TabLabel>,
          tabBarIcon: ({ focused }) => <StandardTabIcon name="storefront" focused={focused} />,
        }}
      />

      <Tabs.Screen name="yonetim" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    height: 90,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderTopWidth: 0,
    borderRadius: 30,
    shadowColor: "#173F77",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  tabBarItem: {
    paddingHorizontal: 0,
  },

  iconShell: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  iconShellFocused: {
    backgroundColor: "#EEF4FB",
  },

  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    color: "#98A2B3",
    textAlign: "center",
    marginTop: 2,
  },

  tabLabelFocused: {
    color: "#173F77",
  },

  createWrap: {
    marginTop: -30,
    alignItems: "center",
    justifyContent: "center",
  },

  createButton: {
    width: 124,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D59135",
    shadowOpacity: 0.26,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  createInnerRing: {
    width: 112,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.32)",
  },

  createButtonText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
