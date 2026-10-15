import React, { useState, useEffect } from 'react';

export default function ProductExpiryAlerts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchExpiryAlerts = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const response = await fetch('/api/operation/purchases', { headers });
      if (!response.ok) throw new Error('Failed to fetch purchases');
      
      const purchases = await response.json();
      
      let expiringItems = [];
      const today = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(today.getMonth() + 3);
      
      purchases.forEach(purchase => {
        if (purchase.items && purchase.items.length > 0) {
          purchase.items.forEach(item => {
            if (item.expiry) {
              const expiryDate = new Date(item.expiry);
              if (expiryDate <= threeMonthsFromNow) {
                expiringItems.push({
                  ...item,
                  supplierName: purchase.supplier?.name || purchase.supplier?.company || 'N/A',
                  purchaseDate: purchase.date,
                  referenceNo: purchase.referenceNo
                });
              }
            }
          });
        }
      });
      
      expiringItems.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
      
      setItems(expiringItems);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiryAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-2"></div>
        <p className="text-xs text-slate-400 font-medium">Scanning lot expiration dates...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-rose-600 text-xs p-4 bg-rose-50 border border-rose-200/60 rounded-xl">{error}</div>;
  }

  const filteredItems = items.filter(p => 
    (p.productName && p.productName.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.productCode && p.productCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getExpiryStatus = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Expired', color: 'text-rose-700 bg-rose-50 border-rose-200/70' };
    if (diffDays <= 30) return { label: `${diffDays} days left`, color: 'text-amber-700 bg-amber-50 border-amber-200/70' };
    return { label: `${diffDays} days left`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200/70' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Formulary Expiry Surveillance</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track items expiring within 90 days to prevent clinical dispensing hazards</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>{items.length} {items.length === 1 ? 'Batch' : 'Batches'} Monitored</span>
        </span>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden space-y-3 p-4">
        {/* Search Control */}
        <div className="relative max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search by medicine, code, or vendor..."
            className="w-full bg-white border border-slate-200/90 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-slate-200/70">
          <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-600 text-[11px] uppercase font-semibold tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-3 w-14 text-center">Asset</th>
                <th className="py-2.5 px-3">Product Identifier</th>
                <th className="py-2.5 px-3">Medicine Formulation</th>
                <th className="py-2.5 px-3 text-right">Batch Qty</th>
                <th className="py-2.5 px-3">Supplier Distributor</th>
                <th className="py-2.5 px-3 text-center">Expiration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const status = getExpiryStatus(item.expiry);
                  return (
                    <tr key={`${item.id}-${index}`} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-3 text-center">
                        {item.product?.image ? (
                          <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden mx-auto">
                            <img 
                              src={item.product.image.startsWith('http') || item.product.image.startsWith('data:') ? item.product.image : `/api/operation${item.product.image}`} 
                              alt={item.productName} 
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
                      <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                        {item.productCode}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-900">{item.productName}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="font-mono text-xs font-semibold text-slate-800">
                          {item.quantityReceived}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {item.supplierName}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-700">{item.expiry}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                    {searchTerm ? 'No products matching your search.' : 'No active purchase items nearing expiration.'}
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
