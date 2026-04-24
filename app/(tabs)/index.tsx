import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import MobileScreen from "../../components/layout/MobileScreen";

export default function Home() {
  const router = useRouter();

  return (
    <MobileScreen
      scroll
      withTabBar
      backgroundColor="#FFF7ED"
      contentStyle={{
        paddingTop: 6,
      }}
    >
      <View style={{ alignItems: "center", marginTop: 0 }}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={{ width: 190, height: 82, resizeMode: "contain" }}
        />

        <Text
          style={{
            marginTop: 2,
            fontSize: 18,
            lineHeight: 23,
            fontWeight: "700",
            color: "#6E625B",
            textAlign: "center",
            letterSpacing: -0.2,
          }}
        >
          Bir ekmek, bir umuda dönüşsün.
        </Text>
      </View>

      <LinearGradient
        colors={["#FFFFFF", "#FFF8F0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginTop: 14,
          borderRadius: 24,
          padding: 15,
          borderWidth: 1,
          borderColor: "#F3E5D8",
          shadowColor: "#8A4B16",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        }}
      >
        <View
          style={{
            alignSelf: "center",
            backgroundColor: "#FFF0DE",
            borderRadius: 999,
            paddingHorizontal: 11,
            paddingVertical: 5,
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Ionicons name="shield-checkmark" size={13} color="#F97316" />
          <Text
            style={{
              color: "#A45700",
              fontSize: 11,
              fontWeight: "800",
            }}
          >
            Güvenli askı sistemi
          </Text>
        </View>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "900",
            color: "#2B211B",
            textAlign: "center",
            lineHeight: 30,
            letterSpacing: -0.6,
          }}
        >
          Askıya ekmek bırakmak artık çok kolay
        </Text>

        <Text
          style={{
            marginTop: 9,
            fontSize: 14,
            lineHeight: 21,
            color: "#756961",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          İstanbul Fırıncılar Odası güvencesiyle, seçtiğin fırına askıya ekmek
          bırakabilir ve iyiliği güvenle paylaşabilirsin.
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/firin-sec")}
          style={{
            marginTop: 15,
            borderRadius: 22,
            overflow: "hidden",
            shadowColor: "#F97316",
            shadowOpacity: 0.24,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={["#FF8A00", "#F97316", "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 13,
              paddingHorizontal: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="heart" size={21} color="#FFFFFF" />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 19,
                  fontWeight: "900",
                  letterSpacing: -0.2,
                }}
              >
                Ekmek Bırak
              </Text>
            </View>

            <Text
              style={{
                marginTop: 3,
                color: "#FFEBD5",
                fontSize: 12,
                fontWeight: "800",
              }}
            >
              Fırın seçerek devam et
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <View
        style={{
          marginTop: 11,
          flexDirection: "row",
          gap: 9,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 12,
            borderWidth: 1,
            borderColor: "#F2E4D8",
          }}
        >
          <Ionicons name="receipt" size={18} color="#F97316" />
          <Text
            style={{
              marginTop: 5,
              fontSize: 13,
              fontWeight: "900",
              color: "#2B211B",
            }}
          >
            Kayıtlı
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontSize: 10.5,
              lineHeight: 15,
              color: "#7A6E66",
            }}
          >
            Her işlem sistemde izlenir.
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 12,
            borderWidth: 1,
            borderColor: "#F2E4D8",
          }}
        >
          <Ionicons name="storefront" size={18} color="#F97316" />
          <Text
            style={{
              marginTop: 5,
              fontSize: 13,
              fontWeight: "900",
              color: "#2B211B",
            }}
          >
            Fırına Ulaşır
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontSize: 10.5,
              lineHeight: 15,
              color: "#7A6E66",
            }}
          >
            Seçilen fırına askı yazılır.
          </Text>
        </View>
      </View>
    </MobileScreen>
  );
}