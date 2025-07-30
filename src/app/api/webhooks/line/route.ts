import { NextRequest, NextResponse } from "next/server";
import * as line from "@line/bot-sdk";
import { Purchase } from "@/types/purchase";
import { sendApprovalNotification } from "@/lib/services/line";

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature") || "";

  // 署名チェック。失敗しても 200 を返す
  if (!line.validateSignature(body, config.channelSecret, signature)) {
    console.error("Invalid signature");
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  let events: line.WebhookEvent[] = [];
  try {
    events = JSON.parse(body).events;
  } catch (e) {
    console.error("Failed to parse webhook body", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // イベントごとに順に処理
  for (const event of events) {
    if (event.type !== "postback") continue;

    const data = new URLSearchParams(event.postback.data);
    const requestId = data.get("id");
    if (!requestId) continue;

    // 1) 内部 PATCH API 呼び出し
    const patchRes = await fetch(
      `/api/purchases/${requestId}`,  // 相対パスを推奨
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      }
    );

    if (!patchRes.ok) {
      console.error(`PATCH failed for ${requestId}`, await patchRes.text());
      continue;  // 次のイベントへ
    }

    // 2) 更新後 Purchase オブジェクトの取得
    const updatedPurchase: Purchase = await patchRes.json();

    // 3) LINE への通知を await する
    try {
      await sendApprovalNotification(updatedPurchase, { replyToken: event.replyToken })
    } catch (e) {
      console.error("Failed to send LINE notification", e, updatedPurchase);
    }
  }

  // 最後に必ず 200 OK を返す
  return NextResponse.json({ ok: true }, { status: 200 });
}
