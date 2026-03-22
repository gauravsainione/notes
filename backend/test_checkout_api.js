const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

async function run() {
  try {
    require('dotenv').config({ path: '.env' });
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyswap');
    
    // Load models
    require('./models/User');
    require('./models/Product');
    const User = mongoose.model('User');
    const Product = mongoose.model('Product');

    const user = await User.findOne({});
    if (!user) throw new Error('No user found');

    const product = await Product.findOne({ type: 'digital' });
    if (!product) throw new Error('No digital product found');

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'super_secret_jwt_key_demo');

    console.log('Sending request to /api/orders/checkout for product', product.title);
    const res = await axios.post('http://localhost:5000/api/orders/checkout', {
      productId: product._id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Response:', res.data);
  } catch (err) {
    console.error('API Request failed:', err.response ? err.response.data : err.message);
  } finally {
    await mongoose.disconnect();
  }
}
run();
