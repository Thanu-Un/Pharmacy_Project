import React, { useState, useEffect } from 'react';

export default function ProductList({ onAddClick, onEditClick }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/operation/products');
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/operation/products/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to delete product');
      }
      
      setProducts(products.filter(p => p.id !== id));
      setProductToDelete(null); 
    } catch (err) {
      setError(err.message);
      setProductToDelete(null); 
      
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Medicines (Products)</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your complete medicine inventory, pricing, and units.</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Medicine
        </button>
      </div>

      <div className="mb-6 flex justify-end">
        <div className="flex items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-full max-w-md focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
          <svg className="w-5 h-5 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text" 
            placeholder="Search medicines by code, name, category..." 
            className="w-full bg-transparent border-none focus:ring-0 text-slate-700 ml-3 outline-none placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-rose-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Cost</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Stock Qty</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : (() => {
                const filteredProducts = products.filter(p => 
                  (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
                  (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (p.category?.name && p.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
                );

                if (filteredProducts.length === 0) {
                  return (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-slate-400">
                        {searchTerm ? 'No matching products found.' : 'No products found. Click \'Add New Medicine\' to create one.'}
                      </td>
                    </tr>
                  );
                }

                return filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      {p.image ? (
                        <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-600">
                      <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{p.name}</td>
                    <td className="px-6 py-4">
                      {p.category ? (
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
                          {p.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">
                      ${Number(p.cost || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700">
                      ${Number(p.price).toFixed(2)}
                      {p.saleUnit && <span className="text-xs text-slate-400 block font-normal">per {p.saleUnit.name}</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${Number(p.quantity) <= Number(p.alertQuantity) ? 'text-rose-600' : 'text-slate-700'}`}>
                        {Number(p.quantity).toFixed(0)}
                      </span>
                      {p.unit && <span className="text-xs text-slate-500 ml-1">{p.unit.name}</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {Number(p.quantity) > Number(p.alertQuantity) ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          In Stock
                        </span>
                      ) : Number(p.quantity) > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-rose-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right sticky right-0 bg-white">
                      <button onClick={() => onEditClick(p)} title="Edit Medicine" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors mr-2 border border-indigo-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      
                      <div className="relative inline-block">
                        <button onClick={() => setProductToDelete(p.id)} title="Delete Medicine" className="text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-md transition-colors border border-rose-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        
                        {productToDelete === p.id && (
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-48 bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-lg p-3 z-50 text-left before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-right-[6px] before:border-y-[6px] before:border-y-transparent before:border-l-[6px] before:border-l-white after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:-right-[7px] after:border-y-[7px] after:border-y-transparent after:border-l-[7px] after:border-l-slate-200 after:-z-10 animate-in fade-in zoom-in-95 duration-200">
                            <p className="text-slate-800 font-medium mb-3 text-sm border-b border-slate-100 pb-2">Delete Medicine<br/><span className="text-slate-500 font-normal text-xs">Are you sure?</span></p>
                            <div className="flex gap-2">
                              <button onClick={() => handleDelete(p.id)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium py-1.5 rounded transition-colors shadow-sm">Yes I'm sure</button>
                              <button onClick={() => setProductToDelete(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 rounded transition-colors">No</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
