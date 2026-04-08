console.log("SERVER VERSION: 123");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

const firebaseServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseServiceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/* =========================================
   HELPERS
========================================= */

function cleanText(v = "") {
  return String(v || "").trim();
}

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function safeBool(v, fallback = false) {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const x = v.trim().toLowerCase();
    if (x === "true") return true;
    if (x === "false") return false;
  }
  return fallback;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function slugifyTr(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeText(value = "") {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ");
}

function firstFilled(...values) {
  for (const value of values) {
    const text = cleanText(value);
    if (text) return text;
  }
  return "";
}

function mapBakeryPublic(docSnap) {
  const data = docSnap.data() || {};

  return {
    id: docSnap.id,
    uid: data.uid || docSnap.id,
    bakeryName: firstFilled(data.bakeryName, data.name),
    name: firstFilled(data.name, data.bakeryName),
    email: data.email || "",
    phone: data.phone || "",
    city: data.city || "",
    district: data.district || "",
    neighborhood: data.neighborhood || "",
    address: data.address || "",
    citySlug: firstFilled(data.citySlug, slugifyTr(data.city || "")),
    districtSlug: firstFilled(data.districtSlug, slugifyTr(data.district || "")),
    neighborhoodSlug: firstFilled(
      data.neighborhoodSlug,
      slugifyTr(data.neighborhood || "")
    ),
    bakeryCode: data.bakeryCode || "",
    isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    pendingEkmek: safeNumber(data.pendingEkmek, 0),
    pendingPide: safeNumber(data.pendingPide, 0),
    deliveredEkmek: safeNumber(data.deliveredEkmek, 0),
    deliveredPide: safeNumber(data.deliveredPide, 0),
    products: Array.isArray(data.products) ? data.products : [],
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

function mapDistrictPublic(docSnap) {
  const data = docSnap.data() || {};
  const districtName = firstFilled(data.districtName, data.name);
  const slug = firstFilled(data.slug, data.districtSlug, slugifyTr(districtName));

  return {
    id: docSnap.id,
    cityId: data.cityId || "",
    cityCode: safeNumber(data.cityCode, 0),
    cityName: firstFilled(data.cityName, data.city),
    citySlug: firstFilled(data.citySlug, slugifyTr(data.cityName || data.city || "")),
    districtId: data.districtId || docSnap.id,
    districtName,
    slug,
    sort: data.sort ?? data.order ?? 9999,
  };
}

function mapNeighborhoodPublic(docSnap) {
  const data = docSnap.data() || {};
  const neighborhoodName = firstFilled(
    data.neighborhoodName,
    data.name,
    data.mahalle
  );
  const districtName = firstFilled(data.districtName, data.district);
  const districtSlug = firstFilled(
    data.districtSlug,
    slugifyTr(districtName)
  );
  const slug = firstFilled(
    data.slug,
    data.neighborhoodSlug,
    slugifyTr(neighborhoodName)
  );

  return {
    id: docSnap.id,
    cityId: data.cityId || "",
    cityCode: safeNumber(data.cityCode, 0),
    cityName: firstFilled(data.cityName, data.city),
    citySlug: firstFilled(data.citySlug, slugifyTr(data.cityName || data.city || "")),
    districtId: data.districtId || "",
    districtName,
    districtSlug,
    neighborhoodName,
    slug,
    sort: data.sort ?? data.order ?? 9999,
  };
}

async function generateBakeryCode() {
  while (true) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const snap = await db
      .collection("bakeries")
      .where("bakeryCode", "==", code)
      .limit(1)
      .get();

    if (snap.empty) return code;
  }
}

async function findBakeryByUid(uid) {
  const snap = await db
    .collection("bakeries")
    .where("uid", "==", uid)
    .limit(1)
    .get();

  if (snap.empty) return null;

  return {
    doc: snap.docs[0],
    id: snap.docs[0].id,
    data: snap.docs[0].data(),
  };
}

async function writeBakeryTransaction({
  bakeryId,
  bakeryName,
  type,
  count,
  source,
  productType = "",
  createdByUid = null,
  note = "",
  extra = {},
}) {
  await db.collection("bakery_transactions").add({
    bakeryId,
    bakeryName: bakeryName || "",
    type: type || "",
    source: source || "",
    productType: productType || "",
    count: safeNumber(count, 0),
    createdByUid: createdByUid || null,
    note: note || "",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    ...extra,
  });
}

async function deleteCollectionWhere(collectionName, field, value) {
  const snap = await db.collection(collectionName).where(field, "==", value).get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  if (!snap.empty) await batch.commit();
  return snap.size;
}

/* =========================================
   ORTAK TESLİM HELPER'I
   PANEL + TABELA AYNI MERKEZDEN ÇALIŞSIN
========================================= */

async function findBakeryByIdOrUid(bakeryIdOrUid) {
  const directRef = db.collection("bakeries").doc(bakeryIdOrUid);
  const directSnap = await directRef.get();

  if (directSnap.exists) {
    return {
      ref: directRef,
      snap: directSnap,
      id: directRef.id,
      data: directSnap.data() || {},
    };
  }

  const byUidSnap = await db
    .collection("bakeries")
    .where("uid", "==", bakeryIdOrUid)
    .limit(1)
    .get();

  if (!byUidSnap.empty) {
    const docSnap = byUidSnap.docs[0];
    return {
      ref: docSnap.ref,
      snap: docSnap,
      id: docSnap.id,
      data: docSnap.data() || {},
    };
  }

  return null;
}

async function performBakeryDelivery({
  bakeryId,
  productType,
  count,
  source,
  note = "",
}) {
  const normalizedBakeryId = cleanText(bakeryId);
  const normalizedProductType = cleanText(productType).toLowerCase();
  const normalizedSource = cleanText(source || "bakery-panel");
  const normalizedCount = Math.max(1, safeNumber(count, 1));
  const normalizedNote = cleanText(note || "");

  if (!normalizedBakeryId) {
    throw new Error("bakeryId zorunlu");
  }

  if (!["ekmek", "pide"].includes(normalizedProductType)) {
    throw new Error("productType sadece 'ekmek' veya 'pide' olabilir");
  }

  if (
    !["bakery-panel", "tabela-mode", "baker-panel"].includes(normalizedSource)
  ) {
    throw new Error(
      "source sadece 'bakery-panel', 'baker-panel' veya 'tabela-mode' olabilir"
    );
  }

  const bakery = await findBakeryByIdOrUid(normalizedBakeryId);

  if (!bakery) {
    throw new Error("Fırın bulunamadı");
  }

  const pendingField =
    normalizedProductType === "ekmek" ? "pendingEkmek" : "pendingPide";
  const deliveredField =
    normalizedProductType === "ekmek" ? "deliveredEkmek" : "deliveredPide";
  const transactionType =
    normalizedProductType === "ekmek"
      ? "askidan-ekmek-verildi"
      : "askidan-pide-verildi";

  const result = await db.runTransaction(async (tx) => {
    const bakerySnap = await tx.get(bakery.ref);

    if (!bakerySnap.exists) {
      throw new Error("Fırın kaydı işlem sırasında bulunamadı");
    }

    const bakeryData = bakerySnap.data() || {};
    const currentPending = safeNumber(bakeryData[pendingField], 0);
    const currentDelivered = safeNumber(bakeryData[deliveredField], 0);

    if (currentPending < normalizedCount) {
      throw new Error(
        normalizedProductType === "ekmek"
          ? "Askıda yeterli ekmek yok"
          : "Askıda yeterli pide yok"
      );
    }

    const newPending = currentPending - normalizedCount;
    const newDelivered = currentDelivered + normalizedCount;

    tx.set(
      bakery.ref,
      {
        [pendingField]: newPending,
        [deliveredField]: newDelivered,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const bakeryDocId = bakery.ref.id;
    const dailyKey = `${bakeryDocId}_${todayStr()}`;
    const dailyRef = db.collection("deliveries_daily").doc(dailyKey);

    tx.set(
      dailyRef,
      {
        bakeryId: bakeryDocId,
        bakeryName: bakeryData?.bakeryName || "",
        date: todayStr(),
        deliveredEkmek:
          normalizedProductType === "ekmek"
            ? admin.firestore.FieldValue.increment(normalizedCount)
            : admin.firestore.FieldValue.increment(0),
        deliveredPide:
          normalizedProductType === "pide"
            ? admin.firestore.FieldValue.increment(normalizedCount)
            : admin.firestore.FieldValue.increment(0),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const txRef = db.collection("bakery_transactions").doc();

    const legacyFields =
      normalizedProductType === "ekmek"
        ? {
            pendingEkmekBefore: currentPending,
            pendingEkmekAfter: newPending,
            deliveredEkmekBefore: currentDelivered,
            deliveredEkmekAfter: newDelivered,
          }
        : {
            pendingPideBefore: currentPending,
            pendingPideAfter: newPending,
            deliveredPideBefore: currentDelivered,
            deliveredPideAfter: newDelivered,
          };

    tx.set(txRef, {
      bakeryId: bakeryDocId,
      bakeryName: bakeryData?.bakeryName || "",
      city: bakeryData?.city || "",
      district: bakeryData?.district || "",
      neighborhood: bakeryData?.neighborhood || "",
      type: transactionType,
      source:
        normalizedSource === "baker-panel" ? "bakery-panel" : normalizedSource,
      productType: normalizedProductType,
      count: normalizedCount,
      quantity: normalizedCount,
      unit: "adet",
      note: normalizedNote,
      pendingBefore: currentPending,
      pendingAfter: newPending,
      deliveredBefore: currentDelivered,
      deliveredAfter: newDelivered,
      date: todayStr(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...legacyFields,
    });

    return {
      bakeryId: bakeryDocId,
      bakeryName: bakeryData?.bakeryName || "",
      city: bakeryData?.city || "",
      district: bakeryData?.district || "",
      neighborhood: bakeryData?.neighborhood || "",
      productType: normalizedProductType,
      source:
        normalizedSource === "baker-panel" ? "bakery-panel" : normalizedSource,
      count: normalizedCount,
      pendingBefore: currentPending,
      pendingAfter: newPending,
      deliveredBefore: currentDelivered,
      deliveredAfter: newDelivered,
    };
  });

  return result;
}

/* =========================================
   ROOT
========================================= */

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Askıda Ekmek backend çalışıyor",
  });
});

/* =========================================
   SUPER ADMIN
========================================= */

app.post("/create-super-admin", async (req, res) => {
  try {
    const name = cleanText(req.body?.name);
    const email = cleanText(req.body?.email).toLowerCase();
    const password = cleanText(req.body?.password);

    if (!name || !email || !password) {
      return res.status(400).json({
        ok: false,
        message: "name, email ve password zorunlu",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Şifre en az 6 karakter olmalı",
      });
    }

    let userRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
      });
    } catch (err) {
      if (err.code === "auth/email-already-exists") {
        userRecord = await auth.getUserByEmail(email);
      } else {
        throw err;
      }
    }

    await db.collection("admins").doc(userRecord.uid).set(
      {
        uid: userRecord.uid,
        name,
        email,
        role: "superadmin",
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({
      ok: true,
      message: "Super admin hazır",
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error("POST /create-super-admin error:", error);
    return res.status(500).json({
      ok: false,
      message: "Super admin oluşturulamadı",
      error: error.message,
    });
  }
});

/* =========================================
   LOGIN ROUTES
========================================= */

app.post("/admin-login", async (req, res) => {
  try {
    const email = cleanText(req.body?.email).toLowerCase();
    const password = cleanText(req.body?.password);

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Email ve şifre zorunlu",
      });
    }

    if (!process.env.FIREBASE_WEB_API_KEY) {
      return res.status(500).json({
        ok: false,
        message: "FIREBASE_WEB_API_KEY eksik",
      });
    }

    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const firebaseData = await firebaseRes.json().catch(() => ({}));

    if (!firebaseRes.ok) {
      return res.status(401).json({
        ok: false,
        message: "Email veya şifre hatalı",
        error: firebaseData?.error?.message || "AUTH_FAILED",
      });
    }

    const uid = cleanText(firebaseData?.localId);

    if (!uid) {
      return res.status(401).json({
        ok: false,
        message: "Admin doğrulaması başarısız",
      });
    }

    let adminDoc = null;

    const adminByUid = await db.collection("admins").doc(uid).get();
    if (adminByUid.exists) {
      adminDoc = {
        id: adminByUid.id,
        ...adminByUid.data(),
      };
    }

    if (!adminDoc) {
      const byEmailSnap = await db
        .collection("admins")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!byEmailSnap.empty) {
        adminDoc = {
          id: byEmailSnap.docs[0].id,
          ...byEmailSnap.docs[0].data(),
        };
      }
    }

    if (!adminDoc) {
      return res.status(403).json({
        ok: false,
        message: "Admin kaydı bulunamadı",
      });
    }

    const isActive = adminDoc.isActive !== false;
    const role = cleanText(adminDoc.role).toLowerCase();
    const allowedRoles = ["super_admin", "superadmin", "admin"];

    if (!isActive) {
      return res.status(403).json({
        ok: false,
        message: "Admin hesabı pasif",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        ok: false,
        message: "Admin yetkisi bulunamadı",
      });
    }

    return res.json({
      ok: true,
      message: "Admin giriş başarılı",
      admin: {
        uid: adminDoc.uid || uid,
        email: adminDoc.email || email,
        name: adminDoc.name || "",
        role:
          role === "superadmin"
            ? "super_admin"
            : adminDoc.role || "super_admin",
        isActive,
        permissions: adminDoc.permissions || {},
      },
      token: firebaseData?.idToken || null,
    });
  } catch (error) {
    console.error("POST /admin-login error:", error);
    return res.status(500).json({
      ok: false,
      message: "Admin giriş işlemi başarısız",
      error: error.message,
    });
  }
});

