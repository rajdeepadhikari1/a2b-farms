import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Search, Globe, ChevronRight } from 'lucide-react';
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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: t('nav.shopAll'), href: '/shop' },
    { name: t('nav.plants'), href: '/shop?category=Plants' },
    { name: t('nav.pots'), href: '/shop?category=Pots' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'हिंदी', native: 'हिंदी' },
    { code: 'ne', name: 'नेपाली', native: 'नेपाली' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        isScrolled ? 'bg-white/95 backdrop-blur-md py-2 md:py-3 border-stone-200 shadow-sm' : 'bg-white py-2 md:py-5 border-transparent',
        location.pathname !== '/' && !isScrolled && 'bg-white border-stone-200 shadow-sm'
      )}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between gap-3">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -ml-2 hover:bg-stone-100 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-stone-800" />
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-[11px] font-medium text-stone-600 hover:text-green-700 transition-colors uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Logo - Centered on mobile, left on desktop */}
            <Link 
              to="/" 
              className="flex items-center gap-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2"
            >
              <img 
                src="/logo.png" 
                alt="A2B Farms" 
                className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-full" 
                referrerPolicy="no-referrer" 
              />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm md:text-xl font-bold tracking-tighter text-stone-900 font-serif">A2B FARMS</span>
                <span className="text-[8px] md:text-[10px] text-stone-400 tracking-widest hidden md:block">LIVE FARM</span>
              </div>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Language Selector - Desktop */}
              <div className="relative hidden md:block">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors flex items-center gap-1"
                  aria-label="Select language"
                >
                  <Globe className="w-4 h-4 md:w-5 md:h-5 text-stone-600" />
                  <span className="text-[10px] font-black uppercase text-stone-400 hidden xl:block">{language.toUpperCase()}</span>
                </button>
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-36 bg-white border border-stone-100 shadow-xl overflow-hidden z-[80] rounded-lg"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as any);
                            setIsLangOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-colors",
                            language === lang.code ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-50"
                          )}
                        >
                          {lang.native}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Button */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5 text-stone-600" />
              </button>

              {/* User/Login Button */}
              <Link 
                to={user ? "/profile" : "/login"} 
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                aria-label={user ? "Profile" : "Login"}
              >
                <User className="w-4 h-4 md:w-5 md:h-5 text-stone-600" />
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors relative"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-stone-600" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-green-700 text-white text-[9px] md:text-[10px] font-bold min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[70] bg-white flex items-center justify-center px-4"
          >
            <div className="w-full max-w-4xl">
              <form onSubmit={handleSearch} className="flex items-center gap-4 border-b border-stone-200 pb-4">
                <Search className="w-6 h-6 md:w-8 md:h-8 text-stone-300" />
                <input
                  autoFocus
                  type="text"
                  placeholder={t('nav.search') || 'Search products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xl md:text-3xl lg:text-4xl font-serif text-stone-900 focus:outline-none placeholder:text-stone-200"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8 text-stone-400" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
            onClick={closeMenu}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Menu Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://res.cloudinary.com/dxbbz0b8m/image/upload/v1778228602/logo_su4gi9.png"
                    alt="A2B Farms" 
                    className="w-10 h-10 object-contain rounded-full"
                  />
                  <div>
                    <span className="text-lg font-bold tracking-tighter text-stone-900 font-serif block">A2B FARMS</span>
                    <span className="text-[8px] text-stone-400 tracking-widest">LIVE FARM</span>
                  </div>
                </div>
                <button 
                  onClick={closeMenu}
                  className="p-2 -mr-2 hover:bg-stone-100 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-stone-600" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4">
                {navLinks.map((link, index) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between px-5 py-4 border-b border-stone-50 hover:bg-stone-50 transition-colors group"
                  >
                    <span className="text-sm font-medium text-stone-800 uppercase tracking-wider group-hover:text-green-700 transition-colors">
                      {link.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-green-700 transition-colors" />
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Footer - Language Options */}
              <div className="p-5 border-t border-stone-100 bg-stone-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3">Language</p>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        closeMenu();
                      }}
                      className={cn(
                        "py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        language === lang.code 
                          ? "bg-stone-900 text-white shadow-md" 
                          : "bg-white border border-stone-200 text-stone-500 hover:border-stone-400"
                      )}
                    >
                      {lang.native}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Language Selector - Alternative (Bottom Sheet) */}
      {/* This only shows when lang selector is clicked on mobile */}
      <AnimatePresence>
        {isLangOpen && window.innerWidth < 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] bg-black/50 md:hidden"
            onClick={() => setIsLangOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest">Select Language</h3>
                <button onClick={() => setIsLangOpen(false)} className="p-1">
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as any);
                      setIsLangOpen(false);
                    }}
                    className={cn(
                      "w-full py-4 px-4 text-left text-sm font-medium rounded-xl transition-all",
                      language === lang.code 
                        ? "bg-stone-900 text-white" 
                        : "bg-stone-50 text-stone-700 hover:bg-stone-100"
                    )}
                  >
                    <div>
                      <span className="block">{lang.native}</span>
                      <span className="text-[10px] opacity-60">{lang.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}