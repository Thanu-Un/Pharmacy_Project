import React, { useState, useEffect } from 'react';

export default function ExpenseList({ onAdd, onEdit }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const response = await fetch('/api/operation/expenses', { headers });
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const response = await fetch(`/api/operation/expenses/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) throw new Error('Failed to delete expense');
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Dispensary Operating Expenses</h1>
          <p className="text-xs text-slate-500 mt-0.5">Disbursement ledger, facility overheads, and miscellaneous pharmacy costs</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Record Expense
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden mb-6">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <svg className="animate-spin h-6 w-6 text-sky-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading expense ledger...</span>
          </div>
        ) : error ? (
          <div className="m-4 bg-rose-50 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-rose-200/60">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Reference No</th>
                  <th className="py-3 px-4">Cost Center / Category</th>
                  <th className="py-3 px-4 text-right">Amount ($)</th>
                  <th className="py-3 px-4">Clinical Memo</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {expenses.length === 0 ? (
                  <tr><td colSpan="7" className="py-12 text-center text-slate-400">No expenses recorded yet.</td></tr>
                ) : (
                  expenses.map((exp, idx) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{formatDate(exp.date)}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                          {exp.referenceNo}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-slate-200/60">
                          {exp.category?.name || 'General Expense'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 tabular-nums">
                        ${Number(exp.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate">{exp.note || '—'}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button onClick={() => onEdit && onEdit(exp)} className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors mr-1" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {expenses.length > 0 && (
              <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 py-3 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Recorded Ledger: {expenses.length} transaction(s)</span>
                <span className="font-mono font-bold text-slate-900">
                  Total Disbursements: <span className="text-rose-600">${expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
