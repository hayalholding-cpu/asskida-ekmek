import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { SHADOWS } from "../../lib/theme";

export default function IndexScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5E2C4" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.topStrip}>
            <View style={styles.logoCircle}>
              <Text style={styles.logo}>🥖</Text>
            </View>

            <Text style={styles.stripSlogan}>
              Bir ekmek bırak, bir sofraya umut ol.
            </Text>
          </View>

          <Text style={styles.title}>ASKIDA EKMEK</Text>

          <View style={styles.trustCard}>
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            <Text style={styles.trustText}>
              İstanbul Fırıncılar Odası güvencesiyle
            </Text>
          </View>

          <View style={styles.heroImpactCard}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles-outline" size={14} color="#92400E" />
              <Text style={styles.heroBadgeText}>BUGÜN</Text>
            </View>

            <Text style={styles.heroTitle}>Bugün bırakılan ekmek</Text>
            <Text style={styles.heroNumber}>1284</Text>
            <Text style={styles.heroSub}>
              Bugün İstanbul’da askıya bırakılan toplam ekmek
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.smallStatCard}>
              <View style={styles.smallIconWrap}>
                <Ionicons name="layers-outline" size={18} color="#B45309" />
              </View>
              <Text style={styles.smallStatLabel}>Toplam bırakılan</Text>
              <Text style={styles.smallStatNumber}>24.532</Text>
              <Text style={styles.smallStatSub}>uygulama genelinde</Text>
            </View>

            <View style={styles.smallStatCard}>
              <View style={styles.smallIconWrap}>
                <Ionicons
                  name="storefront-outline"
                  size={18}
                  color="#B45309"
                />
              </View>
              <Text style={styles.smallStatLabel}>Şu anda askıda</Text>
              <Text style={styles.smallStatNumber}>482</Text>
              <Text style={styles.smallStatSub}>dağıtılmayı bekliyor</Text>
            </View>
          </View>

          <View style={styles.socialProofCard}>
            <Ionicons name="people-outline" size={18} color="#7C2D12" />
            <Text style={styles.socialProofText}>
              Bugün 214 kişi askıya ekmek bıraktı
            </Text>
          </View>

          <View style={styles.howItWorksCard}>
            <Text style={styles.sectionTitle}>Nasıl Çalışır?</Text>

            <View style={styles.stepItem}>
              <View style={styles.stepNumberWrap}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>Bölgeni seç</Text>
                <Text style={styles.stepDescription}>
                  İlçe ve mahalle bilgini seçerek anlaşmalı fırınlara ulaş.
                </Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumberWrap}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>Fırını belirle</Text>
                <Text style={styles.stepDescription}>
                  Sana uygun noktadaki fırını seç ve işlemi başlat.
                </Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumberWrap}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>Ekmek bırak</Text>
                <Text style={styles.stepDescription}>
                  Ödemeni tamamla, bıraktığın ekmek ihtiyaç sahibine ulaşsın.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonWrap}>
            <PrimaryButton
              title="BİR EKMEK BIRAK"
              onPress={() => router.push("/urun-birak")}
            />
          </View>

          <View style={styles.bakeryCard}>
            <View style={styles.bakeryIconWrap}>
              <Ionicons name="storefront-outline" size={20} color="#92400E" />
            </View>

            <Text style={styles.bakeryCardTitle}>Fırıncı mısınız?</Text>
            <Text style={styles.bakeryCardText}>
              Askı işlemlerini ve günlük hareketleri fırıncı panelinden takip
              edebilirsiniz.
            </Text>

            <View style={styles.bakeryButtonWrap}>
              <PrimaryButton
                title="FIRINCI GİRİŞİ"
                onPress={() => router.push("/firinci-giris")}
              />
            </View>
          </View>

          <Text style={styles.bottomNote}>
            Mahallendeki anlaşmalı fırına ekmek bırak, ihtiyaç sahibine anında
            ulaşsın.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5E2C4",
  },

  scrollContent: {
    paddingBottom: 36,
  },

  container: {
    flex: 1,
    backgroundColor: "#F5E2C4",
    paddingHorizontal: 22,
    paddingTop: 8,
  },

  topStrip: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8C99A",
  },

  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 28,
    backgroundColor: "#FFF4E4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F2C89C",
    marginBottom: 8,
  },

  logo: {
    fontSize: 30,
  },

  stripSlogan: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    paddingHorizontal: 18,
    lineHeight: 21,
  },

  title: {
    textAlign: "center",
    fontSize: 23,
    fontWeight: "900",
    color: "#17223B",
    letterSpacing: 0.4,
    marginBottom: 14,
  },

  trustCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF9",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E8D4B8",
    ...SHADOWS.card,
  },

  trustText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    lineHeight: 20,
  },

  heroImpactCard: {
    width: "100%",
    backgroundColor: "#FFF7E8",
    borderRadius: 22,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8D4B8",
    marginBottom: 14,
    ...SHADOWS.card,
  },

  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FDE7C7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },

  heroBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#92400E",
    letterSpacing: 0.8,
  },

  heroTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#9A3412",
    marginBottom: 6,
    textAlign: "center",
  },

  heroNumber: {
    fontSize: 42,
    fontWeight: "900",
    color: "#F97316",
    lineHeight: 42,
    marginBottom: 6,
  },

  heroSub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  smallStatCard: {
    flex: 1,
    backgroundColor: "#FFFDF9",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E8D4B8",
    alignItems: "center",
    ...SHADOWS.card,
  },

  smallIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF1DD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  smallStatLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#7C2D12",
    textAlign: "center",
    marginBottom: 6,
    minHeight: 32,
  },

  smallStatNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#B45309",
    lineHeight: 24,
    marginBottom: 4,
  },

  smallStatSub: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 15,
  },

  socialProofCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E8",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#F1D0B5",
    marginBottom: 16,
  },

  socialProofText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#7C2D12",
    lineHeight: 18,
  },

  howItWorksCard: {
    width: "100%",
    backgroundColor: "#FFFDF9",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8D4B8",
    ...SHADOWS.card,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#7C2D12",
    marginBottom: 14,
  },

  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  stepNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },

  stepNumber: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  stepTextWrap: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 3,
  },

  stepDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },

  stepDivider: {
    height: 1,
    backgroundColor: "#F1E1C8",
    marginVertical: 12,
    marginLeft: 40,
  },

  buttonWrap: {
    marginTop: 2,
  },

  bakeryCard: {
    width: "100%",
    backgroundColor: "#FFF7E8",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F1D0B5",
    ...SHADOWS.card,
  },

  bakeryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FDE7C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  bakeryCardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#7C2D12",
    marginBottom: 6,
    textAlign: "center",
  },

  bakeryCardText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },

  bakeryButtonWrap: {
    width: "100%",
    marginTop: 14,
  },

  bottomNote: {
    marginTop: 14,
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 12,
  },
});