// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthClient from "@/app/components/AuthClient";
import LeadLineFriend from "@/app/components/LeadLineFriend";

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();

  const code = params.get("code");
  const state = params.get("state"); // ← LINEのstate（今回はgroupId相当 or 'nogroup'）

  // ❶ LINE 認可から戻ってきた
  if (code && state) {
    return <AuthClient code={code} state={state} />;
  }

  useEffect(() => {
    // ❷ 既にログイン済みなら /payments
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (userId && token) {
      router.replace("/payments");
      return;
    }

    // ❸ 未ログイン → その場で LINE 認可へ
    const redirectUri = `${window.location.origin}/`;
    // groupId がまだ無いケースは 'nogroup' としておく（API 側で optional 扱い）
    const state = localStorage.getItem("groupId") ?? "nogroup";

    const loginUrl =
      "https://access.line.me/oauth2/v2.1/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
        redirect_uri: redirectUri,
        state, // groupId or 'nogroup'
        scope: "profile openid",
      });

    window.location.href = loginUrl;
  }, [router]);

  // ここに来るのは基本的に少ない（手動で戻ってきた等）
  return <LeadLineFriend />;
}
