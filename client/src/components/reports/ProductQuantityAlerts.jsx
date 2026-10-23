import React, { useState, useEffect } from 'react';

export default function ProductQuantityAlerts() {
  const [allProducts, setAllProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(() => {
    const saved = localStorage.getItem('activeWarehouseId');
    return saved ? Number(saved) : 'all';
  });
  const [selectedWarehouseName, setSelectedWarehouseName] = useState(() => {
    return localStorage.getItem('activeWarehouseName') || 'All Warehouses';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWarehouses = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const res = await fetch('/api/operation/warehouses', { headers });
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data);
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
      console.error(e);
    }
  };

  const fetchAlertProducts = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const response = await fetch('/api/operation/products', { headers });
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setAllProducts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertProducts();
    fetchWarehouses();
  }, []);

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
        }
      }
    };
    window.addEventListener('warehousechange', handleWhChange);
    return () => window.removeEventListener('warehousechange', handleWhChange);
  }, []);

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
        window.dispatchEvent(new CustomEvent('warehousechange', { detail: chosen }));
      }
    }
  };

  // Filter products below threshold according to the active warehouse
  const alertProducts = allProducts.filter(p => {
    const stock = getWarehouseStock(p, selectedWarehouseId);
    const alertQty = Number(p.alertQuantity || 0);
    return stock <= alertQty;
  });

  const filteredProducts = alertProducts.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-2"></div>
        <p className="text-xs text-slate-400 font-medium">Scanning inventory thresholds...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-rose-600 text-xs p-4 bg-rose-50 border border-rose-200/60 rounded-xl">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Quantity Threshold Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">Critical inventory levels requiring replenishment</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>{alertProducts.length} {alertProducts.length === 1 ? 'Medicine' : 'Medicines'} Low Stock</span>
        </span>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden space-y-3 p-4">
        {/* Controls: Search & Warehouse Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              placeholder="Filter medicines by code or title..."
              className="w-full bg-white border border-slate-200/90 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Branch:</span>
            <select
              value={selectedWarehouseId}
              onChange={(e) => handleSelectWarehouse(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
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
        
        <div className="overflow-x-auto rounded-lg border border-slate-200/70">
          <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-600 text-[11px] uppercase font-semibold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-3 w-14 text-center">Packaging</th>
                <th className="py-2.5 px-3">Product Identifier</th>
                <th className="py-2.5 px-3">Medicine Description</th>
                <th className="py-2.5 px-3 text-right">
                  In Stock ({selectedWarehouseId === 'all' ? 'All' : selectedWarehouseName})
                </th>
                <th className="py-2.5 px-3 text-right">Min Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const stock = getWarehouseStock(product, selectedWarehouseId);
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-3 text-center">
                        {product.image ? (
                          <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden mx-auto">
                            <img 
                              src={product.image.startsWith('http') || product.image.startsWith('data:') ? product.image : `/api/operation${product.image}`}
                              alt={product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                 e.target.onerror = null; 
                                 e.target.src = 'https://via.placeholder.com/40?text=No+Img';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 mx-auto">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {product.code}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">{product.name}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                          {stock.toFixed(0)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500">
                        {product.alertQuantity}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 italic">
                    {searchTerm ? 'No products matching your search query.' : 'All medicines are safely above inventory alert thresholds.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
