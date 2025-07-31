import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";
import { Client } from "@line/bot-sdk";

const lineClient = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const { userId, userName, purchaseItem, itemCost, itemLink, itemMemo } =
      await req.json();

    // 1) Firestore にドキュメントを作成
    const docRef = await adminDb.collection("purchaseRequests").add({
      userId,
      userName,
      purchaseItem,
      itemCost,
      itemLink,
      itemMemo,
      createdAt: new Date(),
      isApproved: false,
    });
    const requestId = docRef.id;

    // 2) LINE グループに Flex メッセージを送信
    const groupId = process.env.LINE_GROUP_ID!;
    await lineClient.pushMessage(groupId, {
      type: "flex",
      altText: "購入リクエストが届きました",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          spacing: "md",
          contents: [
            {
              type: "text",
              text: `${userName} さんから購入リクエストが届きました！`,
              weight: "bold",
              size: "md",
            },
            {
              type: "text",
              text: `🗒️ ${purchaseItem}  ${itemCost}円`,
              wrap: true,
              color: "#ff5100ff",
              size: "sm",
            },
            ...(itemLink
              ? [
                  {
                    type: "button",
                    style: "link",
                    height: "sm",
                    action: {
                      type: "uri",
                      label: "🔗 商品リンク",
                      uri: itemLink,
                    },
                  } as any,
                ]
              : []),
          ],
        },
        footer: {
          type: "box",
          layout: "horizontal",
          spacing: "md",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#2b6de7ff", // green-400
              action: {
                type: "postback",
                label: "賛成🙌🏻💗",
                data:
                  `action=agree` +
                  `&id=${requestId}` +
                  `&purchaseItem=${encodeURIComponent(purchaseItem)}`,
              },
            },
          ],
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error in POST:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
