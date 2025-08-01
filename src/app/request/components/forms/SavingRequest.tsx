"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import { FiDelete } from "react-icons/fi";
import CategoryAllocationSlide from "./components/CategoryAllocationSlider";

const SavingRequestForm = () => {
  const [user] = useAtom(userAtom);
  const { userId } = user ?? {};
  const [itemCost, setItemCost] = useState("");
  const [itemMemo, setItemMemo] = useState("");
  const [status, setStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("送信中...");

    try {
      // 通常のPOST処理などを入れる
      setStatus("送信＆保存成功！");
      setItemCost("");
      setItemMemo("");
    } catch (err) {
      console.error(err);
      setStatus("送信または保存に失敗しました");
    }
  };

  const handleCostButton = (digit: string) => {
    setItemCost((prev) => prev + digit);
  };

  const toggleOption = (value: string) => {
    setSelectedCategory((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  if (!userId) return null;

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const categories = [
    { value: "wedding", label: "結婚式" },
    { value: "travel", label: "家族旅行" },
    { value: "car", label: "車" },
    { value: "house", label: "新居" },
    { value: "pet", label: "ペット" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-center text-gray-800">
        貯金リクエスト
      </h1>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* 金額入力 */}
        <div>
          <label className="text-md font-medium text-gray-700">Cost</label>
          <div className="relative border-b border-gray-400">
            <input
              type="number"
              value={itemCost}
              onChange={(e) => setItemCost(e.target.value)}
              className="w-full text-xl ml-4"
            />
            <FiDelete
              onClick={() => setItemCost((prev) => prev.slice(0, -1))}
              className="size-7 absolute right-3 bottom-2 text-gray-500"
            />
          </div>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {digits.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleCostButton(d)}
                className="py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-center font-medium"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        {/* メモ */}
        <div>
          <label className="text-md font-medium text-gray-700">Memo</label>
          <input
            type="text"
            value={itemMemo}
            onChange={(e) => setItemMemo(e.target.value)}
            placeholder="メモ（任意）"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {/* カテゴリ選択（ラジオ） */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Category
          </label>
          <div className="flex flex-wrap gap-4 ml-2">
            {categories.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={selectedCategory.includes(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <CategoryAllocationSlide
          totalAmount={Number(itemCost) || 0}
          selectedCategories={selectedCategory}
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
        >
          送信
        </button>
      </form>

      {status && (
        <p className="mt-4 text-center text-sm text-gray-600">{status}</p>
      )}
    </div>
  );
};

export default SavingRequestForm;
