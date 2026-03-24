const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const keyPath = path.join(__dirname, "..", "serviceAccountKey.json");

if (!fs.existsSync(keyPath)) {
  throw new Error("serviceAccountKey.json bulunamadı: " + keyPath);
}

const serviceAccount = require(keyPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { auth, db };