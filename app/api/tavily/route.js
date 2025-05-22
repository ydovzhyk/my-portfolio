// /app/api/tavily/route.js
import { NextResponse } from 'next/server'
import { openai } from '../../../lib/openai'
import { userLangs } from '../../../utils/data/langs'

export async function POST(req) {
  try {
    const { userId, description } = await req.json()

    if (!userId || !description) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const userEntry = userLangs.find((entry) => entry.userId === userId)
    const lang = userEntry?.lang?.toLowerCase() || 'english'

    if (lang === 'english') {
      return NextResponse.json({ summary: description })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful translator. Translate the given English text into the target language. Only return the translated text, no explanation.',
        },
        {
          role: 'user',
          content: `Translate this to ${lang}:\n\n${description}`,
        },
      ],
      temperature: 0.5,
    })

    const translated = completion.choices?.[0]?.message?.content || description

    return NextResponse.json({ summary: translated })
  } catch (err) {
    console.error('Tavily translate API failed:', err)
    return NextResponse.json({ summary: 'Error translating description' })
  }
}
