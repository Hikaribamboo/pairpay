"use client";

import { Range, getTrackBackground } from "react-range";
import { useMemo, useState, useEffect } from "react";

type Props = {
  totalAmount: number; // 合計貯金額（円）
  selectedCategories: string[]; // 例: ["結婚式","家族旅行","車"]
};

const STEP = 1;
const MIN = 0;
const MAX = 100;

const colors = [
  "#d9f99d", // lime-300
  "#7dd3fc", // sky-300
  "#c4b5fd", // purple-300
  "#fda4af", // rose-300
  "#fcd34d", // amber-300
];

export default function CategoryAllocationSlider({
  totalAmount,
  selectedCategories,
}: Props) {
  const safeTotal = Number.isFinite(totalAmount) ? totalAmount : 0;
  const segCount = Math.max(0, selectedCategories.length); // セグメント数＝カテゴリ数
  const handleCount = Math.max(0, segCount - 1);

  // 均等初期値を作る関数（ハンドル数に応じて [.., ..] を返す）
  const makeEvenValues = (hc: number, sc: number) =>
    Array(hc)
      .fill(0)
      .map((_, i) => Math.round(((i + 1) * MAX) / sc));

  // 初期値
  const [values, setValues] = useState<number[]>(
    makeEvenValues(handleCount, segCount)
  );

  // カテゴリ数が変わったら均等に再初期化（ズレ防止）
  useEffect(() => {
    setValues(makeEvenValues(handleCount, segCount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segCount]); // 長さだけを見る

  // 万一 values の長さがズレたら即同期
  useEffect(() => {
    if (values.length !== handleCount) {
      setValues(makeEvenValues(handleCount, segCount));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleCount]);

  // 計算用の values（ズレ時は均等値で補正）
  const normalValues =
    values.length === handleCount
      ? values
      : makeEvenValues(handleCount, segCount);

  // 各セグメントの割合（%）
  const percentages = useMemo(() => {
    if (segCount < 2) return segCount === 1 ? [100] : [];
    const stops = [MIN, ...normalValues, MAX];
    return stops.slice(1).map((v, i) => v - stops[i]);
  }, [normalValues, segCount]);

  // 金額配分（円）
  const allocations = useMemo(
    () =>
      percentages.map((p) => Math.round((p / 100) * Math.max(0, safeTotal))),
    [percentages, safeTotal]
  );

  // カテゴリが1つ以下ならスライダーは不要
  if (segCount < 2) return null;

  return (
    <div className="w-full max-w-xl mx-auto mt-4">
      {/* スライダーバー */}
      <div className="mb-2">
        <div className="relative h-6">
          <Range
            values={normalValues}
            step={STEP}
            min={MIN}
            max={MAX}
            onChange={(vals) => {
              const safe = (vals ?? [])
                .map((v) =>
                  Number.isFinite(v)
                    ? Math.min(MAX, Math.max(MIN, Math.round(v)))
                    : 0
                )
                .sort((a, b) => a - b);
              setValues(safe);
            }}
            // ✅ 親（ref を付ける要素）を position: relative に
            // ✅ children（thumb）はバーとは「兄弟」にして上に描画
            renderTrack={({ props, children }) => {
              const { key: _omitKey, style, ...rest } = (props as any) ?? {};
              return (
                <div
                  {...rest}
                  style={{
                    ...(style || {}),
                    position: "relative", // ★これが重要
                    height: 24,
                    width: "100%",
                    display: "flex",
                    touchAction: "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      right: 0,
                      transform: "translateY(-50%)",
                      height: 8,
                      borderRadius: 9999,
                      background: getTrackBackground({
                        values: normalValues,
                        colors: colors.slice(0, segCount),
                        min: MIN,
                        max: MAX,
                      }),
                    }}
                  />
                  {children} {/* ← thumb をバーの上に重ねる */}
                </div>
              );
            }}
            // ✅ props.style を必ずマージ。zIndex も少し上げる
            renderThumb={({ props, index }) => {
              const { key: _omitKey, style, ...rest } = (props as any) ?? {};
              return (
                <div
                  {...rest}
                  style={{
                    ...(style || {}),
                    zIndex: 2,
                    height: 20,
                    width: 20,
                    borderRadius: 9999,
                    backgroundColor: "#fff",
                    border: "2px solid #3b82f6",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    cursor: "pointer",
                  }}
                />
              );
            }}
          />
        </div>
      </div>

      {/* 各カテゴリの配分表示 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
        {selectedCategories.map((cat, i) => {
          const yen = allocations[i] ?? 0;
          const pct = percentages[i] ?? 0;
          return (
            <div key={`${cat}-${i}`} className="flex flex-col items-center">
              <span className="text-xs text-gray-500">{cat}</span>
              <div className="text-lg font-semibold">
                {yen.toLocaleString()} 円
              </div>
              <div className="text-sm text-gray-400">{pct.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>

      {/* 合計チェック（必ずズレないが、見える化） */}
      <div className="mt-2 text-right text-sm text-gray-500">
        合計:{" "}
        {allocations
          .reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0)
          .toLocaleString()}{" "}
        円 / {safeTotal.toLocaleString()} 円
      </div>
    </div>
  );
}
