import mongoose from 'mongoose'

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  unsubscribeToken: { type: String, unique: true, sparse: true, select: false },
  isSubscribed: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date, default: null },
}, { timestamps: true })

newsletterSchema.index({ isSubscribed: 1, subscribedAt: -1 })

export default mongoose.model('Newsletter', newsletterSchema)
