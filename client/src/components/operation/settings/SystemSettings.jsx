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

  // Currency Form Handlers
  const handleSaveCurrency = async (e) => {
    e.preventDefault();
    setIsSavingCurrency(true);
    setCurrencySuccess(false);

    try {
      // Save each setting key
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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure payment methods, currencies, and exchange rates for your pharmacy POS</p>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-4 pt-2 shadow-sm">
        <button
          onClick={() => setActiveTab('payment-methods')}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'payment-methods'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Payment Methods
        </button>
        <button
          onClick={() => setActiveTab('currency')}
          className={`px-5 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'currency'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Currency & Exchange Rate
        </button>
      </div>

      {/* TAB 1: PAYMENT METHODS */}
      {activeTab === 'payment-methods' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Accepted Payment Methods</h2>
              <p className="text-xs text-slate-500">Enable or add payment gateways and banks used during POS checkout (e.g. Cash, ABA, ACLEDA, Wing)</p>
            </div>
            <button
              onClick={() => handleOpenMethodModal()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Add Payment Method
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
                      <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                          {method.name.slice(0, 3)}
                        </span>
                        <span>{method.name}</span>
                      </td>
                      <td className="p-3 text-slate-700">{method.accountName || '-'}</td>
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
      )}

      {/* TAB 2: CURRENCY & EXCHANGE RATE */}
      {activeTab === 'currency' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Currency & Exchange Rate Settings</h2>
            <p className="text-xs text-slate-500">Set primary base currency, secondary currency, and POS exchange rate (KHR / USD)</p>
          </div>

          {currencySuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-semibold flex items-center gap-2">
              ✓ Currency and Exchange Rate settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSaveCurrency} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Base Currency
                </label>
                <select
                  value={currencySettings.base_currency}
                  onChange={e => setCurrencySettings(prev => ({ ...prev, base_currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="KHR">KHR (៛ - Cambodian Riel)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={currencySettings.currency_symbol}
                  onChange={e => setCurrencySettings(prev => ({ ...prev, currency_symbol: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Secondary Currency
                </label>
                <select
                  value={currencySettings.secondary_currency}
                  onChange={e => setCurrencySettings(prev => ({ ...prev, secondary_currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="KHR">KHR (៛ - Cambodian Riel)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Exchange Rate (KHR per 1 USD) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="1"
                  placeholder="4000"
                  value={currencySettings.exchange_rate}
                  onChange={e => setCurrencySettings(prev => ({ ...prev, exchange_rate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Example: 4000 KHR = $1.00 USD</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={isSavingCurrency}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                {isSavingCurrency ? 'Saving Settings...' : 'Save Currency Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Method Modal */}
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
