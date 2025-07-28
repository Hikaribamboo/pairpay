"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("uid");
  const userName = searchParams.get("name");

  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!userId) {
      const redirectUri = encodeURIComponent("https://pairpay/api/callback");
      const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINE_CLIENT_ID}&redirect_uri=${redirectUri}&state=12345&scope=profile%20openid`;

      window.location.href = loginUrl;
    }
  }, [userId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("送信中...");

    const res = await fetch("/api/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `${userName} さんより: ${text}`,
        userId,
      }),
    });

    if (res.ok) {
      setStatus("送信成功！");
      setText("");
    } else {
      setStatus("送信失敗");
    }
  };

  if (!userId) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-center text-gray-700 mb-2">
          {userName} さん、こんにちは！
        </h2>
        <h1 className="text-xl font-semibold mb-4 text-center text-gray-800">
          LINEにメッセージを送信
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="メッセージを入力"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            送信
          </button>
        </form>
        {status && (
          <p className="mt-4 text-center text-sm text-gray-600">{status}</p>
        )}
      </div>
    </div>
  );
}
