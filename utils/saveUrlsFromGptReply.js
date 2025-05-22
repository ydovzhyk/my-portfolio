import { URL } from 'url'
import { projectsData } from './data/projects-data'
import { db } from '../lib/firebaseAdmin'

export async function saveUrlsFromGptReply(gptText, userId) {
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

  const userDocRef = db.collection('urls').doc(userId)
  await userDocRef.set({ urls: urlsForUser }, { merge: true })

  return {
    success: true,
    found: matches.length,
    saved: urlsForUser.length,
    updated: true,
  }
}