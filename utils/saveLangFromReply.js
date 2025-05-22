import { db } from '../lib/firebaseAdmin'

export async function saveLangFromReply(userId, lang) {
  try {
    const userDocRef = db.collection('langs').doc(userId)

    await userDocRef.set(
      {
        lang,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Failed to save language to Firestore:', error)
  }
}