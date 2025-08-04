import React from "react";
import { useState } from "react";
import { Pencil } from "lucide-react";
import Chip from "@mui/material/Chip";
import type { FixedRules } from "@/types/common-rule";
import FixedRulesEditModal from "@/app/common-rules/components/modals/FixedRulesEditModal";
import { THEME_COLORS } from "@/lib/theme-colors";

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
          <div className="text-md text-gray-700 my-2">
            <div>
              <span className="font-medium">入金負担割合:</span>{" "}
              {fixed.contributionRatio} : {10 - fixed.contributionRatio}
            </div>
            <div>
              <span className="font-medium">承認なしで追加できるカテゴリ</span>{" "}
              <div className="flex flex-wrap gap-2 mt-1">
                {fixed.allowedCategories.map((category, index) => (
                  <Chip
                    key={index}
                    label={category}
                    variant="outlined"
                    style={{
                      border: `1px solid ${THEME_COLORS[index % THEME_COLORS.length]}`,
                      color: THEME_COLORS[index % THEME_COLORS.length],
                      fontWeight: "bold",
                    }}
                  />
                ))}
              </div>
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
