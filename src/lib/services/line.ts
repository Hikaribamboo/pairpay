// src/lib/services/line.ts
import "server-only"; // ← クライアントからの誤 import を防ぐ
import * as line from "@line/bot-sdk";
import { Purchase } from "@/types/purchase";

const client = new line.Client({
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

type Target =
  | { replyToken: string } // 返信
  | { userId: string } // 個人 push
  | { groupId: string } // グループ push
  | { roomId: string }; // ルーム push

export async function sendApprovalNotification(
  purchase: Purchase,
  target: Target
) {
  const message = {
    type: "text" as const,
    text: `${purchase.userName} が「${purchase.purchaseItem}」を承認しました！`,
  };

  try {
    if ("replyToken" in target) {
      console.log("reply noti was called");
      await client.replyMessage(target.replyToken, message);
    } else if ("groupId" in target) {
      await client.pushMessage(target.groupId, message);
    } else if ("roomId" in target) {
      await client.pushMessage(target.roomId, message);
    } else {
      await client.pushMessage(target.userId, message);
    }
  } catch (e: any) {
    console.error("LINE send error:", e?.originalError?.response?.data ?? e);
    throw e;
  }
}

// （任意）常にグループに送りたい時用のシンタックスシュガー
export async function notifyApprovalToGroup(
  purchase: Purchase,
  groupId = process.env.LINE_GROUP_ID!
) {
  return sendApprovalNotification(purchase, { groupId });
}
