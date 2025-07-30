import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await context.params;
  const doc = await adminDb
    .collection("purchaseRequests")
    .doc(requestId)
    .get();
  if (!doc.exists) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(doc.data());
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await context.params;
  const { isApproved } = await req.json();
  if (typeof isApproved !== "boolean") {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const docRef = adminDb.collection("purchaseRequests").doc(requestId);
  await docRef.update({ isApproved, respondedAt: new Date() });

  // 更新後のドキュメントを取得
  const afterSnap = await docRef.get();
  const updated = { id: requestId, ...afterSnap.data() };

  return NextResponse.json(updated);
}
