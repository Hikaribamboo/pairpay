// app/AuthClient.tsx (Client Component)
"use client";
import { useLineAuth } from "@/app/hooks/useLineAuth";

export default function AuthClient({
  code,
  state,
}: {
  code?: string;
  state?: string;
}) {
  const { loading, error } = useLineAuth(code, state);

  if (loading)
    return <p className="text-center mt-10 text-gray-500">ログイン中…</p>;
  if (error)
    return (
      <div className="text-center mt-10 text-red-600">
        ログインに失敗しました。リロードしてください。
      </div>
    );
  return null; // ほぼ即 /request に遷移
}
