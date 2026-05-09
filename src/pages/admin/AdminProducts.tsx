/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Filter,
  X,
  Upload,
  Loader2,
  Check,
  Image as ImageIcon,
  Trash,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Plants',
    description: '',
    stock: '',
    isOrganic: true
  });
  
  // Multiple Images State (up to 5)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<number[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_IMAGES = 5;

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const data = await dataService.getProducts();
    setProducts(data || []);
    setLoading(false);
  }

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        description: product.description,
        stock: (product as any).stock?.toString() || '0',
        isOrganic: (product as any).isOrganic ?? true
      });
      setExistingImages(product.images || []);
      setImagesToRemove([]);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: 'Plants',
        description: '',
        stock: '',
        isOrganic: true
      });
      setExistingImages([]);
      setImagesToRemove([]);
    }
    setImageFiles([]);
    setImagePreviews([]);
    setCurrentImageIndex(0);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dataService.deleteProduct(id);
      fetchProducts();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = MAX_IMAGES - (existingImages.length - imagesToRemove.length) - imageFiles.length;
    const newFiles = files.slice(0, remainingSlots);
    
    if (newFiles.length === 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setImagesToRemove(prev => [...prev, index]);
  };

  const handleRestoreExistingImage = (index: number) => {
    setImagesToRemove(prev => prev.filter(i => i !== index));
  };

  const getVisibleExistingImages = () => {
    return existingImages.filter((_, index) => !imagesToRemove.includes(index));
  };

  const getTotalImageCount = () => {
    return getVisibleExistingImages().length + imageFiles.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category as any,
      description: formData.description,
      stock: parseInt(formData.stock),
      isOrganic: formData.isOrganic,
      images: getVisibleExistingImages(),
      tags: []
    };

    try {
      if (editingProduct) {
        await dataService.updateProduct(
          editingProduct.id, 
          productData as Partial<Product>, 
          imageFiles.length > 0 ? imageFiles : undefined,
          imagesToRemove.length > 0 ? imagesToRemove : undefined
        );
      } else {
        if (imageFiles.length === 0) {
          throw new Error('Please upload at least one product image');
        }
        await dataService.addProduct(productData as unknown as Omit<Product, 'id'>, imageFiles);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold italic mb-2 text-stone-900">Inventory</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Manage your farm product catalog</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-stone-900 text-white px-6 md:px-8 py-3 md:py-4 text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-3"
        >
          <Plus className="w-4 h-4" /> Add New Item
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-stone-200 p-3 md:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
        <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-stone-50 border border-stone-100">
          <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none w-full py-1"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-stone-200 text-[10px] font-black uppercase tracking-widest hover:border-stone-900 transition-all">
          <Filter className="w-3 h-3" /> Filters
        </button>
      </div>

      {/* Product Table - Responsive with horizontal scroll */}
      <div className="bg-white border border-stone-200 overflow-x-auto">
        {loading ? (
          <div className="p-20 text-center space-y-4">
             <Loader2 className="w-8 h-8 animate-spin text-stone-300 mx-auto" />
             <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Syncing Catalog...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Product</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Category</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Price</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Stock</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors group">
                  <td className="px-4 md:px-8 py-4 md:py-6">
                    <div className="flex items-center gap-3 md:gap-5">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-stone-100 border border-stone-200 flex-shrink-0">
                        <img src={product.images?.[0] || '/placeholder.jpg'} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-stone-900 mb-1">{product.name}</p>
                        <p className="text-[9px] md:text-[10px] font-mono text-stone-400">ID: #{product.id.slice(0, 8)}</p>
                        {product.images && product.images.length > 1 && (
                          <p className="text-[8px] text-stone-400 mt-1">{product.images.length} images</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-500 bg-stone-100 px-2 md:px-3 py-1 border border-stone-200 whitespace-nowrap">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6">
                    <p className="text-xs font-bold text-stone-900 whitespace-nowrap">₹{product.price.toLocaleString()}</p>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6">
                    <div className="flex flex-col gap-2 min-w-[80px]">
                       <span className={cn(
                         "text-[9px] md:text-[10px] font-black uppercase tracking-widest",
                         (product as any).stock < 10 ? "text-amber-600" : "text-stone-400"
                       )}>
                         {(product as any).stock} Available
                       </span>
                       <div className="w-20 md:w-24 h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", (product as any).stock < 10 ? "bg-amber-500" : "bg-green-500")}
                            style={{ width: `${Math.min(((product as any).stock / 50) * 100, 100)}%` }}
                          />
                       </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 md:p-3 bg-white border border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-900 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 md:p-3 bg-white border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal - Mobile Responsive */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl rounded-lg"
            >
              <div className="p-4 sm:p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold italic tracking-tight">
                    {editingProduct ? 'Update Inventory' : 'Add New Product'}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">
                    Product Specification Entry
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 transition-colors rounded-full">
                  <X className="w-5 h-5 md:w-6 md:h-6 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  {/* Left Column: Media */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 block">
                      Product Images ({getTotalImageCount()}/{MAX_IMAGES})
                    </label>
                    
                    {/* Image Gallery Preview */}
                    {(getVisibleExistingImages().length > 0 || imagePreviews.length > 0) && (
                      <div className="relative">
                        <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                          {getVisibleExistingImages().length > 0 && currentImageIndex < getVisibleExistingImages().length ? (
                            <img 
                              src={getVisibleExistingImages()[currentImageIndex]} 
                              alt={`Product ${currentImageIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : imagePreviews.length > 0 && currentImageIndex >= getVisibleExistingImages().length ? (
                            <img 
                              src={imagePreviews[currentImageIndex - getVisibleExistingImages().length]} 
                              alt={`Preview ${currentImageIndex - getVisibleExistingImages().length + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        
                        {/* Navigation Arrows */}
                        {getTotalImageCount() > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                              className={cn(
                                "absolute left-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-all",
                                currentImageIndex === 0 && "opacity-50 cursor-not-allowed"
                              )}
                              disabled={currentImageIndex === 0}
                            >
                              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentImageIndex(prev => Math.min(getTotalImageCount() - 1, prev + 1))}
                              className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-all",
                                currentImageIndex === getTotalImageCount() - 1 && "opacity-50 cursor-not-allowed"
                              )}
                              disabled={currentImageIndex === getTotalImageCount() - 1}
                            >
                              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                          {currentImageIndex + 1} / {getTotalImageCount()}
                        </div>
                      </div>
                    )}

                    {/* Thumbnail Strip */}
                    {(getVisibleExistingImages().length > 0 || imagePreviews.length > 0) && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {getVisibleExistingImages().map((url, idx) => (
                          <div key={`existing-${idx}`} className="relative flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setCurrentImageIndex(idx)}
                              className={cn(
                                "w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden border-2",
                                currentImageIndex === idx ? "border-green-500" : "border-stone-200"
                              )}
                            >
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(idx)}
                              className="absolute -top-2 -right-2 p-0.5 md:p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Trash className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </button>
                          </div>
                        ))}
                        {imagePreviews.map((preview, idx) => (
                          <div key={`new-${idx}`} className="relative flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setCurrentImageIndex(getVisibleExistingImages().length + idx)}
                              className={cn(
                                "w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden border-2",
                                currentImageIndex === getVisibleExistingImages().length + idx ? "border-green-500" : "border-stone-200"
                              )}
                            >
                              <img src={preview} alt="" className="w-full h-full object-cover" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(idx)}
                              className="absolute -top-2 -right-2 p-0.5 md:p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <Trash className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Area */}
                    {getTotalImageCount() < MAX_IMAGES && (
                      <div
                        className="border-2 border-dashed border-stone-300 rounded-lg p-4 md:p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <input 
                          id="image-upload" 
                          type="file" 
                          accept="image/*" 
                          multiple
                          className="hidden" 
                          onChange={handleImageSelect}
                        />
                        <Upload className="w-6 h-6 md:w-8 md:h-8 text-stone-400 mx-auto mb-2" />
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-stone-500">
                          Upload {MAX_IMAGES - getTotalImageCount()} more image{MAX_IMAGES - getTotalImageCount() !== 1 ? 's' : ''}
                        </p>
                        <p className="text-[7px] md:text-[8px] text-stone-400 mt-1">PNG, JPG up to 5MB each</p>
                      </div>
                    )}

                    {/* Restore Removed Images */}
                    {imagesToRemove.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-[9px] md:text-[10px] font-bold text-amber-700 mb-2">Removed images:</p>
                        <div className="flex gap-2 flex-wrap">
                          {imagesToRemove.map((idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleRestoreExistingImage(idx)}
                              className="text-[8px] md:text-[9px] bg-white border border-amber-300 rounded-full px-2 py-1 text-amber-700 hover:bg-amber-100"
                            >
                              Restore image {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Data */}
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Product Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border border-stone-200 px-3 py-2.5 md:px-4 md:py-3 text-sm focus:outline-none focus:border-stone-900 bg-white"
                        placeholder="e.g. Rare Organic Succulent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Price (NPR)</label>
                        <input 
                          required
                          type="number" 
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full border border-stone-200 px-3 py-2.5 md:px-4 md:py-3 text-sm focus:outline-none focus:border-stone-900 bg-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Stock Units</label>
                        <input 
                          required
                          type="number" 
                          value={formData.stock}
                          onChange={(e) => setFormData({...formData, stock: e.target.value})}
                          className="w-full border border-stone-200 px-3 py-2.5 md:px-4 md:py-3 text-sm focus:outline-none focus:border-stone-900 bg-white"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Classification</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full border border-stone-200 px-3 py-2.5 md:px-4 md:py-3 text-sm focus:outline-none focus:border-stone-900 bg-white appearance-none"
                      >
                        <option value="Plants">Plants</option>
                        <option value="Seeds">Seeds</option>
                        <option value="Pots">Pots</option>
                        <option value="Care">Care & Tools</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, isOrganic: !formData.isOrganic})}
                        className={cn(
                          "w-10 h-6 rounded-full relative transition-colors",
                          formData.isOrganic ? "bg-green-600" : "bg-stone-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                          formData.isOrganic ? "left-5" : "left-1"
                        )} />
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">Organic Certified</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-stone-200 px-4 py-3 md:px-6 md:py-4 text-sm focus:outline-none focus:border-stone-900 bg-white resize-none"
                    placeholder="Describe the product origins and benefits..."
                  />
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-stone-100">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-stone-900 text-white py-3 md:py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> {editingProduct ? 'Commit Changes' : 'Initialize Product'}
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 md:px-8 py-3 md:py-4 border border-stone-200 text-[10px] font-black uppercase tracking-widest hover:border-stone-900 transition-all"
                  >
                    Discard
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}