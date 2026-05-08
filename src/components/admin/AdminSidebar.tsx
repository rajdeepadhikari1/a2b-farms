/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Camera,
  FileText,
  LogOut,
  ChevronRight,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

import { authService } from '../../services/authService';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Inventory', href: '/admin/inventory', icon: TrendingUp },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Stories', href: '/admin/stories', icon: Camera },
  { name: 'Blogs', href: '/admin/blogs', icon: FileText },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-72 max-w-full bg-stone-900 text-stone-400 h-screen overflow-y-auto flex flex-col border-r border-stone-800">
      
      {/* Logo */}
      <div className="p-5 sm:p-6 lg:p-8 border-b border-stone-800">
        <Link to="/" className="flex items-center gap-3 group">
          
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-md overflow-hidden bg-white">
            <img
              src="/logo_a2b.jpeg"
              alt="A2B Farms"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-white font-black uppercase tracking-tight leading-none text-sm sm:text-base truncate">
              A2B Farms
            </h2>

            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        
        <p className="px-3 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-stone-600">
          Management
        </p>

        {navItems.map((item) => {
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 group',
                isActive
                  ? 'bg-stone-800 text-white shadow-md'
                  : 'hover:bg-stone-800/60 hover:text-stone-200'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                
                <div
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-lg transition-all',
                    isActive
                      ? 'bg-green-500/10'
                      : 'bg-stone-800 group-hover:bg-stone-700'
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-4 h-4',
                      isActive ? 'text-green-500' : 'text-stone-500'
                    )}
                  />
                </div>

                <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest truncate">
                  {item.name}
                </span>
              </div>

              <ChevronRight
                className={cn(
                  'w-4 h-4 shrink-0 transition-all duration-300',
                  isActive
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-stone-800 p-3 sm:p-4">
        
        {/* Logout */}
        <button
          onClick={() => authService.logout()}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-stone-500 hover:text-red-400 hover:bg-red-950/20 transition-all group"
        >
          <div className="w-9 h-9 rounded-lg bg-stone-800 flex items-center justify-center group-hover:bg-red-950/40 transition-all">
            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </div>

          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest">
            Sign Out
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 sm:px-6 bg-stone-950 border-t border-stone-800">
        
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">
            System Online
          </span>
        </div>

        <p className="text-[9px] text-stone-700 font-medium">
          v1.2.4-stable
        </p>
      </div>
    </aside>
  );
}