import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";

export const DEFAULT_CITY_ID = "istanbul";

export async function fetchCities() {
  const q = query(collection(db, "cities"), orderBy("order", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }));
}

export async function fetchDistricts(cityId: string) {
  const q = query(
    collection(db, "districts"),
    where("cityId", "==", cityId),
    orderBy("order", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }));
}

export async function fetchNeighborhoods(cityId: string, districtId: string) {
  const q = query(
    collection(db, "neighborhoods"),
    where("cityId", "==", cityId),
    where("districtId", "==", districtId),
    orderBy("order", "asc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }));
}