app.post("/bakery-login", async (req, res) => {
  try {
    const bakeryCode = cleanText(req.body?.bakeryCode || req.body?.code);
    const password = cleanText(req.body?.password);

    if (!bakeryCode || !password) {
      return res.status(400).json({
        ok: false,
        message: "Fırıncı kodu ve şifre zorunlu",
      });
    }

    const snap = await db
      .collection("bakeries")
      .where("bakeryCode", "==", bakeryCode)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({
        ok: false,
        message: "Fırın bulunamadı",
      });
    }

    const docSnap = snap.docs[0];
    const bakery = docSnap.data();

    if (bakery.isActive === false) {
      return res.status(403).json({
        ok: false,
        message: "Fırın hesabı pasif",
      });
    }

    const bakeryPassword = cleanText(bakery.bakeryPassword);

    if (!bakeryPassword || bakeryPassword !== password) {
      return res.status(401).json({
        ok: false,
        message: "Fırıncı kodu veya şifre hatalı",
      });
    }

    return res.json({
      ok: true,
      message: "Fırıncı giriş başarılı",
      bakery: {
        id: docSnap.id,
        uid: bakery.uid || "",
        bakeryName: bakery.bakeryName || "",
        bakeryCode: bakery.bakeryCode || "",
        email: bakery.email || "",
        district: bakery.district || "",
        neighborhood: bakery.neighborhood || "",
        isActive: bakery.isActive !== false,
        pendingEkmek: safeNumber(bakery.pendingEkmek, 0),
        pendingPide: safeNumber(bakery.pendingPide, 0),
        deliveredEkmek: safeNumber(bakery.deliveredEkmek, 0),
        deliveredPide: safeNumber(bakery.deliveredPide, 0),
        products: Array.isArray(bakery.products) ? bakery.products : [],
      },
    });
  } catch (error) {
    console.error("POST /bakery-login error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırıncı giriş işlemi başarısız",
      error: error.message,
    });
  }
});

