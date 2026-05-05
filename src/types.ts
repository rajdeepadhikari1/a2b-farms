/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Plants' | 'Seeds' | 'Pots' | 'Care' | 'Tools' | 'Organic Feed' | 'Fertilizers';
  images: string[];
  stock: number;
  tags: string[];
  rating?: number;
  reviewCount?: number;
  createdAt: any;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id?: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'COD' | 'eSewa';
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryType: 'Delivery' | 'Pickup' | 'In-table';
  shippingAddress?: {
    line1: string;
    city: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    name: string;
  };
  createdAt: any;
}

export interface Story {
  id: string;
  url: string;
  type: 'image' | 'video';
  expiresAt: any;
  createdAt: any;
  likes?: string[]; // Array of user IDs
  comments?: any[]; // Array of comment objects
  likeCount?: number; // Total number of likes
  commentCount?: number; // Total number of comments
}

export interface StoryComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  comment?: string; // Alias for text (for compatibility)
  createdAt: any;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  image: string;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  displayName?: string;
  photoURL?: string;
  wishlist?: string[]; // Array of product IDs
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  reply?: string;
  status: 'new' | 'replied';
  createdAt: any;
  repliedAt?: any;
  source?: string; // 'story' or 'contact'
  storyId?: string; // If source is 'story'
}