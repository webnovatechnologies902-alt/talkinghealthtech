import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'

const credentials = [
  env.cloudinaryCloudName,
  env.cloudinaryApiKey,
  env.cloudinaryApiSecret,
]
const configured = credentials.every(Boolean)

if (configured) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  })
}

export { cloudinary, configured as isCloudinaryConfigured }
