"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import { fetchAllPurchases } from "@/lib/api/request/purchase";
import type { Purchase } from "@/types/purchase";
import { updatePurchases } from "@/lib/api/request/purchase";

interface PurchaseListProps {
  approvedPayRequest: Purchase[];
  setApprovedPayRequest: React.Dispatch<React.SetStateAction<Purchase[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const PurchaseList = ({
  approvedPayRequest,
  setApprovedPayRequest,
  loading,
  setLoading,
}: PurchaseListProps) => {
  const [user] = useAtom(userAtom);
  const userId = user?.userId;

  const handleApprove = async (requestId: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      const updatedPurchase: Purchase = await updatePurchases(
        requestId,
        userId
      );
      setApprovedPayRequest((prev) =>
        prev.map((p) =>
          p.requestId === updatedPurchase.requestId ? updatedPurchase : p
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const purchases = await fetchAllPurchases();
        setLoading(false);
        setApprovedPayRequest(purchases);
      } catch (e) {
        console.error("リクエストリスト取得エラー", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>読み込み中…</p>;

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
            {approvedPayRequest.map((item) => (
              <tr key={item.requestId}>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.purchaseItem}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {typeof item.itemCost === "number"
                    ? `${item.itemCost} 円`
                    : "不明"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.userName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.userId === userId ? (
                    <span className="text-gray-600">自分</span>
                  ) : item.isApproved ? (
                    <span className="text-green-600">承認済</span>
                  ) : (
                    <button
                      onClick={() => handleApprove(item.requestId)}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      承認
                    </button>
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
