// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Importa Firestore

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyByUq1Fw61eB-xz_l4fWsPBn7P8uYkbPT4",
  authDomain: "proyectoux-abc9f.firebaseapp.com",
  projectId: "proyectoux-abc9f",
  storageBucket: "proyectoux-abc9f.appspot.com",
  messagingSenderId: "465544426115",
  appId: "1:465544426115:web:3de27040f317acd6a421b6"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore
const db = getFirestore(app); // Inicializa Firestore

// Exporta la instancia de Firestore y la aplicación
export { db };
export default app;
