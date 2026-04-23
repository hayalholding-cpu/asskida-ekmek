import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BreadHeroArt from "../../components/ui/BreadHeroArt";

const FEATURED_BAKERIES = [
  { id: "1", name: "Anadolu Ekmek Fırını", distance: "200 m" },
  { id: "2", name: "Örnek Fırın", distance: "500 m" },
  { id: "3", name: "Moda Unlu Mamuller", distance: "650 m" },
];

export default function IndexScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#173F77" />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroPanel}>
          <View style={styles.heroTopRow}>
            <Text style={styles.brandTitle}>ASKIDA{"\n"}EKMEK</Text>

            <View style={styles.heroTrust}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#E7BE7A" />
              <Text style={styles.heroTrustText}>
                İstanbul{"\n"}Fırıncılar Odası
              </Text>
            </View>
          </View>

          <View style={styles.heroCtaBlock}>
            <Text style={styles.heroCtaHeading}>ASKIYA EKMEK BIRAK</Text>

            <Pressable
              style={styles.heroCtaPressable}
              onPress={() => router.push("/urun-birak")}
            >
              <View style={styles.heroCtaShell}>
                <LinearGradient
                  colors={["#F28B3E", "#DD6E28"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroCtaButton}
                >
                  <View style={styles.heroCtaHighlight} />
                  <View style={styles.heroCtaPlate}>
                    <BreadHeroArt />
                  </View>

                  <View style={styles.heroCtaArrow}>
                    <Ionicons name="arrow-forward" size={28} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricMiniCard}>
            <Ionicons name="basket-outline" size={17} color="#D29139" />
            <Text style={styles.metricMiniValue}>1000</Text>
            <Text style={styles.metricMiniLabel}>Bırakılan ekmek</Text>
          </View>

          <View style={styles.metricMiniCard}>
            <Ionicons name="people-outline" size={17} color="#8A98B2" />
            <Text style={styles.metricMiniValue}>13</Text>
            <Text style={styles.metricMiniLabel}>Ekmek bırakan</Text>
          </View>

          <View style={styles.metricMiniCard}>
            <Ionicons name="heart-outline" size={17} color="#D29139" />
            <Text style={styles.metricMiniValue}>45</Text>
            <Text style={styles.metricMiniLabel}>Ekmek alan</Text>
          </View>
        </View>

        <View style={styles.impactCard}>
          <View style={styles.impactRow}>
            <BreadHeroArt compact />
            <View style={styles.impactTextWrap}>
              <Text style={styles.impactValue}>12.500+ EKMEK</Text>
              <Text style={styles.impactLabel}>EKMEK PAYLAŞILDI</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ANLAŞMALI FIRINLAR</Text>
          <Pressable onPress={() => router.push("/harita")}>
            <Text style={styles.sectionLink}>Haritada gör</Text>
          </Pressable>
        </View>

        <View style={styles.bakeryRow}>
          {FEATURED_BAKERIES.map((bakery, index) => (
            <View key={bakery.id} style={styles.bakeryCard}>
              <View
                style={[
                  styles.bakeryImage,
                  index === 1 ? styles.bakeryImageAlt : null,
                  index === 2 ? styles.bakeryImageSoft : null,
                ]}
              >
                <BreadHeroArt compact />
              </View>
              <Text style={styles.bakeryName} numberOfLines={2}>
                {bakery.name}
              </Text>
              <Text style={styles.bakeryMeta}>{bakery.distance}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.footerBand} onPress={() => router.push("/firinci")}>
          <View>
            <Text style={styles.footerBandKicker}>FIRINCI PANELİ</Text>
            <Text style={styles.footerBandTitle}>Fırıncı mısınız?</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#173F77" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    gap: 14,
  },

  heroPanel: {
    backgroundColor: "#173F77",
    borderRadius: 30,
    padding: 18,
    shadowColor: "#173F77",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  brandTitle: {
    fontSize: 24,
    lineHeight: 25,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  heroTrust: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 2,
  },

  heroTrustText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    color: "#DCE6F5",
    textAlign: "right",
  },

  heroCtaBlock: {
    gap: 10,
  },

  heroCtaHeading: {
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.7,
  },

  heroCtaPressable: {
    borderRadius: 34,
  },

  heroCtaShell: {
    backgroundColor: "#FFF9F0",
    borderRadius: 30,
    padding: 8,
    shadowColor: "#0F2F59",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  heroCtaButton: {
    minHeight: 120,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(111, 42, 8, 0.16)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: "#A84514",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  heroCtaHighlight: {
    position: "absolute",
    top: 10,
    left: 14,
    right: 14,
    height: 24,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  heroCtaPlate: {
    width: 156,
    height: 82,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B95018",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  heroCtaArrow: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },

  metricMiniCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#E6EBF3",
  },

  metricMiniValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "900",
    color: "#18202B",
  },

  metricMiniLabel: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    color: "#6E7686",
    textAlign: "center",
  },

  impactCard: {
    backgroundColor: "#FFF3E2",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#F2D2A6",
  },

  impactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  impactTextWrap: {
    flex: 1,
  },

  impactValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1C2430",
  },

  impactLabel: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "800",
    color: "#6D5846",
  },

  sectionHeader: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#101828",
    letterSpacing: 0.4,
  },

  sectionLink: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2A5D9C",
  },

  bakeryRow: {
    flexDirection: "row",
    gap: 10,
  },

  bakeryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E6EBF3",
  },

  bakeryImage: {
    height: 76,
    borderRadius: 16,
    backgroundColor: "#B98553",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  bakeryImageAlt: {
    backgroundColor: "#D6A063",
  },

  bakeryImageSoft: {
    backgroundColor: "#C6924F",
  },

  bakeryName: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    color: "#111827",
  },

  bakeryMeta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#667085",
  },

  footerBand: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EAF1FB",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#D5E0F1",
  },

  footerBandKicker: {
    fontSize: 10,
    fontWeight: "900",
    color: "#2A5D9C",
    letterSpacing: 0.6,
  },

  footerBandTitle: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
    color: "#173F77",
  },
});
