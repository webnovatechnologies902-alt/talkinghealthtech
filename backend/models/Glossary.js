import mongoose from 'mongoose'
import slugify from '../utils/slugify.js'

const glossarySchema = new mongoose.Schema({
  term: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  definition: { type: String, required: true, trim: true, minlength: 5, maxlength: 3000 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  relatedTerms: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Glossary' }], default: [] },
}, { timestamps: true })

glossarySchema.index({ term: 'text', definition: 'text' })
glossarySchema.index({ term: 1 })
glossarySchema.pre('validate', function setSlug() {
  if (!this.slug && this.term) this.slug = slugify(this.term)
})

export default mongoose.model('Glossary', glossarySchema)
