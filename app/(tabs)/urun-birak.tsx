import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MobileScreen from "../../components/layout/MobileScreen";
import { API } from "../../lib/api";

type MobileProduct = {
  id: string;
  name: string;
  price: number;
  isActive?: boolean;
  sort?: number;
};

function cleanText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeProductType(name: string) {
  const v = name.toLocaleLowerCase("tr-TR");

  if (v.includes("pide")) return "pide";
  if (v.includes("ekmek")) return "ekmek";
  if (v.includes("simit")) return "simit";
  if (v.includes("poğaça") || v.includes("pogaca")) return "pogaca";

  return v || "ekmek";
}

function formatPrice(value: number) {
  return `₺${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function UrunBirakScreen() {
  const params = useLocalSearchParams();

  const bakeryId = cleanText(params.bakeryId || params.id);
  const bakeryName = cleanText(params.name || params.bakeryName, "Seçili Fırın");
  const district = cleanText(params.district || params.ilce);
  const neighborhood = cleanText(params.neighborhood || params.mahalle);
  const distance = cleanText(params.distance);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("Afiyet olsun, iyi günler dilerim. ❤️");

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        const data = await API.mobileProducts();

        const list: MobileProduct[] = Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data)
          ? data
          : [];

        const activeProducts = list
          .filter((item) => item?.isActive !== false)
          .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));

        if (!mounted) return;

        setProducts(activeProducts);

        if (activeProducts.length > 0) {
          setSelectedProductId(String(activeProducts[0].id));
        }
      } catch (error: any) {
        Alert.alert(
          "Ürünler alınamadı",
          error?.message || "Ürün bilgileri yüklenirken bir sorun oluştu."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedProduct = useMemo(() => {
    return products.find((item) => String(item.id) === String(selectedProductId));
  }, [products, selectedProductId]);

  const unitPrice = toNumber(selectedProduct?.price, 0);
  const totalPrice = count * unitPrice;
  const productName = cleanText(selectedProduct?.name, "Ekmek");
  const productType = normalizeProductType(productName);

  function decrease() {
    setCount((prev) => Math.max(1, prev - 1));
  }

  function increase() {
    setCount((prev) => Math.min(99, prev + 1));
  }

  function goPayment() {
    if (!bakeryId) {
      Alert.alert("Fırın bilgisi eksik", "Lütfen fırın seçimini tekrar yap.");
      return;
    }

    if (!selectedProduct) {
      Alert.alert("Ürün seçilmedi", "Lütfen bırakmak istediğin ürünü seç.");
      return;
    }

    router.push({
      pathname: "/odeme",
      params: {
        bakeryId,
        bakeryName,
        productId: String(selectedProduct.id),
        productName,
        productType,
        count: String(count),
        unitPrice: String(unitPrice),
        totalPrice: String(totalPrice),
        district,
        neighborhood,
        note,
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

        <Text style={styles.headerTitle}>Ekmek Bırak</Text>

        <View style={styles.headerSpacer} />
      </View>

      <MobileScreen
        scroll
        withTabBar={false}
        backgroundColor="#FFF7ED"
        contentStyle={styles.mobileContent}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTextArea}>
            <Text style={styles.heroTitle}>Kaç ekmek bırakmak istersin?</Text>
            <Text style={styles.heroSubtitle}>
              Seçtiğin fırında askıya ürün bırak.
            </Text>
          </View>

          <Text style={styles.breadEmoji}>🥖</Text>
        </View>

        <View style={styles.counterCard}>
          <TouchableOpacity style={styles.counterButton} onPress={decrease}>
            <Ionicons name="remove" size={21} color="#FF6A00" />
          </TouchableOpacity>

          <Text style={styles.countText}>{count}</Text>

          <TouchableOpacity style={styles.counterButton} onPress={increase}>
            <Ionicons name="add" size={21} color="#FF6A00" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Ürün Seç</Text>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#FF6A00" />
            <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aktif ürün bulunamadı</Text>
            <Text style={styles.emptyText}>
              Şu an bırakılabilecek ürün görünmüyor.
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {products.map((product) => {
              const active = String(product.id) === String(selectedProductId);

              return (
                <TouchableOpacity
                  key={product.id}
                  activeOpacity={0.9}
                  onPress={() => setSelectedProductId(String(product.id))}
                  style={[styles.productCard, active && styles.productCardActive]}
                >
                  <View style={styles.productIcon}>
                    <Text style={styles.productEmoji}>🥖</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>
                      {formatPrice(toNumber(product.price))}
                    </Text>
                  </View>

                  {active ? (
                    <Ionicons name="checkmark-circle" size={23} color="#FF6A00" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={21} color="#E8D6C5" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Text style={styles.sectionLabel}>Fırın Seç</Text>

        <View style={styles.bakeryCard}>
          <View style={styles.bakeryMain}>
            <View style={styles.bakeryIcon}>
              <Ionicons name="storefront" size={19} color="#FF6A00" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.bakeryName}>{bakeryName}</Text>
              <Text style={styles.bakeryAddress}>
                {[neighborhood, district].filter(Boolean).join(" / ") ||
                  "Fırın bilgisi seçildi"}
              </Text>
              {!!distance && <Text style={styles.distanceText}>{distance}</Text>}
            </View>
          </View>

          <Ionicons name="checkmark-circle" size={25} color="#FF6A00" />
        </View>

        <Text style={styles.sectionLabel}>Notun</Text>

        <View style={styles.noteCard}>
          <TextInput
            value={note}
            onChangeText={(text) => setNote(text.slice(0, 80))}
            multiline
            maxLength={80}
            placeholder="İsteğe bağlı not bırak..."
            placeholderTextColor="#B6A99E"
            style={styles.noteInput}
          />

          <Text style={styles.noteCounter}>{note.length}/80</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Özet</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ürün</Text>
            <Text style={styles.summaryValue}>{productName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Adet</Text>
            <Text style={styles.summaryValue}>{count}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fırın</Text>
            <Text style={styles.summaryValue}>{bakeryName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.92}
          style={[
            styles.payButton,
            (!selectedProduct || loading) && styles.payButtonDisabled,
          ]}
          disabled={!selectedProduct || loading}
          onPress={goPayment}
        >
          <Text style={styles.payButtonText}>Ekmek Bırak ve Öde</Text>
        </TouchableOpacity>

        <View style={styles.secureRow}>
          <Ionicons name="lock-closed-outline" size={14} color="#9B9088" />
          <Text style={styles.secureText}>
            Ödeme işlemleri güvenle yapılmaktadır.
          </Text>
        </View>
      </MobileScreen>
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
    color: "#FFFFFF",
    textAlign: "center",
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
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE1C4",
    shadowColor: "#FF6A00",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  heroTextArea: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#312820",
  },
  heroSubtitle: {
    marginTop: 5,
    fontSize: 12.5,
    lineHeight: 18,
    color: "#8E7F72",
  },
  breadEmoji: {
    fontSize: 46,
    marginLeft: 10,
  },
  counterCard: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFE1C4",
  },
  countText: {
    minWidth: 40,
    textAlign: "center",
    fontSize: 27,
    fontWeight: "900",
    color: "#312820",
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "900",
    color: "#3A3028",
  },
  loadingCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1E2D4",
  },
  loadingText: {
    marginTop: 8,
    color: "#8E7F72",
    fontSize: 12.5,
  },
  emptyCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1E2D4",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#312820",
  },
  emptyText: {
    marginTop: 5,
    fontSize: 12.5,
    color: "#8E7F72",
  },
  productGrid: {
    gap: 9,
  },
  productCard: {
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D4",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  productCardActive: {
    borderColor: "#FF7A18",
    backgroundColor: "#FFF3E7",
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#FFE9D2",
    alignItems: "center",
    justifyContent: "center",
  },
  productEmoji: {
    fontSize: 22,
  },
  productName: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#312820",
  },
  productPrice: {
    marginTop: 2,
    fontSize: 12.5,
    fontWeight: "800",
    color: "#FF6A00",
  },
  bakeryCard: {
    minHeight: 82,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FFB477",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bakeryMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  bakeryIcon: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#FFF0DF",
    alignItems: "center",
    justifyContent: "center",
  },
  bakeryName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#312820",
  },
  bakeryAddress: {
    marginTop: 3,
    fontSize: 11.5,
    lineHeight: 16,
    color: "#8E7F72",
  },
  distanceText: {
    marginTop: 3,
    fontSize: 11.5,
    fontWeight: "800",
    color: "#FF6A00",
  },
  noteCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D4",
    padding: 12,
  },
  noteInput: {
    minHeight: 62,
    textAlignVertical: "top",
    fontSize: 13,
    lineHeight: 18,
    color: "#3A3028",
    padding: 0,
  },
  noteCounter: {
    marginTop: 6,
    textAlign: "right",
    fontSize: 11.5,
    color: "#9B9088",
  },
  summaryCard: {
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1E2D4",
    padding: 14,
  },
  summaryTitle: {
    fontSize: 14.5,
    fontWeight: "900",
    color: "#312820",
    marginBottom: 8,
  },
  summaryRow: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  summaryLabel: {
    fontSize: 12.5,
    color: "#8E7F72",
  },
  summaryValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 12.5,
    fontWeight: "800",
    color: "#312820",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0E4D8",
    marginVertical: 9,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "900",
    color: "#312820",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FF6A00",
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
    opacity: 0.5,
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
    fontSize: 11.5,
    color: "#9B9088",
  },
});