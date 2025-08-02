// lib/api/auth.ts
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { app } from "@/lib/firebase-client";

export async function fetchLineLogin(code: string, redirectUri: string) {
  const res = await fetch(
    `/api/callback?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`
  );
  if (!res.ok) throw new Error("LINEログイン失敗");
  return res.json() as Promise<{
    userId: string;
    userName: string;
    customToken: string;
  }>;
}

export async function signInAndCache(
  customToken: string,
  userId: string,
  userName: string
) {
  const auth = getAuth(app);
  await signInWithCustomToken(auth, customToken);
  sessionStorage.setItem("userId", userId);
  sessionStorage.setItem("userName", userName);
  sessionStorage.setItem("token", customToken);
}
