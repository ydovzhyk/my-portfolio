import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { writeFile, unlink } from 'fs/promises'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { randomUUID } from 'crypto'
import { saveLangFromReply } from '../../../utils/saveLangFromReply'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('audio')
    const userId = formData.get('userId')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${randomUUID()}.webm`
    const tmpDir = os.tmpdir()
    const filepath = path.join(tmpDir, filename)

    await writeFile(filepath, buffer)

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filepath),
      model: 'whisper-1',
      response_format: 'verbose_json',
    })

    const transcript = transcription.text || ''
    const detectedLang = transcription.language

    saveLangFromReply(userId, detectedLang)

    await unlink(filepath)

    if (detectedLang === 'russian') {
      const translation = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a translator. Always translate only from Russian to Ukrainian. Do not explain anything, just translate.',
          },
          {
            role: 'user',
            content: transcript,
          },
        ],
      })

      const translated = translation.choices[0]?.message?.content?.trim() || ''
      return NextResponse.json({ text: translated, language: 'uk' })
    }

    return NextResponse.json({ text: transcript, language: detectedLang })
  } catch (e) {
    console.error('[Transcription Error]', e)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}

////////////////////////////////////////////////////////
// import { NextResponse } from 'next/server'
// import { createClient } from '@deepgram/sdk'
// import { writeFile, unlink } from 'fs/promises'
// import fs from 'fs'
// import path from 'path'
// import os from 'os'
// import { randomUUID } from 'crypto'

// const deepgram = createClient(process.env.DEEPGRAM_API_KEY)

// export async function POST(req) {
//   try {
//     const formData = await req.formData()
//     const file = formData.get('audio')

//     if (!file || typeof file === 'string') {
//       return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
//     }

//     const buffer = Buffer.from(await file.arrayBuffer())
//     const filename = `${randomUUID()}.webm`
//     const tmpDir = os.tmpdir()
//     const filepath = path.join(tmpDir, filename)

//     await writeFile(filepath, buffer)

//     const fileBuffer = fs.readFileSync(filepath)
//     const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
//       fileBuffer,
//       {
//         model: 'nova-2',
//         language: 'uk',
//         smart_format: true,
//         punctuate: true,
//         mimetype: 'audio/webm',
//       }
//     )

//     await unlink(filepath)

//     if (error) {
//       console.error('[Deepgram Error]', error)
//       return NextResponse.json(
//         { error: 'Transcription failed' },
//         { status: 500 }
//       )
//     }

//     const transcript =
//       result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
//     const detectedLang = result?.results?.language || 'unknown'

//     console.log('Transcription:', transcript)
//     console.log('Detected Language:', detectedLang)

//     return NextResponse.json({ text: transcript, language: detectedLang })
//   } catch (e) {
//     console.error('[Deepgram Transcription Error]', e)
//     return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
//   }
// }
