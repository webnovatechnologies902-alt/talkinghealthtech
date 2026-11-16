import mongoose from 'mongoose'

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
}, { timestamps: true })

contactMessageSchema.index({ createdAt: -1 })

export default mongoose.model('ContactMessage', contactMessageSchema)
