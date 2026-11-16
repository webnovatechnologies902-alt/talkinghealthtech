import { ensureUnsubscribeToken, subscribeNewsletter, unsubscribeNewsletter } from '../services/newsletterService.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'
import Newsletter from '../models/Newsletter.js'
import { isEmailConfigured, sendNewsletterCampaign, sendSubscriptionConfirmation } from '../services/emailService.js'
import ApiError from '../utils/ApiError.js'

export const subscribe = asyncHandler(async (req, res) => {
  const unsubscribeToken = await subscribeNewsletter(req.body.email)
  if (!isEmailConfigured()) {
    return res.status(200).json(new ApiResponse(200, 'Subscription saved. Email confirmation is not configured yet.'))
  }
  try {
    await sendSubscriptionConfirmation(req.body.email, unsubscribeToken)
  } catch (error) {
    console.error('Newsletter confirmation email could not be sent', error.code ?? 'unknown error')
    return res.status(202).json(new ApiResponse(202, 'Subscription saved, but the confirmation email could not be sent.'))
  }
  return res.status(200).json(new ApiResponse(200, 'Subscription confirmed. Check your email for an unsubscribe link.'))
})

export const unsubscribe = asyncHandler(async (req, res) => {
  await unsubscribeNewsletter(req.body.token)
  return res.status(200).json(new ApiResponse(200, 'If the address was subscribed, it has been unsubscribed'))
})

export const sendCampaign = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find({ isSubscribed: true })
    .select('email +unsubscribeToken')
    .lean()
  if (!subscribers.length) throw new ApiError(400, 'There are no active newsletter subscribers')
  await Promise.all(subscribers.map((subscriber) => ensureUnsubscribeToken(subscriber)))

  const result = await sendNewsletterCampaign({ subscribers, ...req.body })
  const status = result.failed ? 207 : 200
  const message = result.failed
    ? `Campaign sent to ${result.sent} subscribers; ${result.failed} deliveries failed`
    : `Campaign sent to ${result.sent} subscribers`
  return res.status(status).json(new ApiResponse(status, message, result))
})
