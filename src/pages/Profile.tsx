/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, Mail, Shield, Save, LogOut, ChevronRight, Package, Heart, History, Star, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { Order, Product } from '../types';
import { formatCurrency } from '../lib/utils';
import ProductCard from '../components/ProductCard';

export default function Profile() {
  const { user } = useAuth();
  const { wishlist } = useWishlist();
  const [displayName, setDisplayName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'wishlist'>('info');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'wishlist') fetchWishlist();
    }
  }, [user, activeTab]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dataService.getUserOrders(user.uid);
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setLoading(true);
    try {
      const allProducts = await dataService.getProducts();
      const filtered = allProducts.filter(p => wishlist.includes(p.id));
      setWishlistProducts(filtered);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(user, { displayName });
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          await updateDoc(userRef, { displayName });
        }
      } catch (dbError) {
        console.warn("Firestore update skipped");
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await authService.logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="pt-32 pb-24 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 space-y-4 shrink-0">
            <h1 className="text-3xl font-serif font-bold italic mb-8 uppercase">Account</h1>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center justify-between p-4 border transition-all group ${activeTab === 'info' ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-500 hover:text-stone-900'}`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Personal Info</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'info' ? 'text-white/50' : 'text-stone-300'}`} />
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-4 border transition-all group ${activeTab === 'orders' ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-500 hover:text-stone-900'}`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Order History</span>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'orders' ? 'text-white/50' : 'text-stone-300'}`} />
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center justify-between p-4 border transition-all group ${activeTab === 'wishlist' ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-500 hover:text-stone-900'}`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Wishlist</span>
                </div>
                <div className="flex items-center gap-4">
                  {wishlist.length > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === 'wishlist' ? 'bg-white text-stone-900' : 'bg-stone-100 text-stone-500'}`}>
                      {wishlist.length}
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'wishlist' ? 'text-white/50' : 'text-stone-300'}`} />
                </div>
              </button>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 border border-transparent hover:border-red-100 text-stone-400 hover:text-red-600 transition-all group mt-8"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
              </div>
            </button>
          </aside>

          {/* Main Content */}
          <div className="flex-1 bg-white p-6 md:p-12 border border-stone-200">
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-10">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 pb-4">Personal Information</h2>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                          <User className="w-3 h-3" /> Full Name
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 bg-white font-medium"
                          placeholder="Your Name"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                          <Mail className="w-3 h-3" /> Email Address
                        </label>
                        <div className="relative">
                          <input
                            disabled
                            type="email"
                            value={user.email || ''}
                            className="w-full border border-stone-100 px-4 py-3 text-sm text-stone-400 bg-stone-50 cursor-not-allowed font-medium"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Shield className="w-4 h-4 text-stone-300" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {message.text && (
                      <div className={`p-4 text-xs font-bold uppercase tracking-widest ${
                        message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {message.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-stone-900 text-white px-10 py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-green-800 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Profile
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 pb-4">Order History</h2>
                  
                  {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-stone-200" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Fetching past harvests...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-20 text-center space-y-6">
                      <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto">
                        <History className="w-8 h-8 text-stone-200" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-stone-400 italic font-serif">You haven't placed any orders yet.</p>
                      </div>
                      <Link to="/shop" className="inline-block bg-stone-900 text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-green-800 transition-all">
                        Discover Our Greens
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <div key={order.id} className="border border-stone-100 overflow-hidden group">
                          <div className="bg-stone-50 p-4 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-8">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Order ID</p>
                                <p className="text-xs font-black uppercase tracking-tight">#{order.id?.slice(-8)}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Date</p>
                                <p className="text-xs font-bold">{order.createdAt?.toDate().toLocaleDateString()}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Total</p>
                                <p className="text-xs font-black tracking-tight">{formatCurrency(order.total)}</p>
                              </div>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border ${
                              order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' : 
                              order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              'bg-stone-100 text-stone-500 border-stone-200'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="p-4 space-y-4">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-4">
                                <div className="w-12 h-16 bg-stone-100 shrink-0">
                                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-black uppercase tracking-tight">{item.name}</p>
                                  <p className="text-[10px] text-stone-400">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                                </div>
                                <Link to={`/product/${item.id}`} className="text-[9px] font-black uppercase tracking-widest border border-stone-200 px-3 py-1 hover:bg-stone-900 hover:text-white transition-all">
                                  Reorder
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 pb-4">Saved Plants</h2>
                  
                  {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-stone-200" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Checking your wishlist...</p>
                    </div>
                  ) : wishlistProducts.length === 0 ? (
                    <div className="py-20 text-center space-y-6">
                      <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto">
                        <Heart className="w-8 h-8 text-stone-200" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-stone-400 italic font-serif text-lg">Your wishlist is empty.</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Plants waiting for a home...</p>
                      </div>
                      <Link to="/shop" className="inline-block bg-stone-900 text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-green-800 transition-all">
                        Browse Catalog
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-12">
                      {wishlistProducts.map(product => (
                        <ProductCard key={product.id} product={product as any} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