app.post("/firinci-login", async (req, res) => {
  try {
    const bakeryCode = cleanText(req.body?.bakeryCode || req.body?.code);
    const password = cleanText(req.body?.password);

    if (!bakeryCode || !password) {
      return res.status(400).json({
        ok: false,
        message: "Fırıncı kodu ve şifre zorunlu",
      });
    }

    const snap = await db
      .collection("bakeries")
      .where("bakeryCode", "==", bakeryCode)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({
        ok: false,
        message: "Fırın bulunamadı",
      });
    }

    const docSnap = snap.docs[0];
    const bakery = docSnap.data();

    if (bakery.isActive === false) {
      return res.status(403).json({
        ok: false,
        message: "Fırın hesabı pasif",
      });
    }

    const bakeryPassword = cleanText(bakery.bakeryPassword);

    if (!bakeryPassword || bakeryPassword !== password) {
      return res.status(401).json({
        ok: false,
        message: "Fırıncı kodu veya şifre hatalı",
      });
    }

    return res.json({
      ok: true,
      message: "Fırıncı giriş başarılı",
      bakery: {
        id: docSnap.id,
        uid: bakery.uid || "",
        bakeryName: bakery.bakeryName || "",
        bakeryCode: bakery.bakeryCode || "",
        email: bakery.email || "",
        district: bakery.district || "",
        neighborhood: bakery.neighborhood || "",
        isActive: bakery.isActive !== false,
        pendingEkmek: safeNumber(bakery.pendingEkmek, 0),
        pendingPide: safeNumber(bakery.pendingPide, 0),
        deliveredEkmek: safeNumber(bakery.deliveredEkmek, 0),
        deliveredPide: safeNumber(bakery.deliveredPide, 0),
        products: Array.isArray(bakery.products) ? bakery.products : [],
      },
    });
  } catch (error) {
    console.error("POST /firinci-login error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırıncı giriş işlemi başarısız",
      error: error.message,
    });
  }
});

