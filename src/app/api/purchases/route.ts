import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";

export async function GET(req: NextRequest) {
  const snapshot = await adminDb.collection("purchaseRequests").get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json(data);
}
