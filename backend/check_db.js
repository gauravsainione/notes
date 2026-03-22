const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    console.log("Latest users:", users.map(u => ({ name: u.name, email: u.email, phone: u.phone, createdAt: u.createdAt, wallet: u.walletBalance })));
  } catch(e) { console.error(e); }
  process.exit();
}

check();
