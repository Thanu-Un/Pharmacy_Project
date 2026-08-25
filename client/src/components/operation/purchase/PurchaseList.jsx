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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Purchases (Stock In)</h1>
          <p className="text-sm text-slate-500 mt-1">Manage stock receiving, supplier invoices, and inventory additions.</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Purchase
        </button>
      </div>

      <div className="mb-6 flex justify-end">
        <div className="flex items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-full max-w-md focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
          <svg className="w-5 h-5 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Search by Reference No, Supplier..." 
            className="w-full bg-transparent border-none focus:ring-0 text-slate-700 ml-3 outline-none placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-rose-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Reference No</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4 text-center">Purchase Status</th>
                <th className="px-6 py-4 text-center">Payment Status</th>
                <th className="px-6 py-4 text-right">Grand Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">Loading purchases...</td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">No purchases found.</td>
                </tr>
              ) : (
                filteredPurchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">{new Date(p.date).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600">
                      <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">
                        {p.referenceNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{p.supplier ? p.supplier.name : 'Unknown'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        p.status?.toLowerCase() === 'received' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status?.toLowerCase() === 'received' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        p.paymentStatus?.toLowerCase() === 'paid' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : p.paymentStatus?.toLowerCase() === 'due'
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.paymentStatus?.toLowerCase() === 'paid' ? 'bg-emerald-500' : p.paymentStatus?.toLowerCase() === 'due' ? 'bg-rose-500' : 'bg-indigo-500'}`}></span>
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      ${Number(p.grandTotal).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right sticky right-0 bg-white">
                      <button onClick={() => onEditClick(p)} title="Edit Purchase" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors mr-2 border border-indigo-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <div className="relative inline-block">
                        <button onClick={() => setPurchaseToDelete(p.id)} title="Delete Purchase" className="text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-md transition-colors border border-rose-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        {purchaseToDelete === p.id && (
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-48 bg-white border border-slate-200 shadow-lg rounded-lg p-3 z-50 text-left">
                            <p className="text-slate-800 font-medium mb-3 text-sm border-b border-slate-100 pb-2">Delete Purchase?<br/><span className="text-slate-500 font-normal text-xs">Are you sure?</span></p>
                            <div className="flex gap-2">
                              <button onClick={() => handleDelete(p.id)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium py-1.5 rounded">Yes</button>
                              <button onClick={() => setPurchaseToDelete(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 rounded">No</button>
                            </div>
                          </div>
                        )}
                      </div>
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
