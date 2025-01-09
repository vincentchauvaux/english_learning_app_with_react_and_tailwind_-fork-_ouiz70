// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMId5FJYHehcuJsN4cGuIFQic_uyEBqxw",
  authDomain: "bibuanglais.firebaseapp.com",
  projectId: "bibuanglais",
  storageBucket: "bibuanglais.firebasestorage.app",
  messagingSenderId: "516159004660",
  appId: "1:516159004660:web:4c0bf36bfdf0a1bab8a3a1",
  measurementId: "G-Q3QNMM362P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

async function fetchTranslations() {
  const querySnapshot = await getDocs(collection(db, "translations"));
  const translations = [];
  querySnapshot.forEach((doc) => {
    translations.push({ id: doc.id, ...doc.data() });
  });
  return translations;
}
