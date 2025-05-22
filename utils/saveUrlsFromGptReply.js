import fs from 'fs'
import path from 'path'
import { URL } from 'url'
import { projectsData } from './data/projects-data'
export function saveUrlsFromGptReply(gptText, userId) {
  const urlRegex = /(https?:\/\/[^\s)]+)/g
  const matches = gptText.match(urlRegex) || []

  const excludedDomains = ['github.com', 'linkedin.com', 'youtube.com']

  const filteredUrls = matches.filter((url) => {
    try {
      const parsed = new URL(url)
      return !excludedDomains.includes(parsed.hostname)
    } catch {
      return false
    }
  })

  const urlsForUser = filteredUrls.map((url) => {
    const matchedProject = projectsData.find((project) =>
      url.includes(new URL(project.demo).hostname)
    )

    return {
      url,
      shotName: matchedProject?.shotName || null,
      description: matchedProject?.description || null,
      addedAt: new Date().toISOString(),
    }
  })

  const filePath = path.join(process.cwd(), 'utils/data/urls.js')

  let data = []
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const match = raw.match(/export const savedUrls = (.*);/)
      if (match && match[1]) {
        data = JSON.parse(match[1])
      }
    } catch (e) {
      console.error('Failed to read urls.js:', e)
    }
  }

  const updatedData = data.filter((entry) => entry.userId !== userId)

  urlsForUser.forEach((entry) =>
    updatedData.push({
      ...entry,
      userId,
    })
  )

  const fileContent =
    'export const savedUrls = ' + JSON.stringify(updatedData, null, 2) + ';\n'

  fs.writeFileSync(filePath, fileContent, 'utf-8')

  return {
    success: true,
    found: matches.length,
    saved: urlsForUser.length,
    updated: true,
  }
}
