import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

type Bakery = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
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
  initialRegion,
  nearestBakeryId,
  onSelectBakery,
  selectedBakeryId,
  userLocation,
}: Props) {
  return (
    <>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={true}
        rotateEnabled={false}
      >
        {userLocation ? (
          <Circle
            center={userLocation}
            radius={250}
            strokeWidth={1}
            strokeColor="rgba(59,130,246,0.35)"
            fillColor="rgba(59,130,246,0.12)"
          />
        ) : null}

        {bakeries.map((bakery) => {
          const isSelected = selectedBakeryId === bakery.id;
          const isNearest = nearestBakeryId === bakery.id;

          return (
            <Marker
              key={bakery.id}
              coordinate={{
                latitude: bakery.lat,
                longitude: bakery.lng,
              }}
              pinColor={isNearest ? "#16A34A" : "#FF7A0D"}
              title={bakery.name}
              description={bakery.address}
              onPress={() => onSelectBakery(bakery)}
            >
              {isSelected ? (
                <View style={styles.selectedMarker}>
                  <Text style={styles.selectedMarkerText}>📍</Text>
                </View>
              ) : null}
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.mapOverlay}>
        <Text style={styles.mapOverlayText}>
          Yakınındaki anlaşmalı fırınları keşfet
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },

  mapOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(255,247,237,0.94)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  mapOverlayText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C2D12",
    textAlign: "center",
  },

  selectedMarker: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF7ED",
    borderWidth: 2,
    borderColor: "#FF7A0D",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedMarkerText: {
    fontSize: 16,
  },
});
