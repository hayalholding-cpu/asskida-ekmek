import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BakeryMap from "../../components/map/BakeryMap";

type Bakery = {
  id: string;
  name: string;
  district: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  breadCount: number;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

const BAKERIES: Bakery[] = [
  {
    id: "1",
    name: "Güneş Fırını",
    district: "Üsküdar",
    neighborhood: "Altunizade",
    address: "Altunizade Mah. Kısıklı Cd. No: 24",
    lat: 41.0216,
    lng: 29.0437,
    breadCount: 18,
  },
  {
    id: "2",
    name: "Bereket Ekmek",
    district: "Kadıköy",
    neighborhood: "Kozyatağı",
    address: "Kozyatağı Mah. Buket Sk. No: 8",
    lat: 40.9722,
    lng: 29.0963,
    breadCount: 11,
  },
  {
    id: "3",
    name: "Yeni Umut Fırını",
    district: "Fatih",
    neighborhood: "Aksaray",
    address: "Aksaray Mah. Turgut Özal Cd. No: 51",
    lat: 41.0114,
    lng: 28.9498,
    breadCount: 23,
  },
  {
    id: "4",
    name: "Simitçi Fırın",
    district: "Beşiktaş",
    neighborhood: "Levent",
    address: "Levent Mah. Büyükdere Cd. No: 112",
    lat: 41.0781,
    lng: 29.0105,
    breadCount: 9,
  },
];

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function formatDistance(km: number) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export default function MapScreen() {
  const router = useRouter();
  const [selectedBakery, setSelectedBakery] = useState<Bakery>(BAKERIES[0]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationReady, setLocationReady] = useState(false);

  const initialRegion = useMemo(
    () => ({
      latitude: 41.015,
      longitude: 28.979,
      latitudeDelta: 0.18,
      longitudeDelta: 0.18,
    }),
    []
  );

  useEffect(() => {
    async function getUserLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLocationReady(true);
          Alert.alert(
            "Konum izni gerekli",
            "En yakın fırını gösterebilmemiz için konum izni vermen gerekiyor."
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.log("Konum alınamadı:", error);
      } finally {
        setLocationReady(true);
      }
    }

    getUserLocation();
  }, []);

  const nearestBakery = useMemo(() => {
    if (!userLocation) return null;

    let nearest = BAKERIES[0];
    let minDistance = getDistanceInKm(
      userLocation.latitude,
      userLocation.longitude,
      nearest.lat,
      nearest.lng
    );

    for (const bakery of BAKERIES) {
      const distance = getDistanceInKm(
        userLocation.latitude,
        userLocation.longitude,
        bakery.lat,
        bakery.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = bakery;
      }
    }

    return {
      bakery: nearest,
      distanceKm: minDistance,
    };
  }, [userLocation]);

  const selectedBakeryDistance = useMemo(() => {
    if (!userLocation) return null;

    return getDistanceInKm(
      userLocation.latitude,
      userLocation.longitude,
      selectedBakery.lat,
      selectedBakery.lng
    );
  }, [userLocation, selectedBakery]);

  function openDirections() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedBakery.lat},${selectedBakery.lng}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Hata", "Yol tarifi açılamadı.");
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7EFE4" />

      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>Anlaşmalı noktalar</Text>
            <Text style={styles.headerTitle}>Yakınındaki Fırınlar</Text>
          </View>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{BAKERIES.length} fırın</Text>
          </View>
        </View>

        {nearestBakery ? (
          <View style={styles.nearestCard}>
            <Text style={styles.nearestLabel}>EN YAKIN FIRIN</Text>
            <Text style={styles.nearestName}>{nearestBakery.bakery.name}</Text>
            <Text style={styles.nearestSub}>
              {nearestBakery.bakery.district} / {nearestBakery.bakery.neighborhood} ·{" "}
              {formatDistance(nearestBakery.distanceKm)}
            </Text>
          </View>
        ) : (
          <View style={styles.nearestCard}>
            <Text style={styles.nearestLabel}>KONUM</Text>
            <Text style={styles.nearestName}>
              {locationReady ? "Konum alınamadı" : "Konum alınıyor..."}
            </Text>
            <Text style={styles.nearestSub}>
              En yakın fırını göstermek için konum bilgisi gerekiyor
            </Text>
          </View>
        )}

        <View style={styles.mapCard}>
          <BakeryMap
            bakeries={BAKERIES}
            initialRegion={initialRegion}
            nearestBakeryId={nearestBakery?.bakery.id}
            onSelectBakery={setSelectedBakery}
            selectedBakeryId={selectedBakery.id}
            userLocation={userLocation}
          />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoTopRow}>
            <View>
              <Text style={styles.infoDistrict}>
                {selectedBakery.district} / {selectedBakery.neighborhood}
              </Text>
              <Text style={styles.infoTitle}>{selectedBakery.name}</Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>Aktif</Text>
            </View>
          </View>

          <Text style={styles.infoAddress}>{selectedBakery.address}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Askıdaki ekmek</Text>
              <Text style={styles.statValue}>{selectedBakery.breadCount}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Uzaklık</Text>
              <Text style={styles.statValue}>
                {selectedBakeryDistance
                  ? formatDistance(selectedBakeryDistance)
                  : "-"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.primaryButton}
            onPress={() => router.push("/urun-birak")}
          >
            <Text style={styles.primaryButtonText}>BU FIRINA BAĞIŞ BIRAK</Text>
            <Text style={styles.primaryButtonArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.secondaryButton}
            onPress={openDirections}
          >
            <Text style={styles.secondaryButtonText}>YOL TARİFİ AL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7EFE4",
  },

  container: {
    flex: 1,
    backgroundColor: "#F7EFE4",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 22,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  headerEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#A16207",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2937",
  },

  headerBadge: {
    backgroundColor: "#FFE7C2",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  headerBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9A3412",
  },

  nearestCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F3D4AD",
    marginBottom: 12,
  },

  nearestLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#B45309",
    letterSpacing: 1.1,
    marginBottom: 6,
  },

  nearestName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#17223B",
    marginBottom: 4,
  },

  nearestSub: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },

  mapCard: {
    height: 420,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EFD4AE",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 14,
  },

  infoCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.2,
    borderColor: "#F7C58A",
    shadowColor: "#D97706",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  infoTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  infoDistrict: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  infoTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#17223B",
    maxWidth: 230,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF3",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 2,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },

  liveBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#15803D",
  },

  infoAddress: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
    marginBottom: 14,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#FFF1DE",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 14,
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  statDivider: {
    width: 1,
    backgroundColor: "#F2C998",
    marginHorizontal: 8,
  },

  statLabel: {
    fontSize: 11,
    color: "#8B5E34",
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },

  statValue: {
    fontSize: 18,
    color: "#9A3412",
    fontWeight: "900",
  },

  primaryButton: {
    height: 58,
    borderRadius: 20,
    backgroundColor: "#FF7A0D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    shadowColor: "#FF7A0D",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 10,
  },

  primaryButtonText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.7,
    textAlign: "center",
    marginLeft: 16,
  },

  primaryButtonArrow: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "700",
    lineHeight: 24,
  },

  secondaryButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFF1DE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F2C998",
  },

  secondaryButtonText: {
    color: "#9A3412",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
