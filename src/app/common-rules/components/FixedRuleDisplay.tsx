import React from "react";

import { useState } from "react";
import { Pencil } from "lucide-react";
import type { FixedRules } from "@/types/common-rule";
import FixedRulesEditModal from "@/app/common-rules/components/modals/FixedRulesEditModal";

type FixedRuleDisplayProps = {
  fixed: FixedRules;
  // eslint-disable-next-line no-unused-vars
  onSave: (newFixed: FixedRules) => void | Promise<void>;
};

const FixedRuleDisplay = ({ fixed, onSave }: FixedRuleDisplayProps) => {
  const [editingFixed, setEditingFixed] = useState(false);

  return (
    <div>
      {/* 固定ルール表示 */}
      <section className="border p-4 rounded flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <h2 className="text-lg font-bold">固定ルール</h2>
          <div className="text-sm">
            <div>
              <span className="font-medium">入金負担割合:</span>{" "}
              {fixed.contributionRatio} : {10 - fixed.contributionRatio}
            </div>
            <div>
              <span className="font-medium">許可カテゴリ:</span>{" "}
              {fixed.allowedCategories.join(", ") || "なし"}
            </div>
          </div>
        </div>
        <div>
          <button
            onClick={() => setEditingFixed(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded"
          >
            <Pencil size={16} /> 編集
          </button>
        </div>
      </section>

      {/* 固定ルール編集モーダル */}
      {editingFixed && (
        <FixedRulesEditModal
          fixed={fixed}
          onClose={() => setEditingFixed(false)}
          onSave={onSave}
        />
      )}
    </div>
  );
};

export default FixedRuleDisplay;
