import { NextResponse } from 'next/server'
import { db } from '../../../lib/firebaseAdmin'
import { openai } from '../../../lib/openai'
import { promptContent } from '../../../utils/data/promtContent'
import { saveUrlsFromGptReply } from '../../../utils/saveUrlsFromGptReply'
import { saveLangFromReply } from '../../../utils/saveLangFromReply'

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

    if (!existingMessages.some((m) => m.key === key)) {
      existingMessages.push({ role: 'user', content: message, key })
    }

    const lastMessages = existingMessages
      .slice(-20)
      .map(({ role, content }) => ({ role, content }))

    const systemPrompt = {
      role: 'system',
      content: promptContent,
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemPrompt, ...lastMessages],
      temperature: 0.7,
    })

    const assistantReply =
      completion.choices?.[0]?.message?.content || '🤖 No reply'

    const langMatch = assistantReply.match(/Language:\s*(\w+)/i)
    const userLang = langMatch?.[1]?.toLowerCase() || 'english'

    const cleanReply = assistantReply.replace(/Language:\s*\w+/i, '').trim()

    await saveUrlsFromGptReply(assistantReply, userId)
    await saveLangFromReply(userId, userLang)

    existingMessages.push({ role: 'assistant', content: cleanReply, key })

    await chatRef.set({ messages: existingMessages }, { merge: true })

    return NextResponse.json({ reply: cleanReply, language: userLang })
  } catch (error) {
    console.error('Error in /api/firebase:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}