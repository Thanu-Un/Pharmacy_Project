import React, { useState, useEffect } from 'react';
import SalesAnalytics from './SalesAnalytics';
import InventoryAnalytics from './InventoryAnalytics';

export default function ReportsDashboard({ permissions, currentView }) {
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    if (currentView === 'Reports') {
      setActiveTab('sales');
    }
  }, [currentView]);

  const tabs = [
    { id: 'sales', label: 'Sales & Revenue Analytics', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'inventory', label: 'Formulary & Stock Valuation', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header */}
      <div className="bg-white px-6 py-5 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Clinical & Business Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">Real-time revenue metrics, profit performance, and warehouse valuation</p>
          </div>
        </div>
        
        {/* Modern Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 w-fit mt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'sales' && <SalesAnalytics />}
        {activeTab === 'inventory' && <InventoryAnalytics />}
      </div>
    </div>
  );
}
