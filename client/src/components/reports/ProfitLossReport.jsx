import React, { useState, useEffect } from 'react';

export default function ProfitLossReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchReport = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const url = `/api/reporting/monthly-profit-loss-report?year=${year}`;
      const response = await fetch(url, { headers });
      
      if (!response.ok) throw new Error('Failed to fetch profit and loss report');
      
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
  }, [year]);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500">Loading profit and loss report...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getVal = (monthName, field) => {
    const monthData = reportData.find(d => d.month === monthName);
    if (!monthData) return '-';
    const val = monthData[field];
    if (val === null || val === undefined || val === 0) return '-';
    return `${val.toFixed(2)}$`;
  };

  const getExpenseVal = (monthName, field) => {
    const monthData = reportData.find(d => d.month === monthName);
    if (!monthData) return '0.00';
    const val = monthData[field];
    if (val === null || val === undefined || val === 0) return '-';
    return `${val.toFixed(2)}$`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 overflow-x-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Profit and Loss Statement</h2>
        <p className="text-slate-600">January {year} To December {year}</p>
        <div className="flex justify-center items-center gap-4 mt-2 text-blue-600 text-sm cursor-pointer select-none">
          <span onClick={() => setYear(y => y - 1)}>&lt;&lt;previous</span>
          <span className="font-bold text-slate-800">{year}</span>
          <span onClick={() => setYear(y => y + 1)}>next&gt;&gt;</span>
        </div>
      </div>

      <table className="w-full text-xs text-center border-collapse whitespace-nowrap min-w-max">
        <thead>
          <tr className="bg-[#10b981] text-white">
            <th className="p-2 border border-slate-300 text-left w-64"></th>
            {months.map(m => (
              <th key={m} className="p-2 border border-slate-300 font-medium">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Income Section */}
          <tr className="bg-slate-300 font-bold text-left">
            <td colSpan={13} className="p-2 border border-slate-300">Income</td>
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-6">Total Sale</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getVal(m, 'totalSale')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-6">Total Discount</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getVal(m, 'totalDiscount')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-6 font-medium">Total Net Income</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200 font-medium">{getVal(m, 'totalNetIncome')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-6">Less Of Goods Solds</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200 text-red-500">{getVal(m, 'costOfGoodsSold')}</td>)}
          </tr>
          <tr className="bg-slate-50 font-bold">
            <td className="p-2 border border-slate-200 text-left pl-6 text-slate-800">Gross Profit</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200 text-emerald-600">{getVal(m, 'grossProfit')}</td>)}
          </tr>

          {/* Expenses Section */}
          <tr className="bg-slate-300 font-bold text-left">
            <td colSpan={13} className="p-2 border border-slate-300">Expenses</td>
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Electricity</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'electricity')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Rental</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'rental')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Security</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'security')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Staff Salary</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'staffSalary')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Water expense</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'waterExpense')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Gas</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'gas')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Internet Expense</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'internetExpense')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Office Supply Expense</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'officeSupplyExpense')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Repair & Maintenance</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'repairMaintenance')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Fixed Assets</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'fixedAssets')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Other Expenses</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'otherExpenses')}</td>)}
          </tr>
          <tr>
            <td className="p-2 border border-slate-200 text-left pl-12">Other Costing</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200">{getExpenseVal(m, 'otherCosting')}</td>)}
          </tr>
          <tr className="bg-slate-50 font-medium">
            <td className="p-2 border border-slate-200 text-left pl-12">Total Expenses</td>
            {months.map(m => <td key={m} className="p-2 border border-slate-200 text-red-600">{getExpenseVal(m, 'totalExpenses')}</td>)}
          </tr>

          {/* Net Profit Section */}
          <tr className="bg-slate-300 font-bold text-left">
            <td colSpan={13} className="p-2 border border-slate-300">Net Profit</td>
          </tr>
          <tr className="font-bold text-slate-800">
            <td className="p-3 border border-slate-200 text-center text-sm">Net Profit</td>
            {months.map(m => {
              const monthData = reportData.find(d => d.month === m);
              const val = monthData?.netProfit || 0;
              return (
                <td key={m} className={`p-3 border border-slate-200 ${val < 0 ? 'text-red-600' : val > 0 ? 'text-emerald-600' : ''}`}>
                  {val === 0 ? '0.00' : `${val.toFixed(2)}$`}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
