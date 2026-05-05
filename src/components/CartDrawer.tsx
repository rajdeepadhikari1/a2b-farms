import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useShop();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col"
          >
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif uppercase tracking-tight">Your Cart</h2>
                <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">{cart.length} Items</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-stone-300" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold italic">Your cart is empty</h3>
                    <p className="text-sm text-stone-500 mt-1">Looks like you haven't added any greens yet.</p>
                  </div>
                  <Link
                    to="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="text-stone-900 border-b-2 border-stone-900 pb-1 text-sm font-bold uppercase tracking-widest hover:text-green-700 hover:border-green-700 transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-24 h-24 bg-stone-100 shrink-0 overflow-hidden group">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between pt-1">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-stone-800 line-clamp-1 uppercase tracking-tight">{item.name}</h4>
                          <span className="text-sm font-bold text-stone-900">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">{item.category}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-stone-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-2 hover:bg-stone-50 border-r border-stone-200 text-stone-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-stone-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-stone-50 border-l border-stone-200 text-stone-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-stone-500 text-xs uppercase tracking-widest font-semibold">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-500 text-xs uppercase tracking-widest font-semibold">
                    <span>Estimated Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-900 text-lg font-bold font-serif italic pt-2 border-t border-stone-200">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-stone-900 text-white py-4 flex items-center justify-center gap-2 group hover:bg-green-800 transition-all uppercase tracking-widest text-xs font-bold"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full text-center text-[10px] text-stone-400 font-bold uppercase tracking-widest hover:text-stone-600 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
