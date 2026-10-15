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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Currency & Exchange Rate</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure primary base currency, secondary currency, and POS exchange rate (KHR / USD)</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
        {successMessage && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200/70 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            <span>Currency and exchange rate settings saved successfully!</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading currency settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
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
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {isSaving ? 'Synchronizing Rates...' : 'Save Currency Configuration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
