const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  upiId: { type: String, required: true },
  upiName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
