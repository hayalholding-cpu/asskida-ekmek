import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

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

  const district = typeof params.district === "string" ? params.district : "";
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
      style={{ flex: 1, backgroundColor: "#F0FDF4" }}
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
          borderRadius: 30,
          padding: 24,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#DCFCE7",
        }}
      >
        <View
          style={{
            width: 92,
            height: 92,
            borderRadius: 46,
            backgroundColor: "#16A34A",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#16A34A",
            shadowOpacity: 0.32,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 8,
          }}
        >
          <Ionicons name="checkmark" size={52} color="#FFFFFF" />
        </View>

        <Text
          style={{
            marginTop: 20,
            fontSize: 26,
            fontWeight: "900",
            color: "#14532D",
            textAlign: "center",
          }}
        >
          İşlem Başarıyla Tamamlandı
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 15,
            lineHeight: 22,
            textAlign: "center",
            color: "#4B6353",
          }}
        >
          {count} adet {productName.toLocaleLowerCase("tr-TR")} {bakeryName} için
          askıya bırakıldı.
        </Text>

        <View
          style={{
            marginTop: 16,
            backgroundColor: "#DCFCE7",
            borderRadius: 999,
            paddingHorizontal: 16,
            paddingVertical: 9,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Ionicons name="shield-checkmark" size={16} color="#15803D" />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "900",
              color: "#15803D",
            }}
          >
            Sistem kaydı güvenle alındı
          </Text>
        </View>

        <View
          style={{
            marginTop: 24,
            width: "100%",
            backgroundColor: "#F7FAF7",
            borderRadius: 22,
            padding: 16,
            borderWidth: 1,
            borderColor: "#E5F3E8",
          }}
        >
          {[
            ["Fırın", bakeryName],
            ["Konum", [district, neighborhood].filter(Boolean).join(" / ")],
            ["Ürün", productName],
            ["Adet", String(count)],
            ["Toplam", `${totalPrice} ₺`],
            ["İşlem zamanı", createdAt],
          ]
            .filter(([, value]) => !!value)
            .map(([label, value]) => (
              <View
                key={label}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: label === "Fırın" ? 0 : 12,
                  gap: 12,
                }}
              >
                <Text style={{ color: "#6B7B70" }}>{label}</Text>
                <Text
                  style={{
                    flex: 1,
                    textAlign: "right",
                    fontWeight: label === "Toplam" ? "900" : "800",
                    color: label === "Toplam" ? "#15803D" : "#163827",
                  }}
                >
                  {value}
                </Text>
              </View>
            ))}
        </View>

        {!!note ? (
          <View
            style={{
              marginTop: 18,
              width: "100%",
              backgroundColor: "#F7FAF7",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "800", color: "#163827" }}>
              Notun
            </Text>
            <Text
              style={{
                marginTop: 8,
                fontSize: 14,
                lineHeight: 20,
                color: "#6B7B70",
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
            backgroundColor: "#DCFCE7",
            borderRadius: 20,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#15803D", fontSize: 15, fontWeight: "900" }}>
            Aynı fırına tekrar bırak
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{
            marginTop: 12,
            width: "100%",
            backgroundColor: "#16A34A",
            borderRadius: 20,
            paddingVertical: 18,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "900" }}>
            Ana Sayfaya Dön
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}