import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Upload, ImageIcon, Video, Loader2 } from 'lucide-react';
import { Story } from '../types';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { cn } from '../lib/utils';

interface StoryBarProps {
  stories: Story[];
  onStoryClick: (index: number) => void;
  onStoryAdded?: () => void;
}

export default function StoryBar({ stories, onStoryClick, onStoryAdded }: StoryBarProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [uploading, setUploading] = useState(false);

  // Check if user is logged in via email (password provider)
  const isEmailUser = user?.providerData?.some(p => p.providerId === 'password');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      await dataService.addStory(file, mediaType);
      setIsModalOpen(false);
      setFile(null);
      if (onStoryAdded) onStoryAdded();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-8 border-b border-stone-100">
      <div className="flex gap-6 px-4 md:px-6 container mx-auto">
        {isEmailUser && (
          <div 
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center group-hover:border-stone-900 transition-colors">
              <Plus className="w-6 h-6 text-stone-400 group-hover:text-stone-900" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Add Story</span>
          </div>
        )}

        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStoryClick(index)}
            className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] bg-gradient-to-tr from-green-500 via-emerald-400 to-yellow-200">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                {story.type === 'video' ? (
                  <video
                    src={story.url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={story.url}
                    alt={`Story ${index}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-800 tracking-tighter">Live Farm</span>
          </motion.div>
        ))}
      </div>
      
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
                 <h2 className="text-lg md:text-xl font-serif font-bold italic tracking-tight uppercase">Share Your Farm Life</h2>
                 <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-stone-50 rounded-full transition-colors"
                 >
                  <X className="w-6 h-6 text-stone-400" />
                 </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 md:p-8 space-y-6">
                 <div className="flex gap-3 md:gap-4">
                    {['image', 'video'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMediaType(type as any)}
                        className={cn(
                          "flex-1 p-3 md:p-4 border transition-all flex flex-col items-center gap-2 group",
                          mediaType === type ? "bg-stone-900 border-stone-900 text-white" : "hover:border-stone-900 hover:text-stone-900"
                        )}
                      >
                         {type === 'image' ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                         <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{type}</span>
                      </button>
                    ))}
                 </div>

                 <div 
                   onClick={() => document.getElementById('frontend-story-file')?.click()}
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
                           <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest mt-1">Images or Videos</p>
                         </div>
                       </>
                    )}
                 </div>
                 <input 
                   type="file" 
                   id="frontend-story-file" 
                   className="hidden" 
                   accept={mediaType === 'video' ? "video/*" : "image/*"}
                   onChange={(e) => setFile(e.target.files?.[0] || null)} 
                 />

                 <div className="space-y-4">
                    <p className="text-[9px] font-medium text-stone-400 text-center leading-relaxed italic px-4">Your story will be shared with the A2B community for 24 hours.</p>
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
                      ) : 'Broadcast story'}
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
