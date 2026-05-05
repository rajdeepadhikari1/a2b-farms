import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { useShop } from '../context/ShopContext';
import { useLanguage } from '../context/LanguageContext';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useShop();
  const { t } = useLanguage();

  useEffect(() => {
    // If returning from eSewa success
    if (searchParams.get('q') === 'su') {
      clearCart();
    }
  }, [searchParams, clearCart]);

  return (
    <div className="pt-40 pb-24 min-h-screen bg-stone-50">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <motion.div
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="bg-white p-12 border border-stone-200 space-y-8"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-serif font-bold italic tracking-tight">{t('orderSuccess.title')}</h1>
            <p className="text-stone-500 uppercase tracking-widest text-[11px] font-bold">{t('orderSuccess.subtitle')}</p>
          </div>

          <div className="bg-stone-50 p-6 text-left space-y-4 border border-stone-100">
             <div className="flex gap-4 items-center">
                <Package className="w-5 h-5 text-stone-400" />
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-stone-900">{t('orderSuccess.processing')}</p>
                   <p className="text-[10px] text-stone-500">{t('orderSuccess.processingDesc')}</p>
                </div>
             </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed">
            {t('orderSuccess.confirmation')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              to="/shop" 
              className="flex-1 bg-stone-900 text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-green-800 transition-all flex items-center justify-center gap-2"
            >
              {t('orderSuccess.backToShop')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/" 
              className="flex-1 border border-stone-200 py-4 text-xs font-black uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> {t('nav.profile')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
