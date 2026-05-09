import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { Product } from '../../types';
import { Search, Loader2, Save, AlertTriangle, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [stockUpdates, setStockUpdates] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await dataService.getProducts();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleStockChange = (id: string, value: string) => {
    const num = parseInt(value) || 0;
    setStockUpdates(prev => ({ ...prev, [id]: num }));
  };

  const handleUpdateStock = async (id: string) => {
    const newStock = stockUpdates[id];
    if (newStock === undefined) return;

    setSavingId(id);
    try {
      await dataService.updateProduct(id, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
      const { [id]: _, ...rest } = stockUpdates;
      setStockUpdates(rest);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/admin" className="p-2 bg-stone-50 border border-stone-200 hover:border-stone-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-4xl font-serif font-bold italic tracking-tight">*</h1>
            <h1 className="text-4xl font-serif font-bold italic tracking-tight">Inventory Management</h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Stock control, levels and replenishment</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-stone-50 border border-stone-200 py-3 pl-10 pr-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-stone-900 transition-colors w-full md:w-64"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          </div>
          <Link to="/admin/products" className="bg-stone-900 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Assets
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-stone-200" />
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Auditing Inventory...</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Asset Detail</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Level</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-stone-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-16 bg-stone-100 shrink-0">
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-opacity" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-stone-900 mb-1">{p.name}</p>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Type: {p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {p.stock <= 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-widest border border-red-100">
                        <Trash2 className="w-3 h-3" /> Out of Stock
                      </span>
                    ) : p.stock < 10 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-widest border border-amber-100">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-widest border border-green-100">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <input 
                        type="number"
                        min="0"
                        value={stockUpdates[p.id] !== undefined ? stockUpdates[p.id] : p.stock}
                        onChange={(e) => handleStockChange(p.id, e.target.value)}
                        className="w-20 bg-white border border-stone-200 px-3 py-2 text-xs font-bold focus:outline-none focus:border-stone-900 transition-colors"
                      />
                      <div className="w-32 hidden sm:block">
                        <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${p.stock < 10 ? 'bg-amber-500' : 'bg-stone-900'}`} 
                            style={{ width: `${Math.min((p.stock / 100) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleUpdateStock(p.id)}
                      disabled={savingId === p.id || stockUpdates[p.id] === undefined}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition-all flex items-center gap-2 disabled:opacity-0"
                    >
                      {savingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Sync Level
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-sm font-serif italic text-stone-400">No assets matching your search criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
