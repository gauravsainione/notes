const mongoose = require('mongoose');

async function run() {
  require('dotenv').config({ path: '.env' });
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyswap');
  
  require('./models/User');
  require('./models/Product');
  require('./models/Order');
  const User = mongoose.model('User');
  const Product = mongoose.model('Product');

  const user = await User.findOne({});
  const product = await Product.findOne({ type: 'digital' });

  const req = {
    body: { productId: product._id },
    user: { id: user._id }
  };

  const res = {
    status: function(code) { console.log("Status:", code); return this; },
    json: function(data) { console.log("JSON:", data); return this; }
  };

  const { checkout } = require('./controllers/orderController');
  
  console.log("Calling checkout directly...");
  await checkout(req, res);
  
  await mongoose.disconnect();
}
run();
