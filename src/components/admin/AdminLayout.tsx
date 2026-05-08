/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-stone-200 px-8 flex items-center justify-between sticky top-15 z-10">
          <div className="flex items-center gap-4 bg-stone-50 border border-stone-100 rounded-full px-4 py-2 w-96">
            <Search className="w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search administration..." 
              className="bg-transparent border-none text-xs focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-stone-400 hover:text-stone-900 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-stone-100" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-900 leading-none mb-1">
                  {profile?.displayName || 'Administrator'}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 leading-none">
                  Head of Operations
                </p>
              </div>
              <div className="w-10 h-10 bg-stone-900 border-2 border-stone-100 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
