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
  Settings,
  MessageSquare
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
    <aside className="w-64 bg-stone-900 text-stone-400 h-screen sticky top-0 flex flex-col border-r border-stone-800">
      <div className="p-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 shrink-0">
            <img src="/logo_a2b.jpeg" alt="A2B Farms" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h2 className="text-white font-black uppercase tracking-tighter leading-none text-sm">Farms</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-stone-600 mb-4">Management</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center justify-between p-4 group transition-all duration-300",
                isActive 
                  ? "bg-stone-800 text-white" 
                  : "hover:bg-stone-800/50 hover:text-stone-200"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-4 h-4", isActive ? "text-green-500" : "text-stone-500")} />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.name}</span>
              </div>
              <ChevronRight className={cn(
                "w-3 h-3 transition-transform", 
                isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
              )} />
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stone-800 space-y-2">
        <button 
          onClick={() => authService.logout()}
          className="w-full flex items-center gap-3 p-4 text-stone-500 hover:text-red-400 hover:bg-red-950/20 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
      
      <div className="p-8 bg-stone-950">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">System Online</span>
        </div>
        <p className="text-[9px] text-stone-700 font-medium">v1.2.4-stable</p>
      </div>
    </aside>
  );
}
