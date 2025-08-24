// app/page.tsx
"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import AuthClient from "@/app/components/AuthClient";
import LeadLineFriend from "@/app/components/LeadLineFriend";

function PageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setUser = useSetAtom(userAtom);

  const code = params.get("code");
  const state = params.get("state");

  useEffect(() => {
    if (code && state) return;

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName") ?? "匿名ユーザー";
    const groupId = localStorage.getItem("groupId") ?? undefined;

    if (userId && token) {
      setUser({ userId, userName, groupId });
      router.replace("/payments");
      return;
    }

    const redirectUri = `${window.location.origin}/`;
    const st = localStorage.getItem("groupId") ?? "nogroup";

    const loginUrl =
      "https://access.line.me/oauth2/v2.1/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID!,
        redirect_uri: redirectUri,
        state: st,
        scope: "profile openid",
      });

    window.location.href = loginUrl;
  }, [router, code, state, setUser]); // ← setUser を依存に追加

  if (code && state) {
    return <AuthClient code={code} state={state} />;
  }
  return <LeadLineFriend />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  );
}
