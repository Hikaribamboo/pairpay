"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";
import {
  getCurrentRules,
  getChangeRequests,
  submitChangeRequest as apiSubmitChangeRequest,
  approveChangeRequest as apiApproveChangeRequest,
} from "@/lib/api/request/common-rule";
import type {
  CommonRules,
  CommonRulesChangeRequest,
  CommonRulesApproval,
} from "@/types/rules";

// ---- 補助型（画面内のみで使う） ----
type ContributionRatio = Record<string, number>;
type ApiError = { message?: string };
// change request に approvals がネストされて返る場合を吸収
type ChangeWithApprovals = CommonRulesChangeRequest & {
  approvals?: CommonRulesApproval[];
};

// ---- ヘルパー ----
const ratioToString = (ratio?: ContributionRatio) => {
  if (!ratio) return "-";
  const entries = Object.entries(ratio);
  if (entries.length === 0) return "-";
  return entries.map(([k, v]) => `${k}:${v}`).join(" / ");
};

const validateContributionRatio = (ratio: ContributionRatio) => {
  const total = Object.values(ratio).reduce((s, v) => s + v, 0);
  return total > 0;
};

// ---- ページ本体 ----
export default function CommonRulesEditorPage() {
  const [currentRules, setCurrentRules] = useState<CommonRules | null>(null);
  const [history, setHistory] = useState<ChangeWithApprovals[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 提案フォーム状態
  const [proposal, setProposal] = useState<Partial<CommonRules>>({});
  const [ratioInputs, setRatioInputs] = useState<ContributionRatio>({});
  const [limitInput, setLimitInput] = useState<number>(0);
  const [newAllowedCategory, setNewAllowedCategory] = useState("");
  const [newSavingCategory, setNewSavingCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // （実装次第でセッション/権限から取得）
  const isApprover = true;

  const ratioValid = useMemo(
    () => validateContributionRatio(ratioInputs),
    [ratioInputs]
  );

  // 現在ルール取得
  useEffect(() => {
    setLoadingRules(true);
    getCurrentRules()
      .then((data) => {
        setCurrentRules(data);
        // フォーム初期値
        setProposal({
          contributionRatio: data.contributionRatio,
          allowedCategories: data.allowedCategories,
          savingCategories: data.savingCategories,
          monthlySavingLimit: data.monthlySavingLimit,
        });
        setRatioInputs({ ...data.contributionRatio });
        setLimitInput(data.monthlySavingLimit);
      })
      .catch((e: ApiError | any) => {
        console.error(e);
        setError(e?.message || "ルールの取得に失敗しました");
      })
      .finally(() => setLoadingRules(false));
  }, []);

  // 変更履歴取得
  useEffect(() => {
    setLoadingHistory(true);
    getChangeRequests()
      .then((data) => {
        // API が approvals を含めて返す場合/返さない場合どちらも吸収
        setHistory(data as ChangeWithApprovals[]);
      })
      .catch((e: ApiError | any) => {
        console.error(e);
        setError(e?.message || "変更履歴の取得に失敗しました");
      })
      .finally(() => setLoadingHistory(false));
  }, []);

  // 許可カテゴリ 追加/削除
  const handleAddAllowed = () => {
    if (!newAllowedCategory.trim() || !currentRules) return;
    setProposal((p) => ({
      ...p,
      allowedCategories: Array.from(
        new Set([
          ...(p.allowedCategories ?? currentRules.allowedCategories),
          newAllowedCategory.trim(),
        ])
      ),
    }));
    setNewAllowedCategory("");
  };
  const handleRemoveAllowed = (cat: string) => {
    setProposal((p) => ({
      ...p,
      allowedCategories: (
        p.allowedCategories ??
        currentRules?.allowedCategories ??
        []
      ).filter((c) => c !== cat),
    }));
  };

  // 貯金カテゴリ 追加/削除
  const handleAddSaving = () => {
    if (!newSavingCategory.trim() || !currentRules) return;
    setProposal((p) => ({
      ...p,
      savingCategories: Array.from(
        new Set([
          ...(p.savingCategories ?? currentRules.savingCategories),
          newSavingCategory.trim(),
        ])
      ),
    }));
    setNewSavingCategory("");
  };
  const handleRemoveSaving = (cat: string) => {
    setProposal((p) => ({
      ...p,
      savingCategories: (
        p.savingCategories ??
        currentRules?.savingCategories ??
        []
      ).filter((c) => c !== cat),
    }));
  };

  // 変更提案の送信
  const submitChangeRequest = async () => {
    if (!ratioValid || !currentRules) return;
    setSubmitting(true);
    try {
      await apiSubmitChangeRequest({
        contributionRatio: ratioInputs,
        allowedCategories:
          proposal.allowedCategories ?? currentRules.allowedCategories,
        savingCategories:
          proposal.savingCategories ?? currentRules.savingCategories,
        monthlySavingLimit: limitInput,
      });
      const updated = await getChangeRequests();
      setHistory(updated as ChangeWithApprovals[]);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "提案に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  // 承認/拒否
  const handleApprove = async (
    changeRequestId: string,
    approve: boolean,
    comment?: string
  ) => {
    try {
      await apiApproveChangeRequest(changeRequestId, approve, comment);
      const updated = await getChangeRequests();
      setHistory(updated as ChangeWithApprovals[]);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "承認処理に失敗しました");
    }
  };

  if (loadingRules || loadingHistory)
    return <div className="p-6">読み込み中...</div>;
  if (error)
    return (
      <div className="p-6">
        <div className="text-red-600">エラー: {error}</div>
      </div>
    );
  if (!currentRules)
    return (
      <div className="p-6">
        <div>ルールが見つかりません。</div>
      </div>
    );

  // 未承認者（重複除去）
  const pendingApprovers = Array.from(
    new Set(
      history.flatMap((r) =>
        (r.approvals ?? []).filter((a) => !a.approved).map((a) => a.approverId)
      )
    )
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* 上部：現在の有効ルール */}
      <section className="bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">共通ルール設定</h1>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">入金負担割合</div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 bg-indigo-50 rounded">
                {ratioToString(currentRules.contributionRatio)}
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">
              許可なしで追加できるカテゴリ
            </div>
            <div className="flex flex-wrap gap-2">
              {currentRules.allowedCategories.map((c) => (
                <div
                  key={c}
                  className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">貯金カテゴリ</div>
            <div className="flex flex-wrap gap-2">
              {currentRules.savingCategories.map((c) => (
                <div
                  key={c}
                  className="bg-green-100 px-3 py-1 rounded-full text-sm"
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">1か月の貯金上限</div>
            <div className="text-xl font-semibold">
              {currentRules.monthlySavingLimit.toLocaleString()}円
            </div>
          </div>
        </div>
      </section>

      {/* 中央：変更フォーム */}
      <section className="bg-white rounded-xl shadow p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">新しい変更を提案</h2>
            <div className="text-sm text-gray-500">
              すべて承認されると反映されます
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              <div className="font-medium">注意:</div>{" "}
              すべて承認されるまで反映されません
            </div>
          </div>
        </div>

        {/* 入金負担割合編集 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="font-medium">入金負担割合</div>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(ratioInputs).map(([person, value]) => (
                <div key={person} className="flex items-center gap-2">
                  <div className="text-sm">{person}</div>
                  <input
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) =>
                      setRatioInputs((r) => ({
                        ...r,
                        [person]: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="w-20 border rounded px-2 py-1 text-sm"
                  />
                </div>
              ))}
              <div>
                <button
                  type="button"
                  onClick={() => setRatioInputs((r) => ({ ...r, ["new"]: 1 }))}
                  className="text-xs px-2 py-1 bg-blue-100 rounded"
                >
                  + 追加
                </button>
              </div>
            </div>
            {!ratioValid && (
              <div className="text-xs text-red-600">
                合計が 0 にならないようにしてください。
              </div>
            )}
          </div>

          {/* 月間上限 */}
          <div className="space-y-2">
            <div className="font-medium">1か月の貯金上限</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={limitInput}
                onChange={(e) =>
                  setLimitInput(Math.max(0, Number(e.target.value)))
                }
                className="border rounded px-3 py-1 w-32"
              />
              <div className="text-sm">円</div>
            </div>
          </div>
        </div>

        {/* カテゴリ編集 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 許可カテゴリ */}
          <div className="space-y-2">
            <div className="font-medium">許可なしで追加できるカテゴリ</div>
            <div className="flex flex-wrap gap-2">
              {(
                proposal.allowedCategories ?? currentRules.allowedCategories
              ).map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  <span>{c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAllowed(c)}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="追加"
                  value={newAllowedCategory}
                  onChange={(e) => setNewAllowedCategory(e.target.value)}
                  className="border px-2 py-1 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddAllowed}
                  className="text-sm px-3 py-1 bg-indigo-500 text-white rounded"
                >
                  追加
                </button>
              </div>
            </div>
          </div>

          {/* 貯金カテゴリ */}
          <div className="space-y-2">
            <div className="font-medium">貯金カテゴリ</div>
            <div className="flex flex-wrap gap-2">
              {(proposal.savingCategories ?? currentRules.savingCategories).map(
                (c) => (
                  <div
                    key={c}
                    className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSaving(c)}
                      className="text-xs text-gray-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                )
              )}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="追加"
                  value={newSavingCategory}
                  onChange={(e) => setNewSavingCategory(e.target.value)}
                  className="border px-2 py-1 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddSaving}
                  className="text-sm px-3 py-1 bg-green-600 text-white rounded"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 提案ボタン */}
        <div className="mt-4">
          <button
            disabled={!ratioValid || submitting}
            onClick={submitChangeRequest}
            className={clsx(
              "px-6 py-2 rounded shadow font-medium",
              !ratioValid || submitting
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            変更を提案する
          </button>
        </div>
      </section>

      {/* 下部：変更履歴と承認状況 */}
      <section className="bg-white rounded-xl shadow p-6 space-y-6">
        <h2 className="text-lg font-semibold">変更履歴と承認状況</h2>
        <div className="space-y-4">
          {history.map((req) => {
            const approvals: CommonRulesApproval[] = req.approvals ?? [];
            return (
              <div
                key={req.id}
                className="border rounded-lg p-4 flex flex-col gap-4"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="text-sm text-gray-500">
                      提案者: {req.proposerId}
                    </div>
                    <div className="text-base font-medium">
                      ステータス:{" "}
                      <span
                        className={clsx(
                          "px-2 py-1 rounded-full text-xs font-semibold",
                          req.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : req.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      提出日時: {new Date(req.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm">提案内容のスナップショット</div>
                    <div className="mt-1 text-xs">
                      {req.contributionRatio && (
                        <div>
                          入金負担割合: {ratioToString(req.contributionRatio)}
                        </div>
                      )}
                      {req.allowedCategories && (
                        <div>
                          許可カテゴリ: {req.allowedCategories.join(", ")}
                        </div>
                      )}
                      {req.savingCategories && (
                        <div>
                          貯金カテゴリ: {req.savingCategories.join(", ")}
                        </div>
                      )}
                      {req.monthlySavingLimit !== undefined && (
                        <div>
                          上限: {req.monthlySavingLimit.toLocaleString()}円
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 承認者状況 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {approvals.map((a) => (
                    <div
                      key={`${req.id}-${a.approverId}`}
                      className="flex items-start gap-3 border p-3 rounded"
                    >
                      <div>
                        {a.approved ? (
                          <CheckCircle className="text-green-500" />
                        ) : (
                          <XCircle className="text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          承認者: {a.approverId}
                        </div>
                        <div className="text-xs">
                          {a.comment || "コメントなし"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(a.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* アクション（承認者・保留中のみ） */}
                {isApprover && req.status === "pending" && (
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <textarea
                        placeholder="コメント（任意）"
                        className="w-full border rounded p-2 text-sm"
                        id={`comment-${req.id}`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          const textarea = document.getElementById(
                            `comment-${req.id}`
                          ) as HTMLTextAreaElement | null;
                          await handleApprove(req.id, true, textarea?.value);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                      >
                        承認する
                      </button>
                      <button
                        onClick={async () => {
                          const textarea = document.getElementById(
                            `comment-${req.id}`
                          ) as HTMLTextAreaElement | null;
                          await handleApprove(req.id, false, textarea?.value);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded"
                      >
                        拒否する
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* フッター：操作ガード */}
      <footer className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex gap-2 items-center">
          <div className="font-semibold">
            変更は承認されるまで反映されません。
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600">
            未承認の人: {pendingApprovers.join(", ")}
          </div>
        </div>
      </footer>
    </div>
  );
}
