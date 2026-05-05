import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Search, Globe } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useShop();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.shopAll'), href: '/shop' },
    { name: t('nav.plants'), href: '/shop?category=Plants' },
    { name: t('nav.pots'), href: '/shop?category=Pots' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ne', name: 'नेपाली' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
      isScrolled ? 'bg-white/80 backdrop-blur-md py-3 border-stone-200' : 'bg-transparent py-5 border-transparent',
      location.pathname !== '/' && 'bg-white border-stone-200'
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <button
          className="lg:hidden p-2 -ml-2"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu className="w-6 h-6 text-stone-800" />
        </button>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-sm font-medium text-stone-600 hover:text-green-700 transition-colors uppercase tracking-widest"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <Link to="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <img src="/logo_a2b.jpeg" alt="A2B Farms" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
          <span className="text-2xl font-bold tracking-tighter text-stone-900 font-serif">A2B FARMS</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors flex items-center gap-1"
            >
              <Globe className="w-5 h-5 text-stone-600" />
              <span className="text-[10px] font-black uppercase text-stone-400 hidden md:block">{language}</span>
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-32 bg-white border border-stone-100 shadow-xl overflow-hidden z-[80]"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setIsLangOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors",
                        language === lang.code ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"
                      )}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <Search className="w-5 h-5 text-stone-600" />
          </button>
          <Link to={user ? "/profile" : "/login"} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <User className="w-5 h-5 text-stone-600" />
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors relative"
          >
            <ShoppingBag className="w-5 h-5 text-stone-600" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-green-700 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[70] bg-white flex items-center px-4 md:px-12"
          >
            <div className="container mx-auto">
              <form onSubmit={handleSearch} className="flex items-center gap-6">
                <Search className="w-8 h-8 text-stone-300" />
                <input
                  autoFocus
                  type="text"
                  placeholder={t('nav.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-2xl md:text-5xl font-serif italic text-stone-900 focus:outline-none placeholder:text-stone-100"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-4 hover:bg-stone-50 rounded-full transition-colors"
                >
                  <X className="w-8 h-8 text-stone-400" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-0 z-[60] bg-white lg:hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-12">
                <span className="text-xl font-bold font-serif">A2B FARMS</span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-medium text-stone-800"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-12 border-t border-stone-100 flex gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as any);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "flex-1 py-3 text-[10px] font-black uppercase tracking-widest border transition-all",
                      language === lang.code ? "bg-stone-900 border-stone-900 text-white" : "border-stone-200 text-stone-400"
                    )}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
