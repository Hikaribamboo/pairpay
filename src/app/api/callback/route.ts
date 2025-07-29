import { NextRequest, NextResponse } from 'next/server'
import { admin } from "@/lib/firebase-admin";
import { doc, setDoc } from "firebase/firestore"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const redirectBase = process.env.REDIRECT_BASE_URL
  const redirectUri = `${redirectBase}/api/callback`

  const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code!,
      redirect_uri: redirectUri,
      client_id: process.env.LINE_CLIENT_ID!,
      client_secret: process.env.LINE_CLIENT_SECRET!,
    }),
  })

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error("LINEトークン取得失敗:", errorText);
    return new Response("LINEトークン取得エラー", { status: 500 });
  }


  const tokenData = await tokenRes.json()

  const idToken = tokenData.id_token // JWT
  const profileRes = await fetch('https://api.line.me/v2/profile', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  })

  const profile = await profileRes.json()

  console.log('LINE user ID:', profile.userId)

  await admin.firestore().doc(`users/${profile.userId}`).set({
    displayName: profile.displayName,
    pictureUrl: profile.pictureUrl,
    lastLogin: admin.firestore.Timestamp.now(),
  }, { merge: true });

  const firebaseToken = await admin.auth().createCustomToken(profile.userId);
  
  return NextResponse.redirect(
    `${redirectBase}/?uid=${profile.userId}&name=${encodeURIComponent(profile.displayName)}&token=${firebaseToken}`
  );
}
