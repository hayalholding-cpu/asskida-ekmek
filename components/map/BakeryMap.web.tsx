import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Bakery = {
  id: string;
  name: string;
  district?: string;
  neighborhood?: string;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Props = {
  bakeries: Bakery[];
  initialRegion: MapRegion;
  nearestBakeryId?: string;
  onSelectBakery: (bakery: Bakery) => void;
  selectedBakeryId: string;
  userLocation: UserLocation | null;
};

export default function BakeryMap({
  bakeries,
  initialRegion: _initialRegion,
  nearestBakeryId,
  onSelectBakery: _onSelectBakery,
  selectedBakeryId,
  userLocation: _userLocation,
}: Props) {
  const selectedBakery =
    bakeries.find((bakery) => bakery.id === selectedBakeryId) || bakeries[0];
  const nearestBakery =
    bakeries.find((bakery) => bakery.id === nearestBakeryId) || null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Harita görünümü web’de sınırlı</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Harita yalnızca mobil cihazlarda gösterilir.</Text>
        <Text style={styles.body}>
          Web bundle artık kırılmadan açılır. Yakındaki fırın bilgilerini aşağıda
          özet olarak görebilirsin.
        </Text>

        {nearestBakery ? (
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>En Yakın</Text>
            <Text style={styles.pillValue}>
              {nearestBakery.name}
              {nearestBakery.district || nearestBakery.neighborhood
                ? ` • ${nearestBakery.district || "-"} / ${nearestBakery.neighborhood || "-"}`
                : ""}
            </Text>
          </View>
        ) : null}

        {selectedBakery ? (
          <View style={styles.selectionBox}>
            <Text style={styles.selectionLabel}>Seçili Fırın</Text>
            <Text style={styles.selectionValue}>{selectedBakery.name}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFF8EE",
    justifyContent: "center",
    padding: 18,
  },

  overlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(255,247,237,0.94)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  overlayText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C2D12",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "#F3D4AD",
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#17223B",
    textAlign: "center",
    marginBottom: 8,
  },

  body: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
  },

  pill: {
    marginTop: 16,
    backgroundColor: "#FFF1DE",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  pillLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#B45309",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  pillValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7C2D12",
    lineHeight: 20,
  },

  selectionBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3D4AD",
    paddingTop: 12,
  },

  selectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8B5E34",
    marginBottom: 4,
  },

  selectionValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#17223B",
  },
});
