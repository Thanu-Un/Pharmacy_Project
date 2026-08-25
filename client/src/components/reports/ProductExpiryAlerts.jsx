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
      const response = await fetch('http://localhost:8080/api/operation/purchases', { headers });
      if (!response.ok) throw new Error('Failed to fetch purchases');
      
      const purchases = await response.json();
      
      // Flatten all purchase items that have an expiry date within 3 months
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
                  supplierName: purchase.supplier?.name || 'N/A',
                  purchaseDate: purchase.date,
                  referenceNo: purchase.referenceNo
                });
              }
            }
          });
        }
      });
      
      // Sort by expiry date (nearest first)
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
    return <div className="flex justify-center items-center h-64 text-slate-500">Loading expiry alerts...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
  }

  const filteredItems = items.filter(p => 
    (p.productName && p.productName.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.productCode && p.productCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper to check if item is already expired or expiring soon (within 30 days)
  const getExpiryStatus = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Expired', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    if (diffDays <= 30) return { label: `In ${diffDays} days`, color: 'text-amber-600 bg-amber-50 border-amber-100' };
    return { label: `In ${diffDays} days`, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="bg-white px-8 py-6 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Product Expiry Alerts</h1>
            <p className="text-slate-500 mt-1">Track products that are nearing their expiration date.</p>
          </div>
          <span className="bg-amber-100 text-amber-700 py-1 px-3 rounded-full text-sm font-bold">
            {items.length} {items.length === 1 ? 'Item' : 'Items'} with expiry dates
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {/* Header Controls */}
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search by name, code or supplier..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-emerald-600 text-white font-semibold border-b border-emerald-700 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">Image</th>
                  <th className="px-6 py-4">Product Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 text-center">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const status = getExpiryStatus(item.expiry);
                    return (
                      <tr 
                        key={`${item.id}-${index}`} 
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-4 text-center">
                          {item.product?.image ? (
                            <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden mx-auto">
                              <img 
                                src={`http://localhost:8080${item.product.image}`} 
                                alt={item.productName} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                   e.target.onerror = null; 
                                   e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-emerald-600">
                          <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">
                            {item.productCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">{item.productName}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-sm font-bold border border-slate-200">
                            {item.quantityReceived}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {item.supplierName}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="font-semibold text-slate-700">{item.expiry}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                      {searchTerm ? 'No products matching your search.' : 'No products with expiry dates found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
