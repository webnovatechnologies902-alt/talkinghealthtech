import { env } from '../config/env.js'
import { AUTH_COOKIE } from '../utils/generateToken.js'
import ApiError from '../utils/ApiError.js'

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS'])

export default function verifyCookieRequestOrigin(req, res, next) {
  if (safeMethods.has(req.method) || !req.cookies?.[AUTH_COOKIE]) return next()

  const authorization = req.get('authorization')
  if (/^Bearer\s+/i.test(authorization ?? '')) return next()

  const origin = req.get('origin')
  if (origin !== env.frontendUrl) {
    return next(new ApiError(403, 'Request origin is not allowed'))
  }
  return next()
}
