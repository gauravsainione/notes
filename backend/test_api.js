const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });
const jwt = require('jsonwebtoken');

async function testApi() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'gauraddne@gmail.com' });
  const token = jwt.sign({ user: { id: user._id, role: user.role } }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

  try {
      const res = await axios.get('http://localhost:5000/api/orders/mystats', {
          headers: { 'x-auth-token': token }
      });
      console.log(res.data);
  } catch(e) {
      console.error(e.message);
  }
  process.exit();
}
testApi();
