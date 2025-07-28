"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import PurchaseForm from "@/components/PurchaseForm";
import PurchaseList from "@/components/PurchaseList";

export default function Home() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("uid");
  const userName = searchParams.get("name");

  useEffect(() => {
    if (!userId || !userName) {
      const redirectUri = "https://pairpay.vercel.app/api/callback";
      const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_CLIENT_ID}&redirect_uri=${redirectUri}&state=12345&scope=profile%20openid`;
      window.location.href = loginUrl;
    }
  }, [userId, userName]);

  const userInfo = userId && userName ? { userId, userName } : null;

  if (!userInfo) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      {userInfo && <PurchaseForm userInfo={userInfo} />}
      {userId && <PurchaseList userId={userId} />}
    </div>
  );
}
