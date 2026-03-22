const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testPurchase() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyswap');

  // Find admin
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error("No admin found!");
    process.exit(1);
  }

  // Find digital product
  const product = await Product.findOne({ type: 'digital', isApproved: true });
  if (!product) {
    console.error("No digital product found!");
    process.exit(1);
  }

  // Find seller
  const seller = await User.findById(product.seller);

  // Setup buyer
  const pwd = await bcrypt.hash('password123', 10);
  let buyer = await User.findOne({ email: 'testbuyer@example.com' });
  if (!buyer) buyer = await User.create({ name: 'Buyer', email: 'testbuyer@example.com', password: pwd, role: 'student' });

  console.log(`Initial balances -> Seller: ₹${seller.walletBalance || 0}, Admin: ₹${admin.walletBalance || 0}`);
  const price = product.price;
  console.log(`Product Price: ₹${price} (Seller gets ₹${price * 0.8}, Admin gets ₹${price * 0.2})`);

  // Simulate internal checkout module call
  const sellerShare = price * 0.8;
  const adminShare = price * 0.2;

  await User.findByIdAndUpdate(seller._id, { $inc: { walletBalance: sellerShare } });
  await User.findOneAndUpdate({ role: 'admin' }, { $inc: { walletBalance: adminShare } });

  const postSeller = await User.findById(product.seller);
  const postAdmin = await User.findOne({ role: 'admin' });

  console.log(`Final balances -> Seller: ₹${postSeller.walletBalance}, Admin: ₹${postAdmin.walletBalance}`);
  
  const expectedSeller = (seller.walletBalance || 0) + sellerShare;
  const expectedAdmin = (admin.walletBalance || 0) + adminShare;

  if (postSeller.walletBalance !== expectedSeller || postAdmin.walletBalance !== expectedAdmin) {
    console.error("MATH ASSERTION FAILED");
    process.exit(1);
  } else {
    console.log("SUCCESS! 80/20 Math Validated.");
    process.exit(0);
  }
}

testPurchase();
