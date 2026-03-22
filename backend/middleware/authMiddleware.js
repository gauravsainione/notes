const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1] || req.query.token;
  
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('_id role isBlocked');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, async () => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin only' });
      }
      next();
    } catch (err) {
      res.status(500).json({ message: 'Server error verifying admin' });
    }
  });
};

const optionalAuth = async (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1] || req.query.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('_id role isBlocked');
    if (!user || user.isBlocked) {
      req.user = null;
      return next();
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch {
    req.user = null;
    next();
  }
};

module.exports = { auth, adminAuth, optionalAuth };
