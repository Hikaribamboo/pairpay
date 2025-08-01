// app/page.tsx
"use client";

import { useLineAuth } from "./hooks/useLineAuth";

export default function Page() {
  const { loading, error } = useLineAuth();

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">ログイン中…</p>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        ログインに失敗しました。リロードしてください。
      </div>
    );
  }

  // 通常ここにはほぼ表示されない（リダイレクト済み）
  return null;
}
