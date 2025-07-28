import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@line/bot-sdk'

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  const { message } = await req.json()

  // グループIDは実際にBotが参加しているグループIDに変更
  const groupId = process.env.LINE_GROUP_ID! 

  try {
    await client.pushMessage(groupId, {
      type: 'text',
      text: message,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error sending message:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
