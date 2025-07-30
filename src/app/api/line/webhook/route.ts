import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const body = await req.json();

  for (const event of body.events) {
    if (event.type === "postback" && event.postback?.data) {
      const params = new URLSearchParams(event.postback.data);
      const action = params.get("action"); 
      const requestId = params.get("id");
      const userId = event.source?.userId;

      if (action && requestId && userId) {
        const reactionRef = adminDb
          .collection("purchaseRequests")
          .doc(requestId)
          .collection("reactions")
          .doc(userId);

        await reactionRef.set({
          type: action,
          reactedAt: Timestamp.now(),
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
