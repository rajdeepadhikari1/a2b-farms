import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { ContactMessage } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Mail, User, Clock, Send, CheckCircle2, History, Loader2, Search, Filter } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'replied'>('all');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const msgs = await dataService.getContactMessages();
      setMessages(msgs || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    setSubmitting(true);
    try {
      await dataService.replyToContactMessage(selectedMessage.id!, replyText);
      setReplyText('');
      setSelectedMessage(null);
      await loadMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = statusFilter === 'all' || msg.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold italic mb-2">*</h1>
          <h1 className="text-3xl font-serif font-bold italic mb-2">Customer Inquiries</h1>
          <p className="text-[10px] uppercase tracking-widest text-stone-500 font-black">Manage messages and replies</p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-stone-100 border-none text-xs focus:ring-1 ring-stone-400 focus:outline-none w-48"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-stone-100 border-none text-xs px-4 py-2 pr-8 focus:ring-1 ring-stone-400 focus:outline-none uppercase font-black tracking-widest"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Messages List */}
        <div className="lg:col-span-5 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 border border-stone-100 italic text-stone-400">
              No messages found.
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={cn(
                  "w-full text-left p-6 border transition-all relative group",
                  selectedMessage?.id === msg.id 
                    ? "border-stone-900 bg-white" 
                    : "border-stone-100 bg-stone-50/50 hover:border-stone-300"
                )}
              >
                {msg.status === 'new' && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full" />
                )}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-900 mb-1">{msg.name}</p>
                    <p className="text-[9px] text-stone-400 font-medium">{msg.email}</p>
                  </div>
                  <span className="text-[9px] text-stone-400 font-mono">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed italic">
                  "{msg.message}"
                </p>
                {msg.status === 'replied' && (
                  <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-stone-400">
                    <CheckCircle2 className="w-3 h-3 text-green-500" /> Replied
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Message Content & Reply Port */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div 
                key={selectedMessage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-stone-200 p-8 h-full flex flex-col"
              >
                <div className="flex justify-between items-start mb-8 pb-6 border-b border-stone-100">
                  <div>
                    <h2 className="text-xl font-serif font-bold italic mb-1">{selectedMessage.name}</h2>
                    <div className="flex items-center gap-3 text-stone-400">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                        <Mail className="w-3 h-3" /> {selectedMessage.email}
                      </div>
                      <span className="text-[9px]">•</span>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                        <Clock className="w-3 h-3" /> {formatDate(selectedMessage.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-full",
                    selectedMessage.status === 'new' ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-400"
                  )}>
                    {selectedMessage.status}
                  </div>
                </div>

                <div className="flex-grow space-y-8">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Original Message</h3>
                    <div className="bg-stone-50 p-6 italic text-sm text-stone-700 leading-relaxed border-l-2 border-stone-200">
                      {selectedMessage.message}
                    </div>
                  </div>

                  {selectedMessage.status === 'replied' ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Your Reply</h3>
                        <span className="text-[8px] font-mono text-stone-300">
                          {selectedMessage.repliedAt ? formatDate(selectedMessage.repliedAt) : ''}
                        </span>
                      </div>
                      <div className="bg-green-50/50 p-6 text-sm text-stone-700 leading-relaxed border-l-2 border-green-200">
                        {selectedMessage.reply}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4">Draft Reply</h3>
                      <form onSubmit={handleReply} className="space-y-4">
                        <textarea 
                          rows={6}
                          placeholder="Type your response here..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full border border-stone-200 p-4 text-sm focus:outline-none focus:border-stone-900 bg-stone-50/30"
                        />
                        <button 
                          disabled={submitting || !replyText.trim()}
                          className="w-full bg-stone-900 text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-green-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {submitting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              Send Reply <Send className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-stone-50 border border-stone-200 border-dashed p-12 h-full flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-12 h-12 text-stone-200 mb-4" />
                <h2 className="text-xl font-serif italic text-stone-300">Select a message to view details</h2>
                <p className="text-[10px] text-stone-400 mt-2 uppercase tracking-widest font-black">Waiting for selection</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
