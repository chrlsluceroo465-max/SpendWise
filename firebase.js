import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAJB-ALyjQpu7s1nouGA1GzRQ15NPzyU6M",
  authDomain: "reactnativeapp-2a05c.firebaseapp.com",
  projectId: "reactnativeapp-2a05c",
  storageBucket: "reactnativeapp-2a05c.firebasestorage.app",
  messagingSenderId: "822632157723",
  appId: "1:822632157723:web:72fcfa951d073690fc5ebe",
  measurementId: "G-7VZJK32L44"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? browserLocalPersistence 
    : getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db, app };