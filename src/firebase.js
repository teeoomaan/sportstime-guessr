import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // İkisi tek satırda birleşti

const firebaseConfig = {
  apiKey: "AIzaSyDqR_PnpJDyMwAq_JTR28jNCYMW3KRMuh8",
  authDomain: "mapletics-e1e53.firebaseapp.com",
  projectId: "mapletics-e1e53",
  storageBucket: "mapletics-e1e53.firebasestorage.app",
  messagingSenderId: "830981688983",
  appId: "1:830981688983:web:13e5136321aa01e81e23d2",
  measurementId: "G-LWVLJ2ZCP6"
};

// Firebase'i Başlat
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();