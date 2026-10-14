import React, { useState, useEffect } from 'react';

export default function PurchaseList({ onAddClick, onEditClick }) {
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/operation/purchases');
      if (!response.ok) throw new Error('Failed to fetch purchases');
      const data = await response.json();
      // Sort by date descending
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPurchases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/operation/purchases/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete purchase');
      setPurchases(purchases.filter(p => p.id !== id));
      setPurchaseToDelete(null);
    } catch (err) {
      setError(err.message);
      setPurchaseToDelete(null);
      setTimeout(() => setError(null), 5000);
    }
  };

  const filteredPurchases = purchases.filter(p => 
    p.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Procurement & Stock In</h1>
          <p className="text-xs text-slate-500 mt-0.5">Supplier purchase orders, receiving invoices, and batch intake</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Purchase Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden mb-6">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search reference no, supplier..." 
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 text-slate-700 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="m-4 bg-rose-50 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-rose-200/60">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reference No</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-center">Fulfillment</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">Loading purchase log...</td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">No purchases found.</td>
                </tr>
              ) : (
                filteredPurchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{new Date(p.date).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                        {p.referenceNo}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{p.supplier ? p.supplier.name : 'Unknown'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        p.status?.toLowerCase() === 'received' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border-amber-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status?.toLowerCase() === 'received' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        p.paymentStatus?.toLowerCase() === 'paid' 
                          ? 'bg-sky-50 text-sky-700 border-sky-200/60'
                          : p.paymentStatus?.toLowerCase() === 'due'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.paymentStatus?.toLowerCase() === 'paid' ? 'bg-sky-500' : p.paymentStatus?.toLowerCase() === 'due' ? 'bg-rose-500' : 'bg-indigo-500'}`}></span>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${Number(p.grandTotal || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button onClick={() => onEditClick(p)} title="Edit Purchase" className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors mr-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => setPurchaseToDelete(p.id)} title="Delete Purchase" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
