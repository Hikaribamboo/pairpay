"use client";

import PurchaseForm from "@/components/PurchaseForm";
import PurchaseList from "@/components/PurchaseList";
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <PurchaseForm />
      <PurchaseList />
    </div>
  );
}
