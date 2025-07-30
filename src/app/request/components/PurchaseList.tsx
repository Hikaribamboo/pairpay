"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { userAtom } from "@/atoms/userAtom";
import { fetchAllPurchases } from "@/lib/api/purchase/all";
import type { Purchase } from "@/types/purchase";

const PurchaseList = () => {
  const [user] = useAtom(userAtom);
  const userId = user?.userId;
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllPurchases();
        setLoading(false);
        setPurchases(data);
      } catch (e) {
        console.error("リクエストリスト取得エラー", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>読み込み中…</p>;

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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        リクエスト一覧
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                購入項目
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                金額
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                申請者
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {purchases.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.purchaseItem}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {typeof item.itemCost === "number"
                    ? `${item.itemCost.toLocaleString()} 円`
                    : "不明"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.userName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.userId !== userId ? (
                    item.isApproved ? (
                      <span className="text-green-600">承認済</span>
                    ) : (
                      <button
                        onClick={() => handleReaction(item.id, "agree")}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        承認
                      </button>
                    )
                  ) : (
                    <span className="text-xs text-gray-400">自分</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseList;
