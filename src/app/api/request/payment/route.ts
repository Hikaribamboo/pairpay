import { adminDb } from "@/lib/firebase-server";
import admin from "firebase-admin";
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

    // serverTimestamp を使う（クライアント時計に依存しない）
    const write = {
      userId,
      userName,
      paymentTitle,
      paymentCost,
      itemLink,
      paymentMemo,
      category,
      isApproved: false,
      approvedAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("paymentRequests").add(write);

    // serverTimestamp は直後は null のことがあるので、読み直して実時刻を取り出す
    const snap = await docRef.get();
    const data = snap.data() || {};
    const createdAt =
      data.createdAt?.toDate?.() instanceof Date
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString();

    const result = {
      requestId: docRef.id,
      userId,
      userName,
      paymentTitle,
      paymentCost,
      itemLink,
      paymentMemo,
      category,
      isApproved: false,
      approvedAt: null,
      createdAt,
    };

    const groupId = process.env.LINE_GROUP_ID!;
    await sendNewPaymentRequestNotification({ ...result }, groupId);

    return NextResponse.json(result, { status: 201 });
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
        console.error("No body in DELETE request", e);
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
