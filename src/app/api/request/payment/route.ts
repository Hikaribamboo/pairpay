import { adminDb } from "@/lib/firebase-server";
import { NextRequest, NextResponse } from "next/server";
import { sendNewPaymentRequestNotification } from "@/lib/services/line-message";
import type { SendRequestMessage, LineTarget } from "@/types/line/message";

export async function GET() {
  const snapshot = await adminDb.collection("paymentRequests").get();
  const data = snapshot.docs.map((doc) => ({
    requestId: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(data);
}


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
    }: SendRequestMessage = await req.json();

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

    const target: LineTarget = {
      groupId: process.env.LINE_GROUP_ID!,
    };

    await sendNewPaymentRequestNotification(
      {
        userId,
        userName,
        paymentTitle,
        paymentCost,
        itemLink,
        paymentMemo,
        category,
        requestId,
      },
      target
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const error =
      err?.originalError?.response?.data ??
      err?.response?.data ??
      err?.message ??
      err;
    console.error("Error in payment POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}