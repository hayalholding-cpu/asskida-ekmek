import { Picker } from "@react-native-picker/picker";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../lib/firebase";

const tn: any = require("turkey-neighbourhoods");
const ISTANBUL_CODE = 34;

export default function Admin() {
  console.log("ADMIN EKRANI ÇALIŞTI");
  const ADMIN_PIN = "1234";
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  // Ürün fiyatları
  const [ekmekFiyat, setEkmekFiyat] = useState("10");
  const [pideFiyat, setPideFiyat] = useState("15");
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Fırın ekleme
  const [ilce, setIlce] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [firinAdi, setFirinAdi] = useState("");
  const [bakeryCode, setBakeryCode] = useState(""); // ✅ fırıncı giriş kodu
  const [onayli, setOnayli] = useState(true);

  const ilceler = useMemo(() => {
    try {
      return tn.getDistrictsByCityCode(ISTANBUL_CODE) ?? [];
    } catch {
      return [];
    }
  }, []);

  const mahalleler = useMemo(() => {
    if (!ilce) return [];
    try {
      return tn.getNeighbourhoodsByCityCodeAndDistrict(ISTANBUL_CODE, ilce) ?? [];
    } catch {
      return [];
    }
  }, [ilce]);

  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "settings", "prices");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data: any = snap.data();
          if (data?.ekmek != null) setEkmekFiyat(String(data.ekmek));
          if (data?.pide != null) setPideFiyat(String(data.pide));
        }
      } catch (e: any) {
        Alert.alert("Hata", e?.message ?? "Fiyatlar okunamadı");
      } finally {
        setLoadingPrices(false);
      }
    })();
  }, []);

  const savePrices = async () => {
    const ekmek = Number(ekmekFiyat);
    const pide = Number(pideFiyat);
    if (!Number.isFinite(ekmek) || ekmek <= 0) return Alert.alert("Hata", "Ekmek fiyatı geçersiz");
    if (!Number.isFinite(pide) || pide <= 0) return Alert.alert("Hata", "Pide fiyatı geçersiz");

    try {
      await setDoc(
        doc(db, "settings", "prices"),
        { ekmek, pide, updatedAt: serverTimestamp() },
        { merge: true }
      );
      Alert.alert("Tamam", "Fiyatlar kaydedildi ✅");
    } catch (e: any) {
      Alert.alert("Hata", e?.message ?? "Kaydedilemedi");
    }
  };

  const addBakery = async () => {
    if (!ilce) return Alert.alert("Hata", "İlçe seçiniz");
    if (!mahalle) return Alert.alert("Hata", "Mahalle seçiniz");
    if (!firinAdi.trim()) return Alert.alert("Hata", "Fırın adı yazınız");
    if (!bakeryCode.trim()) return Alert.alert("Hata", "Fırıncı kodu yazınız (örn: 100001)");

    try {
      await addDoc(collection(db, "bakeries"), {
        cityCode: ISTANBUL_CODE,
        cityName: "İstanbul",
        district: ilce,
        neighbourhood: mahalle,
        name: firinAdi.trim(),
        bakeryCode: bakeryCode.trim(), // ✅ giriş kodu
        verified: onayli,

        rating: 4.5,

        // ✅ Sayaçlar (Fırıncı paneli için)
        pendingEkmek: 0,
        pendingPide: 0,
        leftTotalEkmek: 0,
        leftTotalPide: 0,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setFirinAdi("");
      setBakeryCode("");
      Alert.alert("Tamam", "Fırın eklendi ✅");
    } catch (e: any) {
      Alert.alert("Hata", e?.message ?? "Fırın eklenemedi");
    }
  };

  if (!unlocked) {
    return (
      <View style={styles.lockWrap}>
        <Text style={styles.lockTitle}>Yönetim Paneli</Text>
        <Text style={styles.lockSub}>Giriş için PIN</Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="PIN"
          keyboardType="number-pad"
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            if (pin === ADMIN_PIN) setUnlocked(true);
            else Alert.alert("Hata", "PIN yanlış");
          }}
        >
          <Text style={styles.primaryBtnText}>Giriş</Text>
        </TouchableOpacity>

        <Text style={styles.lockHint}>
          Not: Bu PIN şimdilik test için. Sonra güvenli giriş (Auth) yapacağız.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Yönetim Paneli</Text>

      {/* Fiyatlar */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ürün Fiyatları</Text>

        <Text style={styles.label}>Somun Ekmek (₺)</Text>
        <TextInput
          value={ekmekFiyat}
          onChangeText={setEkmekFiyat}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Örn: 10"
        />

        <Text style={styles.label}>Ramazan Pidesi (₺)</Text>
        <TextInput
          value={pideFiyat}
          onChangeText={setPideFiyat}
          keyboardType="numeric"
          style={styles.input}
          placeholder="Örn: 15"
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={savePrices} disabled={loadingPrices}>
          <Text style={styles.primaryBtnText}>Fiyatları Kaydet</Text>
        </TouchableOpacity>
      </View>

      {/* Fırın ekleme */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Fırın Ekle</Text>

        <Text style={styles.label}>İl</Text>
        <View style={styles.fixedValue}>
          <Text style={styles.fixedText}>İstanbul</Text>
        </View>

        <Text style={styles.label}>İlçe</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={ilce}
            onValueChange={(v) => {
              setIlce(v);
              setMahalle("");
            }}
            mode="dialog"
          >
            <Picker.Item label="İlçe seçiniz..." value="" />
            {ilceler.map((x: string) => (
              <Picker.Item key={x} label={x} value={x} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Mahalle</Text>
        <View style={styles.pickerWrap}>
          <Picker
            enabled={!!ilce}
            selectedValue={mahalle}
            onValueChange={(v) => setMahalle(v)}
            mode="dialog"
          >
            <Picker.Item label={ilce ? "Mahalle seçiniz..." : "Önce ilçe seçiniz"} value="" />
            {mahalleler.map((m: string) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Fırın Adı</Text>
        <TextInput
          value={firinAdi}
          onChangeText={setFirinAdi}
          style={styles.input}
          placeholder="Örn: Bereket Fırını"
        />

        <Text style={styles.label}>Fırıncı Kodu</Text>
        <TextInput
          value={bakeryCode}
          onChangeText={setBakeryCode}
          style={styles.input}
          placeholder="Örn: 100001"
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Onay Durumu</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={onayli ? "1" : "0"}
            onValueChange={(v) => setOnayli(v === "1")}
            mode="dialog"
          >
            <Picker.Item label="Onaylı" value="1" />
            <Picker.Item label="Onaysız" value="0" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={addBakery}>
          <Text style={styles.primaryBtnText}>Fırını Ekle</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F8F8F8" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 15,
    elevation: 3,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  label: { marginTop: 8, fontWeight: "600" },
  input: {
    marginTop: 6,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  pickerWrap: {
    marginTop: 6,
    marginBottom: 2,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  fixedValue: {
    marginTop: 6,
    marginBottom: 6,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  fixedText: { fontWeight: "700" },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#F27A1A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "900" },

  lockWrap: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#F8F8F8" },
  lockTitle: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  lockSub: { textAlign: "center", color: "#666", marginTop: 6, marginBottom: 12 },
  lockHint: { marginTop: 10, color: "#666", fontSize: 12, textAlign: "center" },
});