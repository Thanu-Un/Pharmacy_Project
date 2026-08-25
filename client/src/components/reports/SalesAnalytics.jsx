import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function SalesAnalytics() {
  const [dateRange, setDateRange] = useState('7days'); // today, 7days, 30days, thisMonth
  const [summary, setSummary] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      let startDate = new Date();
      let endDate = new Date();

      if (dateRange === 'today') {
        // already today
      } else if (dateRange === '7days') {
        startDate = subDays(new Date(), 6);
      } else if (dateRange === '30days') {
        startDate = subDays(new Date(), 29);
      } else if (dateRange === 'thisMonth') {
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
      }

      const sdStr = format(startDate, 'yyyy-MM-dd');
      const edStr = format(endDate, 'yyyy-MM-dd');

      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

      // Fetch summary
      const sumRes = await fetch(`/api/reporting/sales-summary?startDate=${sdStr}&endDate=${edStr}`, { headers });
      if (sumRes.ok) setSummary(await sumRes.json());

      // Fetch daily sales
      const dailyRes = await fetch(`/api/reporting/daily-sales?startDate=${sdStr}&endDate=${edStr}`, { headers });
      if (dailyRes.ok) setDailySales(await dailyRes.json());

      // Fetch top medicines
      const topRes = await fetch(`/api/reporting/top-medicines?startDate=${sdStr}&endDate=${edStr}&limit=5`, { headers });
      if (topRes.ok) setTopMedicines(await topRes.json());

    } catch (err) {
      console.error(err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading && !summary) {
    return <div className="flex justify-center items-center h-64 text-slate-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <select 
          className="border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#10b981] focus:border-[#10b981] sm:text-sm"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Revenue</div>
          <div className="mt-2 text-3xl font-bold text-slate-800">${summary?.totalRevenue?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Cost</div>
          <div className="mt-2 text-3xl font-bold text-slate-800">${summary?.totalCost?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Net Profit</div>
          <div className={`mt-2 text-3xl font-bold ${summary?.netProfit >= 0 ? 'text-[#10b981]' : 'text-rose-500'}`}>
            ${summary?.netProfit?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Invoices</div>
          <div className="mt-2 text-3xl font-bold text-slate-800">{summary?.invoiceCount || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Top Medicines</h3>
          <div className="h-72">
            {topMedicines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topMedicines}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="quantitySold"
                    nameKey="medicineName"
                  >
                    {topMedicines.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} units`, 'Sold']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
