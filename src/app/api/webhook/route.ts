import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@line/bot-sdk'

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log('LINE Webhook Received:', body)

  const events = body.events

  // 複数イベント対応
  await Promise.all(events.map(async (event: any) => {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text
      if (userMessage.includes('こんにちは')) {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'こんにちは！',
        })
      }
    }

    // グループ参加通知
    if (event.type === 'join') {
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'グループに参加しました！',
      })
    }
  }))

  return NextResponse.json({ status: 'ok' })
}
