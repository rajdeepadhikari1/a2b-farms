/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Upload, 
  Loader2, 
  Check,
  Calendar,
  User
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { BlogPost } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: 'A2B Editorial',
    category: 'Farming'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    setLoading(true);
    const data = await dataService.getBlogs();
    setBlogs(data || []);
    setLoading(false);
  }

  const handleOpenModal = (blog: BlogPost | null = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        title: blog.title,
        content: blog.content,
        author: blog.author || 'A2B Editorial',
        category: (blog as any).category || 'Farming'
      });
    } else {
      setEditingBlog(null);
      setFormData({
        title: '',
        content: '',
        author: 'A2B Editorial',
        category: 'Farming'
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      await dataService.deleteBlog(id);
      fetchBlogs();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const blogData = {
      title: formData.title,
      content: formData.content,
      author: formData.author,
      image: editingBlog?.image || ''
    };

    try {
      if (editingBlog) {
        await dataService.updateBlog(editingBlog.id, blogData, imageFile || undefined);
      } else {
        if (!imageFile) throw new Error('Cover image is required');
        await dataService.addBlog(blogData as unknown as Omit<BlogPost, 'id'>, imageFile);
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold italic mb-2 text-stone-900">Journal</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Content management and editorial</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-stone-900 text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-3"
        >
          <Plus className="w-4 h-4" /> Draft New Post
        </button>
      </div>

      <div className="bg-white border border-stone-200 p-4 flex items-center gap-6">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-stone-50 border border-stone-100">
          <Search className="w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search archives..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none w-full py-1"
          />
        </div>
      </div>

      <div className="bg-white border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
             <Loader2 className="w-8 h-8 animate-spin text-stone-300 mx-auto" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Publication</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Author</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors group">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-16 bg-stone-100 border border-stone-200 flex-shrink-0">
                        <img src={blog.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                      <div className="max-w-md">
                        <p className="text-sm font-serif font-bold italic text-stone-900 mb-1 leading-tight">{blog.title}</p>
                        <div className="flex items-center gap-3">
                           <Calendar className="w-3 h-3 text-stone-300" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">
                             {blog.createdAt ? new Date(blog.createdAt.seconds * 1000).toLocaleDateString() : 'Draft'}
                           </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-900 flex items-center justify-center">
                           <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{blog.author || 'Staff'}</span>
                     </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(blog)} className="p-3 bg-white border border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-900 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(blog.id)} className="p-3 bg-white border border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-600 transition-all">
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
              <div className="p-10 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-serif font-bold italic tracking-tight uppercase">{editingBlog ? 'Update Article' : 'New Publication'}</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-stone-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div 
                   onClick={() => document.getElementById('blog-image')?.click()}
                   className={cn(
                     "w-full h-64 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-4 bg-stone-50 cursor-pointer overflow-hidden transition-all",
                     imageFile || editingBlog?.image ? "border-stone-900 pt-0" : "hover:border-stone-400"
                   )}
                >
                    {imageFile ? (
                      <img src={URL.createObjectURL(imageFile)} alt="" className="w-full h-full object-cover" />
                    ) : editingBlog?.image ? (
                      <img src={editingBlog.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                         <Upload className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Upload Header Imagery</p>
                      </div>
                    )}
                </div>
                <input id="blog-image" type="file" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Post Title</label>
                     <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 bg-white" placeholder="Enter headline..." />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Author Name</label>
                     <input required type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 bg-white" />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Body Content</label>
                  <textarea required rows={12} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full border border-stone-200 px-6 py-6 text-sm focus:outline-none focus:border-stone-900 bg-white resize-none font-serif leading-relaxed" placeholder="Start writing the farm story..." />
                </div>

                <div className="pt-10 flex gap-4 border-t border-stone-100">
                  <button type="submit" disabled={isSubmitting} className="flex-1 bg-stone-900 text-white py-5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> {editingBlog ? 'Update Publication' : 'Release Post'}</>}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 border border-stone-200 text-[10px] font-black uppercase tracking-widest hover:border-stone-900 transition-all">Discard</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
