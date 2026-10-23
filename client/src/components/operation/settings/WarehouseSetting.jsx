import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function WarehouseSetting() {
  const { t } = useTranslation();
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalError, setModalError] = useState('');
  const [pageError, setPageError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [form, setForm] = useState({
    code: '',
    name: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const suggestNextCode = (list) => {
    let maxNum = 0;
    list.forEach(w => {
      if (w.code) {
        const match = w.code.match(/^[Ww][Hh](\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });
    return `WH${String(maxNum + 1).padStart(2, '0')}`;
  };

  const fetchWarehouses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/operation/warehouses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data);
      } else {
        setPageError('Failed to load warehouses');
      }
    } catch (e) {
      console.error(e);
      setPageError(e.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (warehouse = null) => {
    setModalError('');
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setForm({
        code: warehouse.code || '',
        name: warehouse.name || '',
        address: warehouse.address || '',
        phone: warehouse.phone || ''
      });
    } else {
      setEditingWarehouse(null);
      setForm({
        code: suggestNextCode(warehouses),
        name: '',
        address: '',
        phone: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');

    const trimmedCode = (form.code || '').trim();
    const trimmedName = (form.name || '').trim();

    if (!trimmedCode) {
      setModalError(t('warehouse_mgmt.err_code_required') || 'Warehouse code is required');
      return;
    }
    if (!trimmedName) {
      setModalError(t('warehouse_mgmt.err_name_required') || 'Warehouse name is required');
      return;
    }

    // Client-side uniqueness check to prevent unnecessary failed requests
    const isDuplicate = warehouses.some(w => 
      w.code && w.code.trim().toLowerCase() === trimmedCode.toLowerCase() &&
      (!editingWarehouse || w.id !== editingWarehouse.id)
    );

    if (isDuplicate) {
      setModalError(`Warehouse code "${trimmedCode}" already exists. Please choose a different code.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingWarehouse 
        ? `/api/operation/warehouses/${editingWarehouse.id}`
        : '/api/operation/warehouses';
      const method = editingWarehouse ? 'PUT' : 'POST';

      const payload = {
        code: trimmedCode,
        name: trimmedName,
        address: (form.address || '').trim(),
        phone: (form.phone || '').trim()
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setSuccessMsg(t('warehouse_mgmt.success_save') || 'Warehouse saved successfully!');
        await fetchWarehouses();
        // Notify other components (Header, Transfer, POS) that warehouses changed
        try {
          window.dispatchEvent(new Event('warehousesUpdated'));
          window.dispatchEvent(new Event('refreshDashboard'));
        } catch (_) {}
      } else {
        const errorData = await res.json().catch(() => ({}));
        setModalError(errorData.message || 'Failed to save warehouse. Please check that the code is unique.');
      }
    } catch (e) {
      console.error(e);
      setModalError(e.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (warehouse) => {
    setDeleteError('');
    setWarehouseToDelete(warehouse);
  };

  const handleConfirmDelete = async () => {
    if (!warehouseToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError('');
      const res = await fetch(`/api/operation/warehouses/${warehouseToDelete.id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.ok) {
        setWarehouseToDelete(null);
        setSuccessMsg(t('warehouse_mgmt.success_delete') || 'Warehouse deleted successfully!');
        await fetchWarehouses();
        try {
          window.dispatchEvent(new Event('warehousesUpdated'));
          window.dispatchEvent(new Event('refreshDashboard'));
        } catch (_) {}
      } else {
        const errorData = await res.json().catch(() => ({}));
        setDeleteError(errorData.message || 'Cannot delete warehouse. It may be linked to existing stock or transfer records.');
      }
    } catch (e) {
      console.error(e);
      setDeleteError(e.message || 'Failed to delete warehouse due to network error.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredWarehouses = warehouses.filter(w => 
    (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t('warehouse_mgmt.title') || 'Warehouse & Branches'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('warehouse_mgmt.subtitle') || 'Manage pharmacy branches, central warehouses, and dispensing depot locations'}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{t('warehouse_mgmt.add_warehouse') || 'Add Warehouse'}</span>
        </button>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {pageError && (
        <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-800 text-xs font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{pageError}</span>
          </div>
          <button onClick={() => setPageError('')} className="text-rose-500 hover:text-rose-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('warehouse_mgmt.search_placeholder') || 'Filter branches by code or name...'}
          className="w-full bg-white border border-slate-200/90 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium transition-all"
        />
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{t('warehouse_mgmt.loading') || 'Loading warehouses...'}</span>
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              {t('warehouse_mgmt.no_warehouses') || 'No warehouses found'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
              {t('warehouse_mgmt.subtitle') || 'Register your pharmacy storage and branch facility locations.'}
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-1.5 text-xs text-sky-600 font-semibold hover:underline"
            >
              + {t('warehouse_mgmt.add_warehouse') || 'Add Warehouse'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">{t('warehouse_mgmt.code') || 'Code'}</th>
                  <th className="py-3 px-4">{t('warehouse_mgmt.name') || 'Branch / Warehouse Name'}</th>
                  <th className="py-3 px-4">{t('warehouse_mgmt.address') || 'Address'}</th>
                  <th className="py-3 px-4">{t('warehouse_mgmt.phone') || 'Phone'}</th>
                  <th className="py-3 px-4 text-right">{t('warehouse_mgmt.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                        {warehouse.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {warehouse.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{warehouse.address || '-'}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{warehouse.phone || '-'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(warehouse)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title={t('common.edit') || 'Edit'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleOpenDelete(warehouse)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title={t('common.delete') || 'Delete'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isSubmitting && setShowModal(false)}
          />
          
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingWarehouse 
                  ? (t('warehouse_mgmt.edit_warehouse') || 'Edit Warehouse')
                  : (t('warehouse_mgmt.add_warehouse') || 'Add New Warehouse')}
              </h3>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* In-Modal Error Notification */}
            {modalError && (
              <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200/90 rounded-lg text-rose-800 text-xs flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{modalError}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setModalError('')}
                  className="text-rose-400 hover:text-rose-600 shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    {t('warehouse_mgmt.code') || 'Warehouse Code'} <span className="text-rose-500">*</span>
                  </label>
                  {!editingWarehouse && (
                    <span className="text-[10px] text-slate-400">Auto-suggested</span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 font-mono font-medium focus:outline-none focus:border-sky-500 transition-all uppercase"
                  placeholder="e.g. WH01"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  {t('warehouse_mgmt.name') || 'Warehouse Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
                  placeholder="e.g. Main Dispensary Depot"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  {t('warehouse_mgmt.phone') || 'Phone Number'}
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500 transition-all"
                  placeholder="e.g. 023 888 999"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  {t('warehouse_mgmt.address') || 'Address'}
                </label>
                <textarea
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 transition-all resize-none h-20"
                  placeholder="Street address, building, city"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {t('warehouse_mgmt.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  )}
                  <span>
                    {isSubmitting 
                      ? (t('warehouse_mgmt.saving') || 'Saving...')
                      : (t('warehouse_mgmt.save') || 'Save Warehouse')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {warehouseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setWarehouseToDelete(null)}
          />

          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                {t('warehouse_mgmt.delete_title') || 'Delete Warehouse?'}
              </h3>
              <p className="text-xs text-slate-500">
                {t('warehouse_mgmt.delete_desc') || 'Are you sure you want to delete this warehouse?'}
              </p>
              <div className="mt-2 py-1.5 px-3 bg-slate-50 border border-slate-200/60 rounded-lg inline-block">
                <span className="font-mono font-bold text-slate-900 text-xs">{warehouseToDelete.code}</span>
                <span className="text-slate-400 mx-1.5">-</span>
                <span className="text-slate-700 font-medium text-xs">{warehouseToDelete.name}</span>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setWarehouseToDelete(null)}
                className="w-1/2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {t('warehouse_mgmt.delete_cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-1/2 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isDeleting && (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                )}
                <span>{t('warehouse_mgmt.delete_confirm') || 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
