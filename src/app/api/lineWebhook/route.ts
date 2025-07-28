import { NextRequest, NextResponse } from "next/server";
import { middleware as lineMiddleware, WebhookEvent } from "@line/bot-sdk";
import { db } from "@/lib/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // LINEイベントループ
  for (const event of body.events) {
    // ✅ postbackイベントか確認
    if (event.type === "postback" && event.postback?.data) {
      const { data, source } = event;
      const params = new URLSearchParams(event.postback.data);
      const action = params.get("action"); // agree または skip
      const requestId = params.get("id");
      const userId = source?.userId;

      if (action && requestId && userId) {
        // Firestore に保存
        const reactionRef = doc(
          db,
          "purchaseRequests",
          requestId,
          "reactions",
          userId
        );

        await setDoc(reactionRef, {
          type: action,
          reactedAt: Timestamp.now(),
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
