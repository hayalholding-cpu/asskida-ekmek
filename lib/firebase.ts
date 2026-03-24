import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBDMKD9ATqkL2Hs9BZmwstzXWLrnk4zusA",
  authDomain: "askida-ekmek-bb8b6.firebaseapp.com",
  projectId: "askida-ekmek-bb8b6",
  storageBucket: "askida-ekmek-bb8b6.firebasestorage.app",
  messagingSenderId: "484303163152",
  appId: "1:484303163152:web:7afa6ef4053b7b33599f95"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);