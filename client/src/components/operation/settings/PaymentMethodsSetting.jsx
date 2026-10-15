import React, { useState, useEffect } from 'react';

export default function PaymentMethodsSetting() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isMethodsLoading, setIsMethodsLoading] = useState(true);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [methodForm, setMethodForm] = useState({
    name: '',
    accountName: '',
    accountNumber: '',
    qrCodeUrl: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setIsMethodsLoading(true);
      const res = await fetch('/api/operation/payment-methods');
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMethodsLoading(false);
    }
  };

  const handleOpenMethodModal = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setMethodForm({
        name: method.name || '',
        accountName: method.accountName || '',
        accountNumber: method.accountNumber || '',
        qrCodeUrl: method.qrCodeUrl || '',
        status: method.status || 'Active'
      });
    } else {
      setEditingMethod(null);
      setMethodForm({
        name: '',
        accountName: '',
        accountNumber: '',
        qrCodeUrl: '',
        status: 'Active'
      });
    }
    setShowMethodModal(true);
  };

  const handleSaveMethod = async (e) => {
    e.preventDefault();
    if (!methodForm.name.trim()) return;

    try {
      const url = editingMethod 
        ? `/api/operation/payment-methods/${editingMethod.id}`
        : '/api/operation/payment-methods';
      const method = editingMethod ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(methodForm)
      });

      if (res.ok) {
        setShowMethodModal(false);
        fetchPaymentMethods();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteMethod = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    try {
      const res = await fetch(`/api/operation/payment-methods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPaymentMethods();
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Payment Gateways & Methods</h1>
          <p className="text-xs text-slate-500 mt-0.5">Dispensary checkout methods, bank settlements, and currency integrations</p>
        </div>
        <button
          onClick={() => handleOpenMethodModal()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Payment Method</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Settlement Accounts ({paymentMethods.length})</span>
          <button
            onClick={fetchPaymentMethods}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Beneficiary Name</th>
                <th className="py-3 px-4">Account Identifier</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isMethodsLoading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">Loading payment methods...</td>
                </tr>
              ) : paymentMethods.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">No payment methods configured yet.</td>
                </tr>
              ) : (
                paymentMethods.map(method => (
                  <tr key={method.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] uppercase font-mono">
                        {method.name.slice(0, 3)}
                      </span>
                      <span>{method.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{method.accountName || '-'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-xs">{method.accountNumber || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        method.status === 'Inactive' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200/60' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      }`}>
                        {method.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenMethodModal(method)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                          title="Edit Method"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMethod(method.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Method"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {/* Modal */}
      {showMethodModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl border border-slate-200/80 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </h3>
              <button onClick={() => setShowMethodModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Method Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABA Bank, KHQR, Cash"
                  value={methodForm.name}
                  onChange={e => setMethodForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. NUTHEB PHARMACY"
                  value={methodForm.accountName}
                  onChange={e => setMethodForm(prev => ({ ...prev, accountName: e.target.value }))}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 000 123 456"
                  value={methodForm.accountNumber}
                  onChange={e => setMethodForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={methodForm.status}
                  onChange={e => setMethodForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMethodModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Save Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
