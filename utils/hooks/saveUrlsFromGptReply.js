import { URL } from 'url'
import { db } from '../../lib/firebaseAdmin'
import { projectsData } from '../data/projects-data'

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

  const newUrls = filteredUrls.map((url) => {
    const matchedProject = projectsData.find((project) =>
      url.includes(new URL(project.demo).hostname)
    )

    return {
      url,
      shotName: matchedProject?.shotName || null,
      addedAt: new Date().toISOString(),
    }
  })

  const userDocRef = db.collection('urls').doc(userId)
  const doc = await userDocRef.get()

  const existingUrls =
    doc.exists && Array.isArray(doc.data()?.urls) ? doc.data().urls : []

  const updatedUrls = [...existingUrls]

  for (const newUrl of newUrls) {
    const alreadyExists = existingUrls.some((u) => u.url === newUrl.url)
    if (!alreadyExists) {
      updatedUrls.push(newUrl)
    }
  }

  await userDocRef.set({ urls: updatedUrls }, { merge: true })

  return {
    success: true,
    found: matches.length,
    saved: updatedUrls.length - existingUrls.length,
    updated: true,
  }
}

