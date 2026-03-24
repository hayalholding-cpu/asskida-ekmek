import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() || "http://192.168.1.104:4000";

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function cleanText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function formatProductName(value: string) {
  const v = cleanText(value).toLowerCase();

  if (v === "ekmek") return "Ekmek";
  if (v === "ramazan_pidesi") return "Ramazan Pidesi";
  if (v === "ramazan pidesi") return "Ramazan Pidesi";
  if (v === "simit") return "Simit";
  if (v === "poğaça" || v === "pogaca") return "Poğaça";

  if (!v) return "Ürün";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatPrice(amount: number) {
  return `₺${amount}`;
}

export default function PaymentScreen() {
  const params = useLocalSearchParams();

  const bakeryId = cleanText(params.bakeryId);
  const bakeryName = cleanText(params.bakeryName, "Fırın");
  const productType = cleanText(params.productType, "Ekmek");
  const count = toNumber(params.count, 1);
  const totalPrice = toNumber(params.totalPrice, 0);

  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const summary = useMemo(() => {
    return {
      bakeryId,
      bakeryName,
      productType: formatProductName(productType),
      count: count > 0 ? count : 1,
      totalPrice: totalPrice >= 0 ? totalPrice : 0,
    };
  }, [bakeryId, bakeryName, productType, count, totalPrice]);

  async function handleCompletePayment() {
    if (!summary.bakeryId) {
      Alert.alert("Eksik bilgi", "Fırın bilgisi bulunamadı.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/mobile/payment-complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bakeryId: summary.bakeryId,
          bakeryName: summary.bakeryName,
          productType: summary.productType,
          count: summary.count,
          totalPrice: summary.totalPrice,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.ok === false) {
        throw new Error(data?.message || "Ödeme işlemi tamamlanamadı.");
      }

      setSuccessVisible(true);
    } catch (error: any) {
      Alert.alert(
        "Hata",
        error?.message || "İşlem sırasında bir sorun oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F2EA" />

      <View style={styles.container}>
        <View style={styles.headerArea}>
          <Text style={styles.title}>Ödeme</Text>
          <Text style={styles.subtitle}>Ekmek bırakma işlemini tamamla</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sipariş Özeti</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{summary.count} adet</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fırın</Text>
            <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
              {summary.bakeryName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ürün</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {summary.productType}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Adet</Text>
            <Text style={styles.infoValue}>{summary.count}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalBox}>
            <View>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalHint}>Ödenecek tutar</Text>
            </View>

            <Text style={styles.totalPrice}>
              {formatPrice(summary.totalPrice)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handleCompletePayment}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.payButtonText}>İşlem yapılıyor...</Text>
              </View>
            ) : (
              <Text style={styles.payButtonText}>Ödemeyi Tamamla</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Geri dön</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Text style={styles.successIcon}>✓</Text>
            </View>

            <Text style={styles.successTitle}>İşlem tamamlandı</Text>

            <Text style={styles.successText}>
              Ekmek bırakma işlemin başarıyla tamamlandı.
            </Text>

            <TouchableOpacity
              style={styles.successButton}
              onPress={() => {
                setSuccessVisible(false);
                router.replace("/");
              }}
              activeOpacity={0.9}
            >
              <Text style={styles.successButtonText}>Ana Sayfaya Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F2EA",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    justifyContent: "space-between",
  },

  headerArea: {
    gap: 4,
    marginTop: 2,
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#2B1208",
    letterSpacing: -0.6,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#7A675E",
  },

  card: {
    backgroundColor: "#FFFCF8",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#EEE1D2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 14,
    marginTop: 10,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2B1208",
    letterSpacing: -0.4,
    flex: 1,
  },

  countBadge: {
    backgroundColor: "#F3E8D8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8E6838",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  infoLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8A7A72",
    flex: 1,
  },

  infoValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2B1208",
    textAlign: "right",
    flex: 1.4,
  },

  divider: {
    height: 1,
    backgroundColor: "#EFE3D6",
    marginVertical: 2,
  },

  totalBox: {
    backgroundColor: "#FFF3E1",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9A6A1F",
    marginBottom: 2,
  },

  totalHint: {
    fontSize: 12,
    color: "#AD8A5A",
    fontWeight: "500",
  },

  totalPrice: {
    fontSize: 30,
    fontWeight: "900",
    color: "#D97A00",
    letterSpacing: -0.8,
  },

  bottomArea: {
    gap: 8,
    marginTop: 12,
  },

  payButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#D97A00",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    shadowColor: "#D97A00",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  payButtonDisabled: {
    opacity: 0.72,
  },

  payButtonText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },

  loadingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  backButton: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#8B7A72",
  },

  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(24, 18, 10, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  successCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },

  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EAF8EF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  successIcon: {
    fontSize: 34,
    fontWeight: "900",
    color: "#22B35E",
    marginTop: -2,
  },

  successTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1F2A22",
    marginBottom: 6,
    letterSpacing: -0.4,
  },

  successText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5B675E",
    textAlign: "center",
    marginBottom: 18,
  },

  successButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: "#22B35E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    alignSelf: "stretch",
  },

  successButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});