import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const fromStr = req.nextUrl.searchParams.get("from");
  const toStr = req.nextUrl.searchParams.get("to");

  if (!fromStr || !toStr) {
    return NextResponse.json(
      { error: "from と to を指定してください" },
      { status: 400 }
    );
  }

  const fromDate = new Date(fromStr);
  const toDate = new Date(toStr);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return NextResponse.json({ error: "日付形式が不正です" }, { status: 400 });
  }

  const snapshot = await adminDb
    .collection("paymentRequests")
    .where("createdAt", ">=", Timestamp.fromDate(fromDate))
    .where("createdAt", "<=", Timestamp.fromDate(toDate))
    .get();

  const data = snapshot.docs.map((doc) => ({
    requestId: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(data);
}
