import fs from 'fs'
import path from 'path'

export function saveLangFromReply(userId, lang) {
  const filePath = path.join(process.cwd(), 'utils/data/langs.js')

  let langs = []

  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const json = raw.match(/export const userLangs = (.+);/s)
      langs = json ? JSON.parse(json[1]) : []
    } catch (e) {
      console.error('Failed to parse langs.js:', e)
    }
  }

  const existingIndex = langs.findIndex((l) => l.userId === userId)

  if (existingIndex !== -1) {
    langs[existingIndex].lang = lang
    langs[existingIndex].updatedAt = new Date().toISOString()
  } else {
    langs.push({
      userId,
      lang,
      updatedAt: new Date().toISOString(),
    })
  }

  const fileContent =
    'export const userLangs = ' + JSON.stringify(langs, null, 2) + ';\n'

  fs.writeFileSync(filePath, fileContent, 'utf-8')
}
