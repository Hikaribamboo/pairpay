import { getAuth, signInWithCustomToken } from "firebase/auth";
import { app } from "@/lib/firebase-client";

// カスタムトークンとユー情報を取得
export async function fetchLoginData(authorizationCode: string) {
  const res = await fetch(`/api/callback?code=${authorizationCode}`);
  if (!res.ok) throw new Error("LINEログインに失敗しました");
  return res.json(); // { userId, userName, firebaseToken }
}

// Firebaseにログインしセッションに保存
export async function loginWithFirebaseToken(
  token: string,
  userId: string,
  userName: string
) {
  const auth = getAuth(app);
  await signInWithCustomToken(auth, token);

  sessionStorage.setItem("userId", userId);
  sessionStorage.setItem("userName", userName);
  sessionStorage.setItem("token", token);
}
