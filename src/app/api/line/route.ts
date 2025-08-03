// api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  approvePaymentRequest,
  ApprovalError,
} from "@/lib/services/approval-request";
import { pushSimpleText } from "@/lib/services/line-message";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const groupId = process.env.LINE_GROUP_ID!;
  const target = { groupId };

  // 署名検証などは省略（すでにある場合）

  const events = JSON.parse(body).events;
  for (const event of events) {
    if (event.type !== "postback") continue;

    const params = new URLSearchParams(event.postback.data);
    const requestId = params.get("id");
    const paymentTitle = params.get("paymentTitle") ?? "（不明）";
    const userId = event.source?.userId;

    if (!requestId || !userId) continue;

    try {
      await approvePaymentRequest(requestId, userId);
    } catch (e) {
      if (e instanceof ApprovalError) {
        const msg =
          e.status === 403
            ? "自分のリクエストは承認できません"
            : e.status === 409
              ? `「${paymentTitle}」はすでに承認されています`
              : `「${paymentTitle}」の承認に失敗しました`;
        await pushSimpleText(target, msg);
      } else {
        console.error(e);
        await pushSimpleText(target, "不明なエラーが発生しました");
      }
    }
  }

  return NextResponse.json({ ok: true });
}
