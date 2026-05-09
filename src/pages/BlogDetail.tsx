import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { ArrowLeft, User, Calendar, Share2, Instagram, Facebook, ArrowRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { dataService } from '../services/dataService';
import { BlogPost } from '../types';

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      setLoading(true);
      try {
        const blogs = await dataService.getBlogs();
        const found = blogs.find(b => b.id === id);
        setPost(found || null);
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  if (loading) return (
    <div className="pt-40 pb-24 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Loading Article...</p>
    </div>
  );

  if (!post) return <div className="pt-40 pb-24 text-center">Article not found</div>;

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>
        
        <article className="max-w-4xl mx-auto">
          <header className="mb-12 space-y-8">
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight uppercase leading-[0.9]">
              {post.title}
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-y border-stone-100 py-6">
              <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-stone-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-200" />
                  <span>By {post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 border border-stone-200 rounded-full hover:bg-stone-50"><Share2 className="w-4 h-4" /></button>
                <button className="p-2 border border-stone-200 rounded-full hover:bg-stone-50"><Instagram className="w-4 h-4" /></button>
                <button className="p-2 border border-stone-200 rounded-full hover:bg-stone-50"><Facebook className="w-4 h-4" /></button>
              </div>
            </div>
          </header>

          <figure className="aspect-[21/9] bg-stone-100 mb-16 overflow-hidden">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </figure>

          <div className="prose prose-stone max-w-none prose-lg prose-headings:font-serif prose-headings:italic">
            <div className="markdown-content">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-stone-100 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Next Article</h4>
            </div>
            <Link to="/blog" className="p-4 bg-stone-50 rounded-full hover:bg-stone-100 transition-colors">
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
