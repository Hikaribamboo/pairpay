// lib/services/line.ts
import "server-only";
import * as line from "@line/bot-sdk";
import type { Payment } from "@/types/request/payment";
import type { SendRequestMessage } from "@/types/line/message";

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

export async function sendNewPaymentRequestNotification(
  params: SendRequestMessage,
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

// ルール変更通知（固定＋自由どちらも使える）
export async function sendRulesUpdatedNotification(
  previous: { fixed: any; free: string[] } | null,
  current: { fixed: any; free: string[] },
  target: LineTarget
): Promise<void> {
  const diffs: string[] = [];

  if (previous) {
    // contributionRatio の差分
    if (previous.fixed.contributionRatio !== current.fixed.contributionRatio) {
      diffs.push(
        `・入金負担割合: ${previous.fixed.contributionRatio} → ${current.fixed.contributionRatio}`
      );
    }
    // allowedCategories の差分
    const addedAllowed = current.fixed.allowedCategories.filter(
      (c: string) => !previous.fixed.allowedCategories.includes(c)
    );
    const removedAllowed = previous.fixed.allowedCategories.filter(
      (c: string) => !current.fixed.allowedCategories.includes(c)
    );
    if (addedAllowed.length)
      diffs.push(`・許可カテゴリに追加: ${addedAllowed.join(", ")}`);
    if (removedAllowed.length)
      diffs.push(`・許可カテゴリから削除: ${removedAllowed.join(", ")}`);

    // savingCategories の差分
    const addedSaving = current.fixed.savingCategories.filter(
      (c: string) => !previous.fixed.savingCategories.includes(c)
    );
    const removedSaving = previous.fixed.savingCategories.filter(
      (c: string) => !current.fixed.savingCategories.includes(c)
    );
    if (addedSaving.length)
      diffs.push(`・貯金カテゴリに追加: ${addedSaving.join(", ")}`);
    if (removedSaving.length)
      diffs.push(`・貯金カテゴリから削除: ${removedSaving.join(", ")}`);

    // 自由ルールの差分
    const addedFree = current.free.filter((f) => !previous.free.includes(f));
    const removedFree = previous.free.filter((f) => !current.free.includes(f));
    if (addedFree.length)
      diffs.push(
        `・自由ルール追加: ${addedFree.map((f) => `"${f}"`).join(", ")}`
      );
    if (removedFree.length)
      diffs.push(
        `・自由ルール削除: ${removedFree.map((f) => `"${f}"`).join(", ")}`
      );
  } else {
    diffs.push("初回ルール設定が行われました。");
  }

  const bodyText =
    diffs.length > 0
      ? ["ルールが更新されました：", ...diffs].join("\n")
      : "ルールの更新がありましたが、差分が検知できませんでした。";

  await pushSimpleText(target, bodyText);
}

export async function sendWelcomeLink(target: LineTarget): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL!;
  const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID!;
  const redirect = `${appUrl}/`;
  const groupId = target.groupId;
  const loginUrl =
    "https://access.line.me/oauth2/v2.1/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirect,
      state: groupId,
      scope: "profile openid",
    });

  const flexMessage: line.Message = {
    type: "flex",
    altText: "PairPayへようこそ！",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: "ペアPayへようこそ！",
            weight: "bold",
            size: "lg",
          },
          {
            type: "text",
            text: "下のボタンからログインしてペア登録を始めましょう",
            size: "sm",
            wrap: true,
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "uri",
              label: "LINEログイン",
              uri: loginUrl,
            },
          },
        ],
      },
    },
  };

  await pushMessageToLine(target, flexMessage);
}
