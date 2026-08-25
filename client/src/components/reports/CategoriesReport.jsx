import React, { useState, useEffect } from 'react';

export default function CategoriesReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      let url = '/api/reporting/categories-report';
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await fetch(url, { headers });
      
      if (!response.ok) throw new Error('Failed to fetch categories report');
      
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []); // Only fetch on mount, let user click Refresh for dates

  // Filter the data based on search query
  const filteredData = reportData.filter(row => 
    row.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    row.categoryCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500">Loading categories report...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
  }

  // Calculate totals for filtered data
  const totals = filteredData.reduce((acc, row) => ({
    purchasedAmt: acc.purchasedAmt + (row.purchasedAmt || 0),
    soldAmt: acc.soldAmt + (row.soldAmt || 0),
    profitLoss: acc.profitLoss + (row.profitLoss || 0)
  }), { purchasedAmt: 0, soldAmt: 0, profitLoss: 0 });

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-slate-800">Categories Report</h2>
        
        <div className="flex items-center gap-4 flex-wrap">
          <input 
            type="text" 
            placeholder="Search by code or name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-slate-500">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button 
            onClick={fetchReport}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-600 text-white text-sm">
              <th className="p-3 font-medium border-b border-emerald-700 whitespace-nowrap">Category Code</th>
              <th className="p-3 font-medium border-b border-emerald-700 whitespace-nowrap">Category Name</th>
              <th className="p-3 font-medium border-b border-emerald-700 text-right whitespace-nowrap">Purchased</th>
              <th className="p-3 font-medium border-b border-emerald-700 text-right whitespace-nowrap">Sold</th>
              <th className="p-3 font-medium border-b border-emerald-700 text-right whitespace-nowrap">Purchased Amount</th>
              <th className="p-3 font-medium border-b border-emerald-700 text-right whitespace-nowrap">Sold Amount</th>
              <th className="p-3 font-medium border-b border-emerald-700 text-right whitespace-nowrap">Profit and/or Loss</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredData.map((row, index) => (
              <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                <td className="p-3 text-slate-600">{row.categoryCode}</td>
                <td className="p-3 text-slate-800">{row.categoryName}</td>
                <td className="p-3 text-right text-slate-800">{row.purchasedQty || 0}</td>
                <td className="p-3 text-right text-slate-800">{row.soldQty || 0}</td>
                <td className="p-3 text-right text-slate-800 font-medium">{(row.purchasedAmt || 0).toFixed(2)}$</td>
                <td className="p-3 text-right text-slate-800 font-medium">{(row.soldAmt || 0).toFixed(2)}$</td>
                <td className="p-3 text-right">
                  <span className={`font-medium ${row.profitLoss >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                    {(row.profitLoss || 0).toFixed(2)}$
                  </span>
                </td>
              </tr>
            ))}
            
            {/* Total Row */}
            <tr className="bg-slate-50 border-t-2 border-slate-300 font-semibold text-slate-800">
              <td className="p-3" colSpan={4}>Total</td>
              <td className="p-3 text-right">{totals.purchasedAmt.toFixed(2)}$</td>
              <td className="p-3 text-right">{totals.soldAmt.toFixed(2)}$</td>
              <td className={`p-3 text-right ${totals.profitLoss >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                {totals.profitLoss.toFixed(2)}$
              </td>
            </tr>
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No categories data found for the selected period.
          </div>
        )}
      </div>
    </div>
  );
}
