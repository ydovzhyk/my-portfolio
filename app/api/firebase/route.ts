import { NextResponse } from 'next/server'
import { db } from '../../../lib/firebaseAdmin'
import { openai } from '../../../lib/openai'
import { promptContent } from '../../../utils/data/promtContent'
export async function POST(req) {
  try {
    const body = await req.json()
    const { userId, message, key } = body

    if (!userId || !message || !key) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const chatRef = db.collection('chatHistory').doc(userId)
    const doc = await chatRef.get()
    const existingMessages = doc.exists ? doc.data().messages || [] : []

    // Додати нове повідомлення користувача, якщо ще не додане
    if (!existingMessages.some((m) => m.key === key)) {
      existingMessages.push({ role: 'user', content: message, key })
    }

    // Взяти останні 20 повідомлень для GPT (10 user + 10 assistant)
    const lastMessages = existingMessages
      .slice(-20)
      .map(({ role, content }) => ({
        role,
        content,
      }))

    // Створити system prompt
    const systemPrompt = {
      role: 'system',
      content: promptContent,
    }

    // Виклик GPT через офіційний SDK
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemPrompt, ...lastMessages],
      temperature: 0.7,
    })

    const assistantReply =
      completion.choices?.[0]?.message?.content || '🤖 No reply'

    // Додаємо відповідь до історії
    existingMessages.push({ role: 'assistant', content: assistantReply, key })

    // Оновлюємо Firestore
    await chatRef.set({ messages: existingMessages }, { merge: true })

    return NextResponse.json({ reply: assistantReply })
  } catch (error) {
    console.error('Error in /api/firebase:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}

