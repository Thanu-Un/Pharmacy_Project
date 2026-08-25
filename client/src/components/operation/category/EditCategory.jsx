import React, { useState, useEffect } from 'react';

export default function EditCategory({ category, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) {
      setFormData({
        code: category.code || '',
        name: category.name || '',
        description: category.description || ''
      });
    }
  }, [category]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/operation/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to update category');
      }

      if (onSaveSuccess) onSaveSuccess();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Category</h1>
          <p className="text-sm text-slate-500 mt-1">Update existing medicine category details</p>
        </div>
        <button 
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Back to List
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-rose-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category Code <span className="text-rose-500">*</span></label>
              <input 
                type="text"
                name="code"
                required
                disabled
                value={formData.code}
                className="w-full md:w-1/2 px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Category code cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category Name <span className="text-rose-500">*</span></label>
              <input 
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Antibiotics"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description about this category..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 resize-y"
              ></textarea>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium shadow-sm shadow-indigo-500/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                'Update Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
