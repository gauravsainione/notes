const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true, default: '' },
  reply: { type: String, trim: true, default: '' },
  replyAt: { type: Date }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  comment: { type: String, trim: true, required: true },
  reply: { type: String, trim: true, default: '' },
  replyAt: { type: Date }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  pricingType: { type: String, enum: ['free', 'paid'], default: 'paid' },
  type: { type: String, enum: ['digital', 'physical'], required: true },
  category: { type: String, default: '' }, // Subject/Course
  
  // Specific to digital
  fileUrl: { type: String }, // Full PDF url
  previewUrl: { type: String }, // First 5 pages url
  thumbnailUrl: { type: String }, // First page as thumbnail
  
  // Specific to physical
  condition: { type: String, enum: ['new', 'good', 'used'] },
  images: [{ type: String }],
  
  // Local first indexing
  location: { type: String, default: '' },
  
  // Admin approval
  isApproved: { type: Boolean, default: false },
  rejectionReason: { type: String, default: '' },

  // Soft delete
  isDeleted: { type: Boolean, default: false },

  reviews: [reviewSchema],
  comments: [commentSchema]
}, { timestamps: true });

// Optimizing common queries (filtering, sorting)
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isApproved: 1, isDeleted: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
