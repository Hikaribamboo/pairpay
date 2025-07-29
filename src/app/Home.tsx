"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetAtom } from "jotai";
import { userAtom } from "@/atoms/userAtom";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import { app } from "@/lib/firebase-client";
import PurchaseForm from "@/components/PurchaseForm";
import PurchaseList from "@/components/PurchaseList";

export default function Home() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const setUser = useSetAtom(userAtom);
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    const cachedUserId = sessionStorage.getItem("userId");
    const cachedUserName = sessionStorage.getItem("userName");
    const cachedToken = sessionStorage.getItem("token");

    if (cachedUserId && cachedUserName && cachedToken) {
      setUser({
        userId: cachedUserId,
        userName: cachedUserName,
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser({
          userId: user.uid,
          userName: user.displayName ?? "LINEユーザー",
        });
      } else if (code) {
        // 初回ログイン
        const res = await fetch(`/api/callback?code=${code}`);
        const data = await res.json();
        await signInWithCustomToken(auth, data.firebaseToken);

        // Firebase成功後、セッション保存
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("userName", data.userName);
        sessionStorage.setItem("token", data.firebaseToken);

        setUser({
          userId: data.userId,
          userName: data.userName,
        });
        router.replace("/");
      } else {
        // 未ログインならLINEログインへ
        const redirectUri = `${process.env.NEXT_PUBLIC_REDIRECT_BASE_URL}/api/callback`;
        const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_CLIENT_ID}&redirect_uri=${redirectUri}&state=12345&scope=profile%20openid`;
        window.location.href = loginUrl;
      }
    });

    return () => unsubscribe();
  }, [code, setUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <PurchaseForm />
      <PurchaseList />
    </div>
  );
}
