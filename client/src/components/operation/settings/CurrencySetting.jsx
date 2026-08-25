import React, { useState, useEffect } from 'react';

export default function CurrencySetting() {
  const [currencySettings, setCurrencySettings] = useState({
    exchange_rate: '4000',
    base_currency: 'USD',
    secondary_currency: 'KHR',
    currency_symbol: '$'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(false);

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

      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3500);
    } catch (e) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Currency & Exchange Rate</h1>
        <p className="text-sm text-slate-500 mt-1">Configure primary base currency, secondary currency, and POS exchange rate (KHR / USD)</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            Currency and Exchange Rate settings saved successfully!
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading currency settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Base Currency
                </label>
                <select
                  value={currencySettings.base_currency}
                  onChange={e => setCurrencySettings(prev => ({ ...prev, base_currency: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
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
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Secondary Currency
                </label>
                <select
                  value={currencySettings.secondary_currency}
                  onChange={e => setCurrencySettings(prev => ({ ...prev, secondary_currency: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
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
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Example: 4000 KHR = $1.00 USD</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                {isSaving ? 'Saving Settings...' : 'Save Currency Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
