/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Bell, Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-stone-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="relative z-50 w-72 max-w-[80%] bg-white h-full shadow-xl">
            <div className="flex justify-end p-4 border-b border-stone-200">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 sm:px-6 lg:px-8 h-auto min-h-[80px] flex items-center">
          <div className="flex items-center justify-between w-full gap-4">
            
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1">
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md border border-stone-200 hover:bg-stone-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <div className="hidden sm:flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-full px-4 py-2 w-full max-w-md">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search administration..."
                  className="bg-transparent border-none text-sm focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 sm:gap-5">
              
              {/* Notification */}
              <button className="relative p-2 text-stone-400 hover:text-stone-900 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
              </button>

              {/* Divider */}
              <div className="hidden sm:block h-8 w-[1px] bg-stone-100" />

              {/* User Info */}
              <div className="flex items-center gap-2 sm:gap-3">
                
                {/* Text Info */}
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-900 leading-none mb-1">
                    {profile?.displayName || 'Administrator'}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 leading-none">
                    Head of Operations
                  </p>
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-stone-900 border-2 border-stone-100 flex items-center justify-center rounded-md">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search */}
        <div className="sm:hidden px-4 py-3 bg-white border-b border-stone-100">
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none text-sm focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}