import React, { useState, useEffect } from 'react';

export default function ExpenseCategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [submitError, setSubmitError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const response = await fetch('/api/operation/expense-categories', { headers });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    setSubmitError('');
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, code: category.code || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', code: `EXP-${(categories.length + 1).toString().padStart(3, '0')}` });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const headers = { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };
      
      const payload = { ...formData };
      if (editingCategory) payload.id = editingCategory.id;

      const response = await fetch('/api/operation/expense-categories', {
        method: 'POST', // Backend currently uses POST for both create and update if ID exists, or we may need to adjust if it doesn't.
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save category');
      
      await fetchCategories();
      handleCloseModal();
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const response = await fetch(`/api/operation/expense-categories/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) throw new Error('Failed to delete category');
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-6 text-slate-500 text-center">Loading categories...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Expense Categories</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          + Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-[#10b981] text-white">
              <th className="p-3 border-r border-[#059669] cursor-pointer hover:bg-[#059669] transition-colors">
                <div className="flex items-center justify-between">
                  Category Code
                  <svg className="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </div>
              </th>
              <th className="p-3 border-r border-[#059669] cursor-pointer hover:bg-[#059669] transition-colors">
                <div className="flex items-center justify-between">
                  Category Name
                  <svg className="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </div>
              </th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categories.length === 0 ? (
              <tr><td colSpan="3" className="p-4 text-center text-slate-500">No categories found.</td></tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-200 font-medium text-slate-700">{cat.code || '-'}</td>
                  <td className="p-3 border-r border-slate-200 text-slate-600">{cat.name}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleOpenModal(cat)} className="text-blue-500 hover:text-blue-700 p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
            
            {submitError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{submitError}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category Code</label>
                  <input 
                    type="text" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#4a89dc]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#4a89dc]"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#4a89dc] hover:bg-[#3b75c3] text-white rounded-md transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
