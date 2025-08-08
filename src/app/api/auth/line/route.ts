// app/api/auth/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const { code, redirectUri, groupId } = await req.json();
  if (!code || !redirectUri || !groupId) {
    return NextResponse.json(
      { error: "Missing code or redirectUri" },
      { status: 400 }
    );
  }

  /*----------------- ① トークン取得 -----------------*/
  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
      client_secret: process.env.LINE_CLIENT_SECRET!,
    }),
  });

  if (!tokenRes.ok) {
    // ここで LINE が返したエラーメッセージを出力
    const errText = await tokenRes.text();
    console.error("LINE token endpoint error:", tokenRes.status, errText);

    return NextResponse.json(
      { status: tokenRes.status, error: errText },
      { status: tokenRes.status }
    );
  }

  const { access_token } = await tokenRes.json();

  /*----------------- ② プロフィール取得 -----------------*/
  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!profileRes.ok) {
    const errText = await profileRes.text();
    console.error("LINE profile error:", errText);
    return NextResponse.json({ error: errText }, { status: 500 });
  }
  const profile = await profileRes.json();

  /*----------------- ③ Firestore 更新 & カスタムトークン -----------------*/
  await adminDb.collection("users").doc(profile.userId).set(
    {
      userId: profile.userId,
      userName: profile.displayName,
      groupId,
      lastLogin: new Date(),
    },
    { merge: true }
  );

  const groupRef = adminDb.collection("groups").doc(groupId);
  const groupSnap = await groupRef.get();

  let pairUserId: string | null = null;
  let pairUserName: string | null = null;

  if (!groupSnap.exists) {
    // 初回：ドキュメントがなければ新規作成
    await groupRef.set({
      groupId,
      members: [profile.userId],
    });
  } else {
    const data = groupSnap.data()!;

    // 必要なら追加
    if (!data.members.includes(profile.userId) && data.members.length < 2) {
      await groupRef.update({
        members: FieldValue.arrayUnion(profile.userId),
      });
    }

    // ペアの userName を取得
    const pairId = data.members.find((id: string) => id !== profile.userId);
    if (pairId) {
      pairUserId = pairId;
      const pairDoc = await adminDb.collection("users").doc(pairId).get();
      if (pairDoc.exists) {
        pairUserName = pairDoc.data()?.userName ?? null;
      }
    }
  }

  const customToken = await adminAuth.createCustomToken(profile.userId);

  return NextResponse.json({
    userId: profile.userId,
    userName: profile.displayName,
    customToken,
    pairUserId,
    pairUserName,
  });
}
