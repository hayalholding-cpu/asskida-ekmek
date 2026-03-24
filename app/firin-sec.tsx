import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

type Option = {
  label: string;
  value: string;
};

const cities: Option[] = [
  { label: "İstanbul", value: "istanbul" },
];

const districtsByCity: Record<string, Option[]> = {
  istanbul: [
    { label: "Kadıköy", value: "kadikoy" },
    { label: "Üsküdar", value: "uskudar" },
    { label: "Fatih", value: "fatih" },
    { label: "Beşiktaş", value: "besiktas" },
  ],
};

const neighborhoodsByDistrict: Record<string, Option[]> = {
  kadikoy: [
    { label: "Moda", value: "moda" },
    { label: "Fenerbahçe", value: "fenerbahce" },
    { label: "Kozyatağı", value: "kozyatagi" },
  ],
  uskudar: [
    { label: "Altunizade", value: "altunizade" },
    { label: "Çengelköy", value: "cengelkoy" },
    { label: "Acıbadem", value: "acibadem" },
  ],
  fatih: [
    { label: "Aksaray", value: "aksaray" },
    { label: "Balat", value: "balat" },
    { label: "Fındıkzade", value: "findikzade" },
  ],
  besiktas: [
    { label: "Levent", value: "levent" },
    { label: "Etiler", value: "etiler" },
    { label: "Ortaköy", value: "ortakoy" },
  ],
};

const bakeriesByNeighborhood: Record<string, Option[]> = {
  moda: [
    { label: "Moda Ekmek Fırını", value: "moda-ekmek-firini" },
    { label: "Günaydın Unlu Mamüller", value: "gunaydin-unlu" },
  ],
  fenerbahce: [
    { label: "Fener Taş Fırın", value: "fener-tas-firin" },
    { label: "Sahil Unlu Mamüller", value: "sahil-unlu" },
  ],
  kozyatagi: [
    { label: "Kozyatağı Halk Fırını", value: "kozyatagi-halk-firini" },
  ],
  altunizade: [
    { label: "Altunizade Ekmek Evi", value: "altunizade-ekmek-evi" },
  ],
  cengelkoy: [
    { label: "Çengelköy Fırın", value: "cengelkoy-firin" },
  ],
  acibadem: [
    { label: "Acıbadem Unlu Mamüller", value: "acibadem-unlu" },
  ],
  aksaray: [
    { label: "Aksaray Taş Fırın", value: "aksaray-tas-firin" },
  ],
  balat: [
    { label: "Balat Ekmekçisi", value: "balat-ekmekcisi" },
  ],
  findikzade: [
    { label: "Fındıkzade Fırın", value: "findikzade-firin" },
  ],
  levent: [
    { label: "Levent Unlu Mamüller", value: "levent-unlu" },
  ],
  etiler: [
    { label: "Etiler Ekmek Atölyesi", value: "etiler-ekmek-atolyesi" },
  ],
  ortakoy: [
    { label: "Ortaköy Taş Fırın", value: "ortakoy-tas-firin" },
  ],
};

