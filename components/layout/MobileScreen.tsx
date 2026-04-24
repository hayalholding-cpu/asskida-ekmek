import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

type MobileScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
  withTabBar?: boolean;
};

export default function MobileScreen({
  children,
  scroll = true,
  backgroundColor = "#FFF7ED",
  contentStyle,
  withTabBar = true,
}: MobileScreenProps) {
  const bottomSpace = withTabBar
    ? Platform.OS === "ios"
      ? 92
      : 84
    : Platform.OS === "ios"
    ? 28
    : 24;

  const baseContentStyle: ViewStyle = {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 14 : 10,
    paddingBottom: bottomSpace,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[baseContentStyle, contentStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            alwaysBounceVertical={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, baseContentStyle, contentStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}