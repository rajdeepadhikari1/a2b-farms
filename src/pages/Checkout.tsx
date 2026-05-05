import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, cn } from '../lib/utils';
import { ChevronRight, Truck, Store, MapPin, ArrowRight, ShieldCheck, Lock, Loader2, CreditCard, Banknote } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useShop();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [deliveryType, setDeliveryType] = useState<'Delivery' | 'Pickup' | 'In-table'>('Delivery');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'eSewa'>('COD');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const orderId = `A2B-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const orderData = {
        userId: user?.uid || 'guest',
        items: cart,
        total: cartTotal,
        status: 'pending' as const,
        paymentMethod,
        paymentStatus: 'pending' as const,
        deliveryType,
        contact: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: deliveryType === 'Delivery' ? {
          line1: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: 'Nepal'
        } : undefined,
        createdAt: new Date().toISOString()
      };

      await dataService.createOrder(orderData);

      if (paymentMethod === 'eSewa') {
        initiateEsewaPayment(orderId, cartTotal);
        return; // Don't clear cart yet, wait for success redirect (though we don't have a backend callback here yet)
      }

      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const initiateEsewaPayment = (orderId: string, amount: number) => {
    const path = "https://uat.esewa.com.np/epay/main";
    const params = {
      amt: amount,
      psc: 0,
      pdc: 0,
      txAmt: 0,
      tAmt: amount,
      pid: orderId,
      scd: "EPAYTEST",
      su: `${window.location.origin}/order-success?q=su&oid=${orderId}&amt=${amount}`,
      fu: `${window.location.origin}/checkout?q=fu`
    };

    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", path);

    for (const key in params) {
      const hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("name", key);
      hiddenField.setAttribute("value", (params as any)[key]);
      form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
  };

  if (cart.length === 0) return (
    <div className="pt-40 pb-24 text-center container mx-auto px-4">
      <h2 className="text-3xl font-serif italic mb-6 text-stone-300">Your cart was empty.</h2>
      <Link to="/shop" className="bg-stone-900 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-green-800 transition-all">Start Shopping</Link>
    </div>
  );

  return (
    <div className="pt-32 pb-24 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-4xl font-serif font-bold italic tracking-tight mb-12 uppercase">{t('checkout.title')}</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-12">
            {/* Delivery Method */}
            <div className="bg-white p-8 border border-stone-200">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-8 border-b border-stone-100 pb-3">{t('checkout.deliveryMethod')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'Delivery', icon: Truck, label: t('checkout.shipToMe') },
                  { id: 'Pickup', icon: Store, label: t('checkout.storePickup') },
                  { id: 'In-table', icon: MapPin, label: t('checkout.dineIn') }
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setDeliveryType(method.id as any)}
                    className={cn(
                      "p-6 border-2 flex flex-col items-center gap-4 transition-all",
                      deliveryType === method.id 
                      ? 'border-stone-900 bg-stone-50' 
                      : 'border-stone-100 bg-white hover:border-stone-200'
                    )}
                  >
                    <method.icon className={cn("w-6 h-6", deliveryType === method.id ? 'text-stone-900' : 'text-stone-300')} />
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", deliveryType === method.id ? 'text-stone-900' : 'text-stone-400')}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white p-8 border border-stone-200">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-8 border-b border-stone-100 pb-3">{t('checkout.summary')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t('checkout.fullName')}</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t('checkout.email')}</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900" placeholder="john@example.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t('checkout.phone')}</label>
                  <input required type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900" placeholder="+977 98XXXXXXXX" />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {deliveryType === 'Delivery' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-8 border border-stone-200">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-8 border-b border-stone-100 pb-3">{t('checkout.shippingAddress')}</h2>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t('checkout.addressLine1')}</label>
                    <input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900" placeholder="Street name and number" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t('checkout.city')}</label>
                      <input required type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900" placeholder="Your City" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t('checkout.postalCode')}</label>
                      <input required type="text" value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900" placeholder="44600" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Method */}
            <div className="bg-white p-8 border border-stone-200">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-8 border-b border-stone-100 pb-3">{t('checkout.paymentMethod')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'COD', icon: Banknote, label: t('checkout.cod'), desc: 'Pay when delivered' },
                  { id: 'eSewa', icon: CreditCard, label: t('checkout.esewa'), desc: 'Nepal\'s Digital Wallet' }
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={cn(
                      "p-6 border-2 flex flex-col items-start gap-4 transition-all text-left",
                      paymentMethod === method.id 
                      ? 'border-stone-900 bg-stone-50' 
                      : 'border-stone-100 bg-white hover:border-stone-200'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <method.icon className={cn("w-6 h-6", paymentMethod === method.id ? 'text-stone-900' : 'text-stone-300')} />
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        paymentMethod === method.id ? 'border-stone-900' : 'border-stone-200'
                      )}>
                        {paymentMethod === method.id && <div className="w-2 h-2 rounded-full bg-stone-900" />}
                      </div>
                    </div>
                    <div>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest block mb-1", paymentMethod === method.id ? 'text-stone-900' : 'text-stone-400')}>
                        {method.label}
                      </span>
                      <span className="text-[10px] text-stone-400 leading-tight uppercase font-medium">{method.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 border border-stone-200 sticky top-32">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-8 border-b border-stone-100 pb-3">{t('checkout.orderSummary')}</h2>
              <div className="space-y-6 max-h-[300px] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-stone-50 shrink-0">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-[11px] font-bold text-stone-800 uppercase tracking-tight">{item.name}</h4>
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-stone-900">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-stone-100">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                  <span>{t('checkout.subtotal')}</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-stone-400">
                  <span>{t('checkout.shipping')}</span>
                  <span>{deliveryType === 'Delivery' ? 'Calculated' : 'Free'}</span>
                </div>
                <div className="flex justify-between text-lg font-serif font-bold italic text-stone-900 pt-3 border-t border-stone-200">
                  <span>{t('checkout.total')}</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <button
                disabled={isProcessing}
                className="w-full bg-stone-900 text-white py-5 text-xs font-black uppercase tracking-[0.2em] mt-8 hover:bg-green-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? t('checkout.processing') : (
                  <>
                    {t('checkout.placeOrder')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-8 flex items-center justify-center gap-4 text-[9px] uppercase tracking-widest font-black text-stone-300">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> {t('checkout.securePayment')}
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {t('checkout.verifiedFarm')}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
