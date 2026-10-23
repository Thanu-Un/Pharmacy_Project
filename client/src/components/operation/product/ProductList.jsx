import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Card from '../../ui/Card';

export default function ProductList({ onAddClick, onEditClick }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(() => {
    const saved = localStorage.getItem('activeWarehouseId');
    return saved ? Number(saved) : 'all';
  });
  const [selectedWarehouseName, setSelectedWarehouseName] = useState(() => {
    return localStorage.getItem('activeWarehouseName') || 'All Warehouses';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/operation/warehouses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data);
        
        // If saved ID matches a warehouse, ensure name is synchronized
        const savedId = localStorage.getItem('activeWarehouseId');
        if (savedId) {
          const found = data.find(w => String(w.id) === String(savedId));
          if (found) {
            setSelectedWarehouseId(found.id);
            setSelectedWarehouseName(found.name);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch warehouses in ProductList:', e);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/operation/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

  // Synchronize with Header's warehouse switcher or other components
  useEffect(() => {
    const handleWhChange = (e) => {
      const newWh = e.detail;
      if (newWh && newWh.id) {
        setSelectedWarehouseId(Number(newWh.id));
        setSelectedWarehouseName(newWh.name || '');
      } else {
        const savedId = localStorage.getItem('activeWarehouseId');
        const savedName = localStorage.getItem('activeWarehouseName');
        if (savedId) {
          setSelectedWarehouseId(Number(savedId));
          setSelectedWarehouseName(savedName || '');
        } else {
          setSelectedWarehouseId('all');
          setSelectedWarehouseName('All Warehouses');
        }
      }
    };

    const handleWarehousesUpdated = () => {
      fetchWarehouses();
      fetchProducts();
    };

    window.addEventListener('warehousechange', handleWhChange);
    window.addEventListener('warehousesUpdated', handleWarehousesUpdated);
    return () => {
      window.removeEventListener('warehousechange', handleWhChange);
      window.removeEventListener('warehousesUpdated', handleWarehousesUpdated);
    };
  }, []);

  const handleSelectWarehouse = (val) => {
    if (val === 'all') {
      setSelectedWarehouseId('all');
      setSelectedWarehouseName('All Warehouses');
    } else {
      const chosen = warehouses.find(w => String(w.id) === String(val));
      if (chosen) {
        setSelectedWarehouseId(chosen.id);
        setSelectedWarehouseName(chosen.name);
        localStorage.setItem('activeWarehouseId', String(chosen.id));
        localStorage.setItem('activeWarehouseName', chosen.name);
        // Dispatch to update Header and POS simultaneously
        window.dispatchEvent(new CustomEvent('warehousechange', { detail: chosen }));
      }
    }
  };

  const getWarehouseStock = (product, whId) => {
    if (!product) return 0;
    if (whId === 'all' || !whId) {
      return parseFloat(product.quantity || 0);
    }
    if (product.stocks && Array.isArray(product.stocks)) {
      const found = product.stocks.find(s => s.warehouse?.id === Number(whId));
      return found ? parseFloat(found.quantity || 0) : 0;
    }
    return 0;
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/operation/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to delete product');
      }
      
      setProducts(products.filter(p => p.id !== id));
      setProductToDelete(null); 
    } catch (err) {
      setError(err.message);
      setProductToDelete(null); 
      setTimeout(() => setError(null), 5000);
    }
  };

  const filteredProducts = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.category?.name && p.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Medicine Formulary</h1>
            <Badge variant="neutral" size="sm">
              <span className="font-mono">{products.length}</span> SKUs
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pharmaceutical database, inventory unit conversions, and unit pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="brand"
            size="sm"
            onClick={onAddClick}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Add Medicine SKU
          </Button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search by name, SKU code, or category..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Warehouse Stock Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <svg className="w-4 h-4 text-brand-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="hidden sm:inline">Stock Branch:</span>
            </div>
            <select
              value={selectedWarehouseId}
              onChange={(e) => handleSelectWarehouse(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:bg-white focus:border-brand-500 cursor-pointer transition-all"
            >
              <option value="all">All Warehouses (Global Total)</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Showing Count & Active Warehouse Pill */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-100 font-sans font-semibold text-[11px]">
            {selectedWarehouseId === 'all' ? 'All Warehouses' : `Branch: ${selectedWarehouseName}`}
          </span>
          <span>
            {filteredProducts.length} of {products.length} medicines
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2.5 border border-rose-200">
          <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Clinical Table Card */}
      <Card contentClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px] font-mono">
                <th className="py-2.5 px-3.5 w-12 text-center">Media</th>
                <th className="py-2.5 px-3.5">Code / SKU</th>
                <th className="py-2.5 px-3.5">Medicine Name</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5 text-right">Cost</th>
                <th className="py-2.5 px-3.5 text-right">Sale Price</th>
                <th className="py-2.5 px-3.5 text-right">
                  <span>In Stock</span>
                  {selectedWarehouseId !== 'all' && (
                    <span className="block text-[9px] font-sans font-normal text-brand-700 lowercase">
                      ({selectedWarehouseName})
                    </span>
                  )}
                </th>
                <th className="py-2.5 px-3.5 text-center">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading medicine formulary...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    {searchTerm ? 'No matching medicines found.' : 'No medicines available. Click "Add Medicine SKU" to create one.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const qty = getWarehouseStock(p, selectedWarehouseId);
                  const totalGlobal = parseFloat(p.quantity || 0);
                  const alertQty = Number(p.alertQuantity || 0);
                  const isOutOfStock = qty <= 0;
                  const isLowStock = qty > 0 && qty <= alertQty;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-2 px-3 text-center">
                        {p.image ? (
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden mx-auto">
                            <img 
                              src={p.image.startsWith('http') || p.image.startsWith('data:') ? p.image : `/api/operation${p.image}`} 
                              alt={p.name} 
                              className="w-full h-full object-cover" 
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/32?text=Rx'; }}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-400 mx-auto">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-700 font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-[11px]">
                          {p.code}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3.5">
                        {p.category ? (
                          <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/70">
                            {p.category.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">General</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-slate-500 tabular-nums">
                        ${Number(p.cost || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono text-slate-900 font-semibold tabular-nums">
                        ${Number(p.price || 0).toFixed(2)}
                        {p.saleUnit && <span className="text-[10px] text-slate-400 block font-normal font-sans">per {p.saleUnit.name}</span>}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums">
                        <span className={`font-semibold text-xs ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>
                          {qty.toFixed(0)}
                        </span>
                        {p.unit && <span className="text-[10px] text-slate-400 ml-1 font-sans">{p.unit.name}</span>}
                        {selectedWarehouseId !== 'all' && (
                          <span className="block text-[10px] text-slate-400 font-sans font-normal" title="Total global stock across all warehouses">
                            Total: {totalGlobal.toFixed(0)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <Badge
                          size="sm"
                          dot
                          variant={isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'}
                        >
                          {isOutOfStock ? (t('pos.out_of_stock') || 'Out of Stock') : isLowStock ? 'Low Stock' : (t('pos.in_stock') || 'In Stock')}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditClick(p)}
                            title="Edit Medicine"
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          
                          <div className="relative inline-block">
                            <button
                              onClick={() => setProductToDelete(p.id)}
                              title="Delete Medicine"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            
                            {productToDelete === p.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 shadow-dropdown rounded-lg p-2.5 z-50 text-left animate-in fade-in zoom-in-95 duration-150">
                                <p className="text-slate-800 font-semibold text-xs mb-1">Delete SKU?</p>
                                <p className="text-slate-500 text-[11px] mb-2">This action cannot be undone.</p>
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleDelete(p.id)}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-medium py-1 rounded transition-colors"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setProductToDelete(null)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium py-1 rounded transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
