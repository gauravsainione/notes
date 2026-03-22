const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const resolveStoredUploadPath = (storedPath = '') => {
  const relativePath = storedPath.replace(/^\/+/, '');
  return path.resolve(__dirname, '..', relativePath);
};

const checkout = async (req, res) => {
  try {
    const { productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product || product.type !== 'digital' || !product.isApproved || product.isDeleted) {
      return res.status(400).json({ message: 'Product not available for online purchase' });
    }
    if (product.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot buy your own product' });
    }

    const existingOrder = await Order.findOne({
      buyer: req.user.id,
      product: productId,
      status: 'completed'
    });
    if (existingOrder) {
      return res.status(400).json({ message: 'You have already purchased this product' });
    }

    const isFreeProduct = product.pricingType === 'free' || Number(product.price) <= 0;

    if (isFreeProduct) {
      const order = new Order({
        buyer: req.user.id,
        product: productId,
        amount: 0,
        status: 'completed',
        paymentId: `free_access_${Date.now()}`,
        financialsCounted: false
      });

      await order.save();

      return res.status(200).json({
        success: true,
        orderId: order._id,
        amount: 0,
        isFree: true
      });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(product.price * 100), // Amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create a pending order in our database
    const order = new Order({
      buyer: req.user.id,
      product: productId,
      amount: product.price,
      status: 'pending',
      paymentId: razorpayOrder.id 
    });
    
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrder,
      orderId: order._id,
      amount: product.price
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: 'Server error', error: err.message, details: err });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studySwapOrderId } = req.body;

    const order = await Order.findById(studySwapOrderId).populate('product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (order.status === 'completed') {
      return res.status(200).json({ success: true, message: 'Payment already verified' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order is no longer payable' });
    }
    if (!order.product || order.product.isDeleted || !order.product.isApproved) {
      order.status = 'failed';
      await order.save();
      return res.status(400).json({ success: false, message: 'Product is no longer available' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                    .update(body.toString())
                                    .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is successful
      order.status = 'completed';
      order.paymentId = razorpay_payment_id; // update to actual payment ID
      await order.save();

      // Distribute funds (80% seller, 20% admin platform fee)
      const sellerShare = Math.round(order.amount * 0.8 * 100) / 100;
      const adminShare = Math.round(order.amount * 0.2 * 100) / 100;

      await User.findByIdAndUpdate(order.product.seller, { $inc: { walletBalance: sellerShare } });
      await User.findOneAndUpdate({ role: 'admin' }, { $inc: { walletBalance: adminShare } });

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      order.status = 'failed';
      await order.save();
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id, status: 'completed' }).populate('product').sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Count seller's listings (exclude deleted)
    const totalListings = await Product.countDocuments({ seller: userId, isDeleted: false });
    const approvedListings = await Product.countDocuments({ seller: userId, isApproved: true, isDeleted: false });
    const pendingListings = await Product.countDocuments({ seller: userId, isApproved: false, isDeleted: false });

    // Find all products by this seller
    const sellerProducts = await Product.find({ seller: userId, isDeleted: false }, '_id');
    const productIds = sellerProducts.map(p => p._id);

    // Orders where the product belongs to this seller
    const salesOrders = await Order.find({ product: { $in: productIds }, status: 'completed', financialsCounted: true })
      .populate('product', 'title price')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const compute = (since) => {
      const filtered = since ? salesOrders.filter(o => new Date(o.createdAt) >= since) : salesOrders;
      return {
        sales: filtered.length,
        earned: filtered.reduce((sum, o) => sum + Math.round((o.amount || 0) * 0.8), 0)
      };
    };

    // Recent 5 sales
    const recentSales = salesOrders.slice(0, 5).map(o => ({
      _id: o._id,
      productTitle: o.product?.title || 'Deleted',
      amount: o.amount,
      buyerName: o.buyer?.name || 'Unknown',
      date: o.createdAt,
      yourShare: Math.round((o.amount || 0) * 0.8)
    }));

    res.json({
      totalListings,
      approvedListings,
      pendingListings,
      allTime: compute(null),
      today: compute(startOfToday),
      weekly: compute(startOfWeek),
      monthly: compute(startOfMonth),
      recentSales
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Secure viewer — only the buyer who owns the order can view the full PDF
const viewPurchasedFile = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('product');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Verify the authenticated user is the buyer
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You did not purchase this.' });
    }

    if (!order.product || !order.product.fileUrl) {
      return res.status(404).json({ message: 'File not found for this product' });
    }

    // Resolve file path on disk
    const filePath = resolveStoredUploadPath(order.product.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Stream the PDF inline (no download prompt)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    // Prevent caching to make it harder to save
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    console.error('View file error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMySales = async (req, res) => {
  try {
    const sellerProducts = await Product.find({ seller: req.user.id }, '_id');
    const productIds = sellerProducts.map(p => p._id);

    const salesOrders = await Order.find({ product: { $in: productIds }, status: 'completed', financialsCounted: true })
      .populate('product', 'title price')
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(salesOrders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { checkout, verifyPayment, getMyOrders, getMyStats, viewPurchasedFile, getMySales };
