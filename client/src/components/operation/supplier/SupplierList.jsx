import React, { useState, useEffect } from 'react';

export default function SupplierList({ onAddClick, onEditClick }) {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/operation/suppliers');
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/operation/suppliers/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete supplier');
      setSuppliers(suppliers.filter(s => s.id !== id));
      setSupplierToDelete(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.company?.toLowerCase().includes(term) ||
      s.name?.toLowerCase().includes(term) ||
      s.phone?.toLowerCase().includes(term) ||
      s.emailAddress?.toLowerCase().includes(term) ||
      s.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Suppliers List</h1>
          <p className="text-sm text-slate-500 mt-1">Manage medicine wholesale suppliers and distributors</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm shadow-emerald-500/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search by company, name, phone or city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="p-6 text-center text-rose-600">
            <p className="font-semibold">Error: {error}</p>
            <button onClick={fetchSuppliers} className="mt-2 text-sm text-emerald-600 underline">Try again</button>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <svg className="animate-spin h-8 w-8 text-emerald-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading suppliers list...</span>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <p className="text-lg font-bold text-slate-700">No Suppliers Found</p>
            <p className="text-sm text-slate-400 mt-1">Try searching for something else or add a new supplier.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Company Name</th>
                  <th className="px-6 py-4">Contact Person</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Address</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4 text-right sticky right-0 bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredSuppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{s.company}</td>
                    <td className="px-6 py-4">{s.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{s.phone}</td>
                    <td className="px-6 py-4 text-slate-500">{s.emailAddress || '—'}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={s.address}>{s.address || '—'}</td>
                    <td className="px-6 py-4">
                      {s.city ? (
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-semibold">
                          {s.city}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right sticky right-0 bg-white">
                      <button 
                        onClick={() => onEditClick(s)} 
                        title="Edit Supplier" 
                        className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors mr-2 border border-indigo-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setSupplierToDelete(s.id)} 
                          title="Delete Supplier" 
                          className="text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-md transition-colors border border-rose-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        
                        {supplierToDelete === s.id && (
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-48 bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-lg p-3 z-50 text-left before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-right-[6px] before:border-y-[6px] before:border-y-transparent before:border-l-[6px] before:border-l-white after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:-right-[7px] after:border-y-[7px] after:border-y-transparent after:border-l-[7px] after:border-l-slate-200 after:-z-10 animate-in fade-in zoom-in-95 duration-200">
                            <p className="text-slate-800 font-medium mb-3 text-sm border-b border-slate-100 pb-2">Delete Supplier<br/><span className="text-slate-500 font-normal text-xs">Are you sure?</span></p>
                            <div className="flex gap-2">
                              <button onClick={() => handleDelete(s.id)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium py-1.5 rounded transition-colors shadow-sm">Yes I'm sure</button>
                              <button onClick={() => setSupplierToDelete(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 rounded transition-colors">No</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
