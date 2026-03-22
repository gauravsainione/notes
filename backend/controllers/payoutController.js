const User = require('../models/User');
const Payout = require('../models/Payout');

// Save UPI details
const saveUpi = async (req, res) => {
  try {
    const { upiId, upiName } = req.body;
    if (!upiId || !upiName) return res.status(400).json({ message: 'UPI ID and Name are required' });

    const user = await User.findById(req.user.id);
    user.upiId = upiId;
    user.upiName = upiName;
    await user.save();
    res.json({ message: 'UPI details saved', upiId: user.upiId, upiName: user.upiName });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get UPI details
const getUpi = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('upiId upiName walletBalance');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Request payout (min ₹100)
const requestPayout = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.upiId || !user.upiName) {
      return res.status(400).json({ message: 'Please save your UPI details first' });
    }
    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum withdrawal is ₹100' });
    }
    if (amount > user.walletBalance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const payout = new Payout({
      user: req.user.id,
      amount,
      upiId: user.upiId,
      upiName: user.upiName
    });
    await payout.save();

    // Deduct balance immediately
    user.walletBalance -= amount;
    await user.save();

    res.status(201).json({ message: 'Payout request submitted', payout, newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get my payout requests
const getMyPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(payouts);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { saveUpi, getUpi, requestPayout, getMyPayouts };
