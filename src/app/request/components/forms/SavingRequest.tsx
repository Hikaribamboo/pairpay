"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import CategoryAllocationSlide from "./components/CategoryAllocationSlider";
import EnterCost from "./components/EnterCost";

const SavingRequestForm = () => {
  const [user] = useAtom(userAtom);
  const { userId } = user ?? {};
  const [paymentCost, setPaymentCost] = useState("");
  const [paymentMemo, setPaymentMemo] = useState("");
  const [status, setStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("送信中...");

    try {
      // 通常のPOST処理などを入れる
      setStatus("送信＆保存成功！");
      setPaymentCost("");
      setPaymentMemo("");
    } catch (err) {
      console.error(err);
      setStatus("送信または保存に失敗しました");
    }
  };

  const toggleOption = (value: string) => {
    setSelectedCategory((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  if (!userId) return null;

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
        <EnterCost paymentCost={paymentCost} setPaymentCost={setPaymentCost} />
        {/* メモ */}
        <div>
          <label className="text-md font-medium text-gray-700 mb-2 block">
            Memo
          </label>
          <input
            type="text"
            value={paymentMemo}
            onChange={(e) => setPaymentMemo(e.target.value)}
            placeholder="メモ（任意）"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        {/* カテゴリ選択（ラジオ） */}
        <div>
          <label className="text-md font-medium text-gray-700 mb-2 block">
            Category
          </label>
          <div className="flex flex-wrap ml-2">
            {categories.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-1 mx-2 my-1"
              >
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
          totalAmount={Number(paymentCost) || 0}
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
