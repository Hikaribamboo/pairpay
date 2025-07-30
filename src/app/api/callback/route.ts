// app/api/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const redirectUri = req.nextUrl.searchParams.get("redirect_uri"); // ← フロントから受け取る

  if (!code || !redirectUri) {
    return new Response("Missing code or redirect_uri", { status: 400 });
  }

  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,  // ← フロントと完璧に一致
      client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
      client_secret: process.env.LINE_CLIENT_SECRET!,
    }),
  });
  if (!tokenRes.ok) throw new Error(await tokenRes.text());
  const { access_token } = await tokenRes.json();

  // 2) LINE プロフィールを取得
  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!profileRes.ok) throw new Error("LINE profile error");
  const profile = await profileRes.json();

  // 3) Firestore に保存（merge: true）
  await adminDb
    .collection("users")
    .doc(profile.userId)
    .set(
      { userName: profile.displayName, lastLogin: Timestamp.now() },
      { merge: true }
    );

  // 4) カスタムトークンを発行（名前を customToken に）
  const customToken = await adminAuth.createCustomToken(profile.userId);

  return NextResponse.json({
    userId: profile.userId,
    userName: profile.displayName,
    customToken,
  });
}
