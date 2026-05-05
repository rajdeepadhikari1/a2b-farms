import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Send, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { Story, StoryComment } from '../types';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (showComments && currentStory) {
      fetchComments();
    }
  }, [showComments, currentStory?.id]);

  const fetchComments = async () => {
    if (!currentStory) return;
    setLoadingComments(true);
    try {
      const fetchedComments = await dataService.getStoryComments(currentStory.id);
      setComments(fetchedComments as StoryComment[]);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setComments([]);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [currentIndex, stories.length, onClose, showComments]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      setShowComments(false);
      setComments([]);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      setShowComments(false);
      setComments([]);
    }
  };

  const handleLike = async () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await dataService.likeStory(currentStory.id, user.uid);
      console.log('Like result:', result);
    } catch (err) {
      console.error('Error liking story:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }

    setIsSending(true);
    try {
      await dataService.replyToStory(
        currentStory.id,
        user.displayName || user.email?.split('@')[0] || 'User',
        user.email || 'user@example.com',
        message
      );
      setMessage('');
      alert('Message sent to admin!');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }

    try {
      await dataService.commentStory(
        currentStory.id,
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'Anonymous',
        commentText
      );
      setCommentText('');
      await fetchComments();
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment. Please try again.');
    }
  };

  const handleShare = () => {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }
    const shareUrl = `${window.location.origin}/stories?id=${currentStory.id}`;
    if (navigator.share) {
      navigator.share({
        title: 'A2B Farms Story',
        text: 'Check out this story from A2B Farms!',
        url: shareUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (window.confirm('Delete this story?')) {
      await dataService.deleteStory(currentStory.id);
      handleNext();
    }
  };

  const getLikeCount = () => {
    if (currentStory.likes) {
      return Array.isArray(currentStory.likes) ? currentStory.likes.length : 0;
    }
    return currentStory.likeCount || 0;
  };

  const isLikedByUser = () => {
    if (!user) return false;
    if (currentStory.likes) {
      return Array.isArray(currentStory.likes) && currentStory.likes.includes(user.uid);
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      {/* Progress Bars */}
      <div className="absolute top-4 left-0 right-0 z-50 flex gap-1 px-4">
        {stories.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Top Header Buttons */}
      <div className="absolute top-8 left-0 right-0 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-white/50 overflow-hidden bg-white/10">
            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-white text-sm font-bold uppercase tracking-widest block leading-none">A2B Farms</span>
            <span className="text-[10px] text-white/60 uppercase tracking-widest font-black">Live Farm</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-red-500/40 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Story Content Area - Full fit photo */}
      <div className="relative w-full max-w-lg h-full sm:h-[90vh] sm:rounded-2xl bg-black shadow-2xl overflow-hidden flex flex-col">
        {/* Image/Video Container - Full screen with object-cover */}
        <div className="relative flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStory.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {currentStory.type === 'video' ? (
                <video
                  src={currentStory.url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleNext}
                />
              ) : (
                <img
                  src={currentStory.url}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  alt="Story"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />

          {/* Navigation Click Targets */}
          <div
            className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer"
            onClick={handlePrev}
          />
          <div
            className="absolute inset-y-0 right-0 w-1/3 z-40 cursor-pointer"
            onClick={handleNext}
          />

          {/* Interaction Overlay Buttons */}
          <div className="absolute right-4 bottom-24 z-50 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  "p-3 rounded-full bg-black/40 backdrop-blur-md transition-all active:scale-90",
                  isLikedByUser() ? "text-red-500" : "text-white"
                )}
              >
                <Heart className={cn("w-6 h-6", isLikedByUser() && "fill-current")} />
              </button>
              <span className="text-[10px] text-white font-black uppercase tracking-tighter shadow-sm drop-shadow-lg">{getLikeCount()}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setShowComments(!showComments)}
                className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white transition-all active:scale-90"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
              <span className="text-[10px] text-white font-black uppercase tracking-tighter shadow-sm drop-shadow-lg">{comments.length || currentStory.commentCount || 0}</span>
            </div>

            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white transition-all active:scale-90"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>

          {/* User Info Overlay */}
          <div className="absolute bottom-24 left-4 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-white/50 overflow-hidden bg-white/10">
                <img src="/favicon.ico" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-white text-sm font-bold uppercase tracking-widest block leading-none drop-shadow-lg">A2B Farms</span>
                <span className="text-[10px] text-white/80 uppercase tracking-widest font-black drop-shadow-lg">Live Farm</span>
              </div>
            </div>
          </div>

          {/* Comments Panel */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-lg flex flex-col"
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Comments</h3>
                  <button onClick={() => setShowComments(false)} className="text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {loadingComments ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <MessageSquare className="w-8 h-8 text-white mb-2" />
                      <p className="text-[10px] text-white uppercase tracking-widest font-black">No comments yet</p>
                      <p className="text-[8px] text-white/60 mt-1">Be the first to comment!</p>
                    </div>
                  ) : (
                    comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-700 shrink-0 overflow-hidden">
                          {comment.userPhoto ? (
                            <img src={comment.userPhoto} className="w-full h-full object-cover" alt="avatar" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                              {(comment.userName || 'U')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">{comment.userName || 'Anonymous'}</p>
                          <p className="text-sm text-white/80 leading-relaxed mt-1 font-light">{comment.comment || comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostComment} className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-white/10 border-none rounded-full px-4 py-2 text-sm text-white placeholder-white/40 focus:ring-0 focus:outline-none"
                  />
                  <button type="submit" className="p-2 text-white disabled:opacity-50 transition-all active:scale-90" disabled={!commentText.trim()}>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Message Input - ALWAYS VISIBLE */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-black/60 to-transparent relative z-50 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send message to A2B Farms..."
                className="w-full bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-5 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/50 focus:bg-black/60 transition-all"
                onFocus={() => setShowComments(false)}
              />
              {isSending && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!message.trim() || isSending}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-stone-900 shadow-xl hover:bg-green-100 transition-colors disabled:opacity-50 disabled:scale-95 active:scale-90 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}