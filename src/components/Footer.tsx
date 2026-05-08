import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-stone-50 border-t border-stone-200 pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://res.cloudinary.com/dxbbz0b8m/image/upload/v1778228602/logo_su4gi9.png"
                alt="A2B Farms" 
                className="w-8 h-8 object-contain rounded-full" 
                referrerPolicy="no-referrer" 
              />
              <span className="text-xl font-bold tracking-tighter text-stone-900 font-serif">A2B FARMS</span>
            </Link>
            <p className="text-stone-600 text-sm leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4">
              <button className="p-2 bg-white border border-stone-200 rounded-full hover:bg-green-50 hover:border-green-200 transition-colors">
                <Instagram className="w-4 h-4 text-stone-600" />
              </button>
              <button className="p-2 bg-white border border-stone-200 rounded-full hover:bg-green-50 hover:border-green-200 transition-colors">
                <Twitter className="w-4 h-4 text-stone-600" />
              </button>
              <button className="p-2 bg-white border border-stone-200 rounded-full hover:bg-green-50 hover:border-green-200 transition-colors">
                <Facebook className="w-4 h-4 text-stone-600" />
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-6 italic">{t('footer.shop')}</h4>
            <ul className="space-y-4">
              {[t('nav.shopAll'), t('nav.plants'), t('nav.pots'), t('nav.blog')].map((item) => (
                <li key={item}>
                  <Link to="/shop" className="text-stone-500 hover:text-green-700 text-sm transition-colors uppercase tracking-widest text-[11px] font-semibold">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-6 italic">{t('footer.support')}</h4>
            <ul className="space-y-4">
              <li key="contact">
                <Link to="/contact" className="text-stone-500 hover:text-green-700 text-sm transition-colors uppercase tracking-widest text-[11px] font-semibold">
                  {t('footer.contact')}
                </Link>
              </li>
              {['Care Tips', 'Shipping Info', 'Returns', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-stone-500 hover:text-green-700 text-sm transition-colors uppercase tracking-widest text-[11px] font-semibold">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-bold mb-6 italic">{t('footer.newsletter')}</h4>
            <p className="text-stone-500 text-sm mb-4">{t('footer.newsletterDesc')}</p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                className="bg-white border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-green-700 transition-colors rounded-none"
              />
              <button className="bg-stone-900 text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-green-800 transition-colors rounded-none">
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone-400 text-[10px] uppercase tracking-widest font-medium">
            © {new Date().getFullYear()} A2B Farms. {t('footer.allRights')}
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-stone-400 hover:text-stone-600 text-[10px] uppercase tracking-widest font-medium">{t('footer.privacy')}</Link>
            <Link to="#" className="text-stone-400 hover:text-stone-600 text-[10px] uppercase tracking-widest font-medium">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
