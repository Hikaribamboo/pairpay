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
  createdAt: any;
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

  if (loading)
    return <p className="text-center text-gray-500 mt-4">読み込み中...</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold text-center text-gray-800 mb-4">
        リクエスト一覧
      </h1>

      <div className="space-y-2">
        {purchases.map((item) => (
          <div key={item.id} className="border-b pb-2">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-800">{item.purchaseItem}</div>
              <div className="text-sm font-semibold">
                ¥{item.itemCost.toLocaleString()}
              </div>

              {/* 自分以外が作成したリクエストに対してボタン表示 */}
              {item.userId !== userId ? (
                <button
                  onClick={() => handleReaction(item.id, "agree")}
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                >
                  Approve
                </button>
              ) : (
                <span className="text-xs text-gray-400">自分</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseList;
