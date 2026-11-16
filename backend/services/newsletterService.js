import Newsletter from '../models/Newsletter.js'
import { randomBytes } from 'node:crypto'

export async function ensureUnsubscribeToken(subscriber) {
  if (subscriber.unsubscribeToken) return subscriber.unsubscribeToken
  const unsubscribeToken = randomBytes(32).toString('hex')
  await Newsletter.updateOne({ _id: subscriber._id }, { $set: { unsubscribeToken } })
  subscriber.unsubscribeToken = unsubscribeToken
  return unsubscribeToken
}

export async function subscribeNewsletter(email) {
  const now = new Date()
  const unsubscribeToken = randomBytes(32).toString('hex')
  await Newsletter.findOneAndUpdate(
    { email },
    {
      $set: { isSubscribed: true, subscribedAt: now, unsubscribedAt: null, unsubscribeToken },
      $setOnInsert: { email },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  )
  return unsubscribeToken
}

export async function unsubscribeNewsletter(unsubscribeToken) {
  await Newsletter.updateOne(
    { unsubscribeToken, isSubscribed: true },
    { $set: { isSubscribed: false, unsubscribedAt: new Date() }, $unset: { unsubscribeToken: 1 } },
  )
}
