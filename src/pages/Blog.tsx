import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, User, Calendar, Loader2 } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { dataService } from '../services/dataService';
import { BlogPost } from '../types';

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const data = await dataService.getBlogs();
        setBlogs(data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
          <h1 className="text-6xl font-serif font-bold tracking-tight uppercase leading-none">The Farm <br /> <span className="italic font-light">Journal.</span></h1>
          <p className="text-stone-500 uppercase tracking-widest text-[11px] font-bold">Expert tips, stories, and plant inspiration from A2B Farms</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Opening Archives...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {blogs.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <Link to={`/blog/${post.id}`}>
                  <div className="aspect-[16/10] bg-stone-100 overflow-hidden mb-6 relative">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-black uppercase tracking-widest">Article</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(post.createdAt)}
                      </div>
                    </div>
                    <h2 className="text-2xl font-serif font-bold italic tracking-tight group-hover:text-green-800 transition-colors leading-tight">{post.title}</h2>
                    <p className="text-stone-500 text-sm line-clamp-3 leading-relaxed font-medium">
                      {post.content}
                    </p>
                    <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 group-hover:text-green-700 transition-colors">
                      Read Story
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
