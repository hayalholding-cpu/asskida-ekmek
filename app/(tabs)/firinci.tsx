import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { deliverSuspendedProduct } from "../../lib/api";
import { db } from "../../lib/firebase";

type BakeryDoc = {
  id: string;
  bakeryName?: string;
  bakeryCode?: string;
  bakeryPassword?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  districtSlug?: string;
  neighborhoodSlug?: string;
  pendingEkmek?: number;
  pendingPide?: number;
  deliveredEkmek?: number;
  deliveredPide?: number;
  isActive?: boolean;
  verified?: boolean;
  email?: string;
  phone?: string;
  uid?: string;
};

type DailyDeliveryDoc = {
  ekmek?: number;
  pide?: number;
  deliveredEkmek?: number;
  deliveredPide?: number;
};

type BakeryTransaction = {
  id?: string;
  bakeryId?: string;
  bakeryName?: string;
  type?: string;
  source?: string;
  productType?: string;
  count?: number;
  createdAt?: any;
  note?: string;
};

function safeNumber(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeText(value: any) {
  return String(value ?? "").trim().toLowerCase();
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function toDateSafe(dateValue: any): Date | null {
  try {
    if (!dateValue) return null;

    if (typeof dateValue?.toDate === "function") {
      const d = dateValue.toDate();
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
    }

    if (dateValue instanceof Date) {
      return Number.isNaN(dateValue.getTime()) ? null : dateValue;
    }

    if (typeof dateValue === "string" || typeof dateValue === "number") {
      const d = new Date(dateValue);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    return null;
  } catch {
    return null;
  }
}

function sameDay(dateValue: any) {
  const date = toDateSafe(dateValue);
  if (!date) return false;

  try {
    return date.toISOString().slice(0, 10) === getTodayKey();
  } catch {
    return false;
  }
}

function getIncomingProduct(tx: BakeryTransaction): "ekmek" | "pide" | null {
  const type = normalizeText(tx.type);
  const source = normalizeText(tx.source);
  const productType = normalizeText(tx.productType);

  const merged = `${type} ${source} ${productType}`;

  const isIncoming =
    merged.includes("mobile-payment") ||
    merged.includes("payment") ||
    merged.includes("admin-add-bread") ||
    merged.includes("admin-add-pide") ||
    merged.includes("manual-credit") ||
    merged.includes("incoming") ||
    merged.includes("in");

  if (!isIncoming) return null;

  if (merged.includes("pide")) return "pide";
  if (merged.includes("ekmek") || merged.includes("bread")) return "ekmek";

  return null;
}

function getDeliveredProduct(tx: BakeryTransaction): "ekmek" | "pide" | null {
  const type = normalizeText(tx.type);
  const source = normalizeText(tx.source);
  const productType = normalizeText(tx.productType);

  const merged = `${type} ${source} ${productType}`;

  const isDelivered =
    merged.includes("askidan-ekmek-verildi") ||
    merged.includes("askidan-pide-verildi") ||
    merged.includes("delivered") ||
    merged.includes("delivery") ||
    merged.includes("verildi") ||
    merged.includes("bakery-panel") ||
    merged.includes("tabela-mode");

  if (!isDelivered) return null;

  if (merged.includes("pide")) return "pide";
  if (merged.includes("ekmek") || merged.includes("bread")) return "ekmek";

  return null;
}

function getProductLabel(productType?: string) {
  const p = normalizeText(productType);
  if (p.includes("pide")) return "Ramazan Pidesi";
  return "Somun Ekmek";
}

function getTransactionTypeLabel(tx: BakeryTransaction) {
  const merged = `${normalizeText(tx.type)} ${normalizeText(tx.source)} ${normalizeText(
    tx.productType
  )}`;

  if (
    merged.includes("askidan-ekmek-verildi") ||
    merged.includes("askidan-pide-verildi") ||
    merged.includes("verildi") ||
    merged.includes("delivery") ||
    merged.includes("bakery-panel") ||
    merged.includes("tabela-mode")
  ) {
    return "Teslim";
  }

  if (
    merged.includes("mobile-payment") ||
    merged.includes("payment") ||
    merged.includes("admin-add-bread") ||
    merged.includes("admin-add-pide") ||
    merged.includes("manual-credit") ||
    merged.includes("incoming") ||
    merged.includes("in")
  ) {
    return "Gelen";
  }

  return "İşlem";
}

function getTransactionTimeText(createdAt: any) {
  try {
    const date = toDateSafe(createdAt);
    if (!date) return "--:--";

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  } catch {
    return "--:--";
  }
}

export default function FirinciPanel() {
  const [bakeryCode, setBakeryCode] = useState("");
  const [bakeryPassword, setBakeryPassword] = useState("");

  const [bakeryId, setBakeryId] = useState<string | null>(null);
  const [bakery, setBakery] = useState<BakeryDoc | null>(null);

  const [loginLoading, setLoginLoading] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const [deliverEkmek, setDeliverEkmek] = useState(0);
  const [deliverPide, setDeliverPide] = useState(0);

  const [todayDeliveredEkmek, setTodayDeliveredEkmek] = useState(0);
  const [todayDeliveredPide, setTodayDeliveredPide] = useState(0);

  const [todayIncomingEkmek, setTodayIncomingEkmek] = useState(0);
  const [todayIncomingPide, setTodayIncomingPide] = useState(0);

  const [recentTransactions] = useState<BakeryTransaction[]>([]);

  useEffect(() => {
    if (!bakeryId) return;

    setPanelLoading(true);

    const bakeryRef = doc(db, "bakeries", bakeryId);

    const unsub = onSnapshot(
      bakeryRef,
      (snap) => {
        if (!snap.exists()) {
          setBakery(null);
          setBakeryId(null);
          setPanelLoading(false);
          return;
        }

        const data = { id: snap.id, ...(snap.data() as Omit<BakeryDoc, "id">) };
        setBakery(data);

        const pendingE = safeNumber(data.pendingEkmek);
        const pendingP = safeNumber(data.pendingPide);

        setDeliverEkmek((prev) => Math.min(Math.max(prev, 0), pendingE));
        setDeliverPide((prev) => Math.min(Math.max(prev, 0), pendingP));
        setPanelLoading(false);
      },
      () => {
        setPanelLoading(false);
      }
    );

    return () => unsub();
  }, [bakeryId]);

  useEffect(() => {
    if (!bakeryId) {
      setTodayDeliveredEkmek(0);
      setTodayDeliveredPide(0);
      return;
    }

    const dayKey = getTodayKey();
    const dayRef = doc(db, "deliveries_daily", `${bakeryId}_${dayKey}`);

    const unsub = onSnapshot(
      dayRef,
      (snap) => {
        try {
          if (!snap.exists()) {
            setTodayDeliveredEkmek(0);
            setTodayDeliveredPide(0);
            return;
          }

          const data = snap.data() as DailyDeliveryDoc;
          setTodayDeliveredEkmek(
            safeNumber(data?.ekmek || data?.deliveredEkmek)
          );
          setTodayDeliveredPide(
            safeNumber(data?.pide || data?.deliveredPide)
          );
        } catch {
          setTodayDeliveredEkmek(0);
          setTodayDeliveredPide(0);
        }
      },
      () => {
        setTodayDeliveredEkmek(0);
        setTodayDeliveredPide(0);
      }
    );

    return () => unsub();
  }, [bakeryId]);

  useEffect(() => {
    if (!bakeryId) {
      setTodayIncomingEkmek(0);
      setTodayIncomingPide(0);
      return;
    }

    let isMounted = true;

    try {
      const txQuery = query(
        collection(db, "bakery_transactions"),
        where("bakeryId", "==", bakeryId)
      );

      const unsub = onSnapshot(
        txQuery,
        (snap) => {
          if (!isMounted) return;

          try {
            let ekmek = 0;
            let pide = 0;

            snap.forEach((docSnap) => {
              try {
                const raw = docSnap.data() || {};

                const tx: BakeryTransaction = {
                  id: docSnap.id,
                  bakeryId: String(raw.bakeryId ?? ""),
                  bakeryName: String(raw.bakeryName ?? ""),
                  type: String(raw.type ?? ""),
                  source: String(raw.source ?? ""),
                  productType: String(raw.productType ?? ""),
                  count: safeNumber(raw.count),
                  createdAt: raw.createdAt ?? null,
                  note: String(raw.note ?? ""),
                };

                const count = safeNumber(tx.count);

                if (!sameDay(tx.createdAt)) return;
                if (count <= 0) return;

                const incomingProduct = getIncomingProduct(tx);

                if (incomingProduct === "ekmek") ekmek += count;
                if (incomingProduct === "pide") pide += count;
              } catch (itemError) {
                console.log("Transaction item parse hatası:", itemError);
                return;
              }
            });

            if (!isMounted) return;

            setTodayIncomingEkmek(ekmek);
            setTodayIncomingPide(pide);
          } catch (snapshotError) {
            console.log("Transaction snapshot parse hatası:", snapshotError);

            if (!isMounted) return;
            setTodayIncomingEkmek(0);
            setTodayIncomingPide(0);
          }
        },
        (error) => {
          console.log("Transaction listener hatası:", error);

          if (!isMounted) return;
          setTodayIncomingEkmek(0);
          setTodayIncomingPide(0);
        }
      );

      return () => {
        isMounted = false;
        unsub();
      };
    } catch (error) {
      console.log("Transaction listener kurulum hatası:", error);
      setTodayIncomingEkmek(0);
      setTodayIncomingPide(0);

      return () => {
        isMounted = false;
      };
    }
  }, [bakeryId]);

  const pendingEkmek = useMemo(() => safeNumber(bakery?.pendingEkmek), [bakery]);
  const pendingPide = useMemo(() => safeNumber(bakery?.pendingPide), [bakery]);

  const totalDeliveredEkmek = useMemo(
    () => safeNumber(bakery?.deliveredEkmek),
    [bakery]
  );
  const totalDeliveredPide = useMemo(
    () => safeNumber(bakery?.deliveredPide),
    [bakery]
  );

  const totalIncomingEkmek = useMemo(
    () => pendingEkmek + totalDeliveredEkmek,
    [pendingEkmek, totalDeliveredEkmek]
  );
  const totalIncomingPide = useMemo(
    () => pendingPide + totalDeliveredPide,
    [pendingPide, totalDeliveredPide]
  );

  const totalPending = pendingEkmek + pendingPide;
  const totalTodayIncoming = todayIncomingEkmek + todayIncomingPide;
  const totalTodayDelivered = todayDeliveredEkmek + todayDeliveredPide;
  const totalDeliveredAll = totalDeliveredEkmek + totalDeliveredPide;
  const totalIncomingAll = totalIncomingEkmek + totalIncomingPide;

  const resetSession = () => {
    setBakeryId(null);
    setBakery(null);
    setDeliverEkmek(0);
    setDeliverPide(0);
    setTodayDeliveredEkmek(0);
    setTodayDeliveredPide(0);
    setTodayIncomingEkmek(0);
    setTodayIncomingPide(0);
  };

  const handleLogin = async () => {
    const code = bakeryCode.trim();
    const password = bakeryPassword.trim();

    if (!code) {
      return Alert.alert("Hata", "Fırıncı kodu giriniz.");
    }

    if (!password) {
      return Alert.alert("Hata", "Şifre giriniz.");
    }

    setLoginLoading(true);

    try {
      const qy = query(
        collection(db, "bakeries"),
        where("bakeryCode", "==", code)
      );

      const snap = await getDocs(qy);

      if (snap.empty) {
        resetSession();
        Alert.alert("Giriş Başarısız", "Bu koda ait fırın bulunamadı.");
        setLoginLoading(false);
        return;
      }

      const first = snap.docs[0];
      const data = first.data() as BakeryDoc;
      const savedPassword = String(data?.bakeryPassword ?? "").trim();

      if (!savedPassword) {
        resetSession();
        Alert.alert(
          "Şifre Tanımlı Değil",
          "Bu fırın için henüz şifre tanımlanmamış. Yönetim panelinden şifre ekleyin."
        );
        setLoginLoading(false);
        return;
      }

      if (savedPassword !== password) {
        resetSession();
        Alert.alert("Giriş Başarısız", "Fırıncı kodu veya şifre hatalı.");
        setLoginLoading(false);
        return;
      }

      if (data?.isActive === false) {
        resetSession();
        Alert.alert("Pasif Hesap", "Bu fırın hesabı pasif durumda.");
        setLoginLoading(false);
        return;
      }

      setBakeryId(first.id);
      setDeliverEkmek(0);
      setDeliverPide(0);

      Alert.alert("Giriş Başarılı", "Fırın paneli açıldı.");
    } catch (error: any) {
      Alert.alert("Hata", error?.message ?? "Giriş sırasında hata oluştu.");
    }

    setLoginLoading(false);
  };

  const step = (type: "ekmek" | "pide", dir: -1 | 1) => {
    if (type === "ekmek") {
      setDeliverEkmek((prev) => {
        const next = prev + dir;
        if (next < 0) return 0;
        if (next > pendingEkmek) return pendingEkmek;
        return next;
      });
      return;
    }

    setDeliverPide((prev) => {
      const next = prev + dir;
      if (next < 0) return 0;
      if (next > pendingPide) return pendingPide;
      return next;
    });
  };

  const setQuickAmount = (type: "ekmek" | "pide", amount: number) => {
    if (type === "ekmek") {
      setDeliverEkmek(Math.min(Math.max(amount, 0), pendingEkmek));
      return;
    }

    setDeliverPide(Math.min(Math.max(amount, 0), pendingPide));
  };

  const teslimEt = async () => {
    if (!bakeryId || !bakery) {
      return Alert.alert("Hata", "Önce giriş yapınız.");
    }

    if (deliverEkmek === 0 && deliverPide === 0) {
      return Alert.alert("Uyarı", "Teslim edilecek adet seçiniz.");
    }

    const ekmekToDeliver = Math.min(deliverEkmek, pendingEkmek);
    const pideToDeliver = Math.min(deliverPide, pendingPide);

    if (ekmekToDeliver === 0 && pideToDeliver === 0) {
      return Alert.alert("Uyarı", "Bekleyen ürün yok veya seçim geçersiz.");
    }

    setDeliveryLoading(true);

    try {
      if (ekmekToDeliver > 0) {
        await deliverSuspendedProduct({
          bakeryId,
          productType: "ekmek",
          count: ekmekToDeliver,
          source: "bakery-panel",
          note: "Fırıncı panelinden askıdan ekmek teslim edildi",
        });
      }

      if (pideToDeliver > 0) {
        await deliverSuspendedProduct({
          bakeryId,
          productType: "pide",
          count: pideToDeliver,
          source: "bakery-panel",
          note: "Fırıncı panelinden askıdan pide teslim edildi",
        });
      }

      setDeliverEkmek(0);
      setDeliverPide(0);

      Alert.alert("Başarılı", "Teslim işlemi kaydedildi ve askıdan düşürüldü.");
    } catch (error: any) {
      Alert.alert("Hata", error?.message ?? "Teslim işlemi yapılamadı.");
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleLogout = () => {
    resetSession();
    setBakeryCode("");
    setBakeryPassword("");
    Alert.alert("Çıkış Yapıldı", "Fırıncı oturumu kapatıldı.");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {!bakery ? (
        <>
          <Text style={styles.loginTitle}>Fırıncı Girişi</Text>
          <Text style={styles.loginSubtitle}>
            Fırıncı kodu ve şifreniz ile giriş yapın.
          </Text>

          <View style={styles.loginCard}>
            <Text style={styles.label}>Fırıncı Kodu</Text>
            <TextInput
              value={bakeryCode}
              onChangeText={setBakeryCode}
              placeholder="Örn: 850563"
              keyboardType="number-pad"
              style={styles.input}
              editable={!loginLoading}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Şifre</Text>
            <TextInput
              value={bakeryPassword}
              onChangeText={setBakeryPassword}
              placeholder="Şifrenizi girin"
              secureTextEntry
              style={styles.input}
              editable={!loginLoading}
            />

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleLogin}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.topBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>Fırıncı Paneli</Text>
              <Text style={styles.pageSubtitle}>
                Canlı veri, hızlı teslim ve güçlü istatistik görünümü
              </Text>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Çıkış</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bakeryCard}>
            <View style={styles.bakeryHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bakeryName}>
                  {bakery.bakeryName || "Fırın"}
                </Text>
                <Text style={styles.subText}>
                  {bakery.district || "-"} / {bakery.neighborhood || "-"}
                </Text>
              </View>

              <View
                style={[
                  styles.badge,
                  bakery.isActive === false ? styles.badgeNo : styles.badgeOk,
                ]}
              >
                <Text style={styles.badgeText}>
                  {bakery.isActive === false ? "Pasif" : "Aktif"}
                </Text>
              </View>
            </View>

            <Text style={styles.codeText}>
              Fırıncı Kodu: {bakery.bakeryCode || "-"}
            </Text>
          </View>

          {panelLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#F27A1A" />
            </View>
          ) : (
            <>
              <View style={styles.kpiGrid}>
                <View style={[styles.kpiCard, styles.kpiCardPrimary]}>
                  <Text style={styles.kpiLabelPrimary}>Bugün Gelen</Text>
                  <Text style={styles.kpiValuePrimary}>{totalTodayIncoming}</Text>
                  <Text style={styles.kpiSubPrimary}>
                    Ekmek: {todayIncomingEkmek} • Pide: {todayIncomingPide}
                  </Text>
                </View>

                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Bugün Verilen</Text>
                  <Text style={styles.kpiValue}>{totalTodayDelivered}</Text>
                  <Text style={styles.kpiSub}>
                    Ekmek: {todayDeliveredEkmek} • Pide: {todayDeliveredPide}
                  </Text>
                </View>

                <View style={styles.kpiCard}>
                  <Text style={styles.kpiLabel}>Askıda Bekleyen</Text>
                  <Text style={styles.kpiValue}>{totalPending}</Text>
                  <Text style={styles.kpiSub}>
                    Ekmek: {pendingEkmek} • Pide: {pendingPide}
                  </Text>
                </View>

                <View style={styles.kpiCardDark}>
                  <Text style={styles.kpiLabelDark}>Toplam Verilen</Text>
                  <Text style={styles.kpiValueDark}>{totalDeliveredAll}</Text>
                  <Text style={styles.kpiSubDark}>
                    Ekmek: {totalDeliveredEkmek} • Pide: {totalDeliveredPide}
                  </Text>
                </View>
              </View>

              <View style={styles.heroCard}>
                <Text style={styles.heroTitle}>Hızlı Askı İşlemi</Text>
                <Text style={styles.heroHint}>
                  Önce adet seçin, sonra teslim butonuna basın.
                </Text>

                <View style={styles.remainingRow}>
                  <View style={styles.remainingCard}>
                    <Text style={styles.remainingLabel}>Kalan Ekmek</Text>
                    <Text style={styles.remainingValue}>{pendingEkmek}</Text>
                  </View>

                  <View style={styles.remainingCard}>
                    <Text style={styles.remainingLabel}>Kalan Pide</Text>
                    <Text style={styles.remainingValue}>{pendingPide}</Text>
                  </View>
                </View>

                <View style={styles.productActionCard}>
                  <View style={styles.productHeaderBlock}>
                    <Text style={styles.productTitle}>Somun Ekmek</Text>
                    <Text style={styles.productSub}>Bekleyen: {pendingEkmek}</Text>
                  </View>

                  <View style={styles.stepperLargeFull}>
                    <TouchableOpacity
                      style={styles.stepBtnLarge}
                      onPress={() => step("ekmek", -1)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.stepBtnTextLarge}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.stepValueLarge}>{deliverEkmek}</Text>

                    <TouchableOpacity
                      style={styles.stepBtnLarge}
                      onPress={() => step("ekmek", +1)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.stepBtnTextLarge}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.quickRow}>
                    <TouchableOpacity
                      style={styles.quickBtn}
                      onPress={() => setQuickAmount("ekmek", 1)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.quickBtnText}>1</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickBtn}
                      onPress={() => setQuickAmount("ekmek", 5)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.quickBtnText}>5</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickBtn}
                      onPress={() => setQuickAmount("ekmek", 10)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.quickBtnText}>10</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickBtnWide}
                      onPress={() => setQuickAmount("ekmek", pendingEkmek)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.quickBtnText}>Tümü</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.productActionCardSecondary}>
                  <View style={styles.productHeaderBlock}>
                    <Text style={styles.productTitle}>Ramazan Pidesi</Text>
                    <Text style={styles.productSub}>Bekleyen: {pendingPide}</Text>
                  </View>

                  <View style={styles.stepperFull}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => step("pide", -1)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.stepBtnText}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.stepValue}>{deliverPide}</Text>

                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => step("pide", +1)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.quickRow}>
                    <TouchableOpacity
                      style={styles.quickBtnMuted}
                      onPress={() => setQuickAmount("pide", 1)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.quickBtnMutedText}>1</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickBtnMuted}
                      onPress={() => setQuickAmount("pide", 5)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.quickBtnMutedText}>5</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickBtnMuted}
                      onPress={() => setQuickAmount("pide", 10)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.quickBtnMutedText}>10</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickBtnWideMuted}
                      onPress={() => setQuickAmount("pide", pendingPide)}
                      disabled={deliveryLoading}
                    >
                      <Text style={styles.quickBtnMutedText}>Tümü</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.mainActionBtn,
                    deliveryLoading && styles.mainActionBtnDisabled,
                  ]}
                  onPress={teslimEt}
                  disabled={deliveryLoading}
                >
                  {deliveryLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.mainActionBtnText}>ASKIDAN DÜŞ</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>Ürün Bazlı İstatistikler</Text>

                <View style={styles.productStatsCardPrimary}>
                  <View style={styles.productStatsHeader}>
                    <Text style={styles.productStatsTitle}>Somun Ekmek</Text>
                    <Text style={styles.productStatsBadge}>Canlı</Text>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statsMiniCard}>
                      <Text style={styles.statsMiniLabel}>Bugün Gelen</Text>
                      <Text style={styles.statsMiniValue}>{todayIncomingEkmek}</Text>
                    </View>
                    <View style={styles.statsMiniCard}>
                      <Text style={styles.statsMiniLabel}>Bugün Verilen</Text>
                      <Text style={styles.statsMiniValue}>{todayDeliveredEkmek}</Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statsMiniCard}>
                      <Text style={styles.statsMiniLabel}>Bekleyen</Text>
                      <Text style={styles.statsMiniValue}>{pendingEkmek}</Text>
                    </View>
                    <View style={styles.statsMiniCard}>
                      <Text style={styles.statsMiniLabel}>Toplam Verilen</Text>
                      <Text style={styles.statsMiniValue}>{totalDeliveredEkmek}</Text>
                    </View>
                  </View>

                  <View style={styles.productSummaryStrip}>
                    <Text style={styles.productSummaryText}>
                      Toplam Gelen: {totalIncomingEkmek}
                    </Text>
                  </View>
                </View>

                <View style={styles.productStatsCardSecondary}>
                  <View style={styles.productStatsHeader}>
                    <Text style={styles.productStatsTitle}>Ramazan Pidesi</Text>
                    <Text style={[styles.productStatsBadge, styles.productStatsBadgeMuted]}>
                      Canlı
                    </Text>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statsMiniCard}>
                      <Text style={styles.statsMiniLabel}>Bugün Gelen</Text>
                      <Text style={styles.statsMiniValue}>{todayIncomingPide}</Text>
                    </View>
                    <View style={styles.statsMiniCard}>
                      <Text style={styles.statsMiniLabel}>Bugün Verilen</Text>
                      <Text style={styles.statsMiniValue}>{todayDeliveredPide}</Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statsMiniCard}>
                      <Text style={styles.statsMiniLabel}>Bekleyen</Text>
                      <Text style={styles.statsMiniValue}>{pendingPide}</Text>
                    </View>
                    <View style={styles.statsMiniCard}>
                      <Text style={styles.statsMiniLabel}>Toplam Verilen</Text>
                      <Text style={styles.statsMiniValue}>{totalDeliveredPide}</Text>
                    </View>
                  </View>

                  <View style={[styles.productSummaryStrip, styles.productSummaryStripMuted]}>
                    <Text style={styles.productSummaryTextMuted}>
                      Toplam Gelen: {totalIncomingPide}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeader}>Genel Toplamlar</Text>

                <View style={styles.doubleRow}>
                  <View style={styles.softCard}>
                    <Text style={styles.softTitle}>Toplam Gelen</Text>
                    <Text style={styles.softMain}>{totalIncomingAll}</Text>
                    <Text style={styles.softSub}>
                      Ekmek: {totalIncomingEkmek} • Pide: {totalIncomingPide}
                    </Text>
                  </View>

                  <View style={styles.softCard}>
                    <Text style={styles.softTitle}>Toplam Verilen</Text>
                    <Text style={styles.softMain}>{totalDeliveredAll}</Text>
                    <Text style={styles.softSub}>
                      Ekmek: {totalDeliveredEkmek} • Pide: {totalDeliveredPide}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  loginTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginTop: 6,
  },
  loginSubtitle: {
    marginTop: 8,
    marginBottom: 18,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECE4D6",
    elevation: 3,
  },

  label: {
    fontWeight: "800",
    color: "#374151",
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#F27A1A",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  pageSubtitle: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  logoutBtn: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  logoutBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
  },

  bakeryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE4D6",
    elevation: 2,
  },
  bakeryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bakeryName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  subText: {
    marginTop: 4,
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 14,
  },
  codeText: {
    marginTop: 10,
    color: "#9A6500",
    fontWeight: "900",
    fontSize: 16,
  },

  badge: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  badgeOk: {
    backgroundColor: "#EAF7EE",
  },
  badgeNo: {
    backgroundColor: "#FFE9E9",
  },
  badgeText: {
    fontWeight: "900",
    color: "#334155",
    fontSize: 12,
  },

  loadingWrap: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  kpiGrid: {
    marginBottom: 14,
  },
  kpiCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECE4D6",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  kpiCardPrimary: {
    backgroundColor: "#FFF4E5",
    borderColor: "#F6D7A8",
  },
  kpiCardDark: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  kpiLabel: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "800",
  },
  kpiValue: {
    marginTop: 6,
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
  },
  kpiSub: {
    marginTop: 6,
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  kpiLabelPrimary: {
    color: "#8A4B00",
    fontSize: 13,
    fontWeight: "900",
  },
  kpiValuePrimary: {
    marginTop: 6,
    color: "#F27A1A",
    fontSize: 32,
    fontWeight: "900",
  },
  kpiSubPrimary: {
    marginTop: 6,
    color: "#8A4B00",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  kpiLabelDark: {
    color: "#D1D5DB",
    fontSize: 13,
    fontWeight: "900",
  },
  kpiValueDark: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },
  kpiSubDark: {
    marginTop: 6,
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#ECE4D6",
    elevation: 3,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  heroHint: {
    marginTop: 4,
    marginBottom: 14,
    color: "#6B7280",
    fontWeight: "700",
    lineHeight: 20,
  },

  remainingRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  remainingCard: {
    flex: 1,
    backgroundColor: "#FFF2DD",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F6D7A8",
  },
  remainingLabel: {
    color: "#8A4B00",
    fontWeight: "900",
    fontSize: 14,
  },
  remainingValue: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: "900",
    color: "#F27A1A",
  },

  productActionCard: {
    backgroundColor: "#FFF8EC",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F6D7A8",
    marginBottom: 12,
  },
  productActionCardSecondary: {
    backgroundColor: "#FAF8F3",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ECE4D6",
    marginBottom: 14,
  },
  productHeaderBlock: {
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  productSub: {
    marginTop: 4,
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 16,
  },

  stepperLargeFull: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFECCB",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stepBtnLarge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F27A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnTextLarge: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 30,
  },
  stepValueLarge: {
    minWidth: 40,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 26,
    color: "#111827",
  },

  stepperFull: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4EFE5",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F27A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 24,
  },
  stepValue: {
    minWidth: 34,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 22,
    color: "#111827",
  },

  quickRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3C780",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  quickBtnWide: {
    flex: 1.2,
    backgroundColor: "#FFF1D8",
    borderWidth: 1,
    borderColor: "#F3C780",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  quickBtnText: {
    color: "#8A4B00",
    fontWeight: "900",
    fontSize: 14,
  },

  quickBtnMuted: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCCFBC",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  quickBtnWideMuted: {
    flex: 1.2,
    backgroundColor: "#F6F0E6",
    borderWidth: 1,
    borderColor: "#DCCFBC",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  quickBtnMutedText: {
    color: "#5B6472",
    fontWeight: "900",
    fontSize: 14,
  },

  mainActionBtn: {
    marginTop: 4,
    backgroundColor: "#111827",
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: "center",
    elevation: 3,
  },
  mainActionBtnDisabled: {
    opacity: 0.7,
  },
  mainActionBtnText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECE4D6",
    elevation: 2,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },

  productStatsCardPrimary: {
    backgroundColor: "#FFF8EC",
    borderWidth: 1,
    borderColor: "#F6D7A8",
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  productStatsCardSecondary: {
    backgroundColor: "#FAF8F3",
    borderWidth: 1,
    borderColor: "#ECE4D6",
    borderRadius: 20,
    padding: 14,
  },
  productStatsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  productStatsTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  productStatsBadge: {
    backgroundColor: "#F27A1A",
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  productStatsBadgeMuted: {
    backgroundColor: "#5B6472",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  statsMiniCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEE7DA",
  },
  statsMiniLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "800",
  },
  statsMiniValue: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },

  productSummaryStrip: {
    marginTop: 2,
    backgroundColor: "#FFEFD3",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  productSummaryStripMuted: {
    backgroundColor: "#F1EBE2",
  },
  productSummaryText: {
    color: "#8A4B00",
    fontWeight: "900",
    fontSize: 13,
  },
  productSummaryTextMuted: {
    color: "#4B5563",
    fontWeight: "900",
    fontSize: 13,
  },

  doubleRow: {
    flexDirection: "row",
    gap: 10,
  },
  softCard: {
    flex: 1,
    backgroundColor: "#FAF8F3",
    borderWidth: 1,
    borderColor: "#EEE7DA",
    borderRadius: 18,
    padding: 14,
  },
  softTitle: {
    color: "#6B7280",
    fontWeight: "800",
    fontSize: 13,
  },
  softMain: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },
  softSub: {
    marginTop: 6,
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 18,
  },

  emptyTxCard: {
    backgroundColor: "#FAF8F3",
    borderWidth: 1,
    borderColor: "#EEE7DA",
    borderRadius: 18,
    padding: 16,
  },
  emptyTxTitle: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 15,
  },
  emptyTxSub: {
    marginTop: 6,
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 18,
  },

  txRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAF8F3",
    borderWidth: 1,
    borderColor: "#EEE7DA",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  txLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingRight: 10,
  },
  txDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginTop: 5,
  },
  txDotOrange: {
    backgroundColor: "#F27A1A",
  },
  txDotDark: {
    backgroundColor: "#111827",
  },
  txTitle: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 14,
    lineHeight: 20,
  },
  txSub: {
    marginTop: 3,
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 17,
  },
  txRight: {
    alignItems: "flex-end",
    minWidth: 56,
  },
  txCount: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 20,
  },
  txTime: {
    marginTop: 2,
    color: "#6B7280",
    fontWeight: "800",
    fontSize: 12,
  },
});