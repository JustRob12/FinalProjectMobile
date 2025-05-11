import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBz3BwCjXZSK5saUMOEv6KP9WIy3Untr4w",
  authDomain: "finalfinance-602e0.firebaseapp.com",
  projectId: "finalfinance-602e0",
  storageBucket: "finalfinance-602e0.firebasestorage.app",
  messagingSenderId: "947230923909",
  appId: "1:947230923909:web:afd30dd157d52f86155dec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 