/* =========================================
   PUBLIC / MOBILE LOCATION & BAKERY API
========================================= */

app.get("/mobile/cities", async (req, res) => {
  try {
    const snap = await db.collection("cities").get();

    const cities = snap.docs
      .map((docSnap) => {
        const data = docSnap.data() || {};
        const name = firstFilled(data.name, data.cityName, data.city);
        const slug = firstFilled(data.slug, data.citySlug, slugifyTr(name));

        return {
          id: docSnap.id,
          name,
          cityName: name,
          slug,
          citySlug: slug,
          cityCode: safeNumber(data.cityCode, 0),
          sort: data.sort ?? data.order ?? 9999,
          ...data,
        };
      })
      .filter((x) => x.name)
      .sort(
        (a, b) =>
          safeNumber(a.sort, 9999) - safeNumber(b.sort, 9999) ||
          String(a.name).localeCompare(String(b.name), "tr")
      );

    return res.json({
      ok: true,
      cities,
    });
  } catch (error) {
    console.error("GET /mobile/cities error:", error);
    return res.status(500).json({
      ok: false,
      message: "Şehirler alınamadı",
      error: error.message,
    });
  }
});

app.get("/mobile/districts", async (req, res) => {
  try {
    const cityCode = safeNumber(req.query?.cityCode, 34);
    const cityId = cleanText(req.query?.cityId);
    const citySlug = cleanText(req.query?.citySlug) || "istanbul";

    const snap = await db.collection("districts").get();

    const districts = snap.docs
      .map(mapDistrictPublic)
      .filter((item) => {
        const hasCityCode = item.cityCode > 0;
        const matchesCityCode = hasCityCode ? item.cityCode === cityCode : true;
        const matchesCityId = cityId ? cleanText(item.cityId) === cityId : true;
        const matchesCitySlug = citySlug
          ? !cleanText(item.citySlug) || cleanText(item.citySlug) === citySlug
          : true;

        return matchesCityCode && matchesCityId && matchesCitySlug;
      })
      .filter((item) => item.slug && item.districtName)
      .sort(
        (a, b) =>
          safeNumber(a.sort, 9999) - safeNumber(b.sort, 9999) ||
          String(a.districtName).localeCompare(String(b.districtName), "tr")
      );

    return res.json({
      ok: true,
      districts,
    });
  } catch (error) {
    console.error("GET /mobile/districts error:", error);
    return res.status(500).json({
      ok: false,
      message: "İlçeler alınamadı",
      error: error.message,
    });
  }
});

app.get("/mobile/neighborhoods", async (req, res) => {
  try {
    const cityCode = safeNumber(req.query?.cityCode, 34);
    const cityId = cleanText(req.query?.cityId);
    const citySlug = cleanText(req.query?.citySlug) || "istanbul";
    const districtSlug = cleanText(req.query?.districtSlug);
    const districtId = cleanText(req.query?.districtId);
    const districtName = cleanText(req.query?.districtName);

    if (!districtSlug && !districtId && !districtName) {
      return res.status(400).json({
        ok: false,
        message: "districtSlug veya districtId veya districtName gerekli",
      });
    }

    const snap = await db.collection("neighborhoods").get();

    const neighborhoods = snap.docs
      .map(mapNeighborhoodPublic)
      .filter((item) => {
        const hasCityCode = item.cityCode > 0;
        const matchesCityCode = hasCityCode ? item.cityCode === cityCode : true;
        const matchesCityId = cityId ? cleanText(item.cityId) === cityId : true;
        const matchesCitySlug = citySlug
          ? !cleanText(item.citySlug) || cleanText(item.citySlug) === citySlug
          : true;

        const matchesDistrictSlug = districtSlug
          ? cleanText(item.districtSlug) === districtSlug
          : true;

        const matchesDistrictId = districtId
          ? cleanText(item.districtId) === districtId
          : true;

        const matchesDistrictName = districtName
          ? normalizeText(item.districtName) === normalizeText(districtName)
          : true;

        return (
          matchesCityCode &&
          matchesCityId &&
          matchesCitySlug &&
          matchesDistrictSlug &&
          matchesDistrictId &&
          matchesDistrictName
        );
      })
      .filter((item) => item.slug && item.neighborhoodName)
      .sort(
        (a, b) =>
          safeNumber(a.sort, 9999) - safeNumber(b.sort, 9999) ||
          String(a.neighborhoodName).localeCompare(String(b.neighborhoodName), "tr")
      );

    return res.json({
      ok: true,
      neighborhoods,
    });
  } catch (error) {
    console.error("GET /mobile/neighborhoods error:", error);
    return res.status(500).json({
      ok: false,
      message: "Mahalleler alınamadı",
      error: error.message,
    });
  }
});

app.get("/mobile/bakeries", async (req, res) => {
  try {
    const citySlug = cleanText(req.query?.citySlug) || "istanbul";
    const districtSlug = cleanText(req.query?.districtSlug);
    const neighborhoodSlug = cleanText(req.query?.neighborhoodSlug);

    const snap = await db.collection("bakeries").get();

    const bakeries = snap.docs
      .map(mapBakeryPublic)
      .filter((item) => item.isActive)
      .filter((item) =>
        citySlug ? cleanText(item.citySlug) === citySlug : true
      )
      .filter((item) =>
        districtSlug ? cleanText(item.districtSlug) === districtSlug : true
      )
      .filter((item) =>
        neighborhoodSlug
          ? cleanText(item.neighborhoodSlug) === neighborhoodSlug
          : true
      )
      .sort((a, b) => {
        const neighborhoodCompare = String(a.neighborhood || "").localeCompare(
          String(b.neighborhood || ""),
          "tr"
        );

        if (neighborhoodCompare !== 0) return neighborhoodCompare;

        return String(a.bakeryName || a.name || "").localeCompare(
          String(b.bakeryName || b.name || ""),
          "tr"
        );
      });

    return res.json({
      ok: true,
      bakeries,
    });
  } catch (error) {
    console.error("GET /mobile/bakeries error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırınlar alınamadı",
      error: error.message,
    });
  }
});

