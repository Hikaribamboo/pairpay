"use client";

import { useEffect, useState, useRef } from "react";
import type { FixedRules } from "@/types/common-rule";
import { fetchRules, updateRules } from "@/lib/api/common-rule";
import { Pencil } from "lucide-react";
import FreeRuleEditModal from "@/app/common-rules/components/modals/FreeRuleEditModal";
import FixedRuleDisplay from "@/app/common-rules/components/FixedRuleDisplay";

export default function RulesPage() {
  const [fixed, setFixed] = useState<FixedRules>({
    contributionRatio: 5,
    allowedCategories: [],
    savingCategories: [],
  });
  const [free, setFree] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingFreeIndex, setEditingFreeIndex] = useState<number | null>(null);
  const [addingFree, setAddingFree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHydrated = useRef(false);

  // 初回ロード
  useEffect(() => {
    fetchRules()
      .then((data) => {
        if (data.fixed) setFixed(data.fixed);
        if (Array.isArray(data.free)) setFree(data.free);
      })
      .catch((e) => {
        console.error(e);
        setError("読み込み失敗");
      })
      .finally(() => {
        isHydrated.current = true;
        setLoading(false);
      });
  }, []);

  const handleFixedSave = async (newFixed: FixedRules) => {
    const prevFixed = fixed; // 現在の値を保持（ロールバック用）
    setFixed(newFixed); // 楽観的に反映
    try {
      await updateRules({ fixed: newFixed, free }); // free は現状の自由ルール
    } catch (e) {
      console.error("固定ルール保存失敗:", e);
      alert("固定ルールの保存に失敗しました。元に戻します。");
      setFixed(prevFixed); // ロールバック
    }
  };

  const handleFreeSave = async (newFree: string[]) => {
    const prevFree = free; // ロールバック用に保持
    setFree(newFree); // 楽観的に反映
    try {
      await updateRules({ fixed, free: newFree }); // fixed は現状の固定ルール
    } catch (e) {
      console.error("自由ルール保存失敗:", e);
      alert("自由ルールの保存に失敗しました。元に戻します。");
      setFree(prevFree); // ロールバック
    }
  };

  const handleDeleteFree = async (index: number) => {
    await handleFreeSave(free.filter((_, i) => i !== index));
    const newFree = free.filter((_, i) => i !== index);
    setFree(newFree);
  };
  if (loading) return <div className="p-6">読み込み中...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded">{error}</div>
      )}
      <FixedRuleDisplay fixed={fixed} onSave={handleFixedSave} />

      {/* 自由ルール表示 */}
      <section className="border p-4 rounded space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">自由ルール</h2>
          <button
            onClick={() => setAddingFree(true)}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm"
          >
            <Pencil size={14} /> 追加
          </button>
        </div>

        {free.length === 0 ? (
          <div className="text-sm text-gray-500">ルールはありません。</div>
        ) : (
          <ul className="space-y-2">
            {free.map((rule, i) => (
              <li
                key={i}
                className="flex justify-between items-center border rounded px-3 py-2"
              >
                <div className="flex-1">
                  <span>{rule}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingFreeIndex(i)}
                    className="text-sm px-2 py-1 border rounded flex items-center gap-1"
                  >
                    <Pencil size={14} /> 編集
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteFree(i);
                    }}
                    className="text-sm px-2 py-1 border rounded text-red-600"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 自由ルール追加 */}
      {addingFree && (
        <FreeRuleEditModal
          initial=""
          free={free}
          onClose={() => setAddingFree(false)}
          onSave={handleFreeSave} // (draft: FixedRules) => void
        />
      )}

      {/* 自由ルール編集 */}
      {editingFreeIndex !== null && (
        <FreeRuleEditModal
          initial={free[editingFreeIndex]}
          index={editingFreeIndex}
          onClose={() => setEditingFreeIndex(null)}
          onSave={handleFreeSave}
          free={free}
        />
      )}
    </div>
  );
}
