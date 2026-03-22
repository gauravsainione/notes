const express = require('express');
const router = express.Router();
const { getPendingProducts, approveProduct, rejectProduct, getDashboardStats, getUsers, blockUser, updateUser, getAllProducts, updateProduct, getOrders, deleteProduct, getPayoutRequests, handlePayout, getUserPayoutDetails, getManualGrantOptions, createManualGrant } = require('../controllers/adminController');
const { adminAuth } = require('../middleware/authMiddleware');

router.get('/products/pending', adminAuth, getPendingProducts);
router.get('/products', adminAuth, getAllProducts);

// Specific routes MUST come before generic :id routes
router.put('/products/:id/approve', adminAuth, approveProduct);
router.put('/products/:id/reject', adminAuth, rejectProduct);
router.put('/products/:id', adminAuth, updateProduct);
router.delete('/products/:id', adminAuth, deleteProduct);

router.get('/stats', adminAuth, getDashboardStats);

// User-specific routes before generic :id
router.get('/users/payout-details', adminAuth, getUserPayoutDetails);
router.get('/users', adminAuth, getUsers);
router.put('/users/:id/block', adminAuth, blockUser);
router.put('/users/:id', adminAuth, updateUser);

router.get('/orders', adminAuth, getOrders);
router.get('/manual-grants/options', adminAuth, getManualGrantOptions);
router.post('/manual-grants', adminAuth, createManualGrant);

// Payout management
router.get('/payouts', adminAuth, getPayoutRequests);
router.put('/payouts/:id', adminAuth, handlePayout);

module.exports = router;
