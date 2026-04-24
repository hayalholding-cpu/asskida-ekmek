import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

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
      item?.district ?? item?.districtName ?? slugToLabel(item?.districtSlug ?? "")
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
      isRefresh ? setRefreshing(true) : setLoading(true);

      const response = await fetch(`${API_BASE}/mobile/bakeries`);
const data = await response.json();

const list = Array.isArray(data)
  ? data
  : Array.isArray(data?.bakeries)
  ? data.bakeries
  : Array.isArray(data?.items)
  ? data.items
  : [];

setBakeries(list);

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

  const totalPending = useMemo(
    () => filtered.reduce((sum, b) => sum + b.pendingBread, 0),
    [filtered]
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FAF7F2" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchBakeries(true)}
        />
      }
    >
      <View>
        <Text style={{ fontSize: 24, fontWeight: "800", color: "#2B211B" }}>
          Fırın Seç
        </Text>

        <Text
          style={{
            marginTop: 6,
            fontSize: 14,
            lineHeight: 20,
            color: "#7A6E66",
          }}
        >
          Askıya ekmek bırakmak istediğin fırını seç. Seçtiğin fırına ürün
          bırakma adımında devam edeceğiz.
        </Text>
      </View>

      <View
        style={{
          marginTop: 20,
          backgroundColor: "#F57C00",
          borderRadius: 24,
          padding: 20,
        }}
      >
        <Text style={{ color: "#FFE8D2", fontSize: 13, fontWeight: "700" }}>
          İstanbul Fırıncılar Odası güvencesiyle
        </Text>

        <Text
          style={{
            marginTop: 8,
            color: "#FFFFFF",
            fontSize: 28,
            fontWeight: "900",
          }}
        >
          {filtered.length}
        </Text>

        <Text style={{ color: "#FFFFFF", marginTop: 2 }}>
          uygun fırın listeleniyor
        </Text>

        <Text
          style={{
            marginTop: 10,
            color: "#FFE8D2",
            fontSize: 13,
            lineHeight: 19,
          }}
        >
          Bu listede aktif fırınlar ve askıdaki ürün durumları gösterilir.
        </Text>
      </View>

      <View
        style={{
          marginTop: 16,
          flexDirection: "row",
          gap: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#2B211B" }}>
            {totalPending}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: "#7A6E66" }}>
            askıda ekmek
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 18,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#2B211B" }}>
            {district}
          </Text>
          <Text style={{ marginTop: 4, fontSize: 12, color: "#7A6E66" }}>
            aktif filtre
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 18,
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
      >
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Fırın, ilçe veya mahalle ara"
          placeholderTextColor="#9A8F87"
          style={{
            fontSize: 15,
            color: "#2B211B",
          }}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 4 }}
      >
        {districts.map((item) => {
          const active = district === item;

          return (
            <TouchableOpacity
              key={item}
              onPress={() => setDistrict(item)}
              style={{
                marginRight: 10,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: active ? "#F57C00" : "#FFFFFF",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: active ? "#FFFFFF" : "#5A4F49",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View
        style={{
          marginTop: 18,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#2B211B" }}>
          Uygun Fırınlar
        </Text>

        <Text style={{ fontSize: 13, color: "#7A6E66" }}>
          {filtered.length} sonuç
        </Text>
      </View>

      {loading ? (
        <View
          style={{
            marginTop: 28,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#F57C00" />
          <Text style={{ marginTop: 12, color: "#7A6E66" }}>
            Fırınlar yükleniyor...
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={{
            marginTop: 16,
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            padding: 18,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800", color: "#2B211B" }}>
            Sonuç bulunamadı
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 13,
              lineHeight: 19,
              color: "#7A6E66",
            }}
          >
            Arama kelimesini veya ilçe filtresini değiştirerek tekrar dene.
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
              marginTop: 14,
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              padding: 18,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#2B211B",
                  }}
                >
                  {bakery.name}
                </Text>

                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    lineHeight: 19,
                    color: "#7A6E66",
                  }}
                >
                  {[bakery.district, bakery.neighborhood]
                    .filter(Boolean)
                    .join(" / ")}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "#FFF0E2",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: "#D96B00",
                    fontSize: 12,
                    fontWeight: "800",
                  }}
                >
                  {bakery.pendingBread} askıda
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 16,
                backgroundColor: "#FAF7F2",
                borderRadius: 18,
                padding: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 19,
                  color: "#7A6E66",
                }}
              >
                Bu fırını seçerek askıya ürün bırakma adımına geçebilirsin.
              </Text>
            </View>

            <View
              style={{
                marginTop: 14,
                backgroundColor: "#F57C00",
                borderRadius: 18,
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: "900",
                }}
              >
                Bu fırını seç
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}