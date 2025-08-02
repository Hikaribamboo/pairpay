"use client";

import { useMemo } from "react";

type SavingCategory = {
  category: string;
  target: number;
  saved: number;
};

type SaveHistoryItem = {
  date: string; // 表示用
  category: string;
  amount: number;
  note?: string;
};

const clamp = (n: number, min: number, max: number) =>
  n < min ? min : n > max ? max : n;

export default function SavingDashboard() {
  const savingCategories: SavingCategory[] = useMemo(
    () => [
      { category: "食費", target: 10000, saved: 6800 },
      { category: "旅行", target: 20000, saved: 15000 },
      { category: "投資", target: 15000, saved: 8000 },
      { category: "レジャー", target: 8000, saved: 5600 },
      { category: "勉強", target: 5000, saved: 5000 },
    ],
    []
  );

  const saveHistory: SaveHistoryItem[] = useMemo(
    () => [
      {
        date: "2025-08-01",
        category: "食費",
        amount: 2000,
        note: "週末まとめて節約分",
      },
      {
        date: "2025-08-03",
        category: "投資",
        amount: 5000,
      },
      {
        date: "2025-08-05",
        category: "旅行",
        amount: 3000,
        note: "次の旅の先取り",
      },
      {
        date: "2025-08-07",
        category: "レジャー",
        amount: 1600,
      },
    ],
    []
  );

  // 今月の貯金合計（履歴の合計と仮定）
  const savingTotal = useMemo(
    () => saveHistory.reduce((sum, h) => sum + h.amount, 0),
    [saveHistory]
  );

  // 口座残高（仮）
  const accountBalance = 85000;

  const bars = useMemo(
    () =>
      savingCategories.map((c) => {
        const ratio = c.target > 0 ? c.saved / c.target : 0;
        const percent = Math.round(clamp(ratio, 0, 1) * 100);
        const isComplete = ratio >= 1;
        return {
          ...c,
          percent,
          isComplete,
        };
      }),
    []
  );

  return (
    <div className="flex flex-col">
      {/* 口座貯金残高 */}
      <div className="text-center mt-8 mb-2">
        <div className="text-sm text-gray-600">口座貯金残高</div>
        <div className="text-3xl font-semibold text-green-600">
          {accountBalance.toLocaleString()}円
        </div>
      </div>
      <div className="bg-gray-100 p-4 m-6 rounded flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">今月の貯金</div>
          <div className="text-2xl font-semibold text-blue-600">
            {savingTotal.toLocaleString()}円
          </div>
        </div>
        <button className="bg-yellow-400 text-white px-4 py-2 rounded">
          貯金
        </button>
      </div>

      {/* カテゴリごとの達成度 */}
      <div className="space-y-6 mx-4 p-4">
        <h2 className="text-xl font-semibold mb-2">カテゴリごとの達成度</h2>
        {bars.map((b) => (
          <div key={b.category} className="space-y-1">
            <div className="flex justify-between mx-2 text-sm font-medium">
              <div>{b.category}</div>
              <div>
                {b.saved.toLocaleString()} / {b.target.toLocaleString()}円 (
                {b.percent}%)
              </div>
            </div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              {/* 塗り部分 */}
              <div
                aria-label={`${b.category} の達成度 ${b.percent}%`}
                role="progressbar"
                aria-valuenow={b.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className={`
                h-full rounded-full transition-all duration-300
                ${b.isComplete ? "bg-green-500" : "bg-blue-500"}
              `}
                style={{ width: `${b.percent}%` }}
              />
              {/* 内部ラベル（小さい幅なら右端に外出し） */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-semibold text-white">
                {b.percent}%
              </div>
            </div>
            {b.isComplete && (
              <div className="text-xs text-green-700 font-medium">
                目標達成済み！おめでとうございます。
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 貯金履歴 */}
      <div className="p-5">
        <h2 className="text-lg font-semibold mb-3">貯金履歴</h2>
        <div className="flex flex-col gap-2">
          {saveHistory.map((h, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 p-3 rounded"
            >
              <div>
                <div className="text-sm text-gray-700">{h.date}</div>
                <div className="font-medium">{h.category}</div>
                {h.note && (
                  <div className="text-xs text-gray-500 mt-1">{h.note}</div>
                )}
              </div>
              <div className="text-blue-600 font-semibold text-lg">
                +{h.amount.toLocaleString()}円
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
