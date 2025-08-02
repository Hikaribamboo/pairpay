"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { fetchPaymentByPeriod } from "@/lib/api/request/papyment";
import type { Payment } from "@/types/request/payment";
import ApprovedRequestList from "@/app//payments/components/ApprovedRequestList";

type Expense = {
  title: string;
  cost: number;
  category: string;
};

const periodOptions = ["今月", "先月", "全期間"] as const;
type Period = (typeof periodOptions)[number];

export default function MobileDashboard() {
  const [payTotal, setPayTotal] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("今月");
  const [payRequests, setPayRequests] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const approvedOnly = payRequests.filter((p) => p.isApproved);

  useEffect(() => {
    async function fetchData() {
      const now = new Date();
      let from: string;
      let to: string;

      if (selectedPeriod === "今月") {
        const year = now.getFullYear();
        const month = now.getMonth();
        from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
        to = `${year}-${String(month + 2).padStart(2, "0")}-01`; // 翌月1日
      } else if (selectedPeriod === "先月") {
        const year = now.getFullYear();
        const month = now.getMonth() - 1;
        const target = new Date(year, month);
        from = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-01`;
        to = `${year}-${String(now.getMonth() + 1).padStart(2, "0")}-01`; // 今月1日
      } else {
        // 全期間（空文字で取得）
        from = "2000-01-01";
        to = "2100-01-01";
      }

      try {
        const data = await fetchPaymentByPeriod(from, to);
        setExpenses(
          data.map((item: any) => ({
            title: item.paymentTitle,
            cost: parseInt(item.paymentCost),
            category: item.category || "その他",
          }))
        );
        setPayTotal(
          data.reduce((sum: number, p: any) => sum + parseInt(p.paymentCost), 0)
        );
      } catch (e) {
        console.error("取得失敗:", e);
      }
    }

    fetchData();
  }, [selectedPeriod]);

  // 🧠 カテゴリ別に合計金額を集計
  const categoryTotals: Record<string, number> = {};
  for (const e of expenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.cost;
  }

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#60A5FA",
          "#F472B6",
          "#FBBF24",
          "#34D399",
          "#A78BFA",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-sm mx-auto p-4 flex flex-col gap-6 bg-white min-h-screen">
      {/* ヘッダー */}
      <header className="text-lg font-bold text-center">ヘッダー</header>

      {/* 今月のPay */}
      <div className="bg-gray-100 p-4 rounded flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">今月のPay</div>
          <div className="text-2xl font-semibold text-blue-600">
            {payTotal.toLocaleString()}円
          </div>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          入金
        </button>
      </div>

      {/* 一覧 */}
      <ApprovedRequestList
        approvedPayRequest={approvedOnly}
        setPayRequests={setPayRequests}
        loading={loading}
        setLoading={setLoading}
      />

      {/* 円グラフ */}
      <section className="mt-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-gray-700">カテゴリ別支出</h2>
          <div className="flex gap-1 text-sm">
            {periodOptions.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-2 py-1 rounded ${
                  selectedPeriod === period
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="w-48 h-48 mx-auto">
          <Pie data={chartData} />
        </div>
      </section>
    </div>
  );
}
