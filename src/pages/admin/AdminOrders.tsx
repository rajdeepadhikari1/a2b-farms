/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle,
  Clock,
  ChevronRight,
  MoreVertical,
  X,
  CreditCard,
  User,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Order } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const data = await dataService.getOrders();
    setOrders(data || []);
    setLoading(false);
  }

  const handleUpdateStatus = async (id: string, status: Order['status']) => {
    await dataService.updateOrderStatus(id, status);
    fetchOrders();
    if (selectedOrder?.id === id) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const filteredOrders = orders.filter(o => filterStatus === 'all' || o.status === filterStatus);

  const stats = [
    { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'amber' },
    { label: 'Processing', count: orders.filter(o => o.status === 'processing').length, color: 'blue' },
    { label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, color: 'green' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold italic mb-2 text-stone-900">Operations</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Logistics and fulfillment tracking</p>
        </div>
        <div className="flex gap-2">
          {stats.map(stat => (
            <div key={stat.label} className="bg-white border border-stone-200 px-6 py-4 flex items-center gap-4">
               <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">{stat.label}</p>
                  <p className="text-xl font-serif font-bold italic">{stat.count}</p>
               </div>
               <div className={cn("w-1 h-8", `bg-${stat.color}-500`)} />
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-stone-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {['all', 'pending', 'processing', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={cn(
                "px-6 py-3 text-[10px] font-black uppercase tracking-widest border transition-all",
                filterStatus === status 
                  ? "bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-200" 
                  : "bg-white text-stone-400 border-stone-200 hover:border-stone-900 hover:text-stone-900"
              )}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-stone-50 border border-stone-100 w-80">
          <Search className="w-4 h-4 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by Order ID or Name..." 
            className="bg-transparent border-none text-xs focus:outline-none w-full py-1"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-stone-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Order Information</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Customer</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Financials</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Timeline</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400 text-right">Fulfillment</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr 
                key={order.id} 
                className="border-b border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer group"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="px-8 py-8">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-stone-100 text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-all">
                         <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-stone-900 mb-1">Order #{(order.id || '').slice(0, 8)}</p>
                        <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">{order.items.length} Items Packed</p>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-8">
                  <p className="text-xs font-black uppercase tracking-widest text-stone-900 mb-1">{order.contact.name}</p>
                  <p className="text-[10px] text-stone-400 font-medium">{order.contact.email}</p>
                </td>
                <td className="px-8 py-8">
                  <p className="text-xs font-black text-stone-900 mb-1">₹{order.total.toLocaleString()}</p>
                  <div className="flex items-center gap-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Paid</span>
                  </div>
                </td>
                <td className="px-8 py-8">
                   <div className="flex items-center gap-2 text-stone-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </span>
                   </div>
                </td>
                <td className="px-8 py-8 text-right">
                   <div className={cn(
                     "inline-flex items-center gap-2 px-3 py-1.5 border font-black uppercase tracking-[0.1em] text-[9px]",
                     order.status === 'delivered' ? "bg-green-50 border-green-200 text-green-700" :
                     order.status === 'processing' ? "bg-blue-50 border-blue-200 text-blue-700" :
                     "bg-amber-50 border-amber-200 text-amber-700"
                   )}>
                      {order.status === 'delivered' ? <CheckCircle className="w-3 h-3" /> :
                       order.status === 'processing' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                       <Clock className="w-3 h-3" />}
                      {order.status}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Side Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white h-screen shadow-2xl flex flex-col"
            >
              <div className="p-10 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1 text-center sm:text-left">Operational Manifest</p>
                    <h2 className="text-2xl font-serif font-bold italic tracking-tight uppercase">Order Details</h2>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-stone-100 transition-colors">
                    <X className="w-6 h-6 text-stone-400" />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                 {/* Status Control */}
                 <section className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Change Logistics State</label>
                    <div className="grid grid-cols-3 gap-2">
                       {[
                         { id: 'pending', icon: Clock, label: 'Pending' },
                         { id: 'processing', icon: Loader2, label: 'Process' },
                         { id: 'delivered', icon: CheckCircle, label: 'Deliver' }
                       ].map(s => (
                         <button
                           key={s.id}
                           onClick={() => handleUpdateStatus(selectedOrder.id as string, s.id as any)}
                           className={cn(
                             "flex flex-col items-center justify-center p-4 border transition-all gap-2 group",
                             selectedOrder.status === s.id 
                               ? "bg-stone-900 border-stone-900 text-white" 
                               : "bg-white border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900"
                           )}
                         >
                           <s.icon className={cn("w-5 h-5", selectedOrder.status === s.id ? "text-green-500" : "group-hover:text-stone-900 shadow-sm")} />
                           <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                         </button>
                       ))}
                    </div>
                 </section>

                 {/* Items */}
                 <section>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6 border-b border-stone-100 pb-2">Invoiced Goods</h3>
                    <div className="space-y-4">
                       {selectedOrder.items.map((item, idx) => (
                         <div key={idx} className="flex items-center justify-between p-4 bg-stone-50 border border-stone-100">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-white border border-stone-200 grayscale">
                                  <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-900 mb-1">{item.name}</p>
                                  <p className="text-[9px] font-bold text-stone-400">UNIT VOL: 1.2kg x {item.quantity}</p>
                               </div>
                            </div>
                            <p className="text-xs font-bold text-stone-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                         </div>
                       ))}
                    </div>
                 </section>

                 {/* Info Grid */}
                 <div className="grid grid-cols-2 gap-8">
                    <section>
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                         <User className="w-3 h-3" /> Customer Profile
                       </h3>
                       <div className="space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-stone-900">{selectedOrder.contact.name}</p>
                          <p className="text-xs text-stone-500 font-medium">{selectedOrder.contact.email}</p>
                          <p className="text-xs text-stone-500 font-medium">{selectedOrder.contact.phone}</p>
                       </div>
                    </section>
                    <section>
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                         <MapPin className="w-3 h-3" /> Shipping Matrix
                       </h3>
                       <div className="space-y-1">
                          <p className="text-xs font-medium text-stone-600 leading-relaxed">
                            {selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.city}<br />
                            {selectedOrder.shippingAddress?.postalCode}, Republic of India
                          </p>
                       </div>
                    </section>
                 </div>

                 {/* Totals */}
                 <section className="bg-stone-900 text-white p-8 space-y-4">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-stone-500">
                       <span>Logistics Calculation</span>
                       <span>A2B-{(selectedOrder.id || '').slice(0, 4)}</span>
                    </div>
                    <div className="space-y-2 border-y border-stone-800 py-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                          <span className="text-xs font-mono">₹{selectedOrder.total.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest">Handling</span>
                          <span className="text-xs font-mono">₹0.00</span>
                       </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Node Final</span>
                       <span className="text-2xl font-serif font-bold italic tracking-tight">₹{selectedOrder.total.toLocaleString()}</span>
                    </div>
                 </section>
              </div>

              <div className="p-10 border-t border-stone-100 flex gap-4">
                 <button className="flex-1 bg-stone-900 text-white py-5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
                    <Truck className="w-4 h-4" /> Generate Waybill
                 </button>
                 <button className="p-5 border border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-900 transition-all">
                    <MoreVertical className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
