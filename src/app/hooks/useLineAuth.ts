// hooks/useLineAuth.ts
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import { fetchLineLogin } from "@/lib/api/auth/auth";

export function useLineAuth(code?: string, state?: string) {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!code || !state) return;

    (async () => {
      setLoading(true);
      try {
        const groupId = state; // 'nogroup' の可能性あり
        const res = await fetchLineLogin(
          code,
          `${window.location.origin}/`,
          groupId
        );

        // userId が返らないケースを DB未登録 とみなして案内へ
        if (!res?.userId) {
          router.replace("/lead-line-friend"); // ページ用意していなければ "/" でもOK
          return;
        }

        const { userId, userName, customToken, pairUserId, pairUserName } = res;

        localStorage.setItem("token", customToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", userName);
        if (groupId && groupId !== "nogroup")
          localStorage.setItem("groupId", groupId);
        if (pairUserId) localStorage.setItem("pairUserId", pairUserId);
        if (pairUserName) localStorage.setItem("pairUserName", pairUserName);

        setUser({
          userId,
          userName,
          groupId: groupId !== "nogroup" ? groupId : undefined,
        });
        router.replace("/payments");
      } catch (e: any) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [code, state, router, setUser]);

  return { loading, error };
}
