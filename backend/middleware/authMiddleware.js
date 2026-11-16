import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { env } from '../config/env.js'
import { AUTH_COOKIE } from '../utils/generateToken.js'
import ApiError from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.get('authorization')
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  const token = req.cookies?.[AUTH_COOKIE] ?? bearer
  if (!token) throw new ApiError(401, 'Authentication required')

  let payload
  try {
    payload = jwt.verify(token, env.jwtSecret, {
      issuer: 'talking-healthtech-api',
      audience: 'talking-healthtech-web',
      algorithms: ['HS256'],
    })
  } catch {
    throw new ApiError(401, 'Invalid or expired authentication token')
  }

  const user = await User.findById(payload.sub).select('name email role profileImage isActive authVersion')
  if (!user || !user.isActive || payload.ver !== user.authVersion) {
    throw new ApiError(401, 'Invalid or expired authentication token')
  }
  req.user = user
  next()
})
