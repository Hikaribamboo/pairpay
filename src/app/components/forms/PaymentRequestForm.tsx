"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import { FaRegPaste } from "react-icons/fa6";
import { createPaymentRequest } from "@/lib/api/request/papyment";
import EnterCost from "@/app/components/forms/components/EnterCost";

interface PaymentRequestFormProps {
  onCreated: () => void;
}

const PaymentRequestForm: React.FC<PaymentRequestFormProps> = ({
  onCreated,
}) => {
  const [user] = useAtom(userAtom);
  const { userId } = user ?? {};
  const userName = user?.userName || "匿名ユーザー";
  const [paymentTitle, setPaymentTitle] = useState("");
  const [paymentCost, setPaymentCost] = useState(0);
  const [itemLink, setItemLink] = useState("");
  const [paymentMemo, setPaymentMemo] = useState("");
  const [status, setStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("送信中...");

    if (!paymentTitle || !paymentCost) {
      setStatus("アイテム名、金額は必須です");
      return;
    } else if (!userId || !userName) {
      setStatus("ログインしていません");
      return;
    }
    try {
      await createPaymentRequest({
        userId,
        userName,
        paymentTitle,
        paymentCost,
        itemLink,
        paymentMemo,
        category: selectedCategory,
      });

      // 通常のPOST処理などを入れる
      setStatus("送信＆保存成功！");
      setPaymentTitle("");
      setPaymentCost(0);
      setItemLink("");
      setPaymentMemo("");
      setSelectedCategory("");

      await onCreated();
    } catch (err) {
      console.error(err);
      setStatus("送信または保存に失敗しました");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setItemLink(text);
    } catch (err) {
      console.error(err);
      alert("クリップボードの読み取りに失敗しました");
    }
  };

  if (!userId) return null;

  const categories = ["ご飯", "交通費", "宿泊費", "デート"];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6 text-center text-gray-800">
        購入リクエスト
      </h1>

      <form onSubmit={handleFormSubmit} className="space-y-2">
        {/* アイテム名とリンク */}
        <div>
          <label className="text-md font-medium text-gray-700 mb-2 block">
            Item
          </label>
          <input
            type="text"
            value={paymentTitle}
            onChange={(e) => setPaymentTitle(e.target.value)}
            placeholder="購入アイテム名"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col flex-1">
          <label className="text-md font-medium text-gray-700 mb-2 block">
            Link
          </label>
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
          <div className="flex justify-center gap-4">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center space-x-1">
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

export default PaymentRequestForm;
