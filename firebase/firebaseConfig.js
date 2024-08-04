// /firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDBKN79wHe_4-oyO-W2FZ58bEVkJs5_W8Q",
  authDomain: "giftapp-3d746.firebaseapp.com",
  projectId: "giftapp-3d746",
  storageBucket: "giftapp-3d746.appspot.com",
  messagingSenderId: "35789309815",
  appId: "1:35789309815:web:7925bf492c7643676b4372",
  measurementId: "G-8M3LKL2P9P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
const firestore = getFirestore(app);

export { auth, firestore };
