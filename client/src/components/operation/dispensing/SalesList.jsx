import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function SalesList({ onNewSaleClick }) {
  const { t } = useTranslation();
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSaleForReceipt, setSelectedSaleForReceipt] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(4000);

  useEffect(() => {
    fetchSales();
    fetch('/api/operation/settings').then(res => res.ok ? res.json() : []).then(data => {
      const item = data.find(s => s.settingKey === 'exchange_rate');
      if (item && parseFloat(item.settingValue)) {
        setExchangeRate(parseFloat(item.settingValue));
      }
    }).catch(() => {});
  }, []);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/operation/sales');
      if (!response.ok) throw new Error('Failed to fetch sales list');
      const data = await response.json();
      // Sort newest first
      data.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
      setSales(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale record?')) return;
    try {
      const response = await fetch(`/api/operation/sales/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete sale');
      setSales(sales.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredSales = sales.filter(s => {
    const term = searchTerm.toLowerCase();
    const ref = (s.referenceNo || '').toLowerCase();
    const cust = (s.customer?.name || 'walk-in patient').toLowerCase();
    const dateStr = s.date ? new Date(s.date).toLocaleString().toLowerCase() : '';
    return ref.includes(term) || cust.includes(term) || dateStr.includes(term);
  });

  const handlePrintReceipt = (sale) => {
    setSelectedSaleForReceipt(sale);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t('sales.sales_list') || 'Sales List'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('sales.sales_desc') || 'Manage recorded sales, invoices, and dispensing history'}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              placeholder={t('sales.search_sales') || 'Search by reference no, customer, date...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
          <button 
            onClick={fetchSales} 
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span>{t('common.refresh') || 'Refresh'}</span>
          </button>
        </div>

        {error && (
          <div className="p-6 text-center text-rose-600 dark:text-rose-400 text-xs">
            <p className="font-semibold">{t('common.error')}: {error}</p>
            <button onClick={fetchSales} className="mt-2 text-brand-600 underline">Try again</button>
          </div>
        )}

        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <svg className="animate-spin h-6 w-6 text-brand-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-medium tracking-wide">Loading dispensary audit log...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-4">{t('dashboard.date_time') || 'Date & Time'}</th>
                  <th className="py-2.5 px-4">{t('sales.reference') || 'Reference'}</th>
                  <th className="py-2.5 px-4">{t('sales.patient_client') || 'Patient / Client'}</th>
                  <th className="py-2.5 px-4 text-right">{t('sales.grand_total') || 'Grand Total'}</th>
                  <th className="py-2.5 px-4 text-right">{t('sales.settled') || 'Settled'}</th>
                  <th className="py-2.5 px-4 text-right">{t('sales.balance') || 'Balance'}</th>
                  <th className="py-2.5 px-4 text-center">{t('sales.dispensation') || 'Dispensation'}</th>
                  <th className="py-2.5 px-4 text-center">{t('sales.payment') || 'Payment'}</th>
                  <th className="py-2.5 px-4 text-center">{t('sales.method') || 'Method'}</th>
                  <th className="py-2.5 px-4 text-center">{t('sales.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                      {t('sales.no_records') || 'No matching dispensation records found.'}
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale, idx) => {
                    const dateFormatted = sale.date ? new Date(sale.date).toLocaleString('en-GB') : '-';
                    let customerName = sale.customer?.name || 'Walk-in Patient';
                    customerName = customerName.replace(' (General)', '');
                    const grandTotalVal = Number(sale.grandTotal || 0).toFixed(2);
                    const grandTotalKHR = (Number(sale.grandTotal || 0) * exchangeRate).toLocaleString();

                    return (
                      <tr key={sale.id || idx} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">{dateFormatted}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                            {sale.referenceNo}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">{customerName}</td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="font-mono font-semibold text-slate-900 tabular-nums">${grandTotalVal}</div>
                          <div className="font-mono text-[10px] text-slate-400 tabular-nums">៛{grandTotalKHR}</div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="font-mono text-xs font-medium text-emerald-700 tabular-nums">${grandTotalVal}</span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-slate-400 text-xs tabular-nums">
                          $0.00
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Completed
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            Paid
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded">
                            {sale.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedSaleForReceipt(sale)}
                              title="Print / View Receipt"
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button
                              onClick={() => handleDelete(sale.id)}
                              title="Delete Record"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Receipt Modal */}
      {selectedSaleForReceipt && (
        <>
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #receipt-print-area, #receipt-print-area * { 
                visibility: visible !important; 
                color: #000000 !important;
                font-family: 'Courier New', Courier, 'Khmer OS Battambang', monospace !important;
              }
              #receipt-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0 !important;
                padding: 0 !important;
              }
              #receipt-print-area table { width: 100% !important; border-collapse: collapse !important; }
              #receipt-print-area th, #receipt-print-area td { padding: 3px 0 !important; font-size: 13px !important; font-weight: bold !important; }
              #receipt-print-area .no-print { display: none !important; }
            }
          `}</style>
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[99999]">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-slate-200 no-print">
                <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Receipt</h2>
                <button onClick={() => setSelectedSaleForReceipt(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 bg-slate-50 flex-1 overflow-y-auto">
                <div id="receipt-print-area" className="bg-white p-4 shadow-sm border border-slate-200 mx-auto" style={{ maxWidth: '300px' }}>
                  <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>NUTHEB PHARMACY</div>
                  <div style={{ textAlign: 'center', fontSize: '12px', marginBottom: '16px' }}>Phnom Penh, Cambodia<br />Tel: 096 573 4996</div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Date:</span>
                    <span>{selectedSaleForReceipt?.date ? new Date(selectedSaleForReceipt.date).toLocaleString() : ''}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Ref No:</span>
                    <span style={{ fontWeight: 'bold' }}>{selectedSaleForReceipt?.referenceNo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', borderBottom: '1px dashed #999', paddingBottom: '8px' }}>
                    <span>Customer:</span>
                    <span>{selectedSaleForReceipt?.customer?.name || 'Walk-in Patient'}</span>
                  </div>

                  <table style={{ width: '100%', fontSize: '12px', marginBottom: '16px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px dashed #999' }}>
                        <th style={{ textAlign: 'left', fontWeight: 'normal', paddingBottom: '4px' }}>Item</th>
                        <th style={{ textAlign: 'center', fontWeight: 'normal', paddingBottom: '4px' }}>Qty</th>
                        <th style={{ textAlign: 'right', fontWeight: 'normal', paddingBottom: '4px' }}>Price</th>
                        <th style={{ textAlign: 'right', fontWeight: 'normal', paddingBottom: '4px' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedSaleForReceipt?.items || []).map((item, idx) => {
                        const price = item?.unitPrice || item?.price || (item?.quantity ? item.subtotal / item.quantity : 0);
                        return (
                          <tr key={idx}>
                            <td style={{ padding: '4px 0' }}>{item?.product?.name || 'Unknown'}</td>
                            <td style={{ padding: '4px 0', textAlign: 'center' }}>{item?.quantity || 0}</td>
                            <td style={{ padding: '4px 0', textAlign: 'right' }}>${Number(price || 0).toFixed(2)}</td>
                            <td style={{ padding: '4px 0', textAlign: 'right' }}>${Number(item?.subtotal || 0).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div style={{ borderTop: '1px dashed #999', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Subtotal:</span>
                      <span>${Number(selectedSaleForReceipt?.total || 0).toFixed(2)}</span>
                    </div>
                    {Number(selectedSaleForReceipt?.discount || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span>Discount:</span>
                        <span>${Number(selectedSaleForReceipt?.discount || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #999' }}>
                      <span>Grand Total:</span>
                      <span>${Number(selectedSaleForReceipt?.grandTotal || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '2px', color: '#555' }}>
                      <span>Grand Total (៛):</span>
                      <span>៛ {Number((selectedSaleForReceipt?.grandTotal || 0) * exchangeRate).toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '24px', marginBottom: '8px' }}>Thank you!</div>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-slate-200 flex gap-4 no-print">
                <button onClick={() => setSelectedSaleForReceipt(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded uppercase tracking-wider transition-colors">
                  Close
                </button>
                <button onClick={() => handlePrintReceipt(selectedSaleForReceipt)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded shadow-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Print
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
