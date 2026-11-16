import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'

export async function registerUser({ name, email, password }) {
  const existing = await User.exists({ email })
  if (existing) throw new ApiError(409, 'An account with that email already exists')
  const user = await User.create({ name, email, password })
  return user
}

export async function authenticateUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password +isActive')
  if (!user || !user.isActive || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email or password is incorrect')
  }
  return user
}

export async function updateUserProfile(userId, changes) {
  const user = await User.findByIdAndUpdate(userId, { $set: changes }, {
    new: true,
    runValidators: true,
    select: 'name email role profileImage createdAt updatedAt',
  })
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

export async function changeUserPassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+password')
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect')
  }
  user.password = newPassword
  user.authVersion += 1
  await user.save()
  return user
}

export async function revokeUserTokens(userId) {
  await User.updateOne({ _id: userId }, { $inc: { authVersion: 1 } })
}
