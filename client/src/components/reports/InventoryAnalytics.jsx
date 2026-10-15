import React, { useState, useEffect } from 'react';

export default function InventoryAnalytics() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInventoryStatus = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const res = await fetch(`/api/reporting/inventory-status`, { headers });
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
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-2"></div>
        <p className="text-xs text-slate-400 font-medium">Auditing stock levels and valuation metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Warehouse Valuation (Cost)</div>
          <div className="text-2xl font-bold font-mono text-slate-900">${status?.totalStockValue?.toFixed(2) || '0.00'}</div>
          <p className="text-[10px] text-slate-400">Total capital invested across all active warehouses</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Physical Units in Stock</div>
          <div className="text-2xl font-bold font-mono text-slate-900">{status?.totalItems || 0} <span className="text-xs font-sans text-slate-400 font-normal">units</span></div>
          <p className="text-[10px] text-slate-400">Aggregated quantities in main packaging units</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Low Stock Threshold Alerts</div>
          <div className="text-2xl font-bold font-mono text-rose-600">{status?.lowStockItems || 0} <span className="text-xs font-sans text-rose-400 font-normal">items</span></div>
          <p className="text-[10px] text-slate-400">Items below configured minimum replenishment count</p>
        </div>
      </div>
    </div>
  );
}
