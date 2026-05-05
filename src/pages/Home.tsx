import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Leaf, Sparkles, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import StoryBar from '../components/StoryBar';
import StoryViewer from '../components/StoryViewer';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { Product, Story } from '../types';

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Home() {
  const { t } = useLanguage();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time stories listener
    const now = new Date();
    const q = query(
      collection(db, 'stories'), 
      where('expiresAt', '>', now), 
      orderBy('expiresAt', 'asc')
    );
    
    const unsubscribeStories = onSnapshot(q, (snapshot) => {
      const s = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Story[];
      setStories(s);
    }, (error) => {
      console.error('Error listening to stories:', error);
    });

    return () => unsubscribeStories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const p = await dataService.getProducts();
        setProducts(p || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const categories = [
    { name: 'Plants', image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=800&auto=format&fit=crop', count: 42 },
    { name: 'Seeds', image: 'https://homesteadandchill.com/wp-content/uploads/2020/08/seed-save-flowers-annuals-cosmos.jpg', count: 18 },
    { name: 'Pots', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop', count: 24 },
    { name: 'Care', image: 'https://bloomscape.com/wp-content/uploads/2020/11/bloomscape_jacks-classicote4-scaled.jpg?ver=337896', count: 12 },
  ];

  return (
    <div className="min-h-screen pt-20 lg:pt-24">
      {/* Story Bar */}
      <StoryBar 
        stories={stories} 
        onStoryClick={(index) => setSelectedStoryIndex(index)} 
      />

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=1920&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-900/10" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl text-white"
          >
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              {t('home.springCollection')}
            </span>
            <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tighter leading-[0.9] mb-8">
              {t('home.growYourOwn')} <br /> <span className="italic font-light">{t('home.sanctuary')}</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-100/90 mb-10 max-w-lg font-medium leading-relaxed">
              {t('home.heroDescription')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="bg-white text-stone-900 px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-all flex items-center gap-2 group"
              >
                {t('home.shopCollection')}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/blog"
                className="bg-transparent border border-white/50 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                {t('home.learnCare')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-serif font-bold italic tracking-tight">{t('home.shopByCategory')}</h2>
            <p className="text-stone-500 uppercase tracking-widest text-[11px] font-bold">{t('home.findPerfect')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/shop?category=${category.name}`}
                className="group block relative aspect-3/4 overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-10 left-10 text-white">
                  <h3 className="text-2xl font-serif font-bold italic mb-1">{category.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">{category.count} Products</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-16">
            <div className="space-y-4">
              <h2 className="text-4xl font-serif font-bold italic tracking-tight">{t('home.trendingNow')}</h2>
              <p className="text-stone-500 uppercase tracking-widest text-[11px] font-bold">{t('home.mostLoved')}</p>
            </div>
            <Link
              to="/shop"
              className="text-stone-900 border-b-2 border-stone-900 pb-1 text-xs font-bold uppercase tracking-widest hover:text-green-700 hover:border-green-700 transition-all"
            >
              {t('home.viewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-16 border-y border-stone-100 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            {[
              { icon: Truck, title: t('home.safeShipping'), desc: t('home.safeShippingDesc') },
              { icon: Sparkles, title: t('home.farmFresh'), desc: t('home.farmFreshDesc') },
              { icon: ShieldCheck, title: t('home.guarantee'), desc: t('home.guaranteeDesc') },
              { icon: Leaf, title: t('home.careGuide'), desc: t('home.careGuideDesc') }
            ].map((feature, i) => (
              <div key={i} className="space-y-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <feature.icon className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 uppercase tracking-widest text-[11px]">{feature.title}</h4>
                  <p className="text-stone-500 text-xs mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Viewer Overlay */}
      {selectedStoryIndex !== null && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </div>
  );
}