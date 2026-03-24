import { Picker } from "@react-native-picker/picker";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../lib/firebase";

const tn: any = require("turkey-neighbourhoods");
const ISTANBUL_CODE = 34;

export default function Yonetim() {
  const ADMIN_PIN = "1234";

  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  // ---- UI AYARLARI (sponsor göster/gizle)
  const [showSponsorsOnHome, setShowSponsorsOnHome] = useState(true);

  // ---- FİYAT
  const [ekmekFiyat, setEkmekFiyat] = useState("");
  const [pideFiyat, setPideFiyat] = useState("");

  // ---- FIRIN
  const [ilce, setIlce] = useState("");
  const [mahalle, setMahalle] = useState("");
  const [firinAdi, setFirinAdi] = useState("");
  const [bakeryCode, setBakeryCode] = useState("");
  const [verified, setVerified] = useState(true);

  // ---- SPONSOR
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorAmount, setSponsorAmount] = useState("");
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [bakeries, setBakeries] = useState<any[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState("");
  const [selectedBakery, setSelectedBakery] = useState("");
  const [distAmount, setDistAmount] = useState("");

  const districts = useMemo(
    () => tn.getDistrictsByCityCode(ISTANBUL_CODE) ?? [],
    []
  );

  const neighbourhoods = useMemo(() => {
    if (!ilce) return [];
    return tn.getNeighbourhoodsByCityCodeAndDistrict(ISTANBUL_CODE, ilce) ?? [];
  }, [ilce]);

  // Yönetim açılınca ayarları ve listeleri çek
  useEffect(() => {
    if (!unlocked) return;

    const load = async () => {
      // UI settings
      try {
        const uiSnap = await getDoc(doc(db, "settings", "ui"));
        if (uiSnap.exists()) {
          const ui: any = uiSnap.data();
          setShowSponsorsOnHome(ui?.showSponsorsOnHome ?? true);
        } else {
          setShowSponsorsOnHome(true);
        }
      } catch {}

      // Prices
      try {
        const pSnap = await getDoc(doc(db, "settings", "prices"));
        if (pSnap.exists()) {
          const p: any = pSnap.data();
          setEkmekFiyat(String(p?.ekmek ?? ""));
          setPideFiyat(String(p?.pide ?? ""));
        }
      } catch {}

      // Sponsors & bakeries
      const s = await getDocs(collection(db, "sponsors"));
      setSponsors(s.docs.map((d) => ({ id: d.id, ...d.data() })));

      const b = await getDocs(collection(db, "bakeries"));
      setBakeries(b.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    load();
  }, [unlocked]);

  const saveUiSettings = async (value: boolean) => {
    setShowSponsorsOnHome(value);
    await setDoc(
      doc(db, "settings", "ui"),
      { showSponsorsOnHome: value, updatedAt: serverTimestamp() },
      { merge: true }
    );
    Alert.alert("Kaydedildi", "Ana sayfa sponsor görünürlüğü güncellendi.");
  };

  const savePrices = async () => {
    const e = Number(ekmekFiyat);
    const p = Number(pideFiyat);
    if (!e || e <= 0) return Alert.alert("Hata", "Ekmek fiyatı geçersiz");
    if (!p || p <= 0) return Alert.alert("Hata", "Pide fiyatı geçersiz");

    await setDoc(
      doc(db, "settings", "prices"),
      { ekmek: e, pide: p, updatedAt: serverTimestamp() },
      { merge: true }
    );
    Alert.alert("Fiyatlar güncellendi");
  };

  const addBakery = async () => {
    if (!ilce) return Alert.alert("Hata", "İlçe seçiniz");
    if (!mahalle) return Alert.alert("Hata", "Mahalle seçiniz");
    if (!firinAdi.trim()) return Alert.alert("Hata", "Fırın adı giriniz");
    if (!bakeryCode.trim()) return Alert.alert("Hata", "Fırıncı kodu giriniz");

    await addDoc(collection(db, "bakeries"), {
      cityCode: ISTANBUL_CODE,
      cityName: "İstanbul",
      district: ilce,
      neighbourhood: mahalle,
      name: firinAdi.trim(),
      bakeryCode: bakeryCode.trim(),
      verified,

      pendingEkmek: 0,
      pendingPide: 0,
      leftTotalEkmek: 0,
      leftTotalPide: 0,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    Alert.alert("Fırın eklendi ✅");
    setFirinAdi("");
    setBakeryCode("");

    // listeyi yenile
    const b = await getDocs(collection(db, "bakeries"));
    setBakeries(b.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const addSponsor = async () => {
    const amount = Number(sponsorAmount);
    if (!sponsorName.trim()) return Alert.alert("Hata", "Sponsor adı giriniz");
    if (!amount || amount <= 0) return Alert.alert("Hata", "Ürün adedi geçersiz");

    await addDoc(collection(db, "sponsors"), {
      name: sponsorName.trim(),
      totalProducts: amount,
      remainingProducts: amount,
      distributedProducts: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    Alert.alert("Sponsor eklendi ✅");
    setSponsorName("");
    setSponsorAmount("");

    const s = await getDocs(collection(db, "sponsors"));
    setSponsors(s.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const distributeSponsor = async () => {
    const amount = Number(distAmount);
    if (!selectedSponsor) return Alert.alert("Hata", "Sponsor seçiniz");
    if (!selectedBakery) return Alert.alert("Hata", "Fırın seçiniz");
    if (!amount || amount <= 0) return Alert.alert("Hata", "Adet geçersiz");

    const sponsor = sponsors.find((x) => x.id === selectedSponsor);
    if (!sponsor) return Alert.alert("Hata", "Sponsor bulunamadı");
    if (Number(sponsor.remainingProducts ?? 0) < amount)
      return Alert.alert("Hata", "Sponsorun kalan ürünü yeterli değil");

    await updateDoc(doc(db, "sponsors", selectedSponsor), {
      remainingProducts: increment(-amount),
      distributedProducts: increment(amount),
      updatedAt: serverTimestamp(),
    });

    // Şimdilik sponsor ürünü "somun ekmek" gibi fırının pendingEkmek'ine ekliyoruz
    await updateDoc(doc(db, "bakeries", selectedBakery), {
      pendingEkmek: increment(amount),
      leftTotalEkmek: increment(amount),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "sponsor_distributions"), {
      sponsorId: selectedSponsor,
      sponsorName: sponsor.name,
      bakeryId: selectedBakery,
      amount,
      createdAt: serverTimestamp(),
    });

    Alert.alert("Dağıtım tamam ✅");
    setDistAmount("");

    // sponsor listesini yenile
    const s = await getDocs(collection(db, "sponsors"));
    setSponsors(s.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  if (!unlocked) {
    return (
      <View style={styles.lockWrap}>
        <Text style={styles.lockTitle}>Yönetim Paneli</Text>
        <TextInput
          placeholder="PIN"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            if (pin === ADMIN_PIN) setUnlocked(true);
            else Alert.alert("Yanlış PIN");
          }}
        >
          <Text style={styles.primaryBtnText}>Giriş</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: "#F8F8F8" }}>
      <Text style={styles.title}>Yönetim</Text>

      {/* UI AYARLARI */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ana Sayfa Ayarları</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Sponsorları ana sayfada göster</Text>
          <Switch
            value={showSponsorsOnHome}
            onValueChange={(v) => saveUiSettings(v)}
          />
        </View>
      </View>

      {/* FİYATLAR */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Fiyat Güncelle</Text>

        <Text style={styles.label}>Somun Ekmek (₺)</Text>
        <TextInput value={ekmekFiyat} onChangeText={setEkmekFiyat} keyboardType="numeric" style={styles.input} />

        <Text style={styles.label}>Ramazan Pidesi (₺)</Text>
        <TextInput value={pideFiyat} onChangeText={setPideFiyat} keyboardType="numeric" style={styles.input} />

        <TouchableOpacity style={styles.primaryBtn} onPress={savePrices}>
          <Text style={styles.primaryBtnText}>Fiyatları Kaydet</Text>
        </TouchableOpacity>
      </View>

      {/* FIRIN EKLE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Fırın Ekle</Text>

        <Text style={styles.label}>İl</Text>
        <View style={styles.fixedValue}>
          <Text style={styles.fixedText}>İstanbul</Text>
        </View>

        <Text style={styles.label}>İlçe</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={ilce} onValueChange={(v) => { setIlce(v); setMahalle(""); }} mode="dialog">
            <Picker.Item label="İlçe seçiniz..." value="" />
            {districts.map((d: string) => <Picker.Item key={d} label={d} value={d} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Mahalle</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={mahalle} onValueChange={setMahalle} enabled={!!ilce} mode="dialog">
            <Picker.Item label={ilce ? "Mahalle seçiniz..." : "Önce ilçe seçiniz"} value="" />
            {neighbourhoods.map((m: string) => <Picker.Item key={m} label={m} value={m} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Fırın Adı</Text>
        <TextInput value={firinAdi} onChangeText={setFirinAdi} style={styles.input} placeholder="Örn: Bereket Fırını" />

        <Text style={styles.label}>Fırıncı Kodu</Text>
        <TextInput value={bakeryCode} onChangeText={setBakeryCode} style={styles.input} placeholder="Örn: 100001" keyboardType="number-pad" />

        <Text style={styles.label}>Onay Durumu</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={verified ? "1" : "0"} onValueChange={(v) => setVerified(v === "1")} mode="dialog">
            <Picker.Item label="Onaylı" value="1" />
            <Picker.Item label="Onaysız" value="0" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={addBakery}>
          <Text style={styles.primaryBtnText}>Fırını Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* SPONSOR EKLE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sponsor Ekle</Text>

        <Text style={styles.label}>Sponsor Adı</Text>
        <TextInput value={sponsorName} onChangeText={setSponsorName} style={styles.input} placeholder="Örn: ABC Holding" />

        <Text style={styles.label}>Toplam Ürün</Text>
        <TextInput value={sponsorAmount} onChangeText={setSponsorAmount} style={styles.input} keyboardType="numeric" placeholder="Örn: 1000" />

        <TouchableOpacity style={styles.primaryBtn} onPress={addSponsor}>
          <Text style={styles.primaryBtnText}>Sponsor Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* SPONSOR DAĞIT */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sponsor Ürün Dağıt</Text>

        <Text style={styles.label}>Sponsor</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={selectedSponsor} onValueChange={setSelectedSponsor} mode="dialog">
            <Picker.Item label="Sponsor seçiniz..." value="" />
            {sponsors.map((s) => (
              <Picker.Item
                key={s.id}
                label={`${s.name} (Kalan: ${s.remainingProducts ?? 0})`}
                value={s.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Fırın</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={selectedBakery} onValueChange={setSelectedBakery} mode="dialog">
            <Picker.Item label="Fırın seçiniz..." value="" />
            {bakeries.map((b) => (
              <Picker.Item key={b.id} label={`${b.name} (${b.district ?? "-"})`} value={b.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Adet</Text>
        <TextInput value={distAmount} onChangeText={setDistAmount} style={styles.input} keyboardType="numeric" placeholder="Örn: 50" />

        <TouchableOpacity style={styles.primaryBtn} onPress={distributeSponsor}>
          <Text style={styles.primaryBtnText}>Dağıt</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "900", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  label: { marginTop: 8, fontWeight: "700", color: "#444" },
  card: {
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 15,
    elevation: 3,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
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
  fixedText: { fontWeight: "800" },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#F27A1A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "900" },
  lockWrap: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#F8F8F8" },
  lockTitle: { fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 10 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  switchLabel: { fontWeight: "800", color: "#333", flex: 1, paddingRight: 10 },
});