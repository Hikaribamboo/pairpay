import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-server"; // ← firebase-adminの初期化済みモジュール
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL!;
  const redirectUri = `${redirectBase}/api/callback`;

  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
      client_secret: process.env.LINE_CLIENT_SECRET!,
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    console.error("LINEトークン取得失敗:", errorText);
    return new Response("LINEトークン取得エラー", { status: 500 });
  }

  const tokenData = await tokenRes.json();

  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!profileRes.ok) {
    return new Response("LINEプロフィール取得エラー", { status: 500 });
  }

  const profile = await profileRes.json();

  // Firestore にユーザー情報を保存（merge: true で上書き防止）
  await adminDb.collection("users").doc(profile.userId).set({
    userName: profile.displayName,
    userId: profile.userId,
    lastLogin: Timestamp.now(),
  }, { merge: true });

  // Firebaseカスタムトークンを発行
  const firebaseToken = await adminAuth.createCustomToken(profile.userId);

  return NextResponse.json({
    userId: profile.userId,
    userName: profile.displayName,
    firebaseToken,
  });
}
