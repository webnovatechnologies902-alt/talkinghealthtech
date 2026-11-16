import mongoose from 'mongoose'
import slugify from '../utils/slugify.js'

const podcastSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 180 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  thumbnail: { type: String, trim: true, maxlength: 2048, default: '' },
  audioUrl: { type: String, trim: true, maxlength: 2048, default: '' },
  videoUrl: { type: String, trim: true, maxlength: 2048, default: '' },
  host: { type: String, required: true, trim: true, maxlength: 120 },
  guests: { type: [{ type: String, trim: true, maxlength: 120 }], default: [] },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  relatedTerms: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Glossary' }], default: [] },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  duration: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date, default: null },
}, { timestamps: true })

podcastSchema.index({ status: 1, publishedAt: -1 })
podcastSchema.index({ category: 1, status: 1, publishedAt: -1 })
podcastSchema.index({ company: 1, status: 1, publishedAt: -1 })
podcastSchema.index({ title: 'text', description: 'text', host: 'text', guests: 'text' })
podcastSchema.pre('validate', function setSlug() {
  if (!this.slug && this.title) this.slug = slugify(this.title)
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date()
})

export default mongoose.model('Podcast', podcastSchema)
