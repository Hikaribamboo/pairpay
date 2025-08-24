import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-server";
import { AllRules } from "@/types/common-rule";
import { sendRulesUpdatedNotification } from "@/lib/services/line-message";

const RULES_DOC_PATH = "common/rules";
async function getCurrentRules(): Promise<AllRules | null> {
  const doc = await adminDb.doc(RULES_DOC_PATH).get();
  if (!doc.exists) return null;
  return doc.data() as AllRules;
}

export async function GET() {
  const existing = await getCurrentRules();
  return NextResponse.json(
    existing || {
      fixed: {
        contributionRatio: 5,
        allowedCategories: [],
        savingCategories: [],
      },
      free: [],
    }
  );
}

export async function PATCH(req: NextRequest) {
  const incoming = (await req.json()) as Partial<AllRules>;
  const previous = await getCurrentRules();

  const merged: AllRules = {
    fixed: {
      contributionRatio:
        incoming.fixed?.contributionRatio ??
        previous?.fixed.contributionRatio ??
        5,
      allowedCategories:
        incoming.fixed?.allowedCategories ??
        previous?.fixed.allowedCategories ??
        [],
      savingCategories:
        incoming.fixed?.savingCategories ??
        previous?.fixed.savingCategories ??
        [],
    },
    free: incoming.free ?? previous?.free ?? [],
  };

  await adminDb.doc(RULES_DOC_PATH).set(merged, { merge: true });

  try {
    const groupId = process.env.LINE_GROUP_ID!;
    await sendRulesUpdatedNotification(previous, merged, groupId);
  } catch (e) {
    console.error("LINE通知失敗:", e);
  }

  return NextResponse.json({ success: true, rules: merged });
}
