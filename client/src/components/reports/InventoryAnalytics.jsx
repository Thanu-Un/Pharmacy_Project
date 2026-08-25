import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function InventoryAnalytics() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInventoryStatus = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const res = await fetch(`http://localhost:8080/api/reporting/inventory-status`, { headers });
      if (res.ok) setStatus(await res.json());
    } catch (err) {
      console.error(err);
      setError('Failed to load inventory status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryStatus();
  }, []);

  if (loading && !status) {
    return <div className="flex justify-center items-center h-64 text-slate-500">Loading inventory data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-slate-500">Total Stock Value (Cost)</div>
              <div className="mt-1 text-2xl font-bold text-slate-800">${status?.totalStockValue?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-slate-500">Total Items in Stock</div>
              <div className="mt-1 text-2xl font-bold text-slate-800">{status?.totalItems || 0} units</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-slate-500">Low Stock Alerts</div>
              <div className="mt-1 text-2xl font-bold text-rose-600">{status?.lowStockItems || 0} items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
