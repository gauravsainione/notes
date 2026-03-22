const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mockUsers = [
  { name: 'Sarah Jenkins', email: 'sarah@university.edu', password: 'password123', role: 'student', location: 'Seattle', college: 'University of Washington' },
  { name: 'Rahul Sharma', email: 'rahul@tech.edu', password: 'password123', role: 'student', location: 'Noida', college: 'Amity University' }
];

const mockProducts = [
  {
    title: 'Advanced Data Structures completely highlighted (PDF)',
    description: 'High-quality scanned PDF of all my notes for Data Structures. Includes graphs, trees, DP and back-tracking heavily simplified.',
    price: 150, type: 'digital', category: 'Computer Science', fileUrl: '/uploads/mock-ds.pdf', location: 'Noida', isApproved: true
  },
  {
    title: 'Calculus Early Transcendentals 8th Edition',
    description: 'Physical book in great condition. No torn pages, some highlighting in chapter 4.',
    price: 800, type: 'physical', condition: 'good', category: 'Mathematics', location: 'Seattle', isApproved: true
  },
  {
    title: 'Organic Chemistry Revision Cheat Sheet',
    description: 'My personal handwritten cheat sheet for quick revision before exams. Covers all major reactions.',
    price: 99, type: 'digital', category: 'Chemistry', fileUrl: '/uploads/mock-chem.pdf', location: 'Seattle', isApproved: true
  },
  {
    title: 'Physics for Scientists and Engineers',
    description: 'Barely used physical textbook. Need to get rid of it fast.',
    price: 1200, type: 'physical', condition: 'new', category: 'Physics', location: 'Noida', isApproved: true
  },
  {
    title: 'Intro to Machine Learning Slides',
    description: 'Awesome compilation of slides and summaries for ML basics.',
    price: 250, type: 'digital', category: 'Computer Science', fileUrl: '/uploads/mock-ml.pdf', location: 'Noida', isApproved: true
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyswap')
  .then(async () => {
    console.log('Connected to DB. Seeding...');
    
    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash('password123', salt);

    let u1 = await User.findOne({ email: mockUsers[0].email });
    if (!u1) u1 = await User.create({ ...mockUsers[0], password: pwd });

    let u2 = await User.findOne({ email: mockUsers[1].email });
    if (!u2) u2 = await User.create({ ...mockUsers[1], password: pwd });

    for (let i = 0; i < mockProducts.length; i++) {
      const p = mockProducts[i];
      const exists = await Product.findOne({ title: p.title });
      if (!exists) {
        await Product.create({ ...p, seller: (i % 2 === 0 ? u1._id : u2._id) });
      }
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
