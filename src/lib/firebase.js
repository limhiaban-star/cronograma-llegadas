import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhIRZwKGapdgHxBSKBbc4xHqzx4xsVzRA",
  authDomain: "cronograma-de-llegadas.firebaseapp.com",
  projectId: "cronograma-de-llegadas",
  storageBucket: "cronograma-de-llegadas.firebasestorage.app",
  messagingSenderId: "809474428136",
  appId: "1:809474428136:web:e7ff2a7d1077cacfb28d5d"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