app.get("/mobile/products", async (req, res) => {
  try {
    const snap = await db
      .collection("products")
      .where("isActive", "==", true)
      .get();

    const products = snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      .sort(
        (a, b) =>
          safeNumber(a.sort, 9999) - safeNumber(b.sort, 9999) ||
          String(a.name || "").localeCompare(String(b.name || ""), "tr")
      );

    return res.json({
      ok: true,
      products,
    });
  } catch (error) {
    console.error("GET /mobile/products error:", error);
    return res.status(500).json({
      ok: false,
      message: "Mobil ürünleri alınamadı",
      error: error.message,
    });
  }
});

/* =========================================
   PRODUCT MANAGEMENT
========================================= */

app.get("/products", async (req, res) => {
  try {
    const snap = await db
      .collection("products")
      .where("isActive", "==", true)
      .get();

    const products = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    products.sort(
      (a, b) =>
        safeNumber(a.sort, 9999) - safeNumber(b.sort, 9999) ||
        String(a.name || "").localeCompare(String(b.name || ""), "tr")
    );

    return res.json({
      ok: true,
      products,
    });
  } catch (error) {
    console.error("GET /products error:", error);
    return res.status(500).json({
      ok: false,
      message: "Ürünler alınamadı",
      error: error.message,
    });
  }
});

app.get("/admin/products", async (req, res) => {
  try {
    const snap = await db.collection("products").get();

    const products = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    products.sort(
      (a, b) =>
        safeNumber(a.sort, 9999) - safeNumber(b.sort, 9999) ||
        String(a.name || "").localeCompare(String(b.name || ""), "tr")
    );

    return res.json({
      ok: true,
      products,
    });
  } catch (error) {
    console.error("GET /admin/products error:", error);
    return res.status(500).json({
      ok: false,
      message: "Admin ürünleri alınamadı",
      error: error.message,
    });
  }
});

app.post("/admin/products", async (req, res) => {
  try {
    const name = cleanText(req.body?.name);
    const slug = cleanText(req.body?.slug) || slugifyTr(name);
    const price = safeNumber(req.body?.price, 0);
    const isActive =
      req.body?.isActive === undefined ? true : safeBool(req.body?.isActive, true);
    const sort = safeNumber(req.body?.sort, 999);

    if (!name) {
      return res.status(400).json({
        ok: false,
        message: "Ürün adı zorunlu",
      });
    }

    const ref = await db.collection("products").add({
      name,
      slug,
      price,
      isActive,
      sort,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      ok: true,
      message: "Ürün eklendi",
      id: ref.id,
    });
  } catch (error) {
    console.error("POST /admin/products error:", error);
    return res.status(500).json({
      ok: false,
      message: "Ürün eklenemedi",
      error: error.message,
    });
  }
});

app.put("/admin/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("products").doc(id).set(
      {
        ...req.body,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({
      ok: true,
      message: "Ürün güncellendi",
    });
  } catch (error) {
    console.error("PUT /admin/products/:id error:", error);
    return res.status(500).json({
      ok: false,
      message: "Ürün güncellenemedi",
      error: error.message,
    });
  }
});

app.delete("/admin/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("products").doc(id).delete();

    return res.json({
      ok: true,
      message: "Ürün silindi",
    });
  } catch (error) {
    console.error("DELETE /admin/products/:id error:", error);
    return res.status(500).json({
      ok: false,
      message: "Ürün silinemedi",
      error: error.message,
    });
  }
});

/* =========================================
   ADMIN BAKERIES
========================================= */

app.get("/admin/bakeries", async (req, res) => {
  try {
    const snap = await db.collection("bakeries").get();

    const bakeries = snap.docs.map((docSnap) => {
      const data = docSnap.data() || {};

      return {
        id: docSnap.id,
        uid: data.uid || docSnap.id,
        bakeryName: data.bakeryName || "",
        email: data.email || "",
        city: data.city || "",
        district: data.district || "",
        neighborhood: data.neighborhood || "",
        citySlug: data.citySlug || "",
        districtSlug: data.districtSlug || "",
        neighborhoodSlug: data.neighborhoodSlug || "",
        bakeryCode: data.bakeryCode || "",
        isActive: typeof data.isActive === "boolean" ? data.isActive : true,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      };
    });

    bakeries.sort((a, b) =>
      String(a.bakeryName || "").localeCompare(String(b.bakeryName || ""), "tr")
    );

    return res.json({
      ok: true,
      bakeries,
    });
  } catch (error) {
    console.error("GET /admin/bakeries error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırın listesi alınamadı",
      error: error.message,
    });
  }
});

/* =========================================
   CREATE BAKER ACCOUNT
========================================= */

app.post("/create-baker-account", async (req, res) => {
  try {
    const bakeryName = cleanText(req.body?.bakeryName);
    const email = cleanText(req.body?.email).toLowerCase();
    const password = cleanText(req.body?.password);
    const phone = cleanText(req.body?.phone);
    const city = cleanText(req.body?.city || "İstanbul");
    const district = cleanText(req.body?.district);
    const neighborhood = cleanText(req.body?.neighborhood);
    const address = cleanText(req.body?.address);
    const isActive =
      req.body?.isActive === undefined ? true : safeBool(req.body?.isActive, true);

    if (!bakeryName || !email || !password || !district || !neighborhood) {
      return res.status(400).json({
        ok: false,
        message: "bakeryName, email, password, district ve neighborhood zorunlu",
      });
    }

    let userRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: bakeryName,
      });
    } catch (err) {
      if (err.code === "auth/email-already-exists") {
        return res.status(400).json({
          ok: false,
          message: "Bu email zaten kullanımda",
        });
      }
      throw err;
    }

    const bakeryCode = await generateBakeryCode();
    const bakeryPassword = cleanText(req.body?.bakeryPassword) || password;

    const bakeryRef = await db.collection("bakeries").add({
      uid: userRecord.uid,
      bakeryName,
      bakeryCode,
      bakeryPassword,
      email,
      phone,
      city,
      district,
      neighborhood,
      address,
      citySlug: slugifyTr(city),
      districtSlug: slugifyTr(district),
      neighborhoodSlug: slugifyTr(neighborhood),
      isActive,
      pendingEkmek: 0,
      pendingPide: 0,
      deliveredEkmek: 0,
      deliveredPide: 0,
      products: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      ok: true,
      message: "Fırın hesabı oluşturuldu",
      bakeryId: bakeryRef.id,
      uid: userRecord.uid,
      bakeryCode,
      bakeryPassword,
    });
  } catch (error) {
    console.error("POST /create-baker-account error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırın hesabı oluşturulamadı",
      error: error.message,
    });
  }
});

/* =========================================
   BAKER DETAIL
========================================= */

app.get("/baker/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const bakery = await findBakeryByUid(uid);

    if (!bakery) {
      return res.status(404).json({
        ok: false,
        message: "Fırın bulunamadı",
      });
    }

    return res.json({
      ok: true,
      bakery: {
        id: bakery.id,
        ...bakery.data,
      },
    });
  } catch (error) {
    console.error("GET /baker/:uid error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırın bilgisi alınamadı",
      error: error.message,
    });
  }
});

app.put("/baker/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const bakery = await findBakeryByUid(uid);

    if (!bakery) {
      return res.status(404).json({
        ok: false,
        message: "Fırın bulunamadı",
      });
    }

    const payload = {
      bakeryName:
        req.body?.bakeryName !== undefined
          ? cleanText(req.body.bakeryName)
          : bakery.data.bakeryName,
      phone:
        req.body?.phone !== undefined
          ? cleanText(req.body.phone)
          : bakery.data.phone,
      city:
        req.body?.city !== undefined
          ? cleanText(req.body.city)
          : bakery.data.city,
      district:
        req.body?.district !== undefined
          ? cleanText(req.body.district)
          : bakery.data.district,
      neighborhood:
        req.body?.neighborhood !== undefined
          ? cleanText(req.body.neighborhood)
          : bakery.data.neighborhood,
      address:
        req.body?.address !== undefined
          ? cleanText(req.body.address)
          : bakery.data.address,
      bakeryPassword:
        req.body?.bakeryPassword !== undefined
          ? cleanText(req.body.bakeryPassword)
          : bakery.data.bakeryPassword || "",
      isActive:
        req.body?.isActive !== undefined
          ? safeBool(req.body.isActive, true)
          : bakery.data.isActive !== false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    payload.citySlug = slugifyTr(payload.city);
    payload.districtSlug = slugifyTr(payload.district);
    payload.neighborhoodSlug = slugifyTr(payload.neighborhood);

    await db.collection("bakeries").doc(bakery.id).set(payload, { merge: true });

    return res.json({
      ok: true,
      message: "Fırın güncellendi",
    });
  } catch (error) {
    console.error("PUT /baker/:uid error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırın güncellenemedi",
      error: error.message,
    });
  }
});

app.delete("/baker/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const bakery = await findBakeryByUid(uid);

    if (!bakery) {
      return res.status(404).json({
        ok: false,
        message: "Fırın bulunamadı",
      });
    }

    const bakeryId = bakery.id;

    const deletedTransactions = await deleteCollectionWhere(
      "bakery_transactions",
      "bakeryId",
      bakeryId
    );

    await db.collection("bakeries").doc(bakeryId).delete();

    let authDeleted = false;
    try {
      await auth.deleteUser(uid);
      authDeleted = true;
    } catch (err) {
      authDeleted = false;
    }

    return res.json({
      ok: true,
      message: "Fırın silindi",
      bakeryId,
      uid,
      deletedTransactions,
      authDeleted,
    });
  } catch (error) {
    console.error("DELETE /baker/:uid error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırın silinemedi",
      error: error.message,
    });
  }
});

/* =========================================
   BAKER PRODUCTS
========================================= */

app.put("/baker/:uid/products", async (req, res) => {
  try {
    const { uid } = req.params;
    const bakery = await findBakeryByUid(uid);

    if (!bakery) {
      return res.status(404).json({
        ok: false,
        message: "Fırın bulunamadı",
      });
    }

    const products = Array.isArray(req.body?.products) ? req.body.products : [];

    await db.collection("bakeries").doc(bakery.id).set(
      {
        products,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({
      ok: true,
      message: "Fırın ürünleri güncellendi",
    });
  } catch (error) {
    console.error("PUT /baker/:uid/products error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırın ürünleri güncellenemedi",
      error: error.message,
    });
  }
});

/* =========================================
   BAKER TRANSACTIONS
========================================= */

app.get("/baker/:uid/transactions", async (req, res) => {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        ok: false,
        message: "Fırın uid gerekli",
      });
    }

    const bakery = await findBakeryByUid(uid);

    if (!bakery) {
      return res.status(404).json({
        ok: false,
        message: "Fırın bulunamadı",
      });
    }

    const bakeryId = bakery.id;
    const bakeryData = bakery.data;

    const txMap = new Map();

    const snaps = await Promise.all([
      db.collection("bakery_transactions").where("bakeryId", "==", bakeryId).get(),
      db.collection("bakery_transactions").where("bakeryId", "==", uid).get(),
      db.collection("bakery_transactions").where("uid", "==", uid).get(),
    ]);

    snaps.forEach((snap) => {
      snap.docs.forEach((docSnap) => {
        if (!txMap.has(docSnap.id)) {
          txMap.set(docSnap.id, {
            id: docSnap.id,
            ...docSnap.data(),
          });
        }
      });
    });

    const transactions = Array.from(txMap.values()).map((data) => ({
      id: data.id,
      bakeryId: data.bakeryId || bakeryId,
      bakeryName: data.bakeryName || bakeryData.bakeryName || "",
      type: data.type || "",
      source: data.source || "",
      productType: data.productType || "",
      count: Number(data.count || 0),
      note: data.note || "",
      createdAt: data.createdAt || null,
    }));

    transactions.sort((a, b) => {
      const aMs =
        a.createdAt && typeof a.createdAt.toDate === "function"
          ? a.createdAt.toDate().getTime()
          : 0;

      const bMs =
        b.createdAt && typeof b.createdAt.toDate === "function"
          ? b.createdAt.toDate().getTime()
          : 0;

      return bMs - aMs;
    });

    return res.json({
      ok: true,
      bakery: {
        id: bakeryId,
        uid: bakeryData.uid || uid,
        bakeryName: bakeryData.bakeryName || "",
      },
      transactions,
    });
  } catch (error) {
    console.error("GET /baker/:uid/transactions error:", error);
    return res.status(500).json({
      ok: false,
      message: "İşlem geçmişi alınamadı",
      error: error.message,
    });
  }
});

