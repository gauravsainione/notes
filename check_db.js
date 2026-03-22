const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find().sort({ createdAt: -1 }).limit(5);
  console.log("Latest users:", users.map(u => ({ email: u.email, phone: u.phone, createdAt: u.createdAt })));
  process.exit();
}

check();
