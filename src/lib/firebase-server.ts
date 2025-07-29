import { initializeApp, applicationDefault, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const firebaseAdminConfig = {
  credential: applicationDefault(), // または cert(serviceAccountKey)
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApp();

const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);

export { adminDb, adminAuth };
