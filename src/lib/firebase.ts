import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBmpq3EM7b6OJAJPevf9bB_m3eiJrTiM08",
  authDomain: "gestao-imobiliaria-quintoandar.firebaseapp.com",
  projectId: "gestao-imobiliaria-quintoandar",
  storageBucket: "gestao-imobiliaria-quintoandar.firebasestorage.app",
  messagingSenderId: "989610244324",
  appId: "1:989610244324:web:f8df6e853d28f049d954f1",
  measurementId: "G-3VTK1DCV61"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Configura persistência local para manter usuário logado mesmo após fechar o navegador
setPersistence(auth, browserLocalPersistence).catch(console.error);

export default app;
