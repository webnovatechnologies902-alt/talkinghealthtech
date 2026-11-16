import mongoose from 'mongoose'
import slugify from '../utils/slugify.js'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  type: { type: String, enum: ['article', 'podcast', 'event', 'glossary'], required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

categorySchema.index({ type: 1, isActive: 1, name: 1 })
categorySchema.index({ name: 'text', description: 'text' })
categorySchema.pre('validate', function setSlug() {
  if (!this.slug && this.name) this.slug = slugify(this.name)
})

export default mongoose.model('Category', categorySchema)
