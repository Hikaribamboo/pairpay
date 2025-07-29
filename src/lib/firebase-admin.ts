import admin from 'firebase-admin';

export const runtime = 'nodejs';

// Base64 版キーを直接復号
const decodedKey = Buffer
  .from(process.env.FIREBASE_PRIVATE_KEY_B64!, 'base64')
  .toString('utf8');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: decodedKey,
    }),
  });
}

export { admin };
