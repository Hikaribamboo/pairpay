// api/line/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  approvePaymentRequest,
  ApprovalError,
} from "@/lib/services/approval-request";
import { pushSimpleText, sendWelcomeLink } from "@/lib/services/line-message";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const events = JSON.parse(body).events;
  for (const ev of events) {
    switch (ev.type) {
      case "join":
        // ボットがグループに招待されたとき
        if (ev.source.type === "group") {
          const groupId = ev.source.groupId;
          await sendWelcomeLink({ groupId });
        }
        break;

      case "postback": {
        // 承認ボタンが押されたとき
        const params = new URLSearchParams(ev.postback.data);
        const requestId = params.get("id");
        const paymentTitle = params.get("paymentTitle") ?? "（不明）";
        const userId = ev.source?.userId;
        const target =
          ev.source.type === "group" ? ev.source.groupId : ev.source.userId!;

        if (!requestId || !userId) break;

        try {
          await approvePaymentRequest(requestId, userId);
        } catch (e: any) {
          let msg: string;
          if (e instanceof ApprovalError) {
            switch (e.status) {
              case 403:
                msg = "自分のリクエストは承認できません";
                break;
              case 409:
                msg = `「${paymentTitle}」はすでに承認されています`;
                break;
              default:
                msg = `「${paymentTitle}」の承認に失敗しました`;
                break;
            }
          } else {
            console.error(e);
            msg = "不明なエラーが発生しました";
          }
          await pushSimpleText(target, msg);
        }

        break;
      }

      default:
        // 他のイベントは無視
        break;
    }
  }

  return NextResponse.json({ ok: true });
}
