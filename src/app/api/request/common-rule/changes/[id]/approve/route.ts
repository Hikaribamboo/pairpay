import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";

function getUserId(req: NextRequest) {
  return req.headers.get("x-user-id");
}

async function getRequiredApprovers(): Promise<string[]> {
  const env = process.env.COMMON_RULE_REQUIRED_APPROVERS;
  if (env?.trim()) return env.split(",").map((s) => s.trim()).filter(Boolean);
  const metaRef = adminDb.collection("common_rules_meta").doc("settings");
  const metaSnap = await metaRef.get();
  const arr: string[] =
    metaSnap.exists && Array.isArray(metaSnap.data()?.requiredApprovers)
      ? metaSnap.data()!.requiredApprovers
      : [];
  return arr;
}

type Body = { approve: boolean; comment?: string };

export async function POST(req: NextRequest, { params }: any) {
  try {
    const approverId = getUserId(req);
    if (!approverId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { approve, comment }: Body = await req.json();
    const changeId: string = params.id;

    const requiredApprovers = await getRequiredApprovers();
    if (!requiredApprovers.length) {
      return NextResponse.json({ message: "No required approvers configured" }, { status: 500 });
    }
    if (!requiredApprovers.includes(approverId)) {
      return NextResponse.json({ message: "Forbidden (not an approver)" }, { status: 403 });
    }

    const changeRef = adminDb.collection("common_rules_change_requests").doc(changeId);
    const changeSnap = await changeRef.get();
    if (!changeSnap.exists) return NextResponse.json({ message: "Change request not found" }, { status: 404 });

    const change = changeSnap.data()!;
    if (change.status !== "pending") {
      return NextResponse.json({ message: `Already ${change.status}` }, { status: 409 });
    }

    // 承認ログ upsert
    await changeRef.collection("approvals").doc(approverId).set(
      {
        approverId,
        approved: !!approve,
        comment: comment ?? "",
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    if (!approve) {
      await changeRef.update({ status: "rejected", finalizedAt: new Date().toISOString() });
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    // 全員承認チェック
    const approvalsSnap = await changeRef.collection("approvals").get();
    const approvedSet = new Set(
      approvalsSnap.docs.filter((d) => d.data().approved === true).map((d) => d.id)
    );
    const allApproved =
      requiredApprovers.every((id) => approvedSet.has(id)) &&
      approvedSet.size === requiredApprovers.length;

    if (!allApproved) {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    // 適用（トランザクション）
    const currentRef = adminDb.collection("common_rules").doc("current");
    await adminDb.runTransaction(async (tx) => {
      const [curSnap, chSnap] = await Promise.all([tx.get(currentRef), tx.get(changeRef)]);
      if (!curSnap.exists) throw new Error("Current rules not found during tx");
      const current = curSnap.data()!;
      const nextVersion = (current.version ?? 1) + 1;
      const proposed: any = chSnap.data()!;

      const merged = {
        ...current,
        ...(proposed.contributionRatio && { contributionRatio: proposed.contributionRatio }),
        ...(proposed.allowedCategories && { allowedCategories: proposed.allowedCategories }),
        ...(proposed.savingCategories && { savingCategories: proposed.savingCategories }),
        ...(typeof proposed.monthlySavingLimit === "number" && { monthlySavingLimit: proposed.monthlySavingLimit }),
        version: nextVersion,
        updatedAt: new Date().toISOString(),
      };

      tx.update(currentRef, merged);
      tx.update(changeRef, {
        status: "approved",
        appliedRuleId: "current",
        finalizedAt: new Date().toISOString(),
      });
    });

    return NextResponse.json({ ok: true, status: "approved" });
  } catch (e: any) {
    console.error("POST /approve error:", e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
