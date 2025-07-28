"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const PurchaseForm = ({
  userInfo,
}: {
  userInfo: { userId: string; userName: string };
}) => {
  const { userId, userName } = userInfo;
  const [purchaseItem, setPurchaseItem] = useState("");
  const [itemCost, setItemCost] = useState(0);
  const [itemLink, setItemLink] = useState("");
  const [itemMemo, setItemMemo] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!userId) {
      const redirectUri = "https://pairpay.vercel.app/api/callback";

      const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_CLIENT_ID}&redirect_uri=${redirectUri}&state=12345&scope=profile%20openid`;

      window.location.href = loginUrl;
    }
  }, [userId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("送信中...");

    try {
      // 1. LINEに送信
      const res = await fetch("/api/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userName,
          purchaseItem,
          itemCost,
          itemLink,
          itemMemo,
        }),
      });

      if (!res.ok) throw new Error("LINE送信失敗");

      // 2. Firestoreに保存
      await addDoc(collection(db, "purchaseRequests"), {
        userId,
        userName,
        purchaseItem,
        itemCost,
        itemLink,
        itemMemo,
        createdAt: Timestamp.now(),
      });

      setStatus("送信＆保存成功！");
      setPurchaseItem("");
      setItemCost(0);
      setItemLink("");
      setItemMemo("");
    } catch (err) {
      console.error(err);
      setStatus("送信または保存に失敗しました");
    }
  };

  if (!userId) return null;
  return (
    <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl">
      <h2 className="text-center text-gray-700 mb-2">
        {userName} さん、こんにちは！
      </h2>
      <h1 className="text-xl font-semibold mb-4 text-center text-gray-800">
        購入リクエストを作成
      </h1>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <input
          type="text"
          value={purchaseItem}
          onChange={(e) => setPurchaseItem(e.target.value)}
          placeholder="購入アイテム名"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          value={itemCost}
          onChange={(e) => setItemCost(Number(e.target.value))}
          placeholder="金額（円）"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="url"
          value={itemLink}
          onChange={(e) => setItemLink(e.target.value)}
          placeholder="リンク（任意）"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          value={itemMemo}
          onChange={(e) => setItemMemo(e.target.value)}
          placeholder="メモ（任意）"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
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

export default PurchaseForm;
