"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import { fetchLineLogin, signInAndCache } from "@/lib/api/auth/auth";

export default function Page() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const setUser = useSetAtom(userAtom);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("userName");
    const token = sessionStorage.getItem("token");

    if (userId && userName && token) {
      setUser({ userId, userName });
      router.replace("/request");
      return;
    }

    if (code) {
      (async () => {
        setLoading(true);
        try {
          const redirectUri = `${window.location.origin}/`;
          const { userId, userName, customToken } = await fetchLineLogin(
            code,
            redirectUri
          );

          await signInAndCache(customToken, userId, userName);
          setUser({ userId, userName });
          router.replace("/request");
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    // 認証URLへ飛ばす
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

  return loading ? (
    <p className="text-center mt-10 text-gray-500">ログイン中…</p>
  ) : null;
}
