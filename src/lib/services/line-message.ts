// lib/services/line.ts
import "server-only";
import * as line from "@line/bot-sdk";
import type { Payment } from "@/types/request/payment";

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
};

// シングルトンのクライアント
export const lineClient = new line.Client(config);

export type LineTarget = { groupId: string };

// 汎用メッセージ送信（Text / Flex を含む）
export async function pushMessageToLine(
  target: LineTarget,
  message: line.Message
): Promise<void> {
  try {
    if ("groupId" in target) {
      await lineClient.pushMessage(target.groupId, message);
    }
  } catch (e: any) {
    console.error(
      "LINE pushMessageToLine error:",
      e?.originalError?.response?.data ?? e
    );
    throw e;
  }
}

// 短文（テキスト）送信用ラッパー
export async function pushSimpleText(
  target: LineTarget,
  text: string
): Promise<void> {
  const message: line.Message = {
    type: "text",
    text,
  };
  await pushMessageToLine(target, message);
}

// 承認通知（テキスト）
export async function sendApprovalNotification(
  payment: Payment,
  target: LineTarget
): Promise<void> {
  const message: line.Message = {
    type: "text",
    text: `「${payment.paymentTitle}」が承認されました！`,
  };
  await pushMessageToLine(target, message);
}

// 購入リクエスト通知（Flex）
export interface RequestPaymentParams {
  userName: string;
  paymentTitle: string;
  paymentCost: number;
  itemLink?: string;
  requestId: string;
}

export async function sendNewPaymentRequestNotification(
  params: RequestPaymentParams,
  target: LineTarget
): Promise<void> {
  const { userName, paymentTitle, paymentCost, itemLink, requestId } = params;

  const isValidHttpUrl =
    typeof itemLink === "string" && /^https?:\/\//i.test(itemLink);

  const bodyContents: any[] = [
    {
      type: "text",
      text: `${userName} さんから購入リクエストが届きました！`,
      weight: "bold",
      size: "md",
    },
    {
      type: "text",
      text: `🗒️ ${paymentTitle}  ${paymentCost.toLocaleString()}円`,
      wrap: true,
      color: "#ff5100",
      size: "sm",
    },
  ];

  if (isValidHttpUrl) {
    bodyContents.push({
      type: "button",
      style: "link",
      height: "sm",
      action: {
        type: "uri",
        label: "商品リンク",
        uri: itemLink,
      },
    });
  }

  const flexMessage: line.Message = {
    type: "flex",
    altText: "購入リクエストが届きました",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: bodyContents,
      },
      footer: {
        type: "box",
        layout: "horizontal",
        spacing: "md",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#2b6de7",
            action: {
              type: "postback",
              label: "賛成🙌🏻💗",
              data:
                `action=agree` +
                `&id=${requestId}` +
                `&paymentTitle=${encodeURIComponent(paymentTitle)}`,
            },
          },
        ],
      },
    },
  };

  await pushMessageToLine(target, flexMessage);
}
