const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');

require('dotenv').config({ path: './.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const orders = await Order.find({ status: 'completed' }).populate('product');
  const validOrder = orders.find(o => o.product && o.product.seller);
  if(!validOrder) { console.log("no orders with seller"); process.exit(); }
  
  const sellerId = validOrder.product.seller;
  
  const sellerProducts = await Product.find({ seller: sellerId }, '_id');
  const productIds = sellerProducts.map(p => p._id);

  const salesOrders = await Order.find({ product: { $in: productIds }, status: 'completed' })
      .populate('product', 'title price')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .lean();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const compute = (since) => {
      const filtered = since ? salesOrders.filter(o => new Date(o.createdAt) >= since) : salesOrders;
      return {
        sales: filtered.length,
        earned: filtered.reduce((sum, o) => sum + Math.round((o.amount || o.product?.price || 0) * 0.8), 0)
      };
  };

  console.log("startOfToday:", startOfToday);
  console.log("startOfWeek:", startOfWeek);
  console.log("startOfMonth:", startOfMonth);
  
  console.log("Orders dates:", salesOrders.map(o => o.createdAt));
  
  console.log({
      allTime: compute(null),
      today: compute(startOfToday),
      weekly: compute(startOfWeek),
      monthly: compute(startOfMonth),
  });

  process.exit();
}
check();
