import mongoose from 'mongoose'
import slugify from '../utils/slugify.js'

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 180 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  excerpt: { type: String, required: true, trim: true, maxlength: 500 },
  content: { type: String, required: true, minlength: 20 },
  featuredImage: { type: String, trim: true, maxlength: 2048, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  views: { type: Number, min: 0, default: 0 },
  seoTitle: { type: String, trim: true, maxlength: 180, default: '' },
  seoDescription: { type: String, trim: true, maxlength: 320, default: '' },
}, { timestamps: true })

articleSchema.index({ status: 1, publishedAt: -1 })
articleSchema.index({ category: 1, status: 1, publishedAt: -1 })
articleSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' })
articleSchema.pre('validate', function setArticleFields() {
  if (!this.slug && this.title) this.slug = slugify(this.title)
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date()
})

export default mongoose.model('Article', articleSchema)
