import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(req: NextRequest) {
  const snapshot = await getDocs(collection(db, "purchaseRequests"));
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return NextResponse.json(data);
}
