"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

type Purchase = {
  id: string;
  userName: string;
  purchaseItem: string;
  itemCost: number;
  itemLink?: string;
  itemMemo?: string;
  createdAt: any; // Timestamp型
};

const PurchaseList = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      const q = query(
        collection(db, "purchaseRequests"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const data: Purchase[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Purchase[];

      setPurchases(data);
      setLoading(false);
    };

    fetchPurchases();
  }, []);

  if (loading) return <p>読み込み中...</p>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold text-center text-gray-800">
        リクエスト一覧
      </h1>
      {purchases.map((p) => (
        <div
          key={p.id}
          className="border p-4 rounded-lg shadow hover:shadow-md transition bg-white"
        >
          <p className="font-semibold text-gray-800">{p.purchaseItem}</p>
          <p className="text-gray-600">金額: {p.itemCost}円</p>
          {p.itemLink && (
            <p className="text-blue-500 break-all">
              <a href={p.itemLink} target="_blank" rel="noopener noreferrer">
                リンク
              </a>
            </p>
          )}
          {p.itemMemo && <p className="text-gray-500">メモ: {p.itemMemo}</p>}
          <p className="text-xs text-gray-400 mt-1">
            by {p.userName} / {p.createdAt.toDate().toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default PurchaseList;
