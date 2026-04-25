import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MobileScreen from "../components/layout/MobileScreen";

type BakeryItem = {
  id: string;
  name: string;
  district: string;
  neighborhood: string;
  pendingBread: number;
  distance: string;
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL as string;

function slugToLabel(value: string) {
  if (!value) return "";
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toLocaleUpperCase("tr-TR"));
}

function normalizeBakery(item: any, index: number): BakeryItem {
  const id = String(
    item?.id ?? item?.uid ?? item?.docId ?? item?._id ?? `bakery-${index + 1}`
  );

  return {
    id,
    name: String(item?.bakeryName ?? item?.name ?? `Fırın ${index + 1}`),
    district: String(
      item?.district ??
        item?.districtName ??
        slugToLabel(item?.districtSlug ?? "")
    ),
    neighborhood: String(
      item?.neighborhood ??
        item?.neighborhoodName ??
        slugToLabel(item?.neighborhoodSlug ?? "")
    ),
    pendingBread:
      Number(
        item?.pendingEkmek ??
          item?.pendingBread ??
          item?.suspendedBread ??
          item?.askidaEkmek ??
          0
      ) || 0,
    distance: "Yakında",
  };
}

export default function FirinSec() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("Tümü");
  const [bakeries, setBakeries] = useState<BakeryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchBakeries(isRefresh = false) {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`${API_BASE}/mobile/bakeries`);
      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.bakeries)
        ? data.bakeries
        : Array.isArray(data?.items)
        ? data.items
        : [];

      const normalized = list
        .map((item: any, index: number) => normalizeBakery(item, index))
        .filter((item: BakeryItem) => item.name.trim().length > 0);

      setBakeries(normalized);
    } catch {
      setBakeries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchBakeries();
  }, []);

  const districts = useMemo(() => {
    const unique = Array.from(
      new Set(bakeries.map((b) => b.district).filter(Boolean))
    );
    return ["Tümü", ...unique];
  }, [bakeries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");

    return bakeries.filter((b) => {
      const districtOk = district === "Tümü" || b.district === district;
      const searchOk =
        !q ||
        b.name.toLocaleLowerCase("tr-TR").includes(q) ||
        b.district.toLocaleLowerCase("tr-TR").includes(q) ||
        b.neighborhood.toLocaleLowerCase("tr-TR").includes(q);

      return districtOk && searchOk;
    });
  }, [bakeries, search, district]);

  return (
    <MobileScreen scroll withTabBar backgroundColor="#FFF7ED">
      {/* HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Image
          source={require("../assets/images/logo.png")}
          style={{ width: 90, height: 36, resizeMode: "contain" }}
        />

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#2B211B" }}>
            Fırın Seç 
          </Text>
          <Text style={{ fontSize: 12, color: "#7A6E66" }}>
            Askıya ekmek bırakacağın fırını seç
          </Text>
        </View>
      </View>

      {/* SEARCH */}
      <View
        style={{
          marginTop: 14,
          backgroundColor: "#FFFFFF",
          borderRadius: 18,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderWidth: 1,
          borderColor: "#F2E4D8",
        }}
      >
        <TextInput
          placeholder="Fırın, ilçe veya mahalle ara"
          placeholderTextColor="#9A8F87"
          value={search}
          onChangeText={setSearch}
          style={{ color: "#2B211B", fontSize: 14 }}
        />
      </View>

      {/* DISTRICTS */}
<View style={{ height: 48, marginTop: 10, flexGrow: 0 }}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ height: 48, maxHeight: 48, flexGrow: 0 }}
    contentContainerStyle={{
      height: 48,
      maxHeight: 48,
      alignItems: "center",
      paddingRight: 8,
      flexGrow: 0,
    }}
  >
    {districts.map((item) => {
      const active = district === item;

      return (
        <TouchableOpacity
          key={item}
          onPress={() => setDistrict(item)}
          activeOpacity={0.85}
          style={{
            marginRight: 8,
            height: 34,
            minHeight: 34,
            maxHeight: 34,
            paddingHorizontal: 14,
            paddingVertical: 0,
            borderRadius: 999,
            backgroundColor: active ? "#F97316" : "#FFFFFF",
            borderWidth: 1,
            borderColor: active ? "#F97316" : "#F2E4D8",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 0,
            flexShrink: 0,
            alignSelf: "center",
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: active ? "#FFF" : "#5A4F49",
              fontWeight: "800",
              fontSize: 12,
              lineHeight: 14,
            }}
          >
            {item}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
</View>

      {/* LIST */}
      {loading ? (
        <View style={{ marginTop: 30, alignItems: "center" }}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={{ marginTop: 10, color: "#7A6E66", fontWeight: "700" }}>
            Fırınlar yükleniyor...
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={{
            marginTop: 16,
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: "#F2E4D8",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "900", color: "#2B211B" }}>
            Sonuç bulunamadı
          </Text>
        </View>
      ) : (
        filtered.map((bakery) => (
          <TouchableOpacity
            key={bakery.id}
            activeOpacity={0.92}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/urun-birak",
                params: {
                  bakeryId: bakery.id,
                  id: bakery.id,
                  name: bakery.name,
                  district: bakery.district,
                  neighborhood: bakery.neighborhood,
                  pendingBread: String(bakery.pendingBread),
                  distance: bakery.distance,
                },
              })
            }
            style={{
              marginTop: 12,
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: "#F2E4D8",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#2B211B" }}>
              {bakery.name}
            </Text>

            <Text style={{ marginTop: 3, color: "#7A6E66", fontSize: 12 }}>
              {[bakery.district, bakery.neighborhood].join(" / ")}
            </Text>

            <View
              style={{
                marginTop: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#F97316", fontWeight: "900" }}>
                {bakery.pendingBread} askıda
              </Text>

              <Text style={{ color: "#16A34A", fontWeight: "800" }}>
                ● Aktif
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </MobileScreen>
  );
}