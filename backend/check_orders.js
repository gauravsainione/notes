const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config({ path: './.env' });

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log("Orders:", orders.map(o => ({ id: o._id, status: o.status, amount: o.amount })));
  } catch(e) { console.error(e); }
  process.exit();
}

check();
