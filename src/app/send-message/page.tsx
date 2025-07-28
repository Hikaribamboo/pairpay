"use client";

import { useState } from "react";

export default function SendMessagePage() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("送信中...");

    const res = await fetch("/api/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (res.ok) {
      setStatus("送信成功！");
      setText("");
    } else {
      setStatus("送信失敗");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>LINEにメッセージを送信</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力"
        />
        <button type="submit">送信</button>
      </form>
      <p>{status}</p>
    </div>
  );
}
