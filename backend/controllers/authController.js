import { env } from '../config/env.js'
import {
  authenticateUser,
  changeUserPassword,
  registerUser,
  revokeUserTokens,
} from '../services/authService.js'
import { clearAuthCookie, cookieOptions, generateToken, AUTH_COOKIE } from '../utils/generateToken.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

function sendAuthenticated(res, user, statusCode, message) {
  const token = generateToken(user._id.toString(), user.authVersion)
  res.cookie(AUTH_COOKIE, token, cookieOptions())
  return res.status(statusCode).json(new ApiResponse(statusCode, message, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
    ...(env.nodeEnv !== 'production' ? { token } : {}),
  }))
}

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body)
  return sendAuthenticated(res, user, 201, 'Account created successfully')
})

export const login = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req.body)
  return sendAuthenticated(res, user, 200, 'Signed in successfully')
})

export const logout = asyncHandler(async (req, res) => {
  await revokeUserTokens(req.user._id)
  clearAuthCookie(res)
  return res.status(200).json(new ApiResponse(200, 'Signed out successfully'))
})

export const me = asyncHandler(async (req, res) => {
  const { _id, name, email, role, profileImage } = req.user
  return res.status(200).json(new ApiResponse(200, 'Profile fetched successfully', {
    user: { id: _id, name, email, role, profileImage },
  }))
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const user = await changeUserPassword(req.user._id, currentPassword, newPassword)
  return sendAuthenticated(res, user, 200, 'Password changed successfully')
})
