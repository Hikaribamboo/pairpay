"use client";

import { useEffect } from "react";
import { fetchAllPaymentRequest } from "@/lib/api/request/papyment";
import type { Payment } from "@/types/request/payment";
import { transDateFormat } from "@/lib/utils/transdate-format";

interface RequestListProps {
  approvedPayRequest: Payment[];
  setPayRequests: React.Dispatch<React.SetStateAction<Payment[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ApprovedRequestList = ({
  approvedPayRequest,
  setPayRequests,
  loading,
  setLoading,
}: RequestListProps) => {
  useEffect(() => {
    const load = async () => {
      try {
        const payments = await fetchAllPaymentRequest();
        setLoading(false);
        setPayRequests(payments);
      } catch (e) {
        console.error("リクエストリスト取得エラー", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 mt-4">読み込み中...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8">
      <h1 className="text-2xl font-700 text-center text-gray-800 mb-6">
        承認済みリクエスト一覧
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                承認日
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                購入項目
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                金額
              </th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">
                申請者
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {approvedPayRequest.map((item) => (
              <tr key={item.requestId}>
                <td className="px-4 py-4 text-sm text-gray-800">
                  {transDateFormat(item.approvedAt)}
                </td>

                <td className="max-w-28 px-4 py-4 text-sm text-gray-800">
                  {item.paymentTitle}
                </td>
                <td className="px-4 py-4 text-sm text-gray-800">
                  {item.paymentCost} 円
                </td>
                <td className="px-4 py-4 text-sm text-gray-800">
                  {item.userName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovedRequestList;
