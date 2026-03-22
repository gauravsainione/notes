const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Payout = require('../models/Payout');

const getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isApproved: false, rejectionReason: '', isDeleted: false }).populate('seller', 'name email').sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, rejectionReason: '' },
      { new: true, runValidators: false }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product approved successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectProduct = async (req, res) => {
  try {
    const { reason } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, rejectionReason: reason || 'No reason provided' },
      { new: true, runValidators: false }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product rejected', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments({ isDeleted: false });
    const pendingCount = await Product.countDocuments({ isApproved: false, rejectionReason: '', isDeleted: false });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allOrders = await Order.find({ status: 'completed', financialsCounted: true }, 'amount createdAt').sort({ createdAt: -1 });

    const compute = (since) => {
      const filtered = since ? allOrders.filter(o => new Date(o.createdAt) >= since) : allOrders;
      const count = filtered.length;
      const earnings = filtered.reduce((s, o) => s + (o.amount || 0), 0);
      const commission = Math.round(earnings * 0.2);
      return { orders: count, earnings, commission };
    };

    const allTime = compute(null);
    const today = compute(startOfToday);
    const weekly = compute(startOfWeek);
    const monthly = compute(startOfMonth);

    // Payout stats
    const allPayouts = await Payout.find({}, 'amount status').sort({ createdAt: -1 });
    const pendingPayouts = allPayouts.filter(p => p.status === 'pending');
    const completedPayouts = allPayouts.filter(p => p.status === 'completed');
    const pendingPayoutCount = pendingPayouts.length;
    const pendingPayoutAmount = pendingPayouts.reduce((s, p) => s + (p.amount || 0), 0);
    const totalPaidOut = completedPayouts.reduce((s, p) => s + (p.amount || 0), 0);

    res.json({
      users: usersCount,
      products: productsCount,
      pending: pendingCount,
      allTime,
      today,
      weekly,
      monthly,
      payouts: { pendingCount: pendingPayoutCount, pendingAmount: pendingPayoutAmount, totalPaidOut }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    // Attach active post count for each user
    const usersWithPosts = await Promise.all(users.map(async (u) => {
      const activePosts = await Product.countDocuments({ seller: u._id, isDeleted: false, isApproved: true });
      return { ...u, activePosts };
    }));
    res.json(usersWithPosts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.isBlocked = !user.isBlocked;
    await user.save();
    
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, location, phone, upiId, upiName, walletBalance } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (location !== undefined) user.location = location;
    if (phone !== undefined) user.phone = phone;
    if (upiId !== undefined) user.upiId = upiId;
    if (upiName !== undefined) user.upiName = upiName;
    if (walletBalance !== undefined) user.walletBalance = walletBalance;

    await user.save();

    // Keep pending payout requests aligned with the latest admin-edited payout details.
    if (upiId !== undefined || upiName !== undefined) {
      const payoutUpdate = {};
      if (upiId !== undefined) payoutUpdate.upiId = user.upiId;
      if (upiName !== undefined) payoutUpdate.upiName = user.upiName;

      await Payout.updateMany(
        { user: user._id, status: 'pending' },
        { $set: payoutUpdate }
      );
    }

    res.json({ message: 'User updated successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked, location: user.location, phone: user.phone, upiId: user.upiId, upiName: user.upiName, walletBalance: user.walletBalance } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // Include deleted products so admin can see them with "Deleted" tag
    const products = await Product.find().populate('seller', 'name email').sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'completed' })
      .populate('buyer', 'name email')
      .populate({ path: 'product', select: 'title seller type', populate: { path: 'seller', select: 'name email' } })
      .populate('manuallyGrantedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getManualGrantOptions = async (req, res) => {
  try {
    const [students, products] = await Promise.all([
      User.find({ role: 'student', isBlocked: false })
        .select('name email')
        .sort({ name: 1 })
        .lean(),
      Product.find({ type: 'digital', isApproved: true, isDeleted: false })
        .populate('seller', 'name email')
        .select('title category price seller')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    res.json({ students, products });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createManualGrant = async (req, res) => {
  try {
    const { buyerId, productId, note } = req.body;

    if (!buyerId || !productId) {
      return res.status(400).json({ message: 'Student and product are required' });
    }

    const [buyer, product] = await Promise.all([
      User.findById(buyerId),
      Product.findById(productId)
    ]);

    if (!buyer || buyer.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!product || product.type !== 'digital' || !product.isApproved || product.isDeleted) {
      return res.status(404).json({ message: 'Eligible digital product not found' });
    }

    const existingAccess = await Order.findOne({
      buyer: buyer._id,
      product: product._id,
      status: 'completed'
    });

    if (existingAccess) {
      return res.status(400).json({ message: 'This student already has access to the course' });
    }

    const order = await Order.create({
      buyer: buyer._id,
      product: product._id,
      amount: product.price,
      status: 'completed',
      paymentId: `MANUAL-${Date.now()}`,
      grantType: 'manual',
      financialsCounted: false,
      manualGrantNote: note || 'Manual course allocation by admin',
      manuallyGrantedBy: req.user.id
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email')
      .populate({ path: 'product', select: 'title seller type', populate: { path: 'seller', select: 'name email' } })
      .populate('manuallyGrantedBy', 'name email')
      .lean();

    res.status(201).json({ message: 'Course allocated to student successfully', order: populatedOrder });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.isDeleted = true;
    await product.save();
    res.json({ message: 'Product marked as deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Payout management
const getPayoutRequests = async (req, res) => {
  try {
    const payouts = await Payout.find().populate('user', 'name email upiId upiName').sort({ createdAt: -1 }).lean();
    res.json(payouts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const handlePayout = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ message: 'Payout not found' });

    if (payout.status !== 'pending') {
      return res.status(400).json({ message: 'Payout already processed' });
    }

    payout.status = status;
    if (status === 'rejected') {
      payout.rejectionReason = reason || 'No reason provided';
      const user = await User.findById(payout.user);
      user.walletBalance += payout.amount;
      await user.save();
    }
    await payout.save();

    res.json({ message: `Payout ${status}`, payout });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserPayoutDetails = async (req, res) => {
  try {
    const users = await User.find({ upiId: { $ne: '' } }).select('name email upiId upiName walletBalance').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  getPendingProducts, approveProduct, rejectProduct, getDashboardStats, getUsers, blockUser, updateUser, 
  getAllProducts, updateProduct, getOrders, deleteProduct,
  getPayoutRequests, handlePayout, getUserPayoutDetails,
  getManualGrantOptions, createManualGrant
};
