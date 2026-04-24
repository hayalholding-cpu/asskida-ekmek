import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

function formatNow() {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return "";
  }
}

export default function Basarili() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const bakeryId =
    typeof params.bakeryId === "string"
      ? params.bakeryId
      : typeof params.id === "string"
      ? params.id
      : "";

  const bakeryName =
    typeof params.bakeryName === "string" ? params.bakeryName : "Fırın";

  const district =
    typeof params.district === "string" ? params.district : "";

  const neighborhood =
    typeof params.neighborhood === "string" ? params.neighborhood : "";

  const productName =
    typeof params.productName === "string" ? params.productName : "Ürün";

  const productType =
    typeof params.productType === "string" ? params.productType : "ekmek";

  const count =
    typeof params.count === "string" ? Number(params.count) || 1 : 1;

  const totalPrice =
    typeof params.totalPrice === "string" ? Number(params.totalPrice) || 0 : 0;

  const note = typeof params.note === "string" ? params.note : "";

  const createdAt = formatNow();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FAF7F2" }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 36,
        flexGrow: 1,
        justifyContent: "center",
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 26,
          padding: 24,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: "#FFF0E2",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: "800",
              color: "#F57C00",
            }}
          >
            ✓
          </Text>
        </View>

        <Text
          style={{
            marginTop: 18,
            fontSize: 24,
            fontWeight: "800",
            color: "#2B211B",
          }}
        >
          İşlem Tamamlandı
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 14,
            lineHeight: 21,
            textAlign: "center",
            color: "#7A6E66",
          }}
        >
          {count} adet {productName.toLocaleLowerCase("tr-TR")} {bakeryName} için
          askıya bırakıldı.
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 13,
            lineHeight: 19,
            textAlign: "center",
            color: "#9A8F87",
          }}
        >
          Sistem kaydı alındı. Uygun durumda ihtiyaç sahiplerine ulaştırılacaktır.
        </Text>

        <View
          style={{
            marginTop: 18,
            backgroundColor: "#FFF0E2",
            borderRadius: 999,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: "#A45700",
            }}
          >
            ✔ Sistem kaydı alındı
          </Text>
        </View>

        <View
          style={{
            marginTop: 24,
            width: "100%",
            backgroundColor: "#FAF7F2",
            borderRadius: 20,
            padding: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 2,
            }}
          >
            <Text style={{ color: "#7A6E66" }}>Fırın</Text>
            <Text style={{ fontWeight: "700", color: "#2B211B" }}>
              {bakeryName}
            </Text>
          </View>

          {!!district || !!neighborhood ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              <Text style={{ color: "#7A6E66" }}>Konum</Text>
              <Text style={{ fontWeight: "700", color: "#2B211B" }}>
                {[district, neighborhood].filter(Boolean).join(" / ")}
              </Text>
            </View>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <Text style={{ color: "#7A6E66" }}>Ürün</Text>
            <Text style={{ fontWeight: "700", color: "#2B211B" }}>
              {productName}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <Text style={{ color: "#7A6E66" }}>Adet</Text>
            <Text style={{ fontWeight: "700", color: "#2B211B" }}>
              {count}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <Text style={{ color: "#7A6E66" }}>Toplam</Text>
            <Text style={{ fontWeight: "800", color: "#F57C00" }}>
              {totalPrice} ₺
            </Text>
          </View>

          {!!createdAt ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              <Text style={{ color: "#7A6E66" }}>İşlem zamanı</Text>
              <Text style={{ fontWeight: "700", color: "#2B211B" }}>
                {createdAt}
              </Text>
            </View>
          ) : null}
        </View>

        {!!note ? (
          <View
            style={{
              marginTop: 18,
              width: "100%",
              backgroundColor: "#FAF7F2",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#2B211B",
              }}
            >
              Notun
            </Text>

            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 20,
                color: "#7A6E66",
              }}
            >
              {note}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={() =>
            router.replace({
              pathname: "/urun-birak",
              params: {
                bakeryId,
                id: bakeryId,
                name: bakeryName,
                district,
                neighborhood,
                productType,
              },
            })
          }
          style={{
            marginTop: 24,
            width: "100%",
            backgroundColor: "#FFF0E2",
            borderRadius: 20,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#A45700",
              fontSize: 15,
              fontWeight: "800",
            }}
          >
            Aynı fırına tekrar bırak
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{
            marginTop: 12,
            width: "100%",
            backgroundColor: "#F57C00",
            borderRadius: 20,
            paddingVertical: 18,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Ana Sayfaya Dön
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}