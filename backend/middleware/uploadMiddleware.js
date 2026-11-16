import multer from 'multer'
import ApiError from '../utils/ApiError.js'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new ApiError(400, 'Only JPEG, PNG, or WebP images are allowed'))
    }
    return callback(null, true)
  },
})
