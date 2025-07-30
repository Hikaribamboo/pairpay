import { NextRequest, NextResponse } from "next/server";
import * as line from "@line/bot-sdk";
import { Purchase } from "@/types/purchase";

// LINE クライアント初期化
const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
};
const client = new line.Client(config);

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-line-signature") || "";
  const body = await req.text();
  if (!line.validateSignature(body, config.channelSecret, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const { events } = JSON.parse(body);
  const updatedResults: Purchase[] = [];

  for (const event of events) {
    if (event.type !== "postback") continue;
    const data = new URLSearchParams(event.postback.data);
    const action = data.get("action");
    const requestId = data.get("id");
    if (!action || !requestId) continue;

    // 承認処理を内部 API に委譲
    const patchRes = await fetch(
      `${process.env.NEXT_PUBLIC_REDIRECT_BASE_URL}/api/purchases/${requestId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      }
    );

    if (!patchRes.ok) {
      console.error(`Failed to PATCH /api/purchases/${requestId}`);
      continue;
    }

    // 2) 更新後の値を受け取る
    const updatedData = await patchRes.json();
    updatedResults.push(updatedData);

    // LINE に返信
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: `リクエスト ${requestId} を承認しました！`,
    });
  }

  return NextResponse.json({
    ok: true,
    updated: updatedResults,
  });
}
