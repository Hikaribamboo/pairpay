import React, { useState } from "react";
import ModalOverlay from "@/app/common-rules/components/modals/ModalOverlay";
import type { FixedRules } from "@/types/common-rule";

type FixedRulesEditModalProps = {
  fixed: FixedRules;
  // eslint-disable-next-line no-unused-vars
  onSave: (newFixed: FixedRules) => void | Promise<void>;
  onClose: () => void;
};

const FixedRulesEditModal = ({
  fixed,
  onSave,
  onClose,
}: FixedRulesEditModalProps) => {
  const [draft, setDraft] = useState<FixedRules>(fixed);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      onClose();
    } catch (e) {
      console.error(e);
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-lg font-bold mb-3">固定ルールを編集</h2>
      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">入金負担割合 (0〜10)</label>
          <input
            type="number"
            min={0}
            max={10}
            value={draft.contributionRatio}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                contributionRatio: Math.min(
                  10,
                  Math.max(0, Number(e.target.value))
                ),
              }))
            }
            className="border px-2 py-1 rounded w-24"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">許可カテゴリ</label>
          <input
            type="text"
            placeholder="カンマ区切りで入力"
            value={draft.allowedCategories.join(", ")}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                allowedCategories: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            className="border px-2 py-1 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">貯金カテゴリ</label>
          <input
            type="text"
            placeholder="カンマ区切りで入力"
            value={draft.savingCategories.join(", ")}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                savingCategories: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
            className="border px-2 py-1 rounded w-full"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          disabled={saving}
          onClick={onClose}
          className="px-4 py-2 border rounded"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? "保存中…" : "保存"}
        </button>
      </div>
    </ModalOverlay>
  );
};

export default FixedRulesEditModal;
