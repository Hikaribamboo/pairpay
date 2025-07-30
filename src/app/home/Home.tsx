"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import PurchaseForm from "@/components/PurchaseForm";
import PurchaseList from "@/components/PurchaseList";
import { fetchLineLogin, signInAndCache } from "@/lib/api/auth/auth";

export default function Home() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const setUser = useSetAtom(userAtom);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1) 既に sessionStorage にあれば即反映
    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("userName");
    const token = sessionStorage.getItem("token");
    if (userId && userName && token) {
      setUser({ userId: userId, userName: userName });
      return;
    }

    if (code) {
      (async () => {
        setLoading(true);
        try {
          // 認可時と同じ redirect_uri を使う（ngrok等でも確実に合う）
          const redirectUri = `${window.location.origin}/`;

          const { userId, userName, customToken } = await fetchLineLogin(
            code,
            redirectUri
          );

          await signInAndCache(customToken, userId, userName);

          setUser({ userId, userName });
          router.replace("/"); // ?code を消してホームへ
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
      return; // 以降の分岐に行かないように
    }

    // 3) それ以外は LINE 認可画面へ飛ばす
    const redirectUri = `${window.location.origin}/`;
    const loginUrl =
      "https://access.line.me/oauth2/v2.1/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
        redirect_uri: redirectUri,
        state: "12345",
        scope: "profile openid",
      });
    window.location.href = loginUrl;
  }, [code, router, setUser]);

  if (loading) return <p>ログイン中…</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <PurchaseForm />
      <PurchaseList />
    </div>
  );
}
