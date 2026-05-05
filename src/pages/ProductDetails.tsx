import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Minus, Plus, Heart, Share2, ShieldCheck, Truck, RefreshCcw, ChevronRight, Loader2, Star, MessageSquare, Send, ZoomIn, X, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../lib/utils';
import ProductCard from '../components/ProductCard';
import { dataService } from '../services/dataService';
import { Product, Review } from '../types';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useShop();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Gallery states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  
  // Review form state
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const [prod, allProducts, prodReviews] = await Promise.all([
          dataService.getProduct(id),
          dataService.getProducts(),
          dataService.getReviews(id)
        ]);
        
        if (prod) {
          setProduct(prod);
          setReviews(prodReviews || []);
          setSelectedImageIndex(0);
          const related = allProducts?.filter(p => p.id !== id && p.category === prod.category).slice(0, 4) || [];
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleShare = async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) { console.error('Error sharing:', err); }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product || !newReview.comment.trim()) return;

    setSubmittingReview(true);
    try {
      const reviewData = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userPhoto: user.photoURL || '',
        rating: newReview.rating,
        comment: newReview.comment.trim()
      };
      
      await dataService.addReview(product.id, reviewData);
      
      const [updatedReviews, updatedProduct] = await Promise.all([
        dataService.getReviews(product.id),
        dataService.getProduct(product.id)
      ]);
      
      if (updatedReviews) setReviews(updatedReviews);
      if (updatedProduct) setProduct(updatedProduct);
      
      setNewReview({ rating: 5, comment: '' });
      setActiveTab('reviews');
    } catch (error) {
      console.error('Error adding review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePrevImage = () => {
    if (product && product.images) {
      setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (product && product.images) {
      setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
  };

  const openZoomModal = (index: number) => {
    setZoomImageIndex(index);
    setIsZoomModalOpen(true);
  };

  if (loading) return (
    <div className="pt-40 pb-24 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-stone-300" />
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Inspecting Quality...</p>
    </div>
  );

  if (!product) return (
    <div className="pt-40 pb-24 text-center">
      <h1 className="text-4xl font-serif italic">Product not found</h1>
      <Link to="/shop" className="mt-8 inline-block text-stone-900 border-b-2 border-stone-900 pb-1 text-sm font-black uppercase tracking-widest">Back to Shop</Link>
    </div>
  );

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="pt-24 pb-24">
      {/* Breadcrumbs */}
      <div className="bg-stone-50 py-4 mb-4">
        <div className="container mx-auto px-4 md:px-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
          <Link to="/" className="hover:text-stone-900 font-bold">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-stone-900 font-bold">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-900">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Images Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden group">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              
              {/* Navigation Arrows for Multiple Images */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}
              
              {/* Zoom Button */}
              <button
                onClick={() => openZoomModal(selectedImageIndex)}
                className="absolute bottom-4 right-4 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              
              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 left-4 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
            
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      "aspect-square bg-stone-100 overflow-hidden transition-all",
                      selectedImageIndex === idx 
                        ? "ring-2 ring-stone-900 ring-offset-1" 
                        : "opacity-60 hover:opacity-100"
                    )}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-1 uppercase tracking-widest ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{product.category}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight uppercase leading-[0.9]">{product.name}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-2xl font-serif font-bold italic text-stone-900">{formatCurrency(product.price)}</p>
                {product.rating && (
                  <div className="flex items-center gap-1 bg-stone-50 px-2 py-1">
                    <Star className="w-3 h-3 fill-stone-900 text-stone-900" />
                    <span className="text-[10px] font-bold">{product.rating.toFixed(1)}</span>
                    <span className="text-[9px] text-stone-400">({product.reviewCount} reviews)</span>
                  </div>
                )}
              </div>
              <p className="text-stone-600 text-sm leading-relaxed font-medium pt-4 border-t border-stone-100">
                {product.description}
              </p>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-6">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center border border-stone-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 px-5 hover:bg-stone-50 border-r border-stone-200 text-stone-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 text-sm font-bold text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 px-5 hover:bg-stone-50 border-l border-stone-200 text-stone-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => addToCart(product as any, quantity)}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-stone-900 text-white py-4.5 text-xs font-black uppercase tracking-[0.2em] hover:bg-green-800 transition-all flex items-center justify-center gap-3 disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
              
              {/* Wishlist & Share */}
              <div className="flex items-center gap-4 flex-wrap">
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex-1 border py-3 text-[10px] font-black uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-2 ${isInWishlist(product.id) ? 'bg-red-50 text-red-600 border-red-100 shadow-sm' : 'border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} /> 
                  {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 border border-stone-200 text-stone-600 py-3 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="pt-10">
              <div className="flex gap-10 border-b border-stone-100 mb-8 overflow-x-auto no-scrollbar">
                {['description', 'reviews', 'shipping', 'care'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${
                      activeTab === tab ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    {tab} {tab === 'reviews' && reviews.length > 0 ? `(${reviews.length})` : ''}
                    {activeTab === tab && (
                      <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
                    )}
                  </button>
                ))}
              </div>
              <div className="min-h-[150px] text-sm text-stone-600 leading-loose">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p>{product.description}</p>
                      {product.tags && product.tags.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {product.tags.map(tag => (
                            <span key={tag} className="bg-stone-50 text-stone-400 px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-stone-100">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                  {activeTab === 'reviews' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                      {/* Review List */}
                      <div className="space-y-10 max-h-[400px] overflow-y-auto pr-4">
                        {reviews.length === 0 ? (
                          <div className="text-center py-10 space-y-2">
                            <MessageSquare className="w-8 h-8 text-stone-200 mx-auto" />
                            <p className="text-stone-400 italic">No reviews yet. Be the first to share your experience!</p>
                          </div>
                        ) : (
                          reviews.map(review => (
                            <div key={review.id} className="space-y-3 border-b border-stone-50 pb-8 last:border-0">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                  {review.userPhoto ? (
                                    <img src={review.userPhoto} className="w-8 h-8 rounded-full object-cover border border-stone-100" alt="avatar" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-black uppercase text-stone-400">
                                      {review.userName?.charAt(0) || 'U'}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">{review.userName || 'Anonymous'}</p>
                                    <div className="flex gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-2.5 h-2.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-200'}`} />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[9px] text-stone-300 font-bold uppercase tracking-widest">
                                  {review.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                                </span>
                              </div>
                              <p className="text-xs text-stone-500 leading-relaxed italic">"{review.comment}"</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Review Form */}
                      <div className="pt-10 border-t border-stone-100">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-900 mb-6">Leave a Review</h4>
                        {user ? (
                          <form onSubmit={handleSubmitReview} className="space-y-6">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Rating</span>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className={`transition-transform hover:scale-110 ${star <= newReview.rating ? 'text-yellow-400' : 'text-stone-200'}`}
                                  >
                                    <Star className={`w-5 h-5 ${star <= newReview.rating ? 'fill-current' : ''}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="relative">
                              <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                placeholder="Your thoughts on this green..."
                                className="w-full bg-stone-50 border border-stone-200 p-4 text-xs focus:outline-none focus:border-stone-900 transition-colors min-h-[100px] font-medium"
                                required
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={submittingReview}
                              className="bg-stone-900 text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-800 transition-all flex items-center gap-3 disabled:bg-stone-300"
                            >
                              {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              Publish Review
                            </button>
                          </form>
                        ) : (
                          <div className="bg-stone-50 p-6 text-center rounded-sm">
                            <p className="text-xs text-stone-500 mb-4 italic">You must be logged in to leave a review.</p>
                            <Link to="/login" className="inline-block text-[10px] font-black uppercase tracking-widest border-b border-stone-900 pb-1">Login to Account</Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'shipping' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <ul className="space-y-4">
                        <li className="flex gap-3"><Truck className="w-5 h-5 text-stone-400 shrink-0" /> Free shipping on orders over ₹2000</li>
                        <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-stone-400 shrink-0" /> Secure packaging keeps your plant safe in transit</li>
                        <li className="flex gap-3"><RefreshCcw className="w-5 h-5 text-stone-400 shrink-0" /> 30-day return policy for unused accessories</li>
                      </ul>
                    </motion.div>
                  )}
                  {activeTab === 'care' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                      <p><strong>Light:</strong> Thrives in medium to bright indirect light.</p>
                      <p><strong>Water:</strong> Allow soil to dry out between waterings. Typically every 1-2 weeks.</p>
                      <p><strong>Humidity:</strong> Average home humidity is sufficient.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-40">
            <div className="flex items-center justify-between mb-16 border-b border-stone-100 pb-8 flex-wrap gap-4">
              <div className="space-y-1">
                <h2 className="text-4xl font-serif font-bold italic tracking-tight uppercase">You May Also Like</h2>
                <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-bold">Curated for your space</p>
              </div>
              <Link to="/shop" className="text-stone-900 text-xs font-black uppercase tracking-widest border-b-2 border-stone-900 pb-1">Shop Collections</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomModalOpen && (
          <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4">
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <img
                src={images[zoomImageIndex] || images[0]}
                alt="Zoomed product view"
                className="max-w-full max-h-[90vh] object-contain"
              />
              
              {/* Navigation in Zoom */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={() => setZoomImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setZoomImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                    {zoomImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}