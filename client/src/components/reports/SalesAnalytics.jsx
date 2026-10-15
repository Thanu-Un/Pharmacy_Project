import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function SalesAnalytics() {
  const [dateRange, setDateRange] = useState('7days');
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
        // today
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

      const sumRes = await fetch(`/api/reporting/sales-summary?startDate=${sdStr}&endDate=${edStr}`, { headers });
      if (sumRes.ok) setSummary(await sumRes.json());

      const dailyRes = await fetch(`/api/reporting/daily-sales?startDate=${sdStr}&endDate=${edStr}`, { headers });
      if (dailyRes.ok) setDailySales(await dailyRes.json());

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

  const COLORS = ['#0f172a', '#0284c7', '#0d9488', '#e11d48', '#8b5cf6'];

  if (loading && !summary) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-2"></div>
        <p className="text-xs text-slate-400 font-medium">Aggregating telemetry & sales revenue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Financial Overview</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Time Window:</label>
          <select 
            className="bg-white border border-slate-200/90 rounded-lg py-1.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium shadow-sm transition-all"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today (24h)</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="thisMonth">This Calendar Month</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Sales Revenue</div>
          <div className="text-2xl font-bold font-mono text-slate-900">${summary?.totalRevenue?.toFixed(2) || '0.00'}</div>
          <p className="text-[10px] text-slate-400">Total received before deductions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total COGS / Inflow Cost</div>
          <div className="text-2xl font-bold font-mono text-slate-900">${summary?.totalCost?.toFixed(2) || '0.00'}</div>
          <p className="text-[10px] text-slate-400">Acquisition cost of dispensed items</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Operating Margin</div>
          <div className={`text-2xl font-bold font-mono ${summary?.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            ${summary?.netProfit?.toFixed(2) || '0.00'}
          </div>
          <p className="text-[10px] text-slate-400">Gross margin minus acquisition costs</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Completed Invoices</div>
          <div className="text-2xl font-bold font-mono text-slate-900">{summary?.invoiceCount || 0}</div>
          <p className="text-[10px] text-slate-400">Total patient checkout tickets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Dispensing Revenue Trajectory</h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">USD Daily</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dx={-10} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '11px'}}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2.5} dot={{r: 3.5, fill: '#0f172a', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 5}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Dispensed Items</h3>
          </div>
          <div className="h-64">
            {topMedicines.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topMedicines}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="quantitySold"
                    nameKey="medicineName"
                  >
                    {topMedicines.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{fontSize: '11px', borderRadius: '6px'}} formatter={(value) => [`${value} units`, 'Dispensed']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No dispensing transactions recorded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
