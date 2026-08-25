import React, { useState, useEffect } from 'react';

export default function AddExpense({ onBack, onSave }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    amount: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        const response = await fetch('/api/operation/expense-categories', { headers });
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, categoryId: data[0].id }));
      } catch (err) {
        setError(err.message);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };

      const payload = {
        date: formData.date + 'T10:00:00',
        category: { id: parseInt(formData.categoryId) },
        amount: parseFloat(formData.amount),
        note: formData.note || null
      };

      const response = await fetch('/api/operation/expenses', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save expense');

      if (onSave) onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6 max-w-2xl mx-auto">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Add Expense</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-[#4a89dc] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-[#4a89dc] focus:border-transparent"
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.code} - {cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($) <span className="text-red-500">*</span></label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-[#4a89dc] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Optional note..."
              rows={3}
              className="w-full border border-slate-300 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-[#4a89dc] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-md transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
