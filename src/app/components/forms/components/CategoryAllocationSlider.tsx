"use client";

import { useMemo, useState, useEffect } from "react";
import { Box, Typography, Slider } from "@mui/material";

type Props = {
  totalAmount: number;
  selectedCategories: string[];
};

const COLORS = [
  "#54de92ff",
  "#5ba2f8ff",
  "#9076f8ff",
  "#ff7585ff",
  "#ffee38ff",
];

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
const MIN = 0;
const MAX = 100;

export default function CategoryAllocationSlider({
  totalAmount,
  selectedCategories,
}: Props) {
  const safeTotal = Number.isFinite(totalAmount) ? totalAmount : 0;
  const segmentCount = Math.max(0, selectedCategories.length);
  const handleCount = Math.max(0, segmentCount - 1);

  // 均等値生成
  const makeEvenValues = (hc: number, sc: number) =>
    Array.from({ length: hc }, (_, i) => Math.round(((i + 1) * MAX) / sc));

  const [values, setValues] = useState<number[]>(() =>
    makeEvenValues(handleCount, segmentCount)
  );

  // カテゴリ数変化時に再初期化（長さ依存）
  useEffect(() => {
    setValues(makeEvenValues(handleCount, segmentCount));
  }, [handleCount, segmentCount]);

  // 万一 values の長さが合ってなければ補正（レンダーごとに新しい hook は増えない）
  const normalValues = useMemo(() => {
    if (values.length === handleCount) return values;
    return makeEvenValues(handleCount, segmentCount);
  }, [values, handleCount, segmentCount]);

  // 各セグメントの割合（%） -- 常に呼ばれる
  const percentages = useMemo(() => {
    if (segmentCount < 2) {
      return segmentCount === 1 ? [100] : [];
    }
    const stops = [MIN, ...normalValues, MAX];
    return stops.slice(1).map((v, i) => v - stops[i]);
  }, [normalValues, segmentCount]);

  // 円の配分
  const allocations = useMemo(() => {
    return percentages.map((p) => Math.round((p / 100) * safeTotal));
  }, [percentages, safeTotal]);

  // 各区間に対応する色（ループ）
  const segmentColors = Array.from(
    { length: segmentCount },
    (_, i) => COLORS[i % COLORS.length]
  );

  // 背景グラデーション（境界をシャープにするため start/end を二回ずつ指定）
  const gradient = useMemo(() => {
    const stops = [0, ...values, 100]; // 0, thumb..., 100
    const parts: string[] = [];
    for (let i = 0; i < segmentCount; i++) {
      const start = stops[i];
      const end = stops[i + 1];
      const color = segmentColors[i];
      parts.push(`${color} ${start}%`);
      parts.push(`${color} ${end}%`);
    }
    return `linear-gradient(to right, ${parts.join(", ")})`;
  }, [values, segmentCount, segmentColors]);

  return (
    <Box className="w-full max-w-xl mx-auto mt-4">
      {/* スライダー */}
      <Box className="mb-2 px-2">
        <Box
          sx={{
            position: "relative",
            height: 40,
            userSelect: "none",
          }}
        >
          {/* 自前の色分けバー（全体） */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 12,
              transform: "translateY(-50%)",
              borderRadius: 999,
              background: gradient,
              zIndex: 1,
            }}
          />
          {/* 透明にした MUI スライダーを上に重ねる */}
          <Slider
            value={values}
            min={0}
            max={100}
            step={1}
            onChange={(_, newValue) => {
              if (!Array.isArray(newValue)) return;
              const sanitized = newValue
                .map((v) => clamp(Math.round(v), 0, 100))
                .sort((a, b) => a - b);
              setValues(sanitized);
            }}
            disableSwap
            valueLabelDisplay="off"
            aria-labelledby="allocation-slider"
            sx={{
              position: "relative",
              zIndex: 2,
              px: 0,
              "& .MuiSlider-rail": {
                opacity: 0,
                background: "none",
              },
              "& .MuiSlider-track": {
                background: "none",
                height: 12,
              },
              "& .MuiSlider-track.Mui-active": {
                background: "none",
              },
              "& .MuiSlider-thumb": {
                height: 24,
                width: 24,
                marginTop: "-2px",
                backgroundColor: "#fff",
                border: "2px solid #64748b",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                cursor: "pointer",
                "&.Mui-focusVisible, &:focus-visible": {
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                },
                "&:hover": {
                  boxShadow: "0 1px 6px rgba(0,0,0,0.35)",
                },
              },
              // 全体の color（デフォルトで track に使われる）も透明に
              color: "transparent",
            }}
          />
        </Box>
      </Box>

      {/* 各カテゴリの配分表示 */}
      <Box className="flex justify-center">
        {selectedCategories.map((cat, i) => {
          const yen = allocations[i] ?? 0;
          const pct = percentages[i] ?? 0;
          return (
            <Box
              key={`${cat}-${i}`}
              className="flex flex-col items-center mx-2"
            >
              <Typography variant="caption" color="text.secondary">
                {cat}
              </Typography>
              <Typography variant="h6" fontWeight={500}>
                {yen.toLocaleString()} 円
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pct.toFixed(1)}%
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
