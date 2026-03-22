const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(compression());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/payout', require('./routes/payoutRoutes'));

// Block direct download of full PDF files — only previews are publicly accessible
app.use('/uploads', (req, res, next) => {
  // Allow preview and thumbnail files
  if (req.path.startsWith('/previews/') || req.path.startsWith('/thumbnails/')) {
    return next();
  }
  // Block PDF files (full notes) — these must be accessed via /api/orders/:id/view
  if (req.path.match(/\.(pdf)$/i)) {
    return res.status(403).json({ message: 'Direct PDF access is not allowed. Please purchase and use the viewer.' });
  }
  // Allow other files (images etc.)
  next();
});
app.use('/uploads', express.static(path.join(__dirname, '/uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

// Basic route
app.get('/', (req, res) => {
  res.send('StudySwap API is running');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studyswap')
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
