import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";
import { Client } from "@line/bot-sdk";
import { RequestPayment } from "@/types/request/payment";

const lineClient = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      userName,
      paymentTitle,
      paymentCost,
      itemLink,
      paymentMemo,
      category,
    }: RequestPayment = await req.json();

    // Firestore
    const docRef = await adminDb.collection("paymentRequests").add({
      userId,
      userName,
      paymentTitle,
      paymentCost,
      itemLink,
      paymentMemo,
      category,
      createdAt: new Date(),
      isApproved: false,
    });
    const requestId = docRef.id;
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
        text: `🗒️ ${paymentTitle}  ${paymentCost}円`,
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
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const data =
      err?.originalError?.response?.data ??
      err?.response?.data ??
      err?.message ??
      err;
    console.error("Error in POST (LINE push):", data);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
