/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase/config';
import { Product, Order, Story, BlogPost, Review, UserProfile, ContactMessage, StoryComment } from '../types';

// Cloudinary config - hardcoded here to avoid import issues
const CLOUDINARY_CLOUD_NAME = "dxbbz0b8m";
const CLOUDINARY_UPLOAD_PRESET = "a2b_farms_preset";

export const dataService = {
  // --- Products with Multiple Images (up to 5) ---
  async getProducts(category?: string) {
    try {
      const collRef = collection(db, 'products');
      let q = query(collRef, orderBy('createdAt', 'desc'));
      if (category && category !== 'All') {
        q = query(collRef, where('category', '==', category), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    } catch (e) { handleFirestoreError(e, 'list', 'products'); return []; }
  },

  async getProduct(id: string) {
    try {
      const docSnap = await getDoc(doc(db, 'products', id));
      if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as Product;
      return null;
    } catch (e) { handleFirestoreError(e, 'get', `products/${id}`); return null; }
  },

  // Updated: Accepts multiple image files (up to 5)
  async addProduct(product: Omit<Product, 'id'>, imageFiles?: File[]) {
    try {
      let imageUrls: string[] = product.images || [];
      
      // Upload multiple images (up to 5)
      if (imageFiles && imageFiles.length > 0) {
        // Limit to 5 images
        const filesToUpload = imageFiles.slice(0, 5);
        const uploadPromises = filesToUpload.map(file => 
          this.uploadImage(file, 'products')
        );
        imageUrls = await Promise.all(uploadPromises);
      }
      
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        images: imageUrls,
        createdAt: serverTimestamp(),
        stock: Number(product.stock),
        price: Number(product.price)
      });
      return docRef.id;
    } catch (e) { 
      handleFirestoreError(e, 'create', 'products'); 
      throw e;
    }
  },

  // Updated: Accepts multiple new image files
  async updateProduct(id: string, product: Partial<Product>, newImageFiles?: File[], imagesToRemove?: number[]) {
    try {
      const data: any = { ...product, updatedAt: serverTimestamp() };
      if (product.price) data.price = Number(product.price);
      if (product.stock !== undefined) data.stock = Number(product.stock);
      
      // Handle image updates
      let currentImages = product.images || [];
      
      // Remove images if specified
      if (imagesToRemove && imagesToRemove.length > 0) {
        currentImages = currentImages.filter((_, index) => !imagesToRemove.includes(index));
      }
      
      // Upload new images
      if (newImageFiles && newImageFiles.length > 0) {
        const filesToUpload = newImageFiles.slice(0, 5 - currentImages.length);
        const uploadPromises = filesToUpload.map(file => 
          this.uploadImage(file, 'products')
        );
        const newImageUrls = await Promise.all(uploadPromises);
        currentImages = [...currentImages, ...newImageUrls];
      }
      
      data.images = currentImages;
      
      await updateDoc(doc(db, 'products', id), data);
    } catch (e) { 
      handleFirestoreError(e, 'update', `products/${id}`); 
      throw e;
    }
  },

  async deleteProduct(id: string) {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) { 
      handleFirestoreError(e, 'delete', `products/${id}`); 
      throw e;
    }
  },

  // --- Reviews ---
  async getReviews(productId: string) {
    try {
      const q = query(collection(db, 'products', productId, 'reviews'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
    } catch (e) { 
      handleFirestoreError(e, 'list', `products/${productId}/reviews`); 
      return []; 
    }
  },

  async addReview(productId: string, review: Omit<Review, 'id' | 'createdAt'>) {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) throw new Error("Product does not exist");
      
      const data = productDoc.data();
      const currentRating = data.rating || 0;
      const currentCount = data.reviewCount || 0;
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + review.rating) / newCount;

      const reviewRef = await addDoc(collection(db, 'products', productId, 'reviews'), {
        ...review,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(productRef, {
        rating: newRating,
        reviewCount: newCount
      });
    } catch (e) { 
      handleFirestoreError(e, 'create', `products/${productId}/reviews`); 
      throw e;
    }
  },

  // --- Orders ---
  async createOrder(order: Omit<Order, 'id'>) {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) { 
      handleFirestoreError(e, 'create', 'orders'); 
      throw e;
    }
  },

  async getOrders() {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
    } catch (e) { 
      handleFirestoreError(e, 'list', 'orders'); 
      return []; 
    }
  },

  async getUserOrders(userId: string) {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
    } catch (e) { 
      handleFirestoreError(e, 'list', 'orders'); 
      return []; 
    }
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    try {
      await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
    } catch (e) { 
      handleFirestoreError(e, 'update', `orders/${id}`); 
      throw e;
    }
  },

  // --- Wishlist ---
  async toggleWishlist(userId: string, productId: string, isAdding: boolean) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, { wishlist: isAdding ? [productId] : [] }, { merge: true });
        return;
      }

      const currentWishlist = userDoc.data().wishlist || [];
      const newWishlist = isAdding 
        ? [...new Set([...currentWishlist, productId])]
        : currentWishlist.filter((id: string) => id !== productId);

      await updateDoc(userRef, { wishlist: newWishlist });
    } catch (e) { 
      handleFirestoreError(e, 'update', `users/${userId}`); 
      throw e;
    }
  },

  async getWishlist(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];
      const productIds = userDoc.data().wishlist || [];
      if (productIds.length === 0) return [];
      
      const collRef = collection(db, 'products');
      const q = query(collRef, where('__name__', 'in', productIds.slice(0, 30)));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    } catch (e) { 
      handleFirestoreError(e, 'get', `users/${userId}/wishlist`); 
      return []; 
    }
  },

  // --- User Profiles ---
  async getUserProfile(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
      return null;
    } catch (e) { 
      handleFirestoreError(e, 'get', `users/${userId}`); 
      return null; 
    }
  },

  // --- Stories with Social Features ---
  async getStories() {
    try {
      const now = new Date();
      const q = query(collection(db, 'stories'), where('expiresAt', '>', now), orderBy('expiresAt', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        const likes = data.likes || [];
        const comments = data.comments || [];
        return {
          id: doc.id,
          ...data,
          likes: likes,
          comments: comments,
          likeCount: likes.length,
          commentCount: comments.length
        } as Story;
      });
    } catch (e) { 
      handleFirestoreError(e, 'list', 'stories'); 
      return []; 
    }
  },

  async addStory(file: File, type: 'image' | 'video') {
    try {
      const url = await this.uploadImage(file, 'stories');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      await addDoc(collection(db, 'stories'), {
        url,
        type,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt)
      });
    } catch (e) { 
      handleFirestoreError(e, 'create', 'stories'); 
      throw e;
    }
  },

  async deleteStory(id: string) {
    try {
      await deleteDoc(doc(db, 'stories', id));
    } catch (e) { 
      handleFirestoreError(e, 'delete', `stories/${id}`); 
      throw e;
    }
  },

  // Like story using arrayUnion/arrayRemove
  async likeStory(storyId: string, userId: string) {
    try {
      if (!storyId || !userId) {
        throw new Error('Missing storyId or userId');
      }
      
      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story does not exist');
      }
      
      const currentLikes = storyDoc.data().likes || [];
      const isLiked = currentLikes.includes(userId);
      
      if (isLiked) {
        await updateDoc(storyRef, {
          likes: arrayRemove(userId)
        });
        return { liked: false, likeCount: currentLikes.length - 1 };
      } else {
        await updateDoc(storyRef, {
          likes: arrayUnion(userId)
        });
        return { liked: true, likeCount: currentLikes.length + 1 };
      }
    } catch (e) { 
      handleFirestoreError(e, 'update', `stories/${storyId}`); 
      throw e;
    }
  },

  // Comment story using subcollection
  async commentStory(storyId: string, userId: string, userName: string, commentText: string) {
    try {
      if (!storyId || !userId || !commentText.trim()) {
        throw new Error('Missing required fields for comment');
      }

      const storyRef = doc(db, 'stories', storyId);
      const storyDoc = await getDoc(storyRef);
      
      if (!storyDoc.exists()) {
        throw new Error('Story does not exist');
      }

      const commentRef = await addDoc(collection(db, 'stories', storyId, 'comments'), {
        userId: userId,
        userName: userName,
        comment: commentText.trim(),
        createdAt: serverTimestamp()
      });

      const currentComments = storyDoc.data().comments || [];
      await updateDoc(storyRef, {
        comments: [...currentComments, { id: commentRef.id, userId, userName, comment: commentText, createdAt: new Date() }]
      });

      return { success: true, commentId: commentRef.id };
    } catch (e) { 
      handleFirestoreError(e, 'update', `stories/${storyId}`); 
      throw e;
    }
  },

  // Get comments for a story
  async getStoryComments(storyId: string) {
    try {
      const commentsRef = collection(db, 'stories', storyId, 'comments');
      const q = query(commentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) { 
      handleFirestoreError(e, 'list', `stories/${storyId}/comments`); 
      return [];
    }
  },

  // Send message from story (goes to contacts collection)
  async replyToStory(storyId: string, name: string, email: string, message: string) {
    try {
      if (!storyId || !name || !email || !message) {
        throw new Error('Missing required fields');
      }

      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        subject: `Reply from Story`,
        message: `Story ID: ${storyId}\n\nMessage: ${message}`,
        status: 'new' as const,
        createdAt: serverTimestamp(),
        source: 'story',
        storyId: storyId
      });
    } catch (e) { 
      handleFirestoreError(e, 'create', 'contacts'); 
      throw e;
    }
  },

  // --- Blogs ---
  async getBlogs() {
    try {
      const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
    } catch (e) { 
      handleFirestoreError(e, 'list', 'blogs'); 
      return []; 
    }
  },

  async getBlog(id: string) {
    try {
      const docSnap = await getDoc(doc(db, 'blogs', id));
      if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as BlogPost;
      return null;
    } catch (e) { 
      handleFirestoreError(e, 'get', `blogs/${id}`); 
      return null; 
    }
  },

  async addBlog(blog: Omit<BlogPost, 'id'>, imageFile?: File) {
    try {
      let imageUrl = blog.image;
      if (imageFile) {
        imageUrl = await this.uploadImage(imageFile, 'blogs');
      }
      const docRef = await addDoc(collection(db, 'blogs'), {
        ...blog,
        image: imageUrl,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) { 
      handleFirestoreError(e, 'create', 'blogs'); 
      throw e;
    }
  },

  async updateBlog(id: string, blog: Partial<BlogPost>, imageFile?: File) {
    try {
      const data: any = { ...blog, updatedAt: serverTimestamp() };
      if (imageFile) {
        data.image = await this.uploadImage(imageFile, 'blogs');
      }
      await updateDoc(doc(db, 'blogs', id), data);
    } catch (e) { 
      handleFirestoreError(e, 'update', `blogs/${id}`); 
      throw e;
    }
  },

  async deleteBlog(id: string) {
    try {
      await deleteDoc(doc(db, 'blogs', id));
    } catch (e) { 
      handleFirestoreError(e, 'delete', `blogs/${id}`); 
      throw e;
    }
  },

  // --- Contacts ---
  async sendContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) {
    try {
      await addDoc(collection(db, 'contacts'), {
        ...message,
        status: 'new' as const,
        createdAt: serverTimestamp()
      });
    } catch (e) { 
      handleFirestoreError(e, 'create', 'contacts'); 
      throw e;
    }
  },

  async getContactMessages() {
    try {
      const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContactMessage[];
    } catch (e) { 
      handleFirestoreError(e, 'list', 'contacts'); 
      return []; 
    }
  },

  async replyToContactMessage(id: string, reply: string) {
    try {
      await updateDoc(doc(db, 'contacts', id), {
        reply,
        status: 'replied' as const,
        repliedAt: serverTimestamp()
      });
    } catch (e) { 
      handleFirestoreError(e, 'update', `contacts/${id}`); 
      throw e;
    }
  },

  // --- Helpers ---
  async uploadImage(file: File, folder: string) {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      console.error('Cloudinary config missing');
      throw new Error('Cloudinary configuration missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', `a2b_farms/${folder}`);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }
};

// Missing setDoc function
async function setDoc(docRef: any, data: any, options?: any) {
  const { setDoc } = await import('firebase/firestore');
  return setDoc(docRef, data, options);
}