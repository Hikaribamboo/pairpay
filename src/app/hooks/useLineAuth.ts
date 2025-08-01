// hooks/useLineAuth.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import { fetchLineLogin, signInAndCache } from "@/lib/api/auth/auth";

export function useLineAuth() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");
  const setUser = useSetAtom(userAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const tryRestore = () => {
      const userId = sessionStorage.getItem("userId");
      const userName = sessionStorage.getItem("userName");
      const token = sessionStorage.getItem("token");
      if (userId && userName && token) {
        setUser({ userId, userName });
        router.replace("/request");
        return true;
      }
      return false;
    };

    if (tryRestore()) return;

    const redirectUri = `${window.location.origin}/`;

    if (code) {
      (async () => {
        setLoading(true);
        try {
          const { userId, userName, customToken } = await fetchLineLogin(
            code,
            redirectUri
          );
          await signInAndCache(customToken, userId, userName);
          setUser({ userId, userName });
          router.replace("/request");
        } catch (e: any) {
          console.error("LINE login failed:", e);
          setError(e);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    // code も既存セッションもない → 認可ページへ飛ばす
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

  return { loading, error };
}
