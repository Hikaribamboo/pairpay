import "server-only";
import * as line from "@line/bot-sdk";
import { Payment } from "@/types/request/payment";

const client = new line.Client({
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

type LineTarget = { groupId: string };

export async function sendApprovalNotification(
  payment: Payment,
  target: LineTarget
) {
  const message = {
    type: "text" as const,
    text: `「${payment.paymentTitle}」が承認されました！`,
  };

  try {
    if ("groupId" in target) {
      await client.pushMessage(target.groupId, message);
    }
  } catch (e: any) {
    console.error("LINE send error:", e?.originalError?.response?.data ?? e);
    throw e;
  }
}
