const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyswap')
  .then(async () => {
    const admin = await User.findOne({ role: 'admin' });
    const payload = { user: { id: admin.id, role: admin.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    console.log('Fetching pending products...');
    const prodRes = await fetch('http://localhost:5000/api/admin/products/pending', { headers: { Authorization: `Bearer ${token}` } });
    console.log(await prodRes.json());
    
    console.log('Fetching users...');
    const userRes = await fetch('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
    console.log(await userRes.json());

    process.exit();
  });
