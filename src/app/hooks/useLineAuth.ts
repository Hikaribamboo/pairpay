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
    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");
    const token = localStorage.getItem("token");
    const groupId = localStorage.getItem("groupId");
    if (userId && userName && token && groupId) {
      setUser({ userId, userName, groupId });
      router.replace("/payments");
      return;
    }

    if (code && state) {
      (async () => {
        setLoading(true);
        try {
          const groupId = state;
          const { userId, userName, customToken } = await fetchLineLogin(
            code,
            `${window.location.origin}/`,
            groupId
          );
          localStorage.setItem("token", customToken);
          localStorage.setItem("userId", userId);
          localStorage.setItem("userName", userName);
          localStorage.setItem("groupId", groupId);
          setUser({ userId, userName, groupId });
          router.replace("/payments");
        } catch (e: any) {
          console.error(e);
          setError(e);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }
  }, [code, state, router, setUser]);

  return { loading, error };
}
