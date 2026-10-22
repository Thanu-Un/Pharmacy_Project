import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function TransferList({ onAddClick, permissions = [] }) {
  const { t } = useTranslation();
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingTransfer, setViewingTransfer] = useState(null);
  const [transferToDelete, setTransferToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/operation/transfers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch stock transfers');
      const data = await response.json();
      setTransfers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/operation/transfers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Failed to delete transfer');
      }
      setTransfers(transfers.filter(tr => tr.id !== id));
      setTransferToDelete(null);
    } catch (err) {
      setError(err.message);
      setTransferToDelete(null);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTransfers = transfers.filter(tr => 
    tr.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tr.fromWarehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tr.toWarehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tr.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            {t('transfer.title') || 'Inter-Warehouse Stock Transfers'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('transfer.subtitle') || 'Shift and balance medicine stock between branches and warehouses'}
          </p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-obsidian-900 hover:bg-obsidian-800 text-white text-xs px-3.5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all whitespace-nowrap active:scale-[0.98] cursor-pointer"
        >
          <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          {t('transfer.new_transfer') || 'New Stock Transfer'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-lg text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-card border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text" 
              placeholder={t('transfer.search_placeholder') || "Search by reference no, warehouse, note..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {filteredTransfers.length} {t('transfer.records') || 'Transfers'}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">{t('transfer.reference') || 'Reference'}</th>
                <th className="py-3 px-4">{t('transfer.date') || 'Date & Time'}</th>
                <th className="py-3 px-4">{t('transfer.from_warehouse') || 'Source (From)'}</th>
                <th className="py-3 px-4 text-center">→</th>
                <th className="py-3 px-4">{t('transfer.to_warehouse') || 'Destination (To)'}</th>
                <th className="py-3 px-4 text-center">{t('transfer.items_count') || 'Items Count'}</th>
                <th className="py-3 px-4 text-center">{t('transfer.status') || 'Status'}</th>
                <th className="py-3 px-4 text-right">{t('common.action') || 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-brand-500 border-t-transparent mb-2"></div>
                    <div>{t('common.loading') || 'Loading transfers...'}</div>
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 italic">
                    {t('transfer.no_transfers') || 'No stock transfer records found.'}
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-brand-600 dark:text-brand-400">
                      {tr.referenceNo}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {tr.date ? new Date(tr.date).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium border border-amber-200/60 dark:border-amber-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {tr.fromWarehouse?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400 font-bold">
                      →
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200/60 dark:border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {tr.toWarehouse?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {tr.items ? tr.items.length : (tr.totalItems || 0)} {t('transfer.skus') || 'SKUs'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                        {tr.status || 'Completed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingTransfer(tr)}
                          title={t('transfer.view_details') || 'View Details'}
                          className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTransferToDelete(tr)}
                          title={t('common.delete') || 'Delete & Revert Stock'}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Transfer Modal */}
      {viewingTransfer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {t('transfer.details') || 'Transfer Details'}
                  </h3>
                  <span className="font-mono text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-200/60">
                    {viewingTransfer.referenceNo}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {viewingTransfer.date ? new Date(viewingTransfer.date).toLocaleString() : ''}
                </p>
              </div>
              <button 
                onClick={() => setViewingTransfer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Route Summary Card */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-700/60 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('transfer.from_warehouse') || 'Source Warehouse'}</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">{viewingTransfer.fromWarehouse?.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">{viewingTransfer.fromWarehouse?.code}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('transfer.to_warehouse') || 'Destination Warehouse'}</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">{viewingTransfer.toWarehouse?.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">{viewingTransfer.toWarehouse?.code}</div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {t('transfer.transferred_items') || 'Transferred Medicines'}
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-3">{t('common.code') || 'Code'}</th>
                        <th className="py-2.5 px-3">{t('common.name') || 'Medicine'}</th>
                        <th className="py-2.5 px-3 text-right">{t('common.quantity') || 'Quantity'}</th>
                        <th className="py-2.5 px-3">{t('common.unit') || 'Unit'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {viewingTransfer.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-mono text-slate-500">{item.productCode || item.product?.code}</td>
                          <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-100">{item.productName || item.product?.name}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-brand-600 dark:text-brand-400">{item.quantity}</td>
                          <td className="py-2 px-3 text-slate-500">{item.unit?.name || 'Base'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Note */}
              {viewingTransfer.note && (
                <div className="text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{t('common.notes') || 'Note'}: </span>
                  <span className="text-slate-500 dark:text-slate-400">{viewingTransfer.note}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/20">
              <button
                onClick={() => setViewingTransfer(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {t('common.close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {transferToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('transfer.delete_confirm_title') || 'Delete & Revert Stock?'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              {t('transfer.delete_confirm_desc') || 'Deleting this transfer will automatically return the stock back to the source warehouse and deduct it from the destination warehouse.'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setTransferToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                disabled={isDeleting}
                onClick={() => handleDelete(transferToDelete.id)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (t('common.processing') || 'Processing...') : (t('transfer.confirm_delete') || 'Yes, Delete & Revert')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