/* =========================================
   ADMIN TRANSACTIONS
========================================= */

app.get("/admin/transactions", async (req, res) => {
  try {
    const snap = await db
      .collection("bakery_transactions")
      .orderBy("createdAt", "desc")
      .get();

    const transactions = snap.docs.map((docSnap) => {
      const data = docSnap.data() || {};

      return {
        id: docSnap.id,
        bakeryId: data.bakeryId || "",
        bakeryUid: data.bakeryUid || data.uid || "",
        bakeryName: data.bakeryName || "",
        city: data.city || "",
        district: data.district || "",
        neighborhood: data.neighborhood || "",
        type: data.type || "",
        productType: data.productType || "",
        count: Number(data.count || 0),
        note: data.note || "",
        source: data.source || "",
        date: data.date || "",
        createdAt: data.createdAt || null,
        pendingBefore: Number(data.pendingBefore || 0),
        pendingAfter: Number(data.pendingAfter || 0),
        deliveredBefore: Number(data.deliveredBefore || 0),
        deliveredAfter: Number(data.deliveredAfter || 0),
        pendingEkmekBefore: Number(data.pendingEkmekBefore || 0),
        pendingEkmekAfter: Number(data.pendingEkmekAfter || 0),
        deliveredEkmekBefore: Number(data.deliveredEkmekBefore || 0),
        deliveredEkmekAfter: Number(data.deliveredEkmekAfter || 0),
        pendingPideBefore: Number(data.pendingPideBefore || 0),
        pendingPideAfter: Number(data.pendingPideAfter || 0),
        deliveredPideBefore: Number(data.deliveredPideBefore || 0),
        deliveredPideAfter: Number(data.deliveredPideAfter || 0),
      };
    });

    return res.json({
      ok: true,
      data: transactions,
    });
  } catch (error) {
    console.error("GET /admin/transactions error:", error);
    return res.status(500).json({
      ok: false,
      message: "İşlem geçmişi alınamadı.",
      error: error.message,
    });
  }
});

/* =========================================
   ADMIN: ADD BREAD / PRODUCT TO BAKER
========================================= */

app.post("/admin/add-bread-to-baker", async (req, res) => {
  try {
    const uid = cleanText(req.body?.uid);
    const productType = cleanText(req.body?.productType || "ekmek").toLowerCase();
    const count = safeNumber(req.body?.count, 0);
    const source = cleanText(req.body?.source || "admin-panel");
    const note = cleanText(req.body?.note || "");

    if (!uid || count <= 0) {
      return res.status(400).json({
        ok: false,
        message: "uid ve pozitif count gerekli",
      });
    }

    const bakery = await findBakeryByUid(uid);

    if (!bakery) {
      return res.status(404).json({
        ok: false,
        message: "Fırın bulunamadı",
      });
    }

    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (productType === "pide") {
      updates.pendingPide = admin.firestore.FieldValue.increment(count);
    } else {
      updates.pendingEkmek = admin.firestore.FieldValue.increment(count);
    }

    await db.collection("bakeries").doc(bakery.id).set(updates, { merge: true });

    await writeBakeryTransaction({
      bakeryId: bakery.id,
      bakeryName: bakery.data.bakeryName,
      type: productType === "pide" ? "admin-add-pide" : "admin-add-bread",
      productType,
      count,
      source,
      createdByUid: null,
      note,
    });

    return res.json({
      ok: true,
      message: "Fırına ürün eklendi",
    });
  } catch (error) {
    console.error("POST /admin/add-bread-to-baker error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırına ürün eklenemedi",
      error: error.message,
    });
  }
});

/* =========================================
   ADMIN: RESET BAKER PASSWORD
========================================= */

