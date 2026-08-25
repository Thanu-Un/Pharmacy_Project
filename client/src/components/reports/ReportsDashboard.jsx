import React, { useState, useEffect } from 'react';
import SalesAnalytics from './SalesAnalytics';
import InventoryAnalytics from './InventoryAnalytics';

export default function ReportsDashboard({ permissions, currentView }) {
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    if (currentView === 'Reports') {
      setActiveTab('sales');
    }
    // Add logic for other views as they are implemented
  }, [currentView]);

  const tabs = [
    { id: 'sales', label: 'Sales & Revenue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'inventory', label: 'Inventory & Stock', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    // more tabs can be added here
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white px-8 py-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Business Reports</h1>
        <p className="text-slate-500 mt-1">View insights and analytics for your pharmacy.</p>
        
        {/* Tabs */}
        <div className="flex space-x-6 mt-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-[#10b981] text-[#10b981]' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'sales' && <SalesAnalytics />}
        {activeTab === 'inventory' && <InventoryAnalytics />}
      </div>
    </div>
  );
}
