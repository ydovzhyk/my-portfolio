import { NextResponse } from 'next/server'
import { db } from '../../../lib/firebaseAdmin'
import axios from 'axios'
export async function POST(req) {
  try {
    const { userId } = await req.json()
    if (!userId)
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

    const doc = await db.collection('chatHistory').doc(userId).get()
    const messages = doc.exists ? doc.data()?.messages || [] : []

    if (!messages.length) {
      return NextResponse.json({ error: 'No messages' }, { status: 200 })
    }

    const formatted = messages
      .map(
        (m) =>
          `${m.role === 'user' ? '🧑 User' : '🤖 Assistant'}:\n${m.content}`
      )
      .join('\n\n')

    const telegramMessage = `📨 Chat with user [${userId}]:\n\n${formatted}`

    const telegramRes = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: telegramMessage,
      }
    )

    if (telegramRes.data.ok) {
      return NextResponse.json({ success: true })
    } else {
      throw new Error('Telegram error')
    }
  } catch (err) {
    console.error('Telegram Error:', err.message)
    return NextResponse.json(
      { error: 'Failed to send chat history' },
      { status: 500 }
    )
  }
}
