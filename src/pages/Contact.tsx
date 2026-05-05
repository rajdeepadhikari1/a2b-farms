import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { dataService } from '../services/dataService';

export default function Contact() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await dataService.sendContactMessage({
        ...formData,
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-serif font-bold italic tracking-tight mb-4"
            >
              {t('contact.title')}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-stone-500 uppercase tracking-[0.2em] text-xs font-bold"
            >
              {t('contact.subtitle')}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Info Cards */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-8 border border-stone-200">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6 border-b border-stone-100 pb-3">
                  {t('contact.getInTouch')}
                </h2>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-stone-50 flex items-center justify-center text-stone-900">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-900 mb-1">{t('contact.location')}</p>
                      <p className="text-xs text-stone-500 leading-relaxed">{t('contact.locationDesc')}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-stone-50 flex items-center justify-center text-stone-900">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-900 mb-1">{t('contact.phone')}</p>
                      <p className="text-xs text-stone-500">+977 1 4XXXXXX</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-stone-50 flex items-center justify-center text-stone-900">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-900 mb-1">{t('contact.email')}</p>
                      <p className="text-xs text-stone-500 text-wrap break-all">hello@a2bfarms.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-stone-900 p-8 text-white">
                <h3 className="font-serif italic text-xl mb-4 text-stone-200">Visit Our Farm</h3>
                <p className="text-xs text-stone-400 leading-relaxed mb-6">
                  Experience the essence of organic farming. Join us for a weekend tour and witness the journey from seed to table.
                </p>
                <button className="text-[10px] font-black uppercase tracking-widest border-b border-stone-700 pb-1 hover:text-green-400 transition-colors">
                  Schedule a Visit
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <div className="bg-white p-8 border border-stone-200 h-full">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-serif italic font-bold mb-4">Message Sent</h2>
                    <p className="text-stone-500 text-sm max-w-md mb-8">
                      {t('contact.success')}
                    </p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="text-[10px] font-black uppercase tracking-widest bg-stone-900 text-white px-8 py-4 hover:bg-green-800 transition-all"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-8 border-b border-stone-100 pb-3">
                      {t('contact.formTitle')}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t('contact.nameLabel')}</label>
                        <input 
                          required
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 bg-stone-50/30" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t('contact.emailLabel')}</label>
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 bg-stone-50/30" 
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t('contact.subjectLabel')}</label>
                        <input 
                          type="text" 
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 bg-stone-50/30" 
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">{t('contact.messageLabel')}</label>
                        <textarea 
                          required
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 bg-stone-50/30 font-sans" 
                        />
                      </div>
                      <div className="md:col-span-2 pt-4">
                        <button 
                          disabled={isSubmitting}
                          className="w-full bg-stone-900 text-white py-5 text-xs font-black uppercase tracking-[0.2em] hover:bg-green-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              {t('contact.sendButton')}
                              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
