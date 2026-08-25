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

  if (loading) return <div className="p-6 text-slate-500 text-center">Loading expenses...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">List Expenses</h2>
        <button
          onClick={onAdd}
          className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Add Expense
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-[#10b981] text-white">
              <th className="p-3 border-r border-[#059669]">#</th>
              <th className="p-3 border-r border-[#059669]">Date</th>
              <th className="p-3 border-r border-[#059669]">Reference No</th>
              <th className="p-3 border-r border-[#059669]">Category</th>
              <th className="p-3 border-r border-[#059669] text-right">Amount ($)</th>
              <th className="p-3 border-r border-[#059669]">Note</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {expenses.length === 0 ? (
              <tr><td colSpan="7" className="p-6 text-center text-slate-500">No expenses recorded yet.</td></tr>
            ) : (
              expenses.map((exp, idx) => (
                <tr key={exp.id} className="hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-200 text-slate-500">{idx + 1}</td>
                  <td className="p-3 border-r border-slate-200">{formatDate(exp.date)}</td>
                  <td className="p-3 border-r border-slate-200 font-mono text-xs text-blue-600">{exp.referenceNo}</td>
                  <td className="p-3 border-r border-slate-200">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">{exp.category?.name || '-'}</span>
                  </td>
                  <td className="p-3 border-r border-slate-200 text-right font-medium text-red-600">{exp.amount?.toFixed(2)}</td>
                  <td className="p-3 border-r border-slate-200 text-slate-500">{exp.note || '-'}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => onEdit && onEdit(exp)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(exp.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {expenses.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-200 p-3 flex justify-between items-center text-sm">
            <span className="text-slate-500">Total: {expenses.length} expense(s)</span>
            <span className="font-bold text-red-600">
              Grand Total: ${expenses.reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
