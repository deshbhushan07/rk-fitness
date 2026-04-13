// src/services/firebase.js
// ⚠️ Replace these values with your actual Firebase project config
// Get them from: Firebase Console → Project Settings → Your Apps → Web App

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCV7S9fRf_6uDD8hP628XVTDry1WXvNZ48",
  authDomain: "rk-fitness-db967.firebaseapp.com",
  projectId: "rk-fitness-db967",
  storageBucket: "rk-fitness-db967.firebasestorage.app",
  messagingSenderId: "382974296794",
  appId: "1:382974296794:web:9b8e361cfa4d19621bdbe3",
  measurementId: "G-2E79YYBWE7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
