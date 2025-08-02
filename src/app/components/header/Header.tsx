"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 shadow relative z-20">
      <div className="ml-4">
        <Image
          src="/logo.png" // public/logo.png を想定
          alt="ペアPay ロゴ"
          width={36}
          height={56}
          priority // 初回表示で優先的に読み込む（ロゴなら有効）
        />
      </div>

      {/* デスクトップナビ */}
      <nav className="hidden md:flex gap-6">
        <Link href="/payments">Payリクエスト一覧</Link>
        <Link href="/management">管理</Link>
        <Link href="/saving">貯金</Link>
      </nav>

      {/* ハンバーガー */}
      <div className="md:hidden">
        <button
          aria-label="メニュー"
          onClick={() => setOpen((o) => !o)}
          className="p-2"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 右側スライドインドロワー */}
      <div
        aria-hidden={!open}
        className={`
          fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
          md:hidden
        `}
        style={{ zIndex: 30 }}
      >
        <div className="p-6 flex flex-col gap-8">
          <button
            aria-label="閉じる"
            onClick={() => setOpen(false)}
            className="self-end"
          >
            <X size={24} />
          </button>
          <Link
            href="/payments"
            onClick={() => setOpen(false)}
            className="block"
          >
            Payリクエスト一覧
          </Link>
          <Link
            href="/management"
            onClick={() => setOpen(false)}
            className="block"
          >
            管理
          </Link>
          <Link href="/saving" onClick={() => setOpen(false)} className="block">
            貯金
          </Link>
        </div>
      </div>

      {/* 背景のオーバーレイ（開いてるときだけ） */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
          style={{ zIndex: 20 }}
        />
      )}
    </header>
  );
}
