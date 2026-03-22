const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });
const jwt = require('jsonwebtoken');

async function testApi() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find an admin
  const admin = await User.findOne({ role: 'admin' });
  const adminToken = jwt.sign({ user: { id: admin._id, role: admin.role } }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

  // Find a student
  const student = await User.findOne({ role: 'student' });
  const studentId = student._id;

  try {
      console.log("Before state:", student.walletBalance);

      // Attempt to PUT walletBalance
      const res = await axios.put(`http://localhost:5000/api/admin/users/${studentId}`, {
          walletBalance: 9999
      }, {
          headers: { 'x-auth-token': adminToken }
      });
      console.log("Response:", res.data);

      // Re-fetch student directly from DB
      const updatedStudent = await User.findById(studentId);
      console.log("After state:", updatedStudent.walletBalance);
      
      // Cleanup
      await axios.put(`http://localhost:5000/api/admin/users/${studentId}`, { walletBalance: student.walletBalance }, { headers: { 'x-auth-token': adminToken } });

  } catch(e) {
      console.error(e.response ? e.response.data : e.message);
  }
  process.exit();
}
testApi();
