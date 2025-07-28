"use client";

import { useSearchParams } from "next/navigation";

import PurchaseForm from "@/components/PurchaseForm";
import PurchaseList from "@/components/PurchaseList";

export default function Home() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("uid");
  const userName = searchParams.get("un");

  const userInfo = userId && userName ? { userId, userName } : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      {userInfo && <PurchaseForm userInfo={userInfo} />}
      {userId && <PurchaseList userId={userId} />}
    </div>
  );
}
