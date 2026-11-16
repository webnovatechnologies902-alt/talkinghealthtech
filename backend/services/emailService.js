import nodemailer from 'nodemailer'
import { env } from '../config/env.js'
import ApiError from '../utils/ApiError.js'

let transporter

export function isEmailConfigured() {
  return env.smtpConfigured
}

function getTransporter() {
  if (!env.smtpConfigured) throw new ApiError(503, 'Email delivery is not configured')
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
      ...(env.smtpUser ? { auth: { user: env.smtpUser, pass: env.smtpPassword } } : {}),
    })
  }
  return transporter
}

function unsubscribeUrl(token) {
  const url = new URL('/unsubscribe', env.frontendUrl)
  url.searchParams.set('token', token)
  return url.toString()
}

export async function sendSubscriptionConfirmation(email, token) {
  return getTransporter().sendMail({
    from: env.smtpFromEmail,
    to: email,
    subject: 'You are subscribed to Talking HealthTech',
    text: `Thanks for subscribing to the Talking HealthTech weekly briefing.\n\nTo unsubscribe, visit: ${unsubscribeUrl(token)}`,
  })
}

export async function sendContactNotification({ name, email, message }) {
  if (!env.contactEmail) return false
  await getTransporter().sendMail({
    from: env.smtpFromEmail,
    to: env.contactEmail,
    replyTo: email,
    subject: 'Talking HealthTech contact message',
    text: `From: ${name} <${email}>\n\n${message}`,
  })
  return true
}

export async function sendNewsletterCampaign({ subscribers, subject, content }) {
  const mailer = getTransporter()
  let sent = 0
  let failed = 0
  let nextIndex = 0
  const workerCount = Math.min(3, subscribers.length)
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < subscribers.length) {
      const subscriber = subscribers[nextIndex]
      nextIndex += 1
      try {
        await mailer.sendMail({
          from: env.smtpFromEmail,
          to: subscriber.email,
          subject,
          text: `${content}\n\nUnsubscribe: ${unsubscribeUrl(subscriber.unsubscribeToken)}`,
        })
        sent += 1
      } catch (error) {
        failed += 1
        console.error('Newsletter campaign delivery failed for one recipient', error.code ?? 'unknown error')
      }
    }
  }))
  return { sent, failed }
}
