/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Clock, 
  Eye, 
  Plus, 
  X, 
  Loader2,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Story } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import StoryViewer from '../../components/StoryViewer';

export default function AdminStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    setLoading(true);
    const data = await dataService.getStories();
    setStories(data || []);
    setLoading(false);
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      await dataService.addStory(file, mediaType);
      setIsModalOpen(false);
      setFile(null);
      fetchStories();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      await dataService.deleteStory(id);
      fetchStories();
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold italic mb-2 text-stone-900">Life at Farm</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Temporary narratives and behind-the-scenes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-stone-900 text-white px-8 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-3"
        >
          <Camera className="w-4 h-4" /> Broadcast Story
        </button>
      </div>

      {loading ? (
        <div className="p-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-stone-300 mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {stories.map((story) => (
            <motion.div 
              key={story.id} 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border border-stone-200 aspect-[9/16] relative group overflow-hidden"
            >
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                {story.type === 'video' ? (
                  <video src={story.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
                ) : (
                  <img src={story.url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
                 <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/60">
                   <Clock className="w-3 h-3" /> 
                   {story.expiresAt ? Math.max(0, Math.ceil((new Date(story.expiresAt.seconds * 1000).getTime() - Date.now()) / (1000 * 60 * 60))) : 0}h left
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setViewerIndex(stories.indexOf(story))}
                      className="flex-1 bg-white/20 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-stone-900 p-2 transition-all"
                    >
                       <Eye className="w-3 h-3 mx-auto" />
                    </button>
                    <button 
                      onClick={() => handleDeleteStory(story.id)}
                      className="bg-red-500/20 backdrop-blur-md text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white p-2 transition-all"
                    >
                       <Trash2 className="w-3 h-3" />
                    </button>
                 </div>
              </div>
              <div className="absolute top-4 right-4">
                 <div className="bg-stone-900 p-1.5 border border-stone-800">
                    {story.type === 'video' ? <Video className="w-3 h-3 text-green-500" /> : <ImageIcon className="w-3 h-3 text-blue-500" />}
                 </div>
              </div>
            </motion.div>
          ))}
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-stone-200 aspect-[9/16] flex flex-col items-center justify-center gap-4 hover:border-stone-900 hover:bg-stone-50 transition-all group"
          >
             <div className="p-4 bg-white border border-stone-100 rounded-full group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-stone-400 group-hover:text-stone-900" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-stone-900">Add Story</p>
          </button>
        </div>
      )}

      <AnimatePresence>
        {viewerIndex !== null && (
          <StoryViewer 
            stories={stories} 
            initialIndex={viewerIndex} 
            onClose={() => setViewerIndex(null)} 
          />
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 1 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg border-t sm:border border-stone-200 overflow-hidden rounded-t-[2rem] sm:rounded-none max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-8 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
                 <h2 className="text-lg md:text-xl font-serif font-bold italic tracking-tight uppercase">Upload Narrative</h2>
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-stone-50 rounded-full transition-colors"
                 >
                  <X className="w-6 h-6 text-stone-400" />
                 </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 md:p-10 space-y-6 md:space-y-8">
                 <div className="flex gap-3 md:gap-4">
                    {['image', 'video'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMediaType(type as any)}
                        className={cn(
                          "flex-1 p-4 md:p-6 border transition-all flex flex-col items-center gap-2 md:gap-3 group",
                          mediaType === type ? "bg-stone-900 border-stone-900 text-white" : "hover:border-stone-900 hover:text-stone-900"
                        )}
                      >
                         {type === 'image' ? <ImageIcon className="w-4 h-4 md:w-5 md:h-5" /> : <Video className="w-4 h-4 md:w-5 md:h-5" />}
                         <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{type}</span>
                      </button>
                    ))}
                 </div>

                 <div 
                   onClick={() => document.getElementById('story-file')?.click()}
                   className={cn(
                     "aspect-[4/5] sm:aspect-[9/10] border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-4 bg-stone-50 cursor-pointer overflow-hidden transition-all",
                     file ? "border-stone-900" : "hover:border-stone-400"
                   )}
                 >
                    {file ? (
                      mediaType === 'video' ? (
                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                      ) : (
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      )
                    ) : (
                       <>
                         <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                           <Upload className="w-5 h-5 text-stone-400" />
                         </div>
                         <div className="text-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-stone-900">Select Media</p>
                           <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest mt-1">Click to Upload</p>
                         </div>
                       </>
                    )}
                 </div>
                 <input 
                   type="file" 
                   id="story-file" 
                   className="hidden" 
                   accept={mediaType === 'video' ? "video/*" : "image/*"}
                   onChange={(e) => setFile(e.target.files?.[0] || null)} 
                 />

                 <div className="pt-4 space-y-4">
                    <p className="text-[9px] font-medium text-stone-400 text-center leading-relaxed italic px-4">The story will be automatically purged from the frontend manifest after 24 chronological hours of broadcast.</p>
                    <button 
                      type="submit"
                      disabled={uploading || !file}
                      className="w-full bg-stone-900 text-white py-4 md:py-5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Broadcasting...</span>
                        </>
                      ) : 'Begin Broadcast'}
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
