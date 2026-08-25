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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payment Methods</h1>
          <p className="text-sm text-slate-500 mt-1">Manage accepted payment options, bank accounts, and active status for POS checkout</p>
        </div>
        <button
          onClick={() => handleOpenMethodModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm self-start md:self-auto text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Payment Method
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Configured Payment Methods</span>
          <button
            onClick={fetchPaymentMethods}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-100 font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-[#00a65a] text-white text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Account Name</th>
                <th className="p-3">Account Number</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
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
                  <tr key={method.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-800 flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                        {method.name.slice(0, 3)}
                      </span>
                      <span className="text-base">{method.name}</span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{method.accountName || '-'}</td>
                    <td className="p-3 font-mono text-slate-600 text-xs">{method.accountNumber || '-'}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded font-bold ${
                        method.status === 'Inactive' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {method.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenMethodModal(method)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Method"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteMethod(method.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Method"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </h3>
            <form onSubmit={handleSaveMethod} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Method Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABA, ACLEDA, Wing, Cash, KHQR"
                  value={methodForm.name}
                  onChange={e => setMethodForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. NUTHEB PHARMACY"
                  value={methodForm.accountName}
                  onChange={e => setMethodForm(prev => ({ ...prev, accountName: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 000 123 456"
                  value={methodForm.accountNumber}
                  onChange={e => setMethodForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={methodForm.status}
                  onChange={e => setMethodForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowMethodModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-semibold shadow-sm"
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