function SelectCard({
  label,
  placeholder,
  value,
  options,
  onSelect,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.fieldCard, disabled && styles.fieldCardDisabled]}>
      <Text style={[styles.fieldLabel, disabled && styles.fieldLabelDisabled]}>
        {label}
      </Text>

      <Text style={[styles.selectedValue, !value && styles.placeholderText]}>
        {value || placeholder}
      </Text>

      <View style={styles.optionWrap}>
        {options.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {disabled ? "Önce üst alanı seçin" : "Seçenek bulunamadı"}
            </Text>
          </View>
        ) : (
          options.map((item) => {
            const active = value === item.label;
            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.85}
                disabled={disabled}
                onPress={() => onSelect(item.value)}
                style={[styles.optionChip, active && styles.optionChipActive]}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    active && styles.optionChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}

export default function FirinSecScreen() {
  const router = useRouter();

  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [bakery, setBakery] = useState("");

  const districtOptions = useMemo(() => {
    return city ? districtsByCity[city] || [] : [];
  }, [city]);

  const neighborhoodOptions = useMemo(() => {
    return district ? neighborhoodsByDistrict[district] || [] : [];
  }, [district]);

  const bakeryOptions = useMemo(() => {
    return neighborhood ? bakeriesByNeighborhood[neighborhood] || [] : [];
  }, [neighborhood]);

  const selectedCityLabel =
    cities.find((item) => item.value === city)?.label || "";
  const selectedDistrictLabel =
    districtOptions.find((item) => item.value === district)?.label || "";
  const selectedNeighborhoodLabel =
    neighborhoodOptions.find((item) => item.value === neighborhood)?.label || "";
  const selectedBakeryLabel =
    bakeryOptions.find((item) => item.value === bakery)?.label || "";

  const isReady =
    !!selectedCityLabel &&
    !!selectedDistrictLabel &&
    !!selectedNeighborhoodLabel &&
    !!selectedBakeryLabel;

  const handleCitySelect = (value: string) => {
    setCity(value);
    setDistrict("");
    setNeighborhood("");
    setBakery("");
  };

  const handleDistrictSelect = (value: string) => {
    setDistrict(value);
    setNeighborhood("");
    setBakery("");
  };

  const handleNeighborhoodSelect = (value: string) => {
    setNeighborhood(value);
    setBakery("");
  };

  const handleContinue = () => {
    if (!isReady) return;

    router.push({
      pathname: "/ekmek-birak",
      params: {
        city: selectedCityLabel,
        district: selectedDistrictLabel,
        neighborhood: selectedNeighborhoodLabel,
        bakery: selectedBakeryLabel,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF4E1" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.stepText}>1 / 3</Text>
          <Text style={styles.title}>Fırın Seçimi</Text>
          <Text style={styles.desc}>
            Askıya ekmek bırakacağınız konumu ve fırını seçin.
          </Text>
        </View>

        <SelectCard
          label="İl"
          placeholder="İl seçiniz"
          value={selectedCityLabel}
          options={cities}
          onSelect={handleCitySelect}
        />

        <SelectCard
          label="İlçe"
          placeholder="İlçe seçiniz"
          value={selectedDistrictLabel}
          options={districtOptions}
          onSelect={handleDistrictSelect}
          disabled={!city}
        />

        <SelectCard
          label="Mahalle"
          placeholder="Mahalle seçiniz"
          value={selectedNeighborhoodLabel}
          options={neighborhoodOptions}
          onSelect={handleNeighborhoodSelect}
          disabled={!district}
        />

        <SelectCard
          label="Fırın"
          placeholder="Fırın seçiniz"
          value={selectedBakeryLabel}
          options={bakeryOptions}
          onSelect={(value) => setBakery(value)}
          disabled={!neighborhood}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Seçim Özeti</Text>

          <Text style={styles.summaryLine}>
            İl: <Text style={styles.summaryValue}>{selectedCityLabel || "-"}</Text>
          </Text>
          <Text style={styles.summaryLine}>
            İlçe:{" "}
            <Text style={styles.summaryValue}>{selectedDistrictLabel || "-"}</Text>
          </Text>
          <Text style={styles.summaryLine}>
            Mahalle:{" "}
            <Text style={styles.summaryValue}>
              {selectedNeighborhoodLabel || "-"}
            </Text>
          </Text>
          <Text style={styles.summaryLine}>
            Fırın:{" "}
            <Text style={styles.summaryValue}>{selectedBakeryLabel || "-"}</Text>
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleContinue}
          disabled={!isReady}
          style={[
            styles.continueButton,
            !isReady && styles.continueButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.continueButtonText,
              !isReady && styles.continueButtonTextDisabled,
            ]}
          >
            DEVAM ET
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF4E1",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C26A00",
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#16213E",
    marginBottom: 10,
  },
  desc: {
    fontSize: 15,
    color: "#667085",
    lineHeight: 23,
  },
  fieldCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  fieldCardDisabled: {
    opacity: 0.72,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
  },
  fieldLabelDisabled: {
    color: "#9CA3AF",
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C25B00",
    marginBottom: 14,
  },
  placeholderText: {
    color: "#9CA3AF",
    fontWeight: "500",
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#FFF2DE",
    borderWidth: 1,
    borderColor: "#F3D2A2",
  },
  optionChipActive: {
    backgroundColor: "#FFEDD5",
    borderColor: "#F97316",
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C4A03",
  },
  optionChipTextActive: {
    color: "#C2410C",
    fontWeight: "800",
  },
  emptyBox: {
    width: "100%",
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 20,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#F2D5AA",
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#16213E",
    marginBottom: 10,
  },
  summaryLine: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
    lineHeight: 22,
  },
  summaryValue: {
    color: "#1F2937",
    fontWeight: "700",
  },
  continueButton: {
    marginTop: 22,
    backgroundColor: "#F97316",
    borderRadius: 18,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: "#FED7AA",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  continueButtonTextDisabled: {
    color: "#9A3412",
  },
});