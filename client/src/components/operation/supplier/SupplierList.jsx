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
      setError(null);
      const response = await fetch('/api/operation/suppliers');
      if (!response.ok) throw new Error('Failed to fetch suppliers list');
      const data = await response.json();
      setSuppliers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/operation/suppliers/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete supplier');
      setSuppliers(suppliers.filter(s => s.id !== id));
      setSupplierToDelete(null);
    } catch (err) {
      setError(err.message);
      setSupplierToDelete(null);
      setTimeout(() => setError(null), 5000);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const term = searchTerm.toLowerCase();
    const company = (s.company || '').toLowerCase();
    const name = (s.name || '').toLowerCase();
    const phone = (s.phone || '').toLowerCase();
    const city = (s.city || '').toLowerCase();
    return company.includes(term) || name.includes(term) || phone.includes(term) || city.includes(term);
  });

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Vendors & Suppliers</h1>
          <p className="text-xs text-slate-500 mt-0.5">Pharmaceutical wholesale distributors, laboratory vendors, and supply contacts</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add Supplier Partner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden mb-6">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search supplier company, contact, phone, city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>

        {error && (
          <div className="m-4 bg-rose-50 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-rose-200/60">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
            <button onClick={fetchSuppliers} className="ml-auto text-sky-600 underline font-medium">Retry</button>
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <svg className="animate-spin h-6 w-6 text-sky-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading supplier directory...</span>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-700 text-sm">No Suppliers Found</p>
            <p className="text-slate-400 mt-1">Try another search or register a new vendor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSuppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.company}</td>
                    <td className="py-3 px-4 text-slate-700">{s.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{s.phone}</td>
                    <td className="py-3 px-4 text-slate-500">{s.emailAddress || '—'}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={s.address}>{s.address || '—'}</td>
                    <td className="py-3 px-4">
                      {s.city ? (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                          {s.city}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => onEditClick(s)} 
                        title="Edit Supplier" 
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors mr-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      
                      <div className="relative inline-block text-left">
                        <button 
                          onClick={() => setSupplierToDelete(s.id)} 
                          title="Delete Supplier" 
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        
                        {supplierToDelete === s.id && (
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-48 bg-white border border-slate-200 shadow-lg rounded-lg p-3 z-50 text-left">
                            <p className="text-slate-800 font-medium mb-3 text-sm border-b border-slate-100 pb-2">Delete Supplier?<br/><span className="text-slate-500 font-normal text-xs">Are you sure?</span></p>
                            <div className="flex gap-2">
                              <button onClick={() => handleDelete(s.id)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium py-1.5 rounded transition-colors shadow-sm">Yes</button>
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
