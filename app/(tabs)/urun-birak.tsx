import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PrimaryButton from "../../components/ui/PrimaryButton";
import SectionCard from "../../components/ui/SectionCard";
import { API, apiGet } from "../../lib/api";
import {
  COLORS,
  COMPONENTS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "../../lib/theme";

const ISTANBUL_CITY_CODE = 34;
const FALLBACK_CITY_CODE = 0;

type DistrictDoc = {
  id: string;
  cityCode: number;
  districtCode?: number;
  districtName: string;
  slug: string;
  sort?: number;
};

type NeighborhoodDoc = {
  id: string;
  neighborhoodCode?: number;
  neighborhoodName: string;
  districtName?: string;
  districtSlug?: string;
  slug?: string;
  cityCode?: number;
  sort?: number;
};

type BakeryDoc = {
  id: string;
  uid?: string;
  name?: string;
  bakeryName?: string;
  district?: string;
  neighborhood?: string;
  city?: string;
  districtCode?: number;
  neighborhoodCode?: number;
  districtSlug?: string;
  neighborhoodSlug?: string;
  citySlug?: string;
  isActive?: boolean;
};

type ProductDoc = {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
};

function toSlug(value: string = "") {
  return String(value)
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeArray(data: any, keys: string[]) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

async function loadMobileProducts() {
  if (typeof API.mobileProducts === "function") {
    return API.mobileProducts();
  }

  return apiGet("/mobile/products");
}

async function loadMobileDistricts(cityCode: number | string) {
  if (typeof API.mobileDistricts === "function") {
    return API.mobileDistricts(cityCode);
  }

  return apiGet(
    `/mobile/districts?cityCode=${encodeURIComponent(String(cityCode))}`
  );
}

async function loadMobileNeighborhoods(districtSlug: string) {
  if (typeof API.mobileNeighborhoods === "function") {
    return API.mobileNeighborhoods(districtSlug);
  }

  return apiGet(
    `/mobile/neighborhoods?districtSlug=${encodeURIComponent(
      String(districtSlug)
    )}`
  );
}

async function loadMobileBakeries(params: {
  cityCode?: number | string;
  districtCode?: number | string;
  neighborhoodCode?: number | string;
}) {
  if (typeof API.mobileBakeries === "function") {
    return API.mobileBakeries(params);
  }

  const search = new URLSearchParams();

  if (params.cityCode !== undefined && params.cityCode !== null) {
    search.append("cityCode", String(params.cityCode));
  }
  if (params.districtCode !== undefined && params.districtCode !== null) {
    search.append("districtCode", String(params.districtCode));
  }
  if (params.neighborhoodCode !== undefined && params.neighborhoodCode !== null) {
    search.append("neighborhoodCode", String(params.neighborhoodCode));
  }

  const query = search.toString();
  return apiGet(`/mobile/bakeries${query ? `?${query}` : ""}`);
}

function mapDistrict(item: any): DistrictDoc {
  const districtName = String(item?.districtName ?? item?.name ?? "").trim();

  const slug =
    String(item?.slug ?? item?.districtSlug ?? "").trim() ||
    toSlug(districtName);

  const districtCode = safeNumber(
    item?.districtCode ?? item?.code ?? item?.district_id,
    0
  );

  return {
    id: String(item?.id || item?.districtId || slug || "").trim(),
    cityCode: safeNumber(item?.cityCode, ISTANBUL_CITY_CODE),
    districtCode: districtCode || undefined,
    districtName,
    slug,
    sort: item?.sort,
  };
}

function mapNeighborhood(item: any, fallbackDistrictSlug = ""): NeighborhoodDoc {
  const neighborhoodName = String(
    item?.neighborhoodName ?? item?.name ?? item?.mahalle ?? ""
  ).trim();

  const slug =
    String(item?.slug ?? item?.neighborhoodSlug ?? "").trim() ||
    toSlug(neighborhoodName);

  const neighborhoodCode = safeNumber(
    item?.neighborhoodCode ?? item?.code ?? item?.neighborhood_id,
    0
  );

  return {
    id: String(item?.id || slug || "").trim(),
    neighborhoodCode: neighborhoodCode || undefined,
    neighborhoodName,
    districtName: String(item?.districtName ?? "").trim(),
    districtSlug:
      String(item?.districtSlug ?? "").trim() || fallbackDistrictSlug,
    slug,
    cityCode: safeNumber(item?.cityCode, ISTANBUL_CITY_CODE),
    sort: item?.sort,
  };
}

function mapBakery(item: any): BakeryDoc {
  return {
    id: String(item?.id || "").trim(),
    uid: item?.uid ? String(item.uid).trim() : "",
    name: String(item?.name || "").trim(),
    bakeryName: String(item?.bakeryName || item?.name || "").trim(),
    district: String(item?.district || "").trim(),
    neighborhood: String(item?.neighborhood || "").trim(),
    city: String(item?.city || "").trim(),
    districtCode: safeNumber(item?.districtCode, 0) || undefined,
    neighborhoodCode: safeNumber(item?.neighborhoodCode, 0) || undefined,
    districtSlug:
      String(item?.districtSlug || "").trim() ||
      toSlug(String(item?.district || "").trim()),
    neighborhoodSlug:
      String(item?.neighborhoodSlug || "").trim() ||
      toSlug(String(item?.neighborhood || "").trim()),
    citySlug:
      String(item?.citySlug || "").trim() ||
      toSlug(String(item?.city || "").trim()),
    isActive: !!item?.isActive,
  };
}

function mapProduct(item: any): ProductDoc {
  return {
    id: String(item?.id || "").trim(),
    name: String(item?.name || "").trim(),
    price: Number(item?.price || 0),
    isActive: !!item?.isActive,
  };
}

function buildNeighborhoodsFromBakeries(
  bakeryList: BakeryDoc[],
  districtSlug: string,
  districtName: string
): NeighborhoodDoc[] {
  return Array.from(
    new Map(
      bakeryList
        .map((b) => {
          const neighborhoodText = String(b.neighborhood || "").trim();
          const neighborhoodSlugValue =
            String(b.neighborhoodSlug || "").trim() || toSlug(neighborhoodText);

          if (!neighborhoodText || !neighborhoodSlugValue) return null;

          return [
            neighborhoodSlugValue,
            {
              id: neighborhoodSlugValue,
              neighborhoodCode: b.neighborhoodCode,
              neighborhoodName: neighborhoodText,
              districtName,
              districtSlug,
              slug: neighborhoodSlugValue,
              cityCode: ISTANBUL_CITY_CODE,
            } as NeighborhoodDoc,
          ];
        })
        .filter(Boolean) as [string, NeighborhoodDoc][]
    ).values()
  ).sort((a, b) => a.neighborhoodName.localeCompare(b.neighborhoodName, "tr"));
}

function mergeNeighborhoodLists(
  apiNeighborhoods: NeighborhoodDoc[],
  bakeryNeighborhoods: NeighborhoodDoc[],
  districtSlug: string,
  districtName: string
) {
  const mergedMap = new Map<string, NeighborhoodDoc>();

  [...apiNeighborhoods, ...bakeryNeighborhoods].forEach((item) => {
    const neighborhoodName = String(item?.neighborhoodName || "").trim();
    const slug = String(item?.slug || "").trim() || toSlug(neighborhoodName);

    if (!neighborhoodName || !slug) return;

    mergedMap.set(slug, {
      id: String(item?.id || slug).trim(),
      neighborhoodCode: item?.neighborhoodCode,
      neighborhoodName,
      districtName: String(item?.districtName || districtName).trim(),
      districtSlug,
      slug,
      cityCode: item?.cityCode ?? ISTANBUL_CITY_CODE,
      sort: item?.sort,
    });
  });

  return Array.from(mergedMap.values()).sort(
    (a, b) =>
      (a.sort ?? 9999) - (b.sort ?? 9999) ||
      a.neighborhoodName.localeCompare(b.neighborhoodName, "tr")
  );
}

export default function UrunBirak() {
  const router = useRouter();

  const [err, setErr] = useState("");
  const [districts, setDistricts] = useState<DistrictDoc[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodDoc[]>([]);
  const [districtBakeries, setDistrictBakeries] = useState<BakeryDoc[]>([]);
  const [products, setProducts] = useState<ProductDoc[]>([]);

  const [districtSlug, setDistrictSlug] = useState("");
  const [neighborhoodSlug, setNeighborhoodSlug] = useState("");
  const [bakeryId, setBakeryId] = useState("");
  const [productId, setProductId] = useState("");
  const [productCount, setProductCount] = useState(1);

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [loadingBakeries, setLoadingBakeries] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showNoBakeryModal, setShowNoBakeryModal] = useState(false);
  const [noBakeryMessage, setNoBakeryMessage] = useState("");

  const [showBakeryModal, setShowBakeryModal] = useState(false);

  const lastPopupNeighborhoodRef = useRef("");

  const selectedDistrict = useMemo(
    () => districts.find((d) => d.slug === districtSlug) || null,
    [districts, districtSlug]
  );

  const selectedNeighborhood = useMemo(
    () => neighborhoods.find((n) => n.slug === neighborhoodSlug) || null,
    [neighborhoods, neighborhoodSlug]
  );

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) || null,
    [products, productId]
  );

  const totalPrice = useMemo(() => {
    return productCount * Number(selectedProduct?.price || 0);
  }, [productCount, selectedProduct]);

  const filteredBakeries = useMemo(() => {
    if (!neighborhoodSlug) return [];

    return districtBakeries
      .filter(
        (b) => String(b.neighborhoodSlug || "").trim() === neighborhoodSlug
      )
      .sort((a, b) =>
        String(a.bakeryName || a.name || "").localeCompare(
          String(b.bakeryName || b.name || ""),
          "tr"
        )
      );
  }, [districtBakeries, neighborhoodSlug]);

  const selectedBakery = useMemo(
    () => filteredBakeries.find((b) => b.id === bakeryId) || null,
    [filteredBakeries, bakeryId]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setErr("");
      setLoadingDistricts(true);

      try {
        let data: any = null;
        let rawList: any[] = [];

        try {
          data = await loadMobileDistricts(ISTANBUL_CITY_CODE);
          rawList = normalizeArray(data, ["districts", "items"]);
        } catch (firstError) {
          console.log("İlçe ilk istek hatası:", firstError);
        }

        if (rawList.length === 0) {
          try {
            data = await loadMobileDistricts(FALLBACK_CITY_CODE);
            rawList = normalizeArray(data, ["districts", "items"]);
          } catch (secondError) {
            console.log("İlçe fallback istek hatası:", secondError);
          }
        }

        const clean: DistrictDoc[] = rawList
          .map((x: any) => mapDistrict(x))
          .filter((x: DistrictDoc) => x.slug && x.districtName)
          .sort(
            (a: DistrictDoc, b: DistrictDoc) =>
              (a.sort ?? 9999) - (b.sort ?? 9999) ||
              a.districtName.localeCompare(b.districtName, "tr")
          );

        if (!cancelled) {
          setDistricts(clean);
          setDistrictSlug((prev) => prev || clean[0]?.slug || "");
        }
      } catch (e) {
        console.log("İlçeler yüklenirken hata:", e);
        if (!cancelled) {
          setErr("İlçeler şu anda yüklenemedi. Lütfen tekrar deneyin.");
        }
      } finally {
        if (!cancelled) setLoadingDistricts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setErr("");
      setLoadingProducts(true);

      try {
        const data = await loadMobileProducts();
        const rawList = normalizeArray(data, ["products", "items"]);

        const clean: ProductDoc[] = rawList
          .map((x: any) => mapProduct(x))
          .filter((x: ProductDoc) => x.id && x.name && x.isActive)
          .sort((a: ProductDoc, b: ProductDoc) =>
            a.name.localeCompare(b.name, "tr")
          );

        if (!cancelled) {
          setProducts(clean);
          setProductId((prev) => prev || clean[0]?.id || "");
        }
      } catch (e) {
        console.log("Ürünler yüklenirken hata:", e);
        if (!cancelled) {
          setErr("Ürünler şu anda yüklenemedi. Lütfen tekrar deneyin.");
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!districtSlug) {
        setNeighborhoods([]);
        setDistrictBakeries([]);
        setNeighborhoodSlug("");
        setBakeryId("");
        return;
      }

      setNeighborhoodSlug("");
      setBakeryId("");
      lastPopupNeighborhoodRef.current = "";

      setErr("");
      setLoadingNeighborhoods(true);
      setLoadingBakeries(true);

      try {
        const districtCode =
          selectedDistrict?.districtCode ||
          safeNumber(selectedDistrict?.id, 0) ||
          undefined;

        const districtName = String(selectedDistrict?.districtName || "").trim();

        let neighborhoodData: any = { neighborhoods: [] };
        let districtBakeryData: any = { bakeries: [] };
        let cityBakeryData: any = { bakeries: [] };

        try {
          if (districtSlug) {
            neighborhoodData = await loadMobileNeighborhoods(districtSlug);
          }
        } catch (e) {
          console.log("Mahalle endpoint hatası:", e);
        }

        try {
          districtBakeryData = await loadMobileBakeries({
            cityCode: ISTANBUL_CITY_CODE,
            ...(districtCode ? { districtCode } : {}),
          });
        } catch (e) {
          console.log("İlçeye özel fırın endpoint hatası:", e);
        }

        try {
          cityBakeryData = await loadMobileBakeries({
            cityCode: ISTANBUL_CITY_CODE,
          });
        } catch (e) {
          console.log("Şehir geneli fırın endpoint hatası:", e);
        }

        const rawNeighborhoods = normalizeArray(neighborhoodData, [
          "neighborhoods",
          "items",
        ]);

        const rawDistrictBakeries = normalizeArray(districtBakeryData, [
          "bakeries",
          "items",
        ]);

        const rawCityBakeries = normalizeArray(cityBakeryData, [
          "bakeries",
          "items",
        ]);

        const mergedRawBakeries = [...rawDistrictBakeries, ...rawCityBakeries];

        const bakeryMap = new Map<string, BakeryDoc>();

        mergedRawBakeries.forEach((item: any) => {
          const b = mapBakery(item);

          if (!b.id || !b.isActive) return;

          const bakeryDistrictSlug =
            String(b.districtSlug || "").trim() ||
            toSlug(String(b.district || "").trim());

          const matchesDistrict =
            (districtCode && b.districtCode === districtCode) ||
            bakeryDistrictSlug === districtSlug ||
            toSlug(String(b.district || "").trim()) === districtSlug;

          if (!matchesDistrict) return;

          bakeryMap.set(b.id, b);
        });

        const bakeryList = Array.from(bakeryMap.values()).sort((a, b) => {
          const neighborhoodCompare = String(a.neighborhood || "").localeCompare(
            String(b.neighborhood || ""),
            "tr"
          );

          if (neighborhoodCompare !== 0) return neighborhoodCompare;

          return String(a.bakeryName || a.name || "").localeCompare(
            String(b.bakeryName || b.name || ""),
            "tr"
          );
        });

        const apiNeighborhoods: NeighborhoodDoc[] = rawNeighborhoods
          .map((x: any) => mapNeighborhood(x, districtSlug))
          .filter((x: NeighborhoodDoc) => !!x.neighborhoodName && !!x.slug);

        const bakeryNeighborhoods = buildNeighborhoodsFromBakeries(
          bakeryList,
          districtSlug,
          districtName
        );

        let cleanNeighborhoods = mergeNeighborhoodLists(
          apiNeighborhoods,
          bakeryNeighborhoods,
          districtSlug,
          districtName
        );

        if (cleanNeighborhoods.length === 0 && bakeryList.length > 0) {
          cleanNeighborhoods = buildNeighborhoodsFromBakeries(
            bakeryList,
            districtSlug,
            districtName
          );
        }

        if (!cancelled) {
          setNeighborhoods(cleanNeighborhoods);
          setDistrictBakeries(bakeryList);

          if (cleanNeighborhoods.length === 0) {
            const msg =
              "Bu ilçede henüz mahalle ve fırın kaydı bulunmuyor. En kısa sürede eklenecektir.";
            setNoBakeryMessage(msg);
            setShowNoBakeryModal(true);
          }
        }
      } catch (e) {
        console.log("Mahalle/fırın verisi yüklenirken hata:", e);

        if (!cancelled) {
          setErr(
            "Mahalle ve fırın bilgileri şu anda getirilemedi. Lütfen tekrar deneyin."
          );
          setNeighborhoods([]);
          setDistrictBakeries([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingNeighborhoods(false);
          setLoadingBakeries(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [districtSlug, selectedDistrict?.districtCode, selectedDistrict?.districtName]);

  useEffect(() => {
    setBakeryId("");
    setErr("");
  }, [neighborhoodSlug]);

  useEffect(() => {
    if (!neighborhoodSlug) return;
    if (loadingNeighborhoods || loadingBakeries) return;

    if (filteredBakeries.length === 0) {
      const normalizedSelected = String(neighborhoodSlug).trim();

      if (lastPopupNeighborhoodRef.current === normalizedSelected) return;

      lastPopupNeighborhoodRef.current = normalizedSelected;

      const msg =
        "Bu mahallede henüz fırın yoktur. En kısa sürede eklenecektir.";
      setNoBakeryMessage(msg);
      setShowNoBakeryModal(true);
    }
  }, [neighborhoodSlug, filteredBakeries, loadingNeighborhoods, loadingBakeries]);

  function increaseProduct() {
    setProductCount((prev) => prev + 1);
  }

  function decreaseProduct() {
    setProductCount((prev) => (prev > 1 ? prev - 1 : 1));
  }

  async function handleGoPayment() {
    setErr("");

    if (!districtSlug) {
      const msg = "Lütfen önce ilçe seçin.";
      setErr(msg);
      Alert.alert("Eksik seçim", msg);
      return;
    }

    if (loadingNeighborhoods || loadingBakeries) {
      const msg =
        "Mahalle ve fırın bilgileri yükleniyor. Lütfen kısa bir süre bekleyin.";
      setErr(msg);
      Alert.alert("Bilgi", msg);
      return;
    }

    if (loadingProducts) {
      const msg = "Ürünler yükleniyor. Lütfen kısa bir süre bekleyin.";
      setErr(msg);
      Alert.alert("Bilgi", msg);
      return;
    }

    if (!neighborhoodSlug) {
      const msg = "Lütfen bir mahalle seçin.";
      setErr(msg);
      Alert.alert("Eksik seçim", msg);
      return;
    }

    if (filteredBakeries.length === 0) {
      const msg =
        "Bu mahallede henüz fırın yoktur. En kısa sürede eklenecektir.";
      setErr(msg);
      setNoBakeryMessage(msg);
      setShowNoBakeryModal(true);
      return;
    }

    if (!selectedBakery) {
      const msg = "Lütfen bir fırın seçin.";
      setErr(msg);
      Alert.alert("Eksik seçim", msg);
      return;
    }

    if (!selectedProduct) {
      const msg = "Lütfen bir ürün seçin.";
      setErr(msg);
      Alert.alert("Eksik seçim", msg);
      return;
    }

    if (productCount < 1) {
      const msg = "Ürün adedi en az 1 olmalıdır.";
      setErr(msg);
      Alert.alert("Hata", msg);
      return;
    }

    try {
      setSaving(true);

      const bakeryDisplayName = String(
        selectedBakery.bakeryName || selectedBakery.name || ""
      ).trim();

      const productDisplayName = String(selectedProduct.name || "").trim();

      router.push({
        pathname: "/odeme",
        params: {
          bakeryId: String(selectedBakery.id || ""),
          bakeryName: bakeryDisplayName,
          productId: String(selectedProduct.id || ""),
          productType: productDisplayName,
          count: String(productCount),
          totalPrice: String(totalPrice),
          district: String(
            selectedDistrict?.districtName || selectedBakery.district || ""
          ),
          neighborhood: String(
            selectedNeighborhood?.neighborhoodName ||
              selectedBakery.neighborhood ||
              "-"
          ),
          productPrice: String(selectedProduct.price || 0),
          firin: bakeryDisplayName,
          ilce: String(
            selectedDistrict?.districtName || selectedBakery.district || ""
          ),
          mahalle: String(
            selectedNeighborhood?.neighborhoodName ||
              selectedBakery.neighborhood ||
              "-"
          ),
          total: String(totalPrice),
          productName: productDisplayName,
          productCount: String(productCount),
          ekmek: productDisplayName.toLowerCase().includes("ekmek")
            ? String(productCount)
            : "0",
          pide: productDisplayName.toLowerCase().includes("pide")
            ? String(productCount)
            : "0",
        },
      });
    } catch (e) {
      console.log("Ödeme sayfasına geçiş hatası:", e);
      const msg = "Ödeme sayfasına geçilemedi. Lütfen tekrar deneyin.";
      setErr(msg);
      Alert.alert("Hata", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Modal
        visible={showNoBakeryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNoBakeryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons
                name="information-circle-outline"
                size={30}
                color={COLORS.accent}
              />
            </View>

            <Text style={styles.modalTitle}>Bilgilendirme</Text>
            <Text style={styles.modalText}>{noBakeryMessage}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowNoBakeryModal(false)}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBakeryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBakeryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bakeryModalCard}>
            <Text style={styles.modalTitle}>Fırın Seç</Text>

            <ScrollView
              style={styles.bakeryList}
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {filteredBakeries.map((b) => {
                const isSelected = bakeryId === b.id;
                const bakeryName = b.bakeryName || b.name || "(adsız)";

                return (
                  <TouchableOpacity
                    key={b.id}
                    style={styles.bakeryOptionRow}
                    onPress={() => {
                      setBakeryId(b.id);
                      setShowBakeryModal(false);
                    }}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterActive,
                      ]}
                    >
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>

                    <Text style={styles.bakeryOptionText}>{bakeryName}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowBakeryModal(false)}
            >
              <Text style={styles.modalButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Ionicons
                name="storefront-outline"
                size={14}
                color={COLORS.accentDark}
              />
              <Text style={styles.heroBadgeText}>ANLAŞMALI FIRIN</Text>
            </View>

            <View style={styles.heroInfoBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={14}
                color={COLORS.successDark}
              />
              <Text style={styles.heroInfoBadgeText}>Güvenli işlem</Text>
            </View>
          </View>

          <Text style={styles.h1}>ÜRÜN BIRAK</Text>
          <Text style={styles.subText}>
            İlçeni seç, mahalleni belirle, fırınını ve ürününü seç. Ardından
            ödeme adımına güvenle geç.
          </Text>
        </View>

        {err ? (
          <View style={styles.errorCard}>
            <Text style={styles.errText}>{err}</Text>
          </View>
        ) : null}

        <SectionCard
          title="BÖLGE SEÇİMİ"
          rightContent={
            <View style={styles.miniPill}>
              <Text style={styles.miniPillText}>1. adım</Text>
            </View>
          }
        >
          <Text style={styles.helperText}>
            Önce ilçe, ardından mahalle seçerek sana uygun anlaşmalı fırınları
            görüntüle.
          </Text>

          <Text style={styles.label}>İlçe</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={districtSlug}
              onValueChange={(v) => setDistrictSlug(String(v))}
              enabled={!loadingDistricts && districts.length > 0}
              dropdownIconColor={COLORS.accent}
            >
              {districts.length === 0 ? (
                <Picker.Item
                  label={loadingDistricts ? "İlçeler yükleniyor..." : "İlçe yok"}
                  value=""
                />
              ) : (
                districts.map((d) => (
                  <Picker.Item
                    key={d.id}
                    label={d.districtName}
                    value={d.slug}
                  />
                ))
              )}
            </Picker>
          </View>

          <Text style={styles.label}>Mahalle</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={neighborhoodSlug}
              onValueChange={(v) => setNeighborhoodSlug(String(v))}
              enabled={!loadingNeighborhoods && neighborhoods.length > 0}
              dropdownIconColor={COLORS.accent}
            >
              <Picker.Item
                label={
                  !districtSlug
                    ? "Önce ilçe seç"
                    : loadingNeighborhoods
                    ? "Mahalleler yükleniyor..."
                    : neighborhoods.length
                    ? "Mahalle seç"
                    : "Mahalle bulunamadı"
                }
                value=""
              />
              {neighborhoods.map((n) => (
                <Picker.Item
                  key={n.id}
                  label={n.neighborhoodName}
                  value={n.slug || ""}
                />
              ))}
            </Picker>
          </View>
        </SectionCard>

        <SectionCard
          title="FIRIN SEÇİMİ"
          rightContent={
            <View style={styles.miniPill}>
              <Text style={styles.miniPillText}>2. adım</Text>
            </View>
          }
        >
          <Text style={styles.helperText}>
            Seçtiğin mahallede aktif olan fırınlar burada listelenir.
          </Text>

          <TouchableOpacity
            style={styles.customSelectBox}
            onPress={() => {
              if (!districtSlug) {
                Alert.alert("Eksik seçim", "Önce ilçe seçin.");
                return;
              }

              if (!neighborhoodSlug) {
                Alert.alert("Eksik seçim", "Önce mahalle seçin.");
                return;
              }

              if (loadingBakeries) {
                Alert.alert(
                  "Bilgi",
                  "Fırınlar yükleniyor. Lütfen kısa bir süre bekleyin."
                );
                return;
              }

              if (filteredBakeries.length === 0) {
                const msg =
                  "Bu mahallede henüz fırın yoktur. En kısa sürede eklenecektir.";
                setNoBakeryMessage(msg);
                setShowNoBakeryModal(true);
                return;
              }

              setShowBakeryModal(true);
            }}
          >
            <Text style={styles.customSelectText}>
              {selectedBakery?.bakeryName || selectedBakery?.name || "Fırın seç"}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </SectionCard>

        <SectionCard
          title="ÜRÜN SEÇİMİ"
          rightContent={
            <View style={styles.miniPill}>
              <Text style={styles.miniPillText}>3. adım</Text>
            </View>
          }
        >
          <Text style={styles.helperText}>
            Admin panelde aktif olan ürünler otomatik olarak burada görünür.
          </Text>

          <View style={styles.pickerBox}>
            <Picker
              selectedValue={productId}
              onValueChange={(v) => setProductId(String(v))}
              enabled={!loadingProducts && products.length > 0}
              dropdownIconColor={COLORS.accent}
            >
              <Picker.Item
                label={
                  loadingProducts
                    ? "Ürünler yükleniyor..."
                    : products.length
                    ? "Ürün seç"
                    : "Aktif ürün yok"
                }
                value=""
              />
              {products.map((p) => (
                <Picker.Item
                  key={p.id}
                  label={`${p.name} • ${p.price} ₺`}
                  value={p.id}
                />
              ))}
            </Picker>
          </View>
        </SectionCard>

        <SectionCard
          title="SEÇİM ÖZETİ"
          warm
          rightContent={
            selectedBakery && selectedProduct ? (
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusPillText}>Hazır</Text>
              </View>
            ) : null
          }
        >
          {selectedBakery ? (
            <>
              <Text style={styles.selectedBakeryName}>
                {selectedBakery.bakeryName || selectedBakery.name}
              </Text>

              <View style={styles.infoBadgeRow}>
                <View style={styles.infoBadge}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={COLORS.accentDark}
                  />
                  <Text style={styles.infoBadgeText}>
                    {selectedNeighborhood?.neighborhoodName ||
                      selectedBakery.neighborhood ||
                      "Mahalle bilgisi yok"}
                  </Text>
                </View>

                <View style={styles.infoBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={COLORS.successDark}
                  />
                  <Text style={styles.infoBadgeText}>Aktif fırın</Text>
                </View>
              </View>

              <Text style={styles.selectedBakerySub}>
                {selectedProduct
                  ? `${selectedProduct.name} ürünü bu fırına bırakılacak.`
                  : "Ürün seçildiğinde özet burada gösterilir."}
              </Text>
            </>
          ) : (
            <Text style={styles.muted}>Henüz fırın seçilmedi.</Text>
          )}
        </SectionCard>

        <SectionCard
          title="ÜRÜN ADEDİ VE TUTAR"
          rightContent={
            <View style={styles.miniPill}>
              <Text style={styles.miniPillText}>4. adım</Text>
            </View>
          }
        >
          <View style={styles.counterHintBox}>
            <Ionicons name="sparkles-outline" size={15} color={COLORS.accent} />
            <Text style={styles.counterHintText}>
              Bırakmak istediğin ürün miktarını belirle
            </Text>
          </View>

          <View style={styles.counterRow}>
            <TouchableOpacity style={styles.counterBtn} onPress={decreaseProduct}>
              <Text style={styles.counterBtnText}>−</Text>
            </TouchableOpacity>

            <View style={styles.counterValueBox}>
              <Text style={styles.counterValueText}>{productCount}</Text>
              <Text style={styles.counterValueSub}>adet</Text>
            </View>

            <TouchableOpacity style={styles.counterBtn} onPress={increaseProduct}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>İlçe</Text>
              <Text style={styles.summaryValue}>
                {selectedDistrict?.districtName || "-"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mahalle</Text>
              <Text style={styles.summaryValue}>
                {selectedNeighborhood?.neighborhoodName ||
                  selectedBakery?.neighborhood ||
                  "-"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Seçilen fırın</Text>
              <Text style={styles.summaryValue}>
                {selectedBakery?.bakeryName || selectedBakery?.name || "-"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Seçilen ürün</Text>
              <Text style={styles.summaryValue}>
                {selectedProduct?.name || "-"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ürün adedi</Text>
              <Text style={styles.summaryValue}>{productCount} adet</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Birim tutar</Text>
              <Text style={styles.summaryValue}>
                {selectedProduct ? `${selectedProduct.price} ₺` : "-"}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryTotalLabel}>Toplam</Text>
              <Text style={styles.summaryTotalValue}>{totalPrice} ₺</Text>
            </View>
          </View>

          <PrimaryButton
            title={saving ? "ÖDEMEYE YÖNLENDİRİLİYOR..." : "ÖDEMEYE GEÇ"}
            onPress={handleGoPayment}
            loading={saving}
            disabled={saving}
          />
        </SectionCard>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    ...COMPONENTS.screenContent,
    backgroundColor: COLORS.background,
  },

  heroCard: {
    ...COMPONENTS.warmCard,
    marginBottom: 14,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },

  heroBadgeText: {
    ...TYPOGRAPHY.badge,
  },

  heroInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },

  heroInfoBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.successDark,
  },

  h1: {
    ...TYPOGRAPHY.h2,
    textAlign: "center",
    color: COLORS.accent,
    letterSpacing: 1,
    marginBottom: 8,
  },

  subText: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    paddingHorizontal: 10,
  },

  errorCard: {
    ...COMPONENTS.errorCard,
    marginBottom: 14,
  },

  errText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.dangerDark,
    lineHeight: 20,
  },

  miniPill: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  miniPillText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.accentDark,
  },

  helperText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: 10,
    lineHeight: 20,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.successBg,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },

  statusPillText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.successDark,
  },

  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.extrabold,
    marginTop: 10,
    marginBottom: 8,
    color: COLORS.accentDark,
  },

  pickerBox: {
    ...COMPONENTS.pickerBox,
  },

  customSelectBox: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  customSelectText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.title,
    fontWeight: FONT_WEIGHT.bold,
  },

  muted: {
    ...TYPOGRAPHY.body,
    marginTop: 4,
  },

  selectedBakeryName: {
    marginTop: 2,
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.accent,
    lineHeight: 24,
  },

  infoBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },

  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },

  infoBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.accentDark,
  },

  selectedBakerySub: {
    ...TYPOGRAPHY.caption,
    marginTop: 10,
    color: COLORS.textMuted,
    lineHeight: 20,
  },

  counterHintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  counterHintText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.accentDark,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 18,
  },

  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 18,
  },

  counterBtn: {
    width: 58,
    height: 58,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceWarm,
  },

  counterBtnText: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.title,
    marginTop: -2,
  },

  counterValueBox: {
    minWidth: 96,
    height: 58,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 16,
  },

  counterValueText: {
    fontSize: FONT_SIZE["3xl"],
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.accent,
    lineHeight: 26,
  },

  counterValueSub: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.accentDark,
    marginTop: 2,
  },

  summaryBox: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 5,
  },

  summaryLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.bold,
  },

  summaryValue: {
    flex: 1,
    textAlign: "right",
    fontSize: FONT_SIZE.sm,
    color: COLORS.title,
    fontWeight: FONT_WEIGHT.extrabold,
  },

  summaryTotalRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  summaryTotalLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.title,
  },

  summaryTotalValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.accent,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modalCard: {
    width: "100%",
    backgroundColor: COLORS.surfaceWarm || "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },

  bakeryModalCard: {
    width: "100%",
    maxHeight: "72%",
    backgroundColor: COLORS.surfaceWarm || "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },

  bakeryList: {
    width: "100%",
    marginTop: 8,
    marginBottom: 16,
  },

  bakeryOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  bakeryOptionText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.title,
    fontWeight: FONT_WEIGHT.bold,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },

  radioOuterActive: {
    borderColor: COLORS.accent,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },

  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.title,
    marginBottom: 10,
    textAlign: "center",
  },

  modalText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },

  modalButton: {
    minWidth: 140,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingHorizontal: 22,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.black,
  },
});
