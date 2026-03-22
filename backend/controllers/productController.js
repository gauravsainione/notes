const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

const getOptionalUserIdFromRequest = (req) => {
  if (req.user?.id) {
    return req.user.id;
  }

  const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1] || req.query.token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.user.id;
  } catch {
    return null;
  }
};

const serializeProductWithReviewMeta = (product, viewerId = null) => {
  const reviews = (product.reviews || []).filter((review) => review && review.user).map((review) => ({
    ...review,
    isOwner: viewerId ? String(review.user) === String(viewerId) : false
  }));
  const comments = (product.comments || []).filter((comment) => comment && comment.user).map((comment) => ({
    ...comment,
    isOwner: viewerId ? String(comment.user) === String(viewerId) : false
  }));
  const averageRating = reviews.length
    ? Number((reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1))
    : 0;

  return {
    ...product,
    reviews,
    comments,
    reviewCount: reviews.length,
    commentCount: comments.length,
    averageRating
  };
};

const getProducts = async (req, res) => {
  try {
    const { location, type, category } = req.query;
    let query = { isApproved: true, isDeleted: false };

    if (location) query.location = new RegExp(location, 'i');
    if (type) query.type = type;
    if (category) query.category = new RegExp(category, 'i');

    const products = await Product.find(query).populate('seller', 'name college location').sort({ createdAt: -1 }).lean();
    res.json(products.map((product) => serializeProductWithReviewMeta(product)));
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email college location').lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.isApproved || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const viewerId = getOptionalUserIdFromRequest(req);
    let canReview = false;

    if (viewerId) {
      canReview = await Order.exists({
        buyer: viewerId,
        product: product._id,
        status: 'completed'
      });
    }

    const serializedProduct = serializeProductWithReviewMeta(product, viewerId);
    const existingReview = viewerId
      ? serializedProduct.reviews.find((review) => String(review.user) === String(viewerId)) || null
      : null;
    const existingComment = viewerId
      ? serializedProduct.comments.find((comment) => String(comment.user) === String(viewerId)) || null
      : null;

    res.json({
      ...serializedProduct,
      canReview: Boolean(canReview),
      canComment: Boolean(viewerId),
      existingReview,
      existingComment
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { title, description, price, pricingType, type, category, fileUrl, previewUrl, thumbnailUrl, condition, images, location } = req.body;
    
    // Fetch seller's location as fallback
    const user = await User.findById(req.user.id);

    const normalizedPricingType = pricingType === 'free' ? 'free' : 'paid';
    const normalizedPrice = normalizedPricingType === 'free' ? 0 : Math.max(Number(price) || 0, 0);

    const product = new Product({
      seller: req.user.id,
      title,
      description,
      price: normalizedPrice,
      pricingType: normalizedPricingType,
      type,
      category,
      fileUrl,
      previewUrl,
      thumbnailUrl,
      condition,
      images,
      location: location || user.location || ''
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id, isDeleted: false }).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }
    product.isDeleted = true;
    await product.save();
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this listing' });
    }
    const { title, price, pricingType, category, fileUrl, previewUrl, thumbnailUrl } = req.body;
    const normalizedPricingType = pricingType === 'free' ? 'free' : (pricingType === 'paid' ? 'paid' : product.pricingType);
    const normalizedPrice = normalizedPricingType === 'free' ? 0 : Math.max(Number(price ?? product.price) || 0, 0);
    
    // Check if anything actually changed
    const hasChanged = (title !== undefined && title !== product.title) || 
                       normalizedPrice !== product.price ||
                       normalizedPricingType !== product.pricingType ||
                       (category !== undefined && category !== product.category) ||
                       (fileUrl !== undefined && fileUrl !== product.fileUrl) ||
                       (previewUrl !== undefined && previewUrl !== product.previewUrl) ||
                       (thumbnailUrl !== undefined && thumbnailUrl !== product.thumbnailUrl);
    
    if (hasChanged) {
      if (title !== undefined) product.title = title;
      product.price = normalizedPrice;
      product.pricingType = normalizedPricingType;
      if (category !== undefined) product.category = category;
      if (fileUrl !== undefined) product.fileUrl = fileUrl;
      if (previewUrl !== undefined) product.previewUrl = previewUrl;
      if (thumbnailUrl !== undefined) product.thumbnailUrl = thumbnailUrl;
      product.isApproved = false; // re-approve required only on changes
      product.rejectionReason = '';
    }
    
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isApproved: true, isDeleted: false });
    res.json(categories.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const addOrUpdateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Please provide a rating between 1 and 5' });
    }

    const hasPurchased = await Order.exists({
      buyer: req.user.id,
      product: req.params.id,
      status: 'completed'
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: 'Only buyers can review this product' });
    }

    const user = await User.findById(req.user.id).select('name');
    const product = await Product.findById(req.params.id);

    if (!product || !product.isApproved || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    const existingReview = product.reviews.find((review) => review?.user && review.user.toString() === req.user.id);

    if (existingReview) {
      existingReview.rating = numericRating;
      existingReview.comment = (comment || '').trim();
      existingReview.userName = user?.name || existingReview.userName;
    } else {
      product.reviews.unshift({
        user: req.user.id,
        userName: user?.name || 'Student',
        rating: numericRating,
        comment: (comment || '').trim()
      });
    }

    await product.save();

    const serializedProduct = serializeProductWithReviewMeta(product.toObject(), req.user.id);
    const review = serializedProduct.reviews.find((item) => item?.user && String(item.user) === String(req.user.id));

    res.json({
      message: existingReview ? 'Review updated successfully' : 'Review added successfully',
      review,
      reviewCount: serializedProduct.reviewCount,
      averageRating: serializedProduct.averageRating
    });
  } catch (err) {
    console.error('Add/update review error:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const addOrUpdateComment = async (req, res) => {
  try {
    const commentText = (req.body.comment || '').trim();

    if (!commentText) {
      return res.status(400).json({ message: 'Please write a comment first' });
    }

    const user = await User.findById(req.user.id).select('name');
    const product = await Product.findById(req.params.id);

    if (!product || !product.isApproved || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!Array.isArray(product.comments)) {
      product.comments = [];
    }

    // Always add new comments at the end so discussion reads oldest to newest
    product.comments.push({
      user: req.user.id,
      userName: user?.name || 'Student',
      comment: commentText
    });

    await product.save();


    // Ensure we have a clean POJO for serialization to avoid Mongoose-specific spread issues
    const productObj = JSON.parse(JSON.stringify(product));
    const serializedProduct = serializeProductWithReviewMeta(productObj, req.user.id);
    
    const comment = serializedProduct.comments[serializedProduct.comments.length - 1];

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: comment || {
        user: req.user.id,
        userName: user?.name || 'Student',
        comment: commentText,
        isOwner: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      commentCount: serializedProduct.comments.length
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const updateComment = async (req, res) => {
  try {
    const { comment: commentText } = req.body;
    if (!commentText || !commentText.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const comment = product.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.comment = commentText.trim();
    await product.save();

    const productObj = JSON.parse(JSON.stringify(product));
    const serializedProduct = serializeProductWithReviewMeta(productObj, req.user.id);
    const updatedComment = (serializedProduct.comments || []).find(c => String(c._id) === String(req.params.commentId));

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (err) {
    console.error('Update comment error:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const comment = product.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    product.comments.pull(req.params.commentId);
    await product.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      commentCount: product.comments.length
    });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const getSellerInteractions = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id, isDeleted: false }).lean();
    let interactions = [];

    products.forEach(product => {
      // Add reviews
      if (product.reviews) {
        product.reviews.forEach(review => {
          interactions.push({
            type: 'review',
            productId: product._id,
            productTitle: product.title,
            interactionId: review._id,
            user: review.user,
            userName: review.userName,
            rating: review.rating,
            content: review.comment,
            reply: review.reply,
            replyAt: review.replyAt,
            createdAt: review.createdAt
          });
        });
      }

      // Add comments
      if (product.comments) {
        product.comments.forEach(comment => {
          interactions.push({
            type: 'comment',
            productId: product._id,
            productTitle: product.title,
            interactionId: comment._id,
            user: comment.user,
            userName: comment.userName,
            content: comment.comment,
            reply: comment.reply,
            replyAt: comment.replyAt,
            createdAt: comment.createdAt
          });
        });
      }
    });

    // Sort by newest first
    interactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(interactions);
  } catch (err) {
    console.error('Get seller interactions error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const replyToComment = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reply to this comment' });
    }

    if (!Array.isArray(product.comments)) {
      product.comments = [];
    }

    const comment = product.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.reply = reply.trim();
    comment.replyAt = new Date();
    await product.save();

    const serializedProduct = serializeProductWithReviewMeta(product.toObject(), req.user.id);
    const updatedComment = (serializedProduct.comments || []).find(
      (item) => String(item._id) === String(req.params.commentId)
    );

    res.json({
      success: true,
      message: 'Reply added successfully',
      comment: updatedComment || {
        _id: req.params.commentId,
        reply: reply.trim(),
        replyAt: new Date()
      }
    });
  } catch (err) {
    console.error('Reply to comment error:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};

const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reply to this review' });
    }

    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.reply = reply.trim();
    review.replyAt = new Date();
    await product.save();

    const serializedProduct = serializeProductWithReviewMeta(product.toObject(), req.user.id);
    const updatedReview = (serializedProduct.reviews || []).find(
      (item) => String(item._id) === String(req.params.reviewId)
    );

    res.json({
      success: true,
      message: 'Reply added successfully',
      review: updatedReview || {
        _id: req.params.reviewId,
        reply: reply.trim(),
        replyAt: new Date()
      }
    });
  } catch (err) {
    console.error('Reply to review error:', err);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
};


module.exports = { 
  getProducts, getProductById, createProduct, getMyProducts, deleteProduct, updateProduct, 
  getCategories, addOrUpdateReview, addOrUpdateComment, updateComment, deleteComment,
  getSellerInteractions, replyToComment, replyToReview
};
