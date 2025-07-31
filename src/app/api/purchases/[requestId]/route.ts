import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";
import { Purchase } from "@/types/purchase";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await context.params;
  const doc = await adminDb.collection("purchaseRequests").doc(requestId).get();
  if (!doc.exists) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(doc.data());
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await context.params;
  const { isApproved, userId } = await req.json();
  if (typeof isApproved !== "boolean") {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const docRef = adminDb.collection("purchaseRequests").doc(requestId);

  const beforeSnap = await docRef.get();

  if (!beforeSnap.exists) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const originalData = beforeSnap.data();
  if (!originalData) {
    return new NextResponse("No data in document", { status: 500 });
  }

  // ✅ 投稿者が自分に賛成しようとしたら拒否
  if (originalData.userId === userId) {
    return new NextResponse("Cannot approve your own request", { status: 403 });
  }

  if (originalData.isApproved) {
    return new NextResponse("Already approved", { status: 409 });
  }

  await docRef.update({
    isApproved,
    respondedAt: new Date(),
  });

  const afterSnap = await docRef.get();
  const updatedPurchase = {
    id: requestId,
    ...afterSnap.data(),
  } as Purchase;

  return NextResponse.json(updatedPurchase);
}
