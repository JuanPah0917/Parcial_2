// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import getAuth
import { getFirestore } from "firebase/firestore"; // Import getFirestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfjl7kwD7a5V51NV6r_ww5DyRYl82dzIw",
  authDomain: "mini-x-project-3.firebaseapp.com",
  projectId: "mini-x-project-3",
  storageBucket: "mini-x-project-3.firebasestorage.app",
  messagingSenderId: "996261192353",
  appId: "1:996261192353:web:59f72971af8585a2c9c6e0",
  measurementId: "G-MDW284QQLK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app); // Initialize auth

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app); // Initialize db

// Export auth and db so you can use them in other files
export { auth, db };