import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Filter, ChevronDown, LayoutGrid, List, Loader2, Search, X } from 'lucide-react';
import { CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import { dataService } from '../services/dataService';
import { Product } from '../types';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const searchParam = searchParams.get('search');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [priceRange, setPriceRange] = useState<string | null>(null);

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParam]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const data = await dataService.getProducts();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (categoryFilter && categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (priceRange) {
      if (priceRange === 'Under ₹500') result = result.filter(p => p.price < 500);
      if (priceRange === '₹500 - ₹1500') result = result.filter(p => p.price >= 500 && p.price <= 1500);
      if (priceRange === 'Over ₹1500') result = result.filter(p => p.price > 1500);
    }

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') result.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
    if (sortBy === 'popular') result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

    return result;
  }, [products, categoryFilter, sortBy, searchQuery, priceRange]);

  const clearFilters = () => {
    setSearchParams({});
    setSearchQuery('');
    setPriceRange(null);
    setSortBy('featured');
  };

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-stone-300" />
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Loading Farm Catalog...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-12 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                  <h1 className="text-5xl font-serif font-bold italic tracking-tight uppercase">
                    {categoryFilter || 'Shop All'}
                  </h1>
                  <p className="text-stone-500 uppercase tracking-widest text-[11px] font-bold">
                    Showing {filteredProducts.length} Results
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <input 
                      type="text"
                      placeholder="Search greens..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-50 border-b border-stone-200 py-2 pl-8 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-0 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-4 h-4 text-stone-400 hover:text-stone-900" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 border-b border-stone-200 pb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Sort By</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-xs font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest Arrival</option>
                      <option value="popular">Most Popular</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
              {/* Sidebar Filters */}
              <aside className="lg:w-64 shrink-0 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 pb-3">Collections</h3>
                  <ul className="space-y-4">
                    <li>
                      <button 
                        onClick={() => { setSearchParams({}); setSearchQuery(''); }}
                        className={`text-sm font-medium uppercase tracking-widest transition-colors ${!categoryFilter ? 'text-green-700 font-bold underline underline-offset-4' : 'text-stone-500 hover:text-stone-900'}`}
                      >
                        All Products
                      </button>
                    </li>
                    {CATEGORIES.map(cat => (
                      <li key={cat}>
                        <button 
                          onClick={() => setSearchParams({ category: cat })}
                          className={`text-sm font-medium uppercase tracking-widest transition-colors ${categoryFilter === cat ? 'text-green-700 font-bold underline underline-offset-4' : 'text-stone-500 hover:text-stone-900'}`}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 border-b border-stone-100 pb-3">Filters</h3>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-800 flex justify-between items-center">
                        Price Range
                        {priceRange && (
                          <button onClick={() => setPriceRange(null)} className="text-[9px] text-stone-400 hover:text-stone-900">Reset</button>
                        )}
                      </h4>
                      <div className="space-y-3">
                        {['Under ₹500', '₹500 - ₹1500', 'Over ₹1500'].map(range => (
                          <label key={range} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="price"
                              checked={priceRange === range}
                              onChange={() => setPriceRange(range)}
                              className="w-3 h-3 text-stone-900 border-stone-300 focus:ring-transparent" 
                            />
                            <span className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${priceRange === range ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'}`}>{range}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Product Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="py-24 text-center space-y-6">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto">
                      <Search className="w-8 h-8 text-stone-200" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-serif italic text-stone-400 leading-tight">No products found matching your criteria.</h2>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Try adjusting your filters or search query.</p>
                    </div>
                    <button 
                      onClick={clearFilters}
                      className="bg-stone-900 text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-green-800 transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
