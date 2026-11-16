import { updateUserProfile } from '../services/authService.js'
import ApiResponse from '../utils/ApiResponse.js'
import asyncHandler from '../utils/asyncHandler.js'

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateUserProfile(req.user._id, req.body)
  return res.status(200).json(new ApiResponse(200, 'Profile updated successfully', { user }))
})
