// app/api/auth/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-server";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const { code, redirectUri, groupId } = await req.json();
  if (!code || !redirectUri) {
    return NextResponse.json(
      { error: "Missing code or redirectUri" },
      { status: 400 }
    );
  }

  // --- ① token ---
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
    const errText = await tokenRes.text();
    console.error("LINE token endpoint error:", tokenRes.status, errText);
    return NextResponse.json(
      { status: tokenRes.status, error: errText },
      { status: tokenRes.status }
    );
  }
  const { access_token } = await tokenRes.json();

  // --- ② profile ---
  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!profileRes.ok) {
    const errText = await profileRes.text();
    console.error("LINE profile error:", errText);
    return NextResponse.json({ error: errText }, { status: 500 });
  }
  const profile = await profileRes.json();

  // --- ③ users 保存 ---
  await adminDb
    .collection("users")
    .doc(profile.userId)
    .set(
      {
        userId: profile.userId,
        userName: profile.displayName,
        // groupId は optional（nogroup のときは保存しない）
        ...(groupId && groupId !== "nogroup" ? { groupId } : {}),
        lastLogin: new Date(),
      },
      { merge: true }
    );

  // --- ④ groups は groupId がある場合だけ ---
  let pairUserId: string | null = null;
  let pairUserName: string | null = null;

  if (groupId && groupId !== "nogroup") {
    const groupRef = adminDb.collection("groups").doc(groupId);
    const groupSnap = await groupRef.get();

    if (!groupSnap.exists) {
      await groupRef.set({ groupId, members: [profile.userId] });
    } else {
      const data = groupSnap.data()!;
      if (!data.members.includes(profile.userId) && data.members.length < 2) {
        await groupRef.update({
          members: FieldValue.arrayUnion(profile.userId),
        });
      }
      const pairId = data.members.find((id: string) => id !== profile.userId);
      if (pairId) {
        pairUserId = pairId;
        const pairDoc = await adminDb.collection("users").doc(pairId).get();
        pairUserName = pairDoc.exists
          ? (pairDoc.data()?.userName ?? null)
          : null;
      }
    }
  }

  const customToken = await adminAuth.createCustomToken(profile.userId);

  return NextResponse.json({
    userId: profile.userId,
    userName: profile.displayName,
    customToken,
    // groupId は保存していない可能性もある点に注意
    pairUserId,
    pairUserName,
  });
}
