import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, MessageCircle, ShieldCheck, FileText, X, Eye, Heart, Bookmark, MessageSquare, Star, Share2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { getFavoriteIds, getBookmarkIds, toggleFavoriteId, toggleBookmarkId } from '../utils/savedCourses';
import PdfThumbnail from '../components/PdfThumbnail';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(320);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [commentForm, setCommentForm] = useState({ comment: '' });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [activeReplyTarget, setActiveReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const currentUserId = user?._id || user?.id;
  const canComment = Boolean(currentUserId);
  const sellerId = product?.seller?._id || product?.seller?.id;
  const isSeller = Boolean(currentUserId && sellerId && String(currentUserId) === String(sellerId));

  const onDocumentLoadSuccess = ({ numPages: pages }) => {
    setNumPages(pages);
  };

  useEffect(() => {
    const updatePreviewWidth = () => {
      const width = window.innerWidth < 640
        ? Math.max(window.innerWidth - 72, 220)
        : Math.min(window.innerWidth * 0.75, 800);
      setPreviewWidth(width);
    };

    updatePreviewWidth();
    window.addEventListener('resize', updatePreviewWidth);
    return () => window.removeEventListener('resize', updatePreviewWidth);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setIsFavorite(getFavoriteIds().includes(res.data._id));
        setIsBookmarked(getBookmarkIds().includes(res.data._id));
        if (res.data.existingReview) {
          setReviewForm({
            rating: res.data.existingReview.rating || 5,
            comment: res.data.existingReview.comment || ''
          });
          setEditingReview(false);
        } else {
          setReviewForm({ rating: 5, comment: '' });
          setEditingReview(false);
        }
        setCommentForm({ comment: '' });
        setEditingCommentId(null);
        setActiveReplyTarget(null);
        setReplyText('');
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [id, currentUserId]);

  useEffect(() => {
    if (location.hash === '#reviews') {
      requestAnimationFrame(() => {
        document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location.hash, product?._id]);

  if (!product) return <div className="p-16 text-center text-xl font-medium text-gray-500 animate-pulse">Loading details...</div>;

  const handleToggleFavorite = () => {
    const next = toggleFavoriteId(product._id);
    setIsFavorite(next);
    toast(next ? 'Added to favorites' : 'Removed from favorites', 'success');
  };

  const handleToggleBookmark = () => {
    const next = toggleBookmarkId(product._id);
    setIsBookmarked(next);
    toast(next ? 'Bookmarked for later' : 'Removed from bookmarks', 'success');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/product/${product._id}`;
    const shareData = {
      title: product.title,
      text: `Check out this course on NotesKart: ${product.title}`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast('Post link copied to clipboard', 'success');
        return;
      }

      toast('Sharing is not supported on this device', 'error');
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast('Failed to share post', 'error');
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setReviewSubmitting(true);
      const { data } = await api.post(`/products/${product._id}/reviews`, reviewForm);

      setProduct((prev) => {
        if (!prev) return prev;
        const existingReviews = prev.reviews || [];
        const nextReviews = existingReviews.some((review) => review.isOwner || String(review.user) === String(currentUserId))
          ? existingReviews.map((review) => (review.isOwner || String(review.user) === String(currentUserId) ? { ...review, ...data.review, isOwner: true } : review))
          : [data.review, ...existingReviews];

        return {
          ...prev,
          reviews: nextReviews,
          existingReview: { ...data.review, isOwner: true },
          reviewCount: data.reviewCount,
          averageRating: data.averageRating
        };
      });

      setEditingReview(true);
      toast(data.message || 'Review saved', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save review', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setCommentSubmitting(true);
      
      let res;
      if (editingCommentId) {
        res = await api.put(`/products/${product._id}/comments/${editingCommentId}`, commentForm);
      } else {
        res = await api.post(`/products/${product._id}/comments`, commentForm);
      }
      
      const { data } = res;

      setProduct((prev) => {
        if (!prev) return prev;
        const existingComments = prev.comments || [];
        
        let nextComments;
        if (editingCommentId) {
            // Update existing in list
            nextComments = existingComments.map(c => String(c._id) === String(editingCommentId) ? { ...c, ...data.comment, isOwner: true } : c);
        } else {
            nextComments = [...existingComments, data.comment];
        }

        return {
          ...prev,
          comments: nextComments,
          existingComment: data.comment,
          commentCount: data.commentCount || nextComments.length,
          canComment: true
        };
      });

      setCommentForm({ comment: '' }); // Clear form on success
      setEditingCommentId(null);
      toast(data.message || 'Comment saved', 'success');
    } catch (err) {
      console.error('Comment submission error:', err.response?.data || err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save comment';
      toast(errorMsg, 'error');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleReplySubmit = async (type, targetId) => {
    if (!isSeller) return;

    const trimmedReply = replyText.trim();
    if (!trimmedReply) {
      toast('Please write a reply first', 'error');
      return;
    }

    try {
      setReplySubmitting(true);
      const endpoint = type === 'review'
        ? `/products/${product._id}/reviews/${targetId}/reply`
        : `/products/${product._id}/comments/${targetId}/reply`;
      const { data } = await api.post(endpoint, { reply: trimmedReply });
      const updatedItem = type === 'review' ? data.review : data.comment;

      setProduct((prev) => {
        if (!prev) return prev;

        if (type === 'review') {
          return {
            ...prev,
            reviews: (prev.reviews || []).map((review) =>
              String(review._id) === String(targetId)
                ? { ...review, ...updatedItem }
                : review
            )
          };
        }

        return {
          ...prev,
          comments: (prev.comments || []).map((comment) =>
            String(comment._id) === String(targetId)
              ? { ...comment, ...updatedItem }
              : comment
          )
        };
      });

      setActiveReplyTarget(null);
      setReplyText('');
      toast(data.message || 'Reply saved', 'success');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save reply', 'error');
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await api.delete(`/products/${product._id}/comments/${commentId}`);
      
      setProduct((prev) => {
        if (!prev) return prev;
        const nextComments = (prev.comments || []).filter(c => String(c._id) !== String(commentId));
        return {
          ...prev,
          comments: nextComments,
          commentCount: data.commentCount || nextComments.length
        };
      });
      
      if (editingCommentId === commentId) {
          setEditingCommentId(null);
          setCommentForm({ comment: '' });
      }

      toast(data.message || 'Comment deleted', 'success');
    } catch (err) {
      console.error('Comment deletion error:', err.response?.data || err);
      toast(err.response?.data?.message || 'Failed to delete comment', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleAction = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (product.type === 'digital') {
      try {
        const { data } = await api.post('/orders/checkout', { productId: product._id });

        if (!data.success) {
          throw new Error('Failed to initialize checkout');
        }

        if (data.isFree) {
          toast('Free notes added to your orders.', 'success');
          navigate('/dashboard');
          return;
        }

        const options = {
          key: data.razorpayKeyId,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: 'NotesKart',
          description: `Purchase of ${product.title}`,
          order_id: data.razorpayOrder.id,
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/orders/verify-payment', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                studySwapOrderId: data.orderId
              });

              if (verifyRes.data.success) {
                toast('Purchase successful! Item added to your orders.', 'success');
                navigate('/dashboard');
              } else {
                toast('Payment verification failed.', 'error');
              }
            } catch (err) {
              toast('Payment verification failed.', 'error');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
          theme: {
            color: '#3b82f6'
          }
        };

        if (!window.Razorpay) {
          toast('Razorpay SDK failed to load. Please disable adblockers or hard refresh the page.', 'error');
          return;
        }

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast(`Payment failed. ${response.error.description}`, 'error');
        });
        rzp.open();
      } catch (err) {
        console.error('Checkout error details:', err.response?.data || err);
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
        toast(`Checkout failed: ${errorMsg}`, 'error');
      }
    } else {
      toast(`Connect with ${product.seller.name} via Email: ${product.seller.email}`, 'info', 6000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <button onClick={() => navigate(-1)} className="mb-5 flex items-center font-bold text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white sm:mb-6">
        Back
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden relative">
        <button onClick={() => navigate(-1)} className="absolute right-3 top-3 z-10 rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white sm:right-4 sm:top-4">
          <X className="w-5 h-5 sm:h-6 sm:w-6" />
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-8 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[400px] border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 relative">
            <div className="w-full text-center text-gray-400 mb-6">
              {product.images?.[0] ? (
                <img src={product.images[0]?.startsWith('/') ? product.images[0] : product.images[0]} alt="Product" className="max-h-96 w-full mx-auto rounded-xl shadow-md object-cover" />
              ) : product.thumbnailUrl ? (
                <div className="w-full overflow-hidden rounded-xl shadow-md">
                  <PdfThumbnail
                    src={product.thumbnailUrl}
                    title={product.title}
                    className="min-h-[320px] bg-white dark:bg-gray-900"
                    pageClassName="scale-[1.02] origin-top"
                  />
                </div>
              ) : (
                <FileText className="w-32 h-32 text-red-400 dark:text-red-500 mx-auto drop-shadow-sm" />
              )}
            </div>
            {product.type === 'digital' && product.previewUrl && (
              <button
                onClick={() => setShowDemo(true)}
                className="bg-white dark:bg-gray-800 px-6 py-3 rounded-xl shadow-sm hover:shadow-md text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-all inline-flex items-center space-x-2 border border-gray-200 dark:border-gray-700 mt-auto"
              >
                <Eye className="w-4 h-4" />
                <span>View Demo (First 5 Pages)</span>
              </button>
            )}
          </div>

          <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-center">
            <div className="inline-block px-4 py-1.5 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-full text-xs font-bold tracking-wider uppercase mb-4 sm:mb-5 w-max">
              {product.category}
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${isFavorite ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300' : 'border-gray-200 bg-white text-gray-700 hover:text-rose-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200'}`}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorited' : 'Add Favorite'}
              </button>
              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${isBookmarked ? 'border-primary-200 bg-primary-50 text-primary-600 dark:border-primary-900/50 dark:bg-primary-950/40 dark:text-primary-300' : 'border-gray-200 bg-white text-gray-700 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200'}`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-200"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>

            <h1 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:mb-5 sm:text-4xl lg:text-5xl">{product.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed font-medium">{product.description}</p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6 space-y-4 sm:space-y-0 mb-6 sm:mb-8 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Price</p>
                <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{product.pricingType === 'free' || Number(product.price) === 0 ? 'Free' : `Rs. ${product.price}`}</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">Seller</p>
                <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-green-500 mr-2" /> {product.seller.name}
                </div>
              </div>
            </div>

            <button
              onClick={handleAction}
              className="w-full py-4 px-6 text-white bg-primary-500 hover:bg-primary-600 rounded-xl font-bold text-lg shadow-md hover:shadow-xl transition-all hover:-translate-y-0.5 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 flex items-center justify-center space-x-2"
            >
              {product.type === 'digital' ? (
                <><ShoppingCart className="w-6 h-6" /> <span>{product.pricingType === 'free' || Number(product.price) === 0 ? 'Get Free Access' : 'Buy Now'}</span></>
              ) : (
                <><MessageCircle className="w-6 h-6" /> <span>Contact Seller</span></>
              )}
            </button>
            {product.type === 'digital' && product.previewUrl && (
              <button
                onClick={() => setShowDemo(true)}
                className="w-full mt-4 py-4 px-6 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl font-bold text-lg shadow-sm transition-all focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 flex items-center justify-center space-x-2"
              >
                <Eye className="w-6 h-6" />
                <span>View Demo Notes</span>
              </button>
            )}
            {product.type === 'physical' && (
              <p className="text-sm font-medium text-center text-gray-500 dark:text-gray-400 mt-5 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <span className="text-yellow-600 dark:text-yellow-500 font-bold mr-1">Note:</span> No online payment required for physical products. Deal locally via cash or UPI.
              </p>
            )}
          </div>
        </div>
      </div>

      <div id="reviews" className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500">Buyer Only</p>
              <h2 className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">Review & Feedback</h2>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-gray-900 dark:text-white">{product.averageRating ? product.averageRating.toFixed(1) : '0.0'}</div>
              <div className="mt-1 flex items-center justify-end gap-1 text-amber-400">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className={`h-4 w-4 ${index < Math.round(product.averageRating || 0) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{product.reviewCount || 0} review{product.reviewCount === 1 ? '' : 's'}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {(product.reviews || []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/40">
                <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-3 font-medium text-gray-500 dark:text-gray-400">No reviews yet. Buyers will see feedback here after sharing their experience.</p>
              </div>
            ) : (
              (product.reviews || []).map((review, index) => (
                <div key={review._id || `${review.user}-${index}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{review.userName}</p>
                      <p className="mt-1 text-xs font-medium text-gray-400">{new Date(review.updatedAt || review.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }, (_, starIndex) => (
                          <Star key={starIndex} className={`h-4 w-4 ${starIndex < review.rating ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        {review.isOwner && (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewForm({ rating: review.rating, comment: review.comment || '' });
                              setEditingReview(true);
                              document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-300"
                          >
                            Edit
                          </button>
                        )}
                        {isSeller && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReplyTarget({ type: 'review', id: review._id });
                              setReplyText(review.reply || '');
                            }}
                            className="text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300"
                          >
                            {review.reply ? 'Edit Reply' : 'Reply'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{review.comment || 'Shared a rating for this product.'}</p>
                  {isSeller && activeReplyTarget?.type === 'review' && String(activeReplyTarget.id) === String(review._id) && (
                    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Reply to review</label>
                      <textarea
                        rows="3"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                      />
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleReplySubmit('review', review._id)}
                          disabled={replySubmitting}
                          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                          {replySubmitting ? 'Saving...' : (review.reply ? 'Update Reply' : 'Post Reply')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReplyTarget(null);
                            setReplyText('');
                          }}
                          className="inline-flex items-center justify-center rounded-2xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {review.reply && (
                    <div className="mt-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50">
                      <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1.5 flex justify-between">
                        <span>Seller's Reply</span>
                        <span className="text-gray-400 dark:text-gray-500 font-bold normal-case">{review.replyAt ? new Date(review.replyAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">"{review.reply}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {product.canReview
                ? 'As a buyer, you can add or edit your review and feedback here.'
                : 'Only verified buyers can write or edit reviews after purchase or free access.'}
            </p>

            {product.canReview && (!product.existingReview || editingReview) ? (
              <form id="review-form" onSubmit={handleSubmitReview} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewForm((prev) => ({ ...prev, rating }))}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${reviewForm.rating === rating ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-300' : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'}`}
                      >
                        <Star className={`h-4 w-4 ${reviewForm.rating >= rating ? 'fill-current text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Feedback</label>
                  <textarea
                    rows="5"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your feedback as a buyer..."
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-primary-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reviewSubmitting ? 'Saving...' : (editingReview ? 'Edit Review & Feedback' : 'Submit Review & Feedback')}
                </button>
              </form>
            ) : product.canReview ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/40">
                <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-3 font-medium text-gray-500 dark:text-gray-400">You already added your review. Use the `Edit` button on your review card to update it.</p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/40">
                <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-3 font-medium text-gray-500 dark:text-gray-400">This section is only for buyers.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500">Everyone</p>
              <h2 className="mt-2 text-2xl font-extrabold text-gray-900 dark:text-white">Comments</h2>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{product.commentCount || 0} comment{product.commentCount === 1 ? '' : 's'}</p>
          </div>

          <div className="mt-6 space-y-4">
            {(product.comments || []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/40">
                <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-3 font-medium text-gray-500 dark:text-gray-400">No comments yet. Anyone logged in can comment here.</p>
              </div>
            ) : (
              (product.comments || []).map((comment, index) => (
                <div key={comment._id || `${comment.user}-${index}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{comment.userName}</p>
                      <p className="mt-1 text-xs font-medium text-gray-400">{new Date(comment.updatedAt || comment.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {comment.isOwner && (
                        <>
                          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">You</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCommentForm({ comment: comment.comment || '' });
                              setEditingCommentId(comment._id);
                              document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-300"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(comment._id)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {isSeller && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReplyTarget({ type: 'comment', id: comment._id });
                            setReplyText(comment.reply || '');
                          }}
                          className="text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300"
                        >
                          {comment.reply ? 'Edit Reply' : 'Reply'}
                        </button>
                      )}
                    </div>
                  </div>
                   <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{comment.comment}</p>
                   {isSeller && activeReplyTarget?.type === 'comment' && String(activeReplyTarget.id) === String(comment._id) && (
                    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/60">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Reply to comment</label>
                      <textarea
                        rows="3"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                      />
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleReplySubmit('comment', comment._id)}
                          disabled={replySubmitting}
                          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                          {replySubmitting ? 'Saving...' : (comment.reply ? 'Update Reply' : 'Post Reply')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReplyTarget(null);
                            setReplyText('');
                          }}
                          className="inline-flex items-center justify-center rounded-2xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                   {comment.reply && (
                    <div className="mt-4 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50">
                      <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1.5 flex justify-between">
                        <span>Seller's Reply</span>
                        <span className="text-gray-400 dark:text-gray-500 font-bold normal-case">{comment.replyAt ? new Date(comment.replyAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">"{comment.reply}"</p>
                    </div>
                  )}
                 </div>
              ))
            )}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {canComment
                ? 'Everyone can comment here for the seller. You can edit your own comment anytime.'
                : 'Log in to comment here.'}
            </p>

            {canComment ? (
              <form id="comment-form" onSubmit={handleSubmitComment} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Comment</label>
                  <textarea
                    rows="6"
                    value={commentForm.comment}
                    onChange={(e) => setCommentForm({ comment: e.target.value })}
                    placeholder="Write your comment for the seller..."
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  {commentSubmitting ? 'Saving...' : (editingCommentId ? 'Update Comment' : 'Post Comment')}
                </button>
                {editingCommentId && (
                  <button
                    type="button"
                    onClick={() => {
                        setEditingCommentId(null);
                        setCommentForm({ comment: '' });
                    }}
                    className="ml-3 inline-flex items-center justify-center rounded-2xl bg-gray-100 px-6 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                )}
              </form>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/40">
                <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-3 font-medium text-gray-500 dark:text-gray-400">Log in to post a comment.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {showDemo && product.previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4" onClick={() => setShowDemo(false)}>
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-2xl dark:bg-gray-800 sm:rounded-2xl" onClick={e => e.stopPropagation()} onContextMenu={e => e.preventDefault()}>
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-4 py-4 dark:border-gray-700 sm:px-6">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Demo Preview</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">First 5 pages of "{product.title}"</p>
              </div>
              <button onClick={() => setShowDemo(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto select-none bg-gray-100 p-3 dark:bg-gray-900 sm:p-4 md:p-8" style={{ minHeight: '60vh' }}>
              <Document
                file={product.previewUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="text-center text-gray-400 my-10 font-medium">Loading demo securely...</div>}
                error={<div className="text-center text-red-400 my-10 font-medium">Failed to load demo.</div>}
                className="flex flex-col items-center"
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <div key={`page_${index + 1}`} className="mb-6 shadow-xl relative">
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={previewWidth}
                    />
                    <div className="absolute inset-0 pointer-events-auto" onContextMenu={e => e.preventDefault()}></div>
                  </div>
                ))}
              </Document>
            </div>
            <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-900/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Like what you see? Buy the full notes!
              </p>
              <button
                onClick={() => { setShowDemo(false); handleAction(); }}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow-md sm:w-auto"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{product.pricingType === 'free' || Number(product.price) === 0 ? 'Get Free Access' : `Buy Now - Rs. ${product.price}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDeleteComment(confirmDeleteId)}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default ProductDetail;
