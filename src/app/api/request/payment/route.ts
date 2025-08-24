import { adminDb } from "@/lib/firebase-server";
import { NextRequest, NextResponse } from "next/server";
import { sendNewPaymentRequestNotification } from "@/lib/services/line-message";
import type { SendRequestMessage } from "@/types/line/message";
import { pushSimpleText } from "@/lib/services/line-message";

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

    const groupId = process.env.LINE_GROUP_ID!;

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
      groupId
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

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idFromQuery = url.searchParams.get("id");
    let id = idFromQuery;

    if (!id) {
      try {
        const body = await req.json();
        id = body?.requestId ?? body?.id ?? null;
      } catch (e) {
        console.log("No body in DELETE request");
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: "Missing request id" },
        { status: 400 }
      );
    }

    const ref = adminDb.collection("paymentRequests").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await ref.delete();

    await pushSimpleText(
      process.env.LINE_GROUP_ID!,
      `「${snap.data()?.paymentTitle ?? "項目"}」を削除しました`
    );

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (err: any) {
    const error =
      err?.originalError?.response?.data ??
      err?.response?.data ??
      err?.message ??
      err;
    console.error("Error in payment DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
