/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Clock,
  ChevronRight
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Product, Order } from '../../types';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [p, o] = await Promise.all([
          dataService.getProducts(),
          dataService.getOrders()
        ]);
        setProducts(p || []);
        setOrders(o || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    { name: 'Total Revenue', value: '₹' + orders.reduce((acc, curr) => acc + curr.total, 0).toLocaleString(), icon: TrendingUp, change: '+12.5%', isPositive: true },
    { name: 'New Orders', value: orders.length, icon: ShoppingBag, change: '+5.2%', isPositive: true },
    { name: 'Inventory Items', value: products.length, icon: Package, change: '-2.4%', isPositive: false },
    { name: 'Total Users', value: '142', icon: Users, change: '+18.1%', isPositive: true },
  ];

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-serif font-bold italic mb-2">*</p>
          <h1 className="text-4xl font-serif font-bold italic mb-2">Overview</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Daily performance metrics and operations</p>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/products" className="bg-white border border-stone-200 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:border-stone-900 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
          <Link to="/admin/stories" className="bg-stone-900 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Story
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 border border-stone-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-stone-50 border border-stone-100">
                <stat.icon className="w-5 h-5 text-stone-900" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{stat.name}</p>
            <h3 className="text-3xl font-serif font-bold italic tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-stone-200">
          <div className="p-8 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest">Recent Activity</h2>
            <Link to="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-2 group">
              View All <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Order ID</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Customer</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer group">
                    <td className="px-8 py-6 text-xs font-bold font-mono text-stone-400">#{order.id?.slice(0, 8)}</td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black uppercase tracking-widest mb-1">{order.contact.name}</p>
                      <p className="text-[10px] text-stone-400">{order.contact.email}</p>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold">₹{order.total.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                      <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${
                        order.status === 'delivered' ? 'bg-green-50 text-green-700' : 
                        order.status === 'processing' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-8">
          <div className="bg-white border border-stone-200 p-8">
            <h2 className="text-xs font-black uppercase tracking-widest mb-8">Stock Alerts</h2>
            <div className="space-y-6">
              {products.filter(p => (p as any).stock < 10).slice(0, 4).map(product => (
                <div key={product.id} className="flex gap-4 group">
                   <div className="w-12 h-12 bg-stone-50 border border-stone-100 flex-shrink-0">
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest truncate mb-1">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-stone-100 rounded-full">
                          <div 
                            className="h-full bg-amber-500 rounded-full" 
                            style={{ width: `${((product as any).stock / 50) * 100}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-black text-amber-600">{(product as any).stock} units</span>
                      </div>
                   </div>
                </div>
              ))}
            </div>
            <Link 
              to="/admin/inventory"
              className="w-full mt-10 py-4 border border-stone-200 text-[10px] font-black uppercase tracking-widest hover:border-stone-900 transition-all text-center block"
            >
              Manage Inventory
            </Link>
          </div>

          <div className="bg-stone-900 text-white p-8">
             <div className="p-3 bg-stone-800 w-fit mb-6">
                <Clock className="w-5 h-5 text-green-500" />
             </div>
             <h3 className="text-lg font-serif font-bold italic mb-2">Operational Hours</h3>
             <p className="text-xs text-stone-400 font-medium mb-8 leading-relaxed">System is currently processing peak weekend loads. No delays reported in shipping.</p>
             <div className="flex items-center justify-between pt-6 border-t border-stone-800">
               <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Logistics Node</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Active</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
