import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYLYuXkEl2mYZEGeKa73O43RLPy8pgz0M",
  authDomain: "chandoan-7216d.firebaseapp.com",
  projectId: "chandoan-7216d",
  storageBucket: "chandoan-7216d.firebasestorage.app",
  messagingSenderId: "609312923908",
  appId: "1:609312923908:web:d456190e872dba66a23051"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
