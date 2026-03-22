const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentId: { type: String }, // Mock payment ID
  grantType: { type: String, enum: ['payment', 'manual'], default: 'payment' },
  financialsCounted: { type: Boolean, default: true },
  manualGrantNote: { type: String, default: '' },
  manuallyGrantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Optimizing common queries
orderSchema.index({ buyer: 1 });
orderSchema.index({ product: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
