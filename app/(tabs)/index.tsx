import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FAF7F2" }}
      contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ alignItems: "center", marginTop: 12 }}>
        <Image
          source={require("../../assets/logo.png")}
          style={{ width: 190, height: 95, resizeMode: "contain" }}
        />

        <Text
          style={{
            marginTop: 8,
            fontSize: 15,
            color: "#7A6E66",
            textAlign: "center",
          }}
        >
          Bir ekmek, bir umuda dönüşsün.
        </Text>
      </View>

      <View
        style={{
          marginTop: 28,
          backgroundColor: "#FFFFFF",
          borderRadius: 26,
          padding: 22,
        }}
      >
        <Text
          style={{
            fontSize: 23,
            fontWeight: "800",
            color: "#2B211B",
            textAlign: "center",
            lineHeight: 30,
          }}
        >
          Askıya ekmek bırakmak artık çok kolay
        </Text>

        <Text
          style={{
            marginTop: 10,
            fontSize: 14,
            lineHeight: 21,
            color: "#7A6E66",
            textAlign: "center",
          }}
        >
          İstanbul Fırıncılar Odası güvencesiyle, seçtiğin fırına askıya ekmek
          bırakabilir ve iyiliği güvenle paylaşabilirsin.
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/firin-sec")}
          style={{
            marginTop: 22,
            backgroundColor: "#F57C00",
            borderRadius: 22,
            paddingVertical: 18,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 17,
              fontWeight: "800",
            }}
          >
            Ekmek Bırak
          </Text>

          <Text
            style={{
              marginTop: 4,
              color: "#FFE8D2",
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            Fırın seçerek devam et
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginTop: 18,
          backgroundColor: "#FFF0E2",
          borderRadius: 22,
          padding: 18,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: "#A45700",
          }}
        >
          Güvenli ve şeffaf askı sistemi
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontSize: 13,
            lineHeight: 20,
            color: "#7A6E66",
          }}
        >
          Bıraktığın ekmekler sistemde kayıt altına alınır. Fırınlar askıdaki
          ekmekleri ihtiyaç sahiplerine ulaştırdıkça süreç takip edilir.
        </Text>
      </View>
    </ScrollView>
  );
}