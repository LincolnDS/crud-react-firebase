// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
  getAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDwdE5egjgIqE7BFyIkvzOfwn00VlpgaTw",
  authDomain: "atividade-pw-outubro.firebaseapp.com",
  projectId: "atividade-pw-outubro",
  storageBucket: "atividade-pw-outubro.firebasestorage.app",
  messagingSenderId: "773753377616",
  appId: "1:773753377616:web:4a6a394d7bb0fec8751255",
  measurementId: "G-BV1T0VVEX5"
};

const app = initializeApp(firebaseConfig);

// Correção multiplataforma: Aplica persistência mobile ou web dinamicamente
export const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web'
    ? browserLocalPersistence
    : getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
