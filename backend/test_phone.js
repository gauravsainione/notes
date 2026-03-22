const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });
const authController = require('./controllers/authController');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // mock req, res
  const req = {
    body: {
      name: 'Test Phone User',
      email: `testphone${Date.now()}@example.com`,
      password: 'password123',
      role: 'student',
      location: 'Test City',
      phone: '1234567890'
    }
  };
  
  const res = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) {
      console.log('Registration Response:', JSON.stringify(data, null, 2));
    }
  };
  
  await authController.register(req, res);
  
  const savedUser = await User.findOne({ email: req.body.email });
  console.log('Saved to DB:', savedUser.name, savedUser.email, savedUser.phone);
  
  process.exit();
}

test().catch(console.error);
