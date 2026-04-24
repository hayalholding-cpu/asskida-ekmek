import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MobileScreen from "../components/layout/MobileScreen";
import { API } from "../lib/api";

const PAYMENT_MODE: "demo" | "live" = "demo";

function cleanText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatPrice(value: number) {
  return `₺${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizeProductType(value: string) {
  const v = value.toLocaleLowerCase("tr-TR");

  if (v.includes("pide")) return "pide";
  if (v.includes("ekmek")) return "ekmek";
  if (v.includes("simit")) return "simit";
  if (v.includes("poğaça") || v.includes("pogaca")) return "pogaca";

  return v || "ekmek";
}

export default function OdemeScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const summary = useMemo(() => {
    const bakeryId = cleanText(params.bakeryId);
    const bakeryName = cleanText(params.bakeryName, "Seçili Fırın");
    const productName = cleanText(params.productName, "Ekmek");
    const productType = normalizeProductType(
      cleanText(params.productType, productName)
    );
    const count = Math.max(1, toNumber(params.count, 1));
    const unitPrice = toNumber(params.unitPrice, 0);
    const totalPriceParam = toNumber(params.totalPrice, 0);
    const totalPrice = totalPriceParam > 0 ? totalPriceParam : count * unitPrice;
    const district = cleanText(params.district);
    const neighborhood = cleanText(params.neighborhood);
    const note = cleanText(params.note);

    return {
      bakeryId,
      bakeryName,
      productName,
      productType,
      count,
      unitPrice,
      totalPrice,
      district,
      neighborhood,
      note,
    };
  }, [params]);

  async function completePayment() {
    if (!summary.bakeryId) {
      Alert.alert(
        "Eksik bilgi",
        "Fırın bilgisi bulunamadı. Lütfen tekrar fırın seç."
      );
      return;
    }

    setLoading(true);

    try {
      if (PAYMENT_MODE === "demo") {
        await new Promise((resolve) => setTimeout(resolve, 650));
        setSuccessVisible(true);
        return;
      }

      const data = await API.mobilePaymentComplete({
        bakeryId: summary.bakeryId,
        bakeryName: summary.bakeryName,
        productType: summary.productType,
        productName: summary.productName,
        count: summary.count,
        totalPrice: summary.totalPrice,
        note: summary.note,
        paymentMode: "live",
        paymentProvider: "virtual-pos",
      });

      if (data?.ok === false) {
        throw new Error(data?.message || "Ödeme işlemi tamamlanamadı.");
      }

      setSuccessVisible(true);
    } catch (error: any) {
      Alert.alert(
        "Ödeme tamamlanamadı",
        error?.message || "İşlem sırasında bir sorun oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  function finishSuccess() {
    setSuccessVisible(false);

    router.replace({
      pathname: "/basarili",
      params: {
        bakeryId: summary.bakeryId,
        bakeryName: summary.bakeryName,
        productName: summary.productName,
        productType: summary.productType,
        count: String(summary.count),
        totalPrice: String(summary.totalPrice),
        paymentMode: PAYMENT_MODE,
      },
    });
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6A00" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ödeme</Text>

        <View style={styles.headerSpacer} />
      </View>

      <MobileScreen
        scroll
        withTabBar={false}
        backgroundColor="#FFF7ED"
        contentStyle={styles.mobileContent}
      >
        <View style={styles.topCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="card-outline" size={28} color="#FF6A00" />
          </View>

          <Text style={styles.title}>Ekmek bırakma işlemini tamamla</Text>
          <Text style={styles.subtitle}>
            İşlem özetini kontrol et, ardından test ödemesini tamamla.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>İşlem Özeti</Text>

            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{summary.count} adet</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fırın</Text>
            <Text style={styles.infoValue}>{summary.bakeryName}</Text>
          </View>

          {!!(summary.neighborhood || summary.district) && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Konum</Text>
              <Text style={styles.infoValue}>
                {[summary.neighborhood, summary.district]
                  .filter(Boolean)
                  .join(" / ")}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ürün</Text>
            <Text style={styles.infoValue}>{summary.productName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Birim Fiyat</Text>
            <Text style={styles.infoValue}>{formatPrice(summary.unitPrice)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>{formatPrice(summary.totalPrice)}</Text>
          </View>
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Ödeme Yöntemi</Text>

          <View style={styles.paymentMethod}>
            <View style={styles.paymentIcon}>
              <Ionicons name="wallet-outline" size={21} color="#FF6A00" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.paymentName}>Test Ödemesi</Text>
              <Text style={styles.paymentDesc}>
                Sunum için demo ödeme akışı. Canlıda sanal POS entegrasyonuna
                bağlanacak şekilde hazırlandı.
              </Text>
            </View>

            <Ionicons name="checkmark-circle" size={23} color="#16A34A" />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          disabled={loading}
          onPress={completePayment}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>Test Ödemesini Tamamla</Text>
          )}
        </TouchableOpacity>

        <View style={styles.secureRow}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#9B9088" />
          <Text style={styles.secureText}>
            Canlı ödeme aşamasında bu akış sanal POS sağlayıcısına bağlanacaktır.
          </Text>
        </View>
      </MobileScreen>

      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={40} color="#FFFFFF" />
            </View>

            <Text style={styles.successTitle}>İşlem Başarılı</Text>
            <Text style={styles.successText}>
              Test ödeme başarıyla tamamlandı. Ekmek bırakma işlemi demo olarak
              onaylandı.
            </Text>

            <TouchableOpacity style={styles.successButton} onPress={finishSuccess}>
              <Text style={styles.successButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  header: {
    height: 58,
    backgroundColor: "#FF6A00",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  headerSpacer: {
    width: 42,
  },
  mobileContent: {
    paddingTop: 14,
    paddingBottom: 28,
  },
  topCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE1C4",
    shadowColor: "#FF6A00",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "900",
    color: "#312820",
  },
  subtitle: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12.5,
    lineHeight: 18,
    color: "#8E7F72",
  },
  summaryCard: {
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D4",
    padding: 15,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#312820",
  },
  countBadge: {
    borderRadius: 999,
    backgroundColor: "#FFF0DF",
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FF6A00",
  },
  infoRow: {
    minHeight: 31,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 12.5,
    color: "#8E7F72",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 12.5,
    fontWeight: "800",
    color: "#312820",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0E4D8",
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "900",
    color: "#312820",
  },
  totalValue: {
    fontSize: 23,
    fontWeight: "900",
    color: "#FF6A00",
  },
  paymentCard: {
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D4",
    padding: 15,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#312820",
    marginBottom: 10,
  },
  paymentMethod: {
    minHeight: 68,
    borderRadius: 18,
    backgroundColor: "#FFF8EF",
    borderWidth: 1,
    borderColor: "#FFE1C4",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paymentIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#312820",
  },
  paymentDesc: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16,
    color: "#8E7F72",
  },
  payButton: {
    marginTop: 15,
    height: 54,
    borderRadius: 20,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6A00",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  secureRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  secureText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    color: "#9B9088",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30, 22, 16, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successModal: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
  },
  successIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#14532D",
  },
  successText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#5F6F63",
  },
  successButton: {
    marginTop: 20,
    width: "100%",
    height: 52,
    borderRadius: 18,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});