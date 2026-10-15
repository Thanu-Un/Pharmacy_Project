import React, { useState, useEffect } from 'react';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('payment-methods'); // 'payment-methods' or 'currency'

  // Payment Methods State
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

  // Currency & Exchange Rate State
  const [currencySettings, setCurrencySettings] = useState({
    exchange_rate: '4000',
    base_currency: 'USD',
    secondary_currency: 'KHR',
    currency_symbol: '$'
  });
  const [isSavingCurrency, setIsSavingCurrency] = useState(false);
  const [currencySuccess, setCurrencySuccess] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
    fetchSettings();
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

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/operation/settings');
      if (res.ok) {
        const data = await res.json();
        const settingsObj = {};
        data.forEach(item => {
          settingsObj[item.settingKey] = item.settingValue;
        });
        setCurrencySettings(prev => ({
          ...prev,
          ...settingsObj
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Payment Method Modal Handlers
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

  const handleSaveCurrency = async (e) => {
    e.preventDefault();
    setIsSavingCurrency(true);
    setCurrencySuccess(false);

    try {
      const keys = ['exchange_rate', 'base_currency', 'secondary_currency', 'currency_symbol'];
      for (const k of keys) {
        await fetch('/api/operation/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settingKey: k,
            settingValue: currencySettings[k]
          })
        });
      }

      setCurrencySuccess(true);
      setTimeout(() => setCurrencySuccess(false), 3000);
    } catch (e) {
      alert(e.message);
    } finally {
      setIsSavingCurrency(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">System Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure transaction gateways, default POS currencies, and conversion rates</p>
      </div>

      {/* Segmented Control Header */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 w-fit">
        <button
          onClick={() => setActiveTab('payment-methods')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'payment-methods'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment Methods
        </button>
        <button
          onClick={() => setActiveTab('currency')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'currency'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Currency & Exchange Rate
        </button>
      </div>

      {/* TAB 1: PAYMENT METHODS */}
      {activeTab === 'payment-methods' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Accepted Payment Channels</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage bank accounts, QR payment options, and cash counters</p>
            </div>
            <button
              onClick={() => handleOpenMethodModal()}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <span>Add Payment Method</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200/70">
            <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-600 text-[11px] uppercase font-semibold tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-2.5 px-3">Method Name</th>
                  <th className="py-2.5 px-3">Account Name</th>
                  <th className="py-2.5 px-3">Account Number</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isMethodsLoading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">Loading payment methods...</td>
                  </tr>
                ) : paymentMethods.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">No payment methods configured yet.</td>
                  </tr>
                ) : (
                  paymentMethods.map(method => (
                    <tr key={method.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] uppercase font-mono">
                          {method.name.slice(0, 3)}
                        </span>
                        <span>{method.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{method.accountName || '-'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{method.accountNumber || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          method.status === 'Inactive' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200/60' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                        }`}>
                          {method.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
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
      )}

      {/* TAB 2: CURRENCY & EXCHANGE RATE */}
      {activeTab === 'currency' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-5 max-w-2xl">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Currency & Exchange Configuration</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Dual currency calculations for POS checkout and billing receipts</p>
          </div>

          {currencySuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              <span>Currency and exchange settings updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveCurrency} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Base System Currency
                </label>
                <select
                  value={currencySettings.base_currency}
                  onChange={e => setCurrencySettings(prev => ({ ...prev, base_currency: e.target.value }))}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="KHR">KHR (៛ - Cambodian Riel)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={currencySettings.currency_symbol}
                  onChange={e => setCurrencySettings(prev => ({ ...prev, currency_symbol: e.target.value }))}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Secondary Currency
                </label>
                <select
                  value={currencySettings.secondary_currency}
                  onChange={e => setCurrencySettings(prev => ({ ...prev, secondary_currency: e.target.value }))}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
                >
                  <option value="KHR">KHR (៛ - Cambodian Riel)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Exchange Rate (KHR per 1 USD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="1"
                  placeholder="4000"
                  value={currencySettings.exchange_rate}
                  onChange={e => setCurrencySettings(prev => ({ ...prev, exchange_rate: e.target.value }))}
                  className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500 transition-all"
                />
                <p className="text-[10px] text-slate-400 mt-1">Example: 4,000 KHR = $1.00 USD</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSavingCurrency}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isSavingCurrency ? 'Saving Settings...' : 'Save Currency Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Method Modal */}
      {showMethodModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200/80 max-w-md w-full p-5 animate-in fade-in zoom-in-95 duration-150">
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
                  Account Number / ID
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
