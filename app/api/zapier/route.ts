
export async function POST(req: Request) {
  const { message, key, userId } = await req.json()

  const webhookUrl = 'https://hooks.zapier.com/hooks/catch/22840097/2nplvji/'
  const storageSecret = process.env.ZAPIER_STORAGE_SECRET

  try {
    // Надіслати запит у Zapier
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, key, userId }),
    })

    if (!res.ok) {
      return Response.json({ error: 'Webhook failed' }, { status: 500 })
    }

    // Очікуємо на відповідь в Storage
    const storageUrl = `https://store.zapier.com/api/records?secret=${storageSecret}&key=history`
    let reply = 'No reply received'

    for (let attempt = 0; attempt < 30; attempt++) {
      const replyRes = await fetch(storageUrl)

      if (!replyRes.ok) {
        await new Promise((r) => setTimeout(r, 1500))
        continue
      }

      const rawText = await replyRes.text()

      try {
        const data = JSON.parse(rawText)
        const userHistory = data.history?.[userId] || []

        const assistantReply = userHistory.find(
          (item: any) => item.role === 'assistant' && item.key === key
        )

        if (assistantReply) {
          reply = assistantReply.content
          break
        }
      } catch (jsonErr) {
        console.error('JSON parse error:', jsonErr)
      }

      await new Promise((r) => setTimeout(r, 1500))
    }

    return Response.json({ reply })
  } catch (error) {
    return Response.json({ error: 'Server error' }, { status: 500 })
  }
}


