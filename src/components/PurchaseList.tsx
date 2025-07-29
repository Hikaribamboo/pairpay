"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { userAtom } from "@/atoms/userAtom";

type Purchase = {
  id: string;
  userId: string;
  userName: string;
  purchaseItem: string;
  itemCost: number;
  itemLink?: string;
  itemMemo?: string;
  createdAt: any; // Timestamp型
};

const PurchaseList = () => {
  const [user] = useAtom(userAtom);
  const userId = user?.userId;
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "purchaseRequests"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Purchase, "id">),
      }));
      setPurchases(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleReaction = async (requestId: string, type: "agree" | "skip") => {
    if (!userId) return;

    const reactionRef = doc(
      collection(db, "purchaseRequests", requestId, "reactions"),
      userId
    );

    await setDoc(reactionRef, {
      type,
      reactedAt: Timestamp.now(),
    });
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold text-center text-gray-800">
        リクエスト一覧
      </h1>
      {purchases.map((item) => (
        <div key={item.id} className="border-b py-2">
          <p className="font-semibold">
            {item.purchaseItem} - ¥{item.itemCost}
          </p>
          {item.itemLink && (
            <a
              href={item.itemLink}
              className="text-blue-500 text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              リンク
            </a>
          )}
          {item.itemMemo && (
            <p className="text-sm text-gray-600">{item.itemMemo}</p>
          )}

          {/* 🔽 提案者でない場合だけ表示 */}
          {item.userId !== userId && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleReaction(item.id, "agree")}
                className="px-3 py-1 rounded-md text-white bg-green-400"
              >
                賛成👍
              </button>
              <button
                onClick={() => handleReaction(item.id, "skip")}
                className="px-3 py-1 rounded-md text-white bg-sky-400"
              >
                スルー👋
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PurchaseList;
