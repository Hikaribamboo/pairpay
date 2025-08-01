// lib/firebase-server.ts
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Base64 形式の秘密鍵を復号
const privateKey = Buffer.from(
  process.env.FIREBASE_PRIVATE_KEY_B64!,
  "base64"
).toString("utf8");

// サービスアカウント情報
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey,
};

// 既に初期化済みならそれを使う
const adminApp = getApps().length
  ? getApp()
  : initializeApp({ credential: cert(serviceAccount) });

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
