import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart, Share2 } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { useWishlist } from '../context/WishlistContext';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useShop();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: `${window.location.origin}/product/${product.id}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
      alert('Link copied to clipboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden mb-4">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </Link>

        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => toggleWishlist(product.id)}
            className={`p-3 bg-white shadow-sm transition-colors ${isInWishlist(product.id) ? 'text-red-500 bg-red-50' : 'text-stone-800 hover:bg-green-50 hover:text-green-700'}`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleShare}
            className="p-3 bg-white text-stone-800 shadow-sm hover:bg-green-50 hover:text-green-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <Link to={`/product/${product.id}`} className="p-3 bg-white text-stone-800 shadow-sm hover:bg-green-50 hover:text-green-700 transition-colors">
            <Eye className="w-4 h-4" />
          </Link>
        </div>

        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-0 left-0 right-0 bg-stone-900/90 text-white py-4 text-xs font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-sm flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          Add to Cart
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-tight group-hover:text-green-800 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm font-serif font-bold italic text-stone-600">{formatCurrency(product.price)}</p>
      </div>
    </motion.div>
  );
}
