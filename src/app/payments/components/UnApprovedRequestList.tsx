"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import { fetchAllPaymentRequest } from "@/lib/api/request/papyment";
import type { Payment } from "@/types/request/payment";
import { updatePayment } from "@/lib/api/request/papyment";

interface RequestListProps {
  approvedPayRequest: Payment[];
  setPayRequests: React.Dispatch<React.SetStateAction<Payment[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const UnApprovedRequestList = ({
  approvedPayRequest,
  setPayRequests,
  setLoading,
}: RequestListProps) => {
  const [user] = useAtom(userAtom);
  const userId = user?.userId;

  const handleApprove = async (requestId: string) => {
    if (!userId) return;
    try {
      setLoading(true);
      const updatedPayment: Payment = await updatePayment(requestId, userId);
      setPayRequests((prev) =>
        prev.map((p) =>
          p.requestId === updatedPayment.requestId ? updatedPayment : p
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
        const payments = await fetchAllPaymentRequest();
        setPayRequests(payments);
      } catch (e) {
        console.error("リクエストリスト取得エラー", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setPayRequests, setLoading]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-700 text-center text-gray-800 mb-6">
        未承認リクエスト一覧
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
                <td className="max-w-28 px-4 py-2 text-sm text-gray-800">
                  {item.paymentTitle}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.paymentCost} 円
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.userName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.userId === userId ? (
                    <span className="text-gray-600">自分</span>
                  ) : (
                    <button
                      onClick={() => handleApprove(item.requestId)}
                      type="button"
                      className="text-white min-w-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md text-xs px-2 py-2 text-center cursor-pointer hover:bg-gradient-to-br transition duration-300"
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

export default UnApprovedRequestList;
