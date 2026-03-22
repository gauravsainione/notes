const express = require('express');
const router = express.Router();
const { checkout, verifyPayment, getMyOrders, getMyStats, viewPurchasedFile, getMySales } = require('../controllers/orderController');
const { auth } = require('../middleware/authMiddleware');

router.post('/checkout', auth, checkout);
router.post('/verify-payment', auth, verifyPayment);
router.get('/myorders', auth, getMyOrders);
router.get('/mystats', auth, getMyStats);
router.get('/mysales', auth, getMySales);
router.get('/:orderId/view', auth, viewPurchasedFile);

module.exports = router;
