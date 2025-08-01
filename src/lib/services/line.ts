// src/lib/services/line.ts
import "server-only"; // ← クライアントからの誤 import を防ぐ
import * as line from "@line/bot-sdk";
import { Purchase } from "@/types/purchase";

const client = new line.Client({
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

type LineTarget = { groupId: string };

export async function sendApprovalNotification(
  purchase: Purchase,
  target: LineTarget
) {
  const message = {
    type: "text" as const,
    text: `「${purchase.purchaseItem}」が承認されました！`,
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