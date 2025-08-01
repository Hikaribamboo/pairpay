import { NextRequest, NextResponse } from "next/server";
import * as line from "@line/bot-sdk";
import { Payment } from "@/types/request/payment";
import { sendApprovalNotification } from "@/lib/services/line";

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
};
const client = new line.Client(config);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature") || "";

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

  for (const event of events) {
    if (event.type !== "postback") continue;

    const data = new URLSearchParams(event.postback.data);
    const requestId = data.get("id");
    const paymentTitle = data.get("paymentTitle");
    const groupId: string = process.env.LINE_GROUP_ID!;

    if (!requestId) continue;

    const userId = event.source.userId;
    if (!userId) {
      continue;
    }

    const patchRes = await fetch(
      `${process.env.NEXT_PUBLIC_REDIRECT_BASE_URL}/api/request/payment/${requestId}`, // 相対パスを推奨
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true, userId }),
      }
    );

    if (patchRes.status === 403) {
      await client.pushMessage(groupId, {
        type: "text",
        text: "自分のリクエストは承認できません",
      });
      continue;
    }

    if (patchRes.status === 409) {
      await client.pushMessage(groupId, {
        type: "text",
        text: `「${paymentTitle}」はすでに承認されています`,
      });
      continue;
    }

    if (!patchRes.ok) {
      console.error(`PATCH failed for ${requestId}`, await patchRes.text());
      continue;
    }

    const updatedPayment: Payment = await patchRes.json();
    await sendApprovalNotification(updatedPayment, { groupId });
    await sendApprovalNotification(updatedPayment, { groupId });
    try {
      await sendApprovalNotification(updatedPayment, {
        groupId,
      });
    } catch (e) {
      console.error("Failed to send LINE notification", e, updatedPayment);
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
