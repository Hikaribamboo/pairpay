// app/api/request/common-rule/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";

export async function GET() {
  try {
    const ref = adminDb.collection("common_rules").doc("current");
    const snap = await ref.get();

    if (!snap.exists) {
      // 必要なら初期ドキュメントを自動作成（空→UIが動くように）
      const init = {
        contributionRatio: { you: 1, partner: 1 },
        allowedCategories: [],
        savingCategories: [],
        monthlySavingLimit: 0,
        version: 1,
        updatedAt: new Date().toISOString(),
      };
      await ref.set(init);
      return NextResponse.json({ id: "current", ...init });
    }

    return NextResponse.json({ id: "current", ...snap.data() });
  } catch (e: any) {
    console.error("GET /common-rule error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
