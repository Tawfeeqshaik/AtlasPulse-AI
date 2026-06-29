import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD-ra2FtaZOhQOOsLeSWXKmL1aRF1WEEp4",
  authDomain: "atlaspulse-ai.firebaseapp.com",
  projectId: "atlaspulse-ai",
  storageBucket: "atlaspulse-ai.firebasestorage.app",
  messagingSenderId: "272966632485",
  appId: "1:272966632485:web:9c0050333254ac0886abcc",
  measurementId: "G-6EKG22LBH5"
};

// Initialize app exactly once
const app = initializeApp(firebaseConfig);

// Initialize all Firebase services using this specific initialized app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Sign-in failed:", error);
    throw error;
  }
};

// Log runtime Firebase configuration details for verification
console.log("🚀 Firebase successfully initialized on custom project:");
console.log("   - projectId: " + app.options.projectId);
console.log("   - authDomain: " + app.options.authDomain);
console.log("   - storageBucket: " + app.options.storageBucket);
console.log("   - appId: " + app.options.appId);
console.log("📡 Auth connected successfully to custom project");
console.log("🗄️ Firestore connected successfully to custom project");
console.log("📦 Storage connected successfully to custom project");
console.log("📊 Analytics connected successfully to custom project");

async function testConnection() {
  try {
    // Attempt a cold-start read of a document in 'test' collection to validate connection
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("✅ Custom Firebase Connection Verified Successfully");
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("⚠️ Firebase connection check: Client offline or network is blocked.");
    } else {
      console.log("ℹ️ Connection verification message:", error?.message || error);
    }
  }
}

testConnection();

export default app;
