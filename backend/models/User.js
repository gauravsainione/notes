const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  isBlocked: { type: Boolean, default: false },
  college: { type: String },
  course: { type: String },
  year: { type: String },
  location: { type: String }, // e.g., "Noida", "Hapur"
  phone: { type: String },
  walletBalance: { type: Number, default: 0 },
  upiId: { type: String, default: '' },
  upiName: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
