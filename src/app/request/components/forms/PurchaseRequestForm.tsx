"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import { FaRegPaste } from "react-icons/fa6";
import { FiDelete } from "react-icons/fi";
import { createPurchaseRequest } from "@/lib/api/request/purchase";

const PurchaseRequestForm = () => {
  const [user] = useAtom(userAtom);
  const { userId } = user ?? {};
  const userName = user?.userName || "匿名ユーザー";
  const [purchaseItem, setPurchaseItem] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [itemLink, setItemLink] = useState("");
  const [itemMemo, setItemMemo] = useState("");
  const [status, setStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("送信中...");

    if (!userId || !purchaseItem || !itemCost || !userName) {
      setStatus("ユーザーID、アイテム名、金額は必須です");
      return;
    }
    try {
      await createPurchaseRequest({
        userId,
        userName,
        purchaseItem,
        itemCost,
        itemLink,
        itemMemo,
      });

      // 通常のPOST処理などを入れる
      setStatus("送信＆保存成功！");
      setPurchaseItem("");
      setItemCost("");
      setItemLink("");
      setItemMemo("");
    } catch (err) {
      console.error(err);
      setStatus("送信または保存に失敗しました");
    }
  };

  const handleCostButton = (digit: string) => {
    setItemCost((prev) => prev + digit);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setItemLink(text);
    } catch (err) {
      alert("クリップボードの読み取りに失敗しました");
    }
  };

  if (!userId) return null;

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const categories = ["ご飯", "交通費", "宿泊費", "デート"];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-center text-gray-800">
        購入リクエスト
      </h1>

      <form onSubmit={handleFormSubmit} className="space-y-2">
        {/* アイテム名とリンク */}
        <div>
          <label className="text-md font-medium text-gray-700">Item</label>
          <input
            type="text"
            value={purchaseItem}
            onChange={(e) => setPurchaseItem(e.target.value)}
            placeholder="購入アイテム名"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col flex-1">
          <label className="text-md font-medium text-gray-700 mb-1">Link</label>
          <div className="relative">
            <input
              type="url"
              value={itemLink}
              onChange={(e) => setItemLink(e.target.value)}
              placeholder="リンク（任意）"
              className="w-full pr-14 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute top-1 right-4 px-2 py-1 bg-indigo-400 text-white rounded"
            >
              <FaRegPaste className="inline" />
            </button>
          </div>
        </div>

        {/* 金額入力 */}
        <div>
          <label className="text-md font-medium text-gray-700">Cost</label>
          <div className="relative">
            <input
              type="number"
              value={itemCost}
              onChange={(e) => setItemCost(e.target.value)}
              className="w-full text-xl border-b border-gray-400"
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
            {categories.map((cat) => (
              <label key={cat} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={selectedCategory === cat}
                  onChange={() => setSelectedCategory(cat)}
                  className="form-radio text-blue-500"
                />
                <span className="text-gray-700">{cat}</span>
              </label>
            ))}
          </div>
        </div>

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

export default PurchaseRequestForm;
