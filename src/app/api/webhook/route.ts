// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log('LINE Webhook Received:', body)

  // ここでLINEメッセージ処理などを行う

  return NextResponse.json({ status: 'ok' }, { status: 200 })
}

// 他のメソッドは拒否（オプション）
export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
