import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dataService } from '../services/dataService';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    async function fetchWishlist() {
      if (user) {
        const profile = await dataService.getUserProfile(user.uid);
        if (profile?.wishlist) {
          setWishlist(profile.wishlist);
        }
      } else {
        setWishlist([]);
      }
    }
    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) return;
    
    const isAdding = !wishlist.includes(productId);
    
    // Optimistic update
    if (isAdding) {
      setWishlist(prev => [...prev, productId]);
    } else {
      setWishlist(prev => prev.filter(id => id !== productId));
    }

    try {
      await dataService.toggleWishlist(user.uid, productId, isAdding);
    } catch (error) {
      // Rollback on error
      if (isAdding) {
        setWishlist(prev => prev.filter(id => id !== productId));
      } else {
        setWishlist(prev => [...prev, productId]);
      }
      console.error('Error toggling wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
