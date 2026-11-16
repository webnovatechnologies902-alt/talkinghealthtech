import ApiError from '../utils/ApiError.js'

export default function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Administrator access required'))
  return next()
}
