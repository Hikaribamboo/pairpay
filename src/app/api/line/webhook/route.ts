import { NextRequest, NextResponse } from "next/server";
import * as line from "@line/bot-sdk";
import { adminDb } from "@/lib/firebase-server";

// LINEとFirebase初期化（初回のみ）
const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
};
const client = new line.Client(config);

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-line-signature") || "";
  const body = await req.text();

  const isValid = line.validateSignature(body, config.channelSecret, signature);
  if (!isValid) return new Response("Invalid signature", { status: 401 });

  try {
    const events = JSON.parse(body).events;

    for (const event of events) {
      if (event.type !== "postback") {console.warn("Unsupported event type:", event.type); continue;};
      if (event.type === "postback") {
        const data = new URLSearchParams(event.postback.data);
        const action = data.get("action");
        const requestId = data.get("id");

        if (action && requestId) {
          const docRef = adminDb.collection("purchaseRequests").doc(requestId);
          const docSnap = await docRef.get();

          if (!docSnap.exists) {
            console.error("Document not found:", requestId);
            return new Response("Not found", { status: 404 });
          }

          const data = docSnap.data()!;
          const { userName, purchaseItem } = data;

          await docRef.update({
            isApproved: true,
            respondedAt: new Date(),
          });

          await client.replyMessage(event.replyToken, [
            {
              type: "text",
              text: `${userName} が「${purchaseItem}」を承認しました！`,
            },
          ]);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
