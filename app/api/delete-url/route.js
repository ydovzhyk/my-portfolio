import fs from 'fs'
import path from 'path'

export async function POST(req) {
  try {
    const { userId, url } = await req.json()

    if (!userId || !url) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
      })
    }

    const filePath = path.join(process.cwd(), 'utils/data/urls.js')
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    const match = fileContent.match(/export const savedUrls = (.*);/s)
    if (!match) {
      return new Response(JSON.stringify({ error: 'No savedUrls found' }), {
        status: 500,
      })
    }

    const parsed = JSON.parse(match[1])

    const filtered = parsed.filter(
      (entry) => !(entry.userId === userId && entry.url === url)
    )

    const fileUpdated =
      'export const savedUrls = ' + JSON.stringify(filtered, null, 2) + ';\n'
    fs.writeFileSync(filePath, fileUpdated, 'utf-8')

    return new Response(JSON.stringify({ success: true }))
  } catch (err) {
    console.error('Error in /api/remove-url:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}
