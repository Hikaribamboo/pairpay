import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";

export async function GET() {
  const snapshot = await adminDb.collection("paymentRequests").get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json(data);
}