app.post("/admin/baker/reset-password", async (req, res) => {
  try {
    const uid = cleanText(req.body?.uid);
    const newPassword = cleanText(req.body?.newPassword || req.body?.password);

    if (!uid || !newPassword) {
      return res.status(400).json({
        ok: false,
        message: "uid ve newPassword gerekli",
      });
    }

    const bakery = await findBakeryByUid(uid);

    if (!bakery) {
      return res.status(404).json({
        ok: false,
        message: "Fırın bulunamadı",
      });
    }

    await db.collection("bakeries").doc(bakery.id).set(
      {
        bakeryPassword: newPassword,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    try {
      await auth.updateUser(uid, { password: newPassword });
    } catch (err) {
      // bilinçli olarak düşürmüyoruz
    }

    return res.json({
      ok: true,
      message: "Fırın şifresi güncellendi",
    });
  } catch (error) {
    console.error("POST /admin/baker/reset-password error:", error);
    return res.status(500).json({
      ok: false,
      message: "Fırın şifresi güncellenemedi",
      error: error.message,
    });
  }
});

/* =========================================
   ORTAK TESLİM ENDPOINT
   PANEL + TABELA BURAYI KULLANACAK
========================================= */

app.post("/bakery/deliver", async (req, res) => {
  try {
    const bakeryId = cleanText(req.body?.bakeryId);
    const productType = cleanText(req.body?.productType).toLowerCase();
    const count = Math.max(1, safeNumber(req.body?.count, 1));
    const source = cleanText(req.body?.source || "bakery-panel");
    const note = cleanText(req.body?.note || "");

    const result = await performBakeryDelivery({
      bakeryId,
      productType,
      count,
      source,
      note,
    });

    return res.json({
      ok: true,
      message:
        result.productType === "ekmek"
          ? `${result.count} adet askıda ekmek teslim edildi`
          : `${result.count} adet askıda pide teslim edildi`,
      data: result,
    });
  } catch (error) {
    console.error("POST /bakery/deliver error:", error);
    return res.status(400).json({
      ok: false,
      message: error.message || "Teslim işlemi başarısız",
    });
  }
});

/* =========================================
   ESKİ ENDPOINT - GERİYE DÖNÜK UYUMLULUK
========================================= */

app.post("/baker/deliver-suspended-bread", async (req, res) => {
  try {
    const bakeryId = cleanText(req.body?.bakeryId);
    const count = Math.max(1, safeNumber(req.body?.count, 1));
    const note = cleanText(req.body?.note || "");
    const source = cleanText(req.body?.source || "baker-panel");

    const result = await performBakeryDelivery({
      bakeryId,
      productType: "ekmek",
      count,
      source,
      note,
    });

    return res.json({
      ok: true,
      message: "Askıdan ekmek verildi",
      bakeryId: result.bakeryId,
      bakeryName: result.bakeryName,
      pendingEkmek: result.pendingAfter,
      deliveredEkmek: result.deliveredAfter,
      data: result,
    });
  } catch (error) {
    console.error("POST /baker/deliver-suspended-bread error:", error);
    return res.status(400).json({
      ok: false,
      message: error.message || "Askıdan ekmek verme işlemi başarısız",
    });
  }
});

/* =========================================
   MOBILE PAYMENT COMPLETE
========================================= */

app.post("/mobile/payment-complete", async (req, res) => {
  try {
    const bakeryId = cleanText(req.body?.bakeryId);
    const productType = cleanText(req.body?.productType || "ekmek").toLowerCase();
    const count = safeNumber(req.body?.count, 0);
    const source = cleanText(req.body?.source || "mobile-payment");
    const note = cleanText(req.body?.note || "");

    if (!bakeryId || count <= 0) {
      return res.status(400).json({
        ok: false,
        message: "bakeryId ve pozitif count gerekli",
      });
    }

    const bakeryRef = db.collection("bakeries").doc(bakeryId);
    const bakeryDoc = await bakeryRef.get();

    if (!bakeryDoc.exists) {
      return res.status(404).json({
        ok: false,
        message: "Fırın bulunamadı",
      });
    }

    const bakeryData = bakeryDoc.data() || {};

    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (productType === "pide") {
      updates.pendingPide = admin.firestore.FieldValue.increment(count);
    } else {
      updates.pendingEkmek = admin.firestore.FieldValue.increment(count);
    }

    await bakeryRef.set(updates, { merge: true });

    await writeBakeryTransaction({
      bakeryId,
      bakeryName: bakeryData?.bakeryName || "",
      type: productType === "pide" ? "mobile-payment-pide" : "mobile-payment",
      productType,
      count,
      source,
      note,
    });

    return res.json({
      ok: true,
      message: "Ödeme tamamlandı ve askı ürünü işlendi",
    });
  } catch (error) {
    console.error("POST /mobile/payment-complete error:", error);
    return res.status(500).json({
      ok: false,
      message: "Ödeme tamamlama başarısız",
      error: error.message,
    });
  }
});

/* =========================================
   MIGRATION
========================================= */

app.get("/admin/migrate-bakeries-preview", async (req, res) => {
  try {
    const snap = await db.collection("bakeries").get();

    const items = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        bakeryName: data.bakeryName || "",
        city: data.city || "",
        district: data.district || "",
        neighborhood: data.neighborhood || "",
        currentCitySlug: data.citySlug || "",
        currentDistrictSlug: data.districtSlug || "",
        currentNeighborhoodSlug: data.neighborhoodSlug || "",
        newCitySlug: slugifyTr(data.city || ""),
        newDistrictSlug: slugifyTr(data.district || ""),
        newNeighborhoodSlug: slugifyTr(data.neighborhood || ""),
      };
    });

    return res.json({
      ok: true,
      total: items.length,
      items,
    });
  } catch (error) {
    console.error("GET /admin/migrate-bakeries-preview error:", error);
    return res.status(500).json({
      ok: false,
      message: "Önizleme alınamadı",
      error: error.message,
    });
  }
});

app.post("/admin/migrate-bakeries-apply", async (req, res) => {
  try {
    const snap = await db.collection("bakeries").get();
    const batch = db.batch();

    snap.docs.forEach((d) => {
      const data = d.data();
      batch.set(
        d.ref,
        {
          citySlug: slugifyTr(data.city || ""),
          districtSlug: slugifyTr(data.district || ""),
          neighborhoodSlug: slugifyTr(data.neighborhood || ""),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();

    return res.json({
      ok: true,
      message: "Slug alanları güncellendi",
      totalUpdated: snap.size,
    });
  } catch (error) {
    console.error("POST /admin/migrate-bakeries-apply error:", error);
    return res.status(500).json({
      ok: false,
      message: "Migrasyon uygulanamadı",
      error: error.message,
    });
  }
});

/* =========================================
   START
========================================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
