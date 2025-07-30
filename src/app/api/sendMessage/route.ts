import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@line/bot-sdk';

const lineClient = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  const { userId, userName, purchaseItem, itemCost, itemLink, itemMemo, requestId, } = await req.json();

  const groupId = process.env.LINE_GROUP_ID!;

  try {
    await lineClient.pushMessage(groupId, {
      type: 'flex',
      altText: '購入リクエストが届きました',
      contents: {
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          contents: [
            {
              type: 'text',
              text: `${userName} さんから購入リクエストが届きました！`,
              weight: 'bold',
              size: 'md',
            },
            {
              type: 'text',
              text: `🗒️ ${purchaseItem}  ${itemCost}円`,
              wrap: true,
              color: '#ff7434ff',
              size: 'sm',
            },
            ...(itemLink
            ? [
                {
                  type: 'button',
                  style: 'link',
                  height: 'sm',
                  action: {
                    type: 'uri',
                    label: '🔗 商品リンク',
                    uri: itemLink,
                  },
                } as any,
              ]
            : []),
          ],
        },
        footer: {
          type: 'box',
          layout: 'horizontal',
          spacing: 'md',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: '#2b6de7ff', // green-400
              action: {
                type: 'postback',
                label: '賛成🙌🏻💗',
                data: `action=agree&id=${requestId}`,
              },
            },
          ],
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error sending message:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
