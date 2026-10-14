import React, { useState, useEffect } from 'react';

export default function UnitList({ onAddClick, onEditClick }) {
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch('/api/operation/units');
        
        if (!response.ok) {
          throw new Error('Failed to fetch units');
        }
        
        const data = await response.json();
        setUnits(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/operation/units/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to delete unit');
      }
      
      setUnits(units.filter(u => u.id !== id));
      setUnitToDelete(null); 
    } catch (err) {
      setError(err.message);
      setUnitToDelete(null); 
      
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Units of Measurement</h1>
          <p className="text-xs text-slate-500 mt-0.5">Dispensary units, packaging metrics, and multiplier rules</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Measurement Unit
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden mb-6">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search units, codes..." 
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 text-slate-700 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="m-4 bg-rose-50 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-rose-200/60">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] whitespace-nowrap text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Unit Name</th>
                <th className="py-3 px-4">Base Unit</th>
                <th className="py-3 px-4 text-center">Operator</th>
                <th className="py-3 px-4 text-center">Ratio</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Loading measurement units...
                  </td>
                </tr>
              ) : (() => {
                const filteredUnits = units.filter(u => 
                  (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
                  (u.code && u.code.toLowerCase().includes(searchTerm.toLowerCase()))
                );

                if (filteredUnits.length === 0) {
                  return (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">
                        {searchTerm ? 'No matching units found.' : 'No measurement units defined yet.'}
                      </td>
                    </tr>
                  );
                }

                return filteredUnits.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                        {u.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{u.name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {u.baseUnitId ? (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                          {units.find(x => x.id === u.baseUnitId)?.name || `ID: ${u.baseUnitId}`}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Base Standard</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-bold">{u.operator || '-'}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{u.operationValue || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onEditClick(u)} title="Edit Unit" className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors mr-2 border border-indigo-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      
                      <div className="relative inline-block">
                        <button onClick={() => setUnitToDelete(u.id)} title="Delete Unit" className="text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-md transition-colors border border-rose-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        
                        {/* Small Popover */}
                        {unitToDelete === u.id && (
                          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-48 bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-lg p-3 z-50 text-left before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-right-[6px] before:border-y-[6px] before:border-y-transparent before:border-l-[6px] before:border-l-white after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:-right-[7px] after:border-y-[7px] after:border-y-transparent after:border-l-[7px] after:border-l-slate-200 after:-z-10 animate-in fade-in zoom-in-95 duration-200">
                            <p className="text-slate-800 font-medium mb-3 text-sm border-b border-slate-100 pb-2">Delete Unit<br/><span className="text-slate-500 font-normal text-xs">Are you sure?</span></p>
                            <div className="flex gap-2">
                              <button onClick={() => handleDelete(u.id)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium py-1.5 rounded transition-colors shadow-sm">Yes I'm sure</button>
                              <button onClick={() => setUnitToDelete(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-1.5 rounded transition-colors">No</button>
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
