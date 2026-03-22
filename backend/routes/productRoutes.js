const express = require('express');
const router = express.Router();
const { 
  getProducts, getProductById, createProduct, getMyProducts, deleteProduct, updateProduct, 
  getCategories, addOrUpdateReview, addOrUpdateComment, updateComment, deleteComment,
  getSellerInteractions, replyToComment, replyToReview
} = require('../controllers/productController');
const { auth, optionalAuth } = require('../middleware/authMiddleware');

router.get('/mine', auth, getMyProducts);
router.get('/interactions', auth, getSellerInteractions);
router.post('/:id/comments/:commentId/reply', auth, replyToComment);
router.post('/:id/reviews/:reviewId/reply', auth, replyToReview);
router.get('/categories', getCategories);
router.get('/', getProducts);

// Specific routes with IDs must come BEFORE generic /:id if they share a prefix (not applicable here as they have different segments, but good practice)
// Actually, in Express /:id and /:id/comments are distinct.
router.post('/:id/reviews', auth, addOrUpdateReview);
router.post('/:id/comments', auth, addOrUpdateComment);
router.put('/:id/comments/:commentId', auth, updateComment);
router.delete('/:id/comments/:commentId', auth, deleteComment);

// Generic ID routes
router.get('/:id', optionalAuth, getProductById);
router.delete('/:id', auth, deleteProduct);
router.put('/:id', auth, updateProduct);

// Root level creation
router.post('/', auth, createProduct);

module.exports = router;
