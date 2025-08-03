import React, { useState } from "react";
import ModalOverlay from "@/app/common-rules/components/modals/ModalOverlay";

type FreeRuleEditModalProps = {
  initial?: string;
  index?: number;
  free: string[];
  // eslint-disable-next-line no-unused-vars
  onSave: (newFree: string[]) => void | Promise<void>;
  onClose: () => void;
};

const FreeRuleEditModal = ({
  initial = "",
  index,
  free,
  onSave,
  onClose,
}: FreeRuleEditModalProps) => {
  const [text, setText] = useState(initial);
  const [saving, setSaving] = useState(false);
  const isEdit = typeof index === "number";

  const handleSave = async () => {
    const v = text.trim();
    if (!v) return;
    setSaving(true);
    try {
      const updated = isEdit
        ? free.map((f, i) => (i === index ? v : f))
        : [...free, v];
      await onSave(updated);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h2 className="text-lg font-bold mb-3">
        {isEdit ? "自由ルールを編集" : "自由ルールを追加"}
      </h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border rounded px-3 py-2 h-32 resize-none"
        placeholder="例：夜22時以降の購入は禁止"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          disabled={saving}
          onClick={onClose}
          className="px-4 py-2 border rounded"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={!text.trim() || saving}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? "保存中…" : "保存"}
        </button>
      </div>
    </ModalOverlay>
  );
};

export default FreeRuleEditModal;
