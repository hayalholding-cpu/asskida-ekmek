import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

type SuccessParams = {
  bakeryName?: string;
  breadCount?: string;
  totalPrice?: string;
};

export default function BasariScreen() {
  const params = useLocalSearchParams<SuccessParams>();

  const bakeryName = String(params.bakeryName ?? "");
  const breadCount = String(params.breadCount ?? "0");
  const totalPrice = String(params.totalPrice ?? "0");

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🍞</Text>
          <Text style={styles.title}>İşlem tamamlandı</Text>
          <Text style={styles.subtitle}>
            {bakeryName} için {breadCount} ekmek bırakıldı.
          </Text>
          <Text style={styles.subtitle}>Toplam tutar: {totalPrice} TL</Text>
          <Text style={styles.message}>Bir sofraya umut oldunuz.</Text>

          <Pressable
            style={styles.button}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.buttonText}>Ana sayfaya dön</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F5F2",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECE5DB",
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1E1E1E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 6,
  },
  message: {
    fontSize: 16,
    color: "#8A5A2B",
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 22,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1E1E1E",
    minHeight: 56,
    borderRadius: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});