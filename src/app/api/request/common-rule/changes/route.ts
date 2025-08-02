// app/api/request/common-rule/changes/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";

type PartialRules = {
  contributionRatio?: Record<string, number>;
  allowedCategories?: string[];
  savingCategories?: string[];
  monthlySavingLimit?: number;
};

function getUserId(req: NextRequest): string | null {
  // 認証統合に応じて差し替え（例：ヘッダ / セッション / JWT など）
  return req.headers.get("x-user-id");
}

export async function GET() {
  try {
    const q = await adminDb
      .collection("common_rules_change_requests")
      .orderBy("createdAt", "desc")
      .get();

    const items = await Promise.all(
      q.docs.map(async (doc) => {
        const base = { id: doc.id, ...doc.data() };
        // approvals をサブコレクションから集約してネスト
        const approvalsSnap = await doc.ref.collection("approvals").get();
        const approvals = approvalsSnap.docs.map((a) => ({ id: a.id, ...a.data() }));
        return { ...base, approvals };
      })
    );

    return NextResponse.json(items);
  } catch (e: any) {
    console.error("GET /common-rule/changes error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const proposerId = getUserId(req);
    if (!proposerId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = (await req.json()) as PartialRules;

    // 現行版の version を控える
    const currentRef = adminDb.collection("common_rules").doc("current");
    const currentSnap = await currentRef.get();
    if (!currentSnap.exists) {
      return NextResponse.json({ message: "Current rules not found" }, { status: 404 });
    }
    const current = currentSnap.data()!;
    const targetRuleVersion = current.version ?? 1;

    const doc = {
      proposerId,
      ...payload, // 提案内容（存在するキーのみ）
      createdAt: new Date().toISOString(),
      status: "pending" as const,
      targetRuleVersion,
      appliedRuleId: null as string | null,
      finalizedAt: null as string | null,
    };

    const createdRef = await adminDb.collection("common_rules_change_requests").add(doc);

    return NextResponse.json({ id: createdRef.id, ...doc }, { status: 201 });
  } catch (e: any) {
    console.error("POST /common-rule/changes error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
