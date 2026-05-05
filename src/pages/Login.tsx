/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-40 pb-20 container mx-auto px-4 max-w-md">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 border border-stone-200 shadow-sm"
      >
        <h2 className="text-3xl font-serif font-bold italic mb-2 uppercase text-center">Login</h2>
        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest text-center mb-8">Welcome back to the farm</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email Address
            </label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 transition-colors" 
              placeholder="your@email.com" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <Lock className="w-3 h-3" /> Password
            </label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 transition-colors" 
              placeholder="••••••••" 
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-xs font-bold uppercase tracking-widest text-red-700">
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-stone-900 text-white py-4 text-xs font-black uppercase tracking-[0.2em] hover:bg-green-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center pt-8 border-t border-stone-100">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">New to A2B Farms?</p>
          <Link to="/signup" className="text-[10px] font-black uppercase tracking-widest text-stone-900 hover:text-green-700 transition-colors">Create an account</Link>
        </div>
      </motion.div>
    </div>
  );
}
