"use client";

import { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
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
  const [termPayRequests, setTermPayRequests] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

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
        setTermPayRequests(data);
      } catch (e) {
        console.error("取得失敗:", e);
      }
    }

    fetchData();
  }, [selectedPeriod]);

  const categoryTotals: Record<string, number> = {};
  for (const e of expenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.cost;
  }

  const muiChartData = Object.entries(categoryTotals).map(
    ([category, value], index) => ({
      id: index,
      value,
      label: category,
    })
  );

  return (
    <div className="flex flex-col">
      {/* 今月のPay */}
      <div className="bg-gray-100 p-4 m-6 rounded flex items-center justify-between">
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

      {/* 円グラフ */}
      <section className="flex flex-col items-center justify-center mt-4">
        <div className="flex justify-between items-center mb-2 gap-8">
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
        <div className="w-72 h-48 mt-4 gap-2">
          <PieChart
            series={[
              {
                data: muiChartData,
                paddingAngle: 0,
                outerRadius: 100, // ← ✨ここが重要
              },
            ]}
            width={200}
            height={200}
          />
        </div>
      </section>
      {/* 一覧 */}
      <ApprovedRequestList
        approvedPayRequest={termPayRequests}
        setPayRequests={setTermPayRequests}
        loading={loading}
        setLoading={setLoading}
      />
    </div>
  );
}
