import fs from 'fs'
import path from 'path'

export async function POST(req) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
      })
    }

    const filePath = path.join(process.cwd(), 'utils/data/urls.js')
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    const match = fileContent.match(/export const savedUrls = (.*);/s)

    if (!match) {
      return new Response(
        JSON.stringify({ error: 'The file does not contain savedUrls.' }),
        {
          status: 500,
        }
      )
    }

    const parsed = JSON.parse(match[1])

    const userUrls = parsed.filter((url) => url.userId === userId)

    return new Response(JSON.stringify(userUrls), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in /api/urls:', error.message)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
