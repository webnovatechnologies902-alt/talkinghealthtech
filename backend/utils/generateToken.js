import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const AUTH_COOKIE = 't_ht_auth'

function tokenLifetimeMs() {
  const [, amount, unit] = env.jwtExpiresIn.match(/^(\d+)([smhd])$/)
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
  return Number(amount) * multipliers[unit]
}

export function generateToken(userId, authVersion = 0) {
  return jwt.sign({ sub: userId, ver: authVersion }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: 'talking-healthtech-api',
    audience: 'talking-healthtech-web',
  })
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: '/api/v1',
    maxAge: tokenLifetimeMs(),
  }
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: '/api/v1',
  })
}
