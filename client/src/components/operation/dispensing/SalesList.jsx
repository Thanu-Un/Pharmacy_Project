import React, { useState, useEffect } from 'react';

export default function SalesList({ onNewSaleClick }) {
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
    window.print();
  };

  return (
    <div className="p-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sales List</h1>
          <p className="text-sm text-slate-500 mt-1">Manage recorded sales, invoices, and dispensing history</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input
              type="text"
              placeholder="Search by reference no, customer, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
            />
          </div>
          <button onClick={fetchSales} className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-6 text-center text-rose-600">
            <p className="font-semibold">Error: {error}</p>
            <button onClick={fetchSales} className="mt-2 text-sm text-emerald-600 underline">Try again</button>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <svg className="animate-spin h-8 w-8 text-emerald-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Loading sales records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              {/* Table Header matching App Emerald Theme */}
              <thead>
                <tr className="bg-emerald-600 text-white font-semibold text-xs tracking-wider uppercase">
                  <th className="p-3 border-r border-emerald-500/40">Date</th>
                  <th className="p-3 border-r border-emerald-500/40">Reference No</th>
                  <th className="p-3 border-r border-emerald-500/40">Customer</th>
                  <th className="p-3 border-r border-emerald-500/40 text-right">Grand Total</th>
                  <th className="p-3 border-r border-emerald-500/40 text-right">Paid</th>
                  <th className="p-3 border-r border-emerald-500/40 text-right">Balance</th>
                  <th className="p-3 border-r border-emerald-500/40 text-center">Sale Status</th>
                  <th className="p-3 border-r border-emerald-500/40 text-center">Payment Status</th>
                  <th className="p-3 border-r border-emerald-500/40 text-center">Paid by</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-12 text-center text-slate-500">
                      No sales records found.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale, idx) => {
                    const dateFormatted = sale.date ? new Date(sale.date).toLocaleString('en-GB') : '-';
                    let customerName = sale.customer?.name || 'Walk-in Patient';
                    customerName = customerName.replace(' (General)', '');
                    const grandTotalVal = Number(sale.grandTotal || 0).toFixed(3) + '$';
                    const paidVal = Number(sale.grandTotal || 0).toFixed(3) + '$';
                    const balanceVal = '0.000$';

                    return (
                      <tr key={sale.id || idx} className="hover:bg-sky-50/50 transition-colors border-b border-slate-100">
                        <td className="p-3 text-slate-700 font-medium whitespace-nowrap">{dateFormatted}</td>
                        <td className="p-3 text-slate-800 font-semibold whitespace-nowrap">{sale.referenceNo}</td>
                        <td className="p-3 text-slate-800 font-medium whitespace-nowrap">{customerName}</td>
                        <td className="p-3 text-right font-bold text-slate-900 whitespace-nowrap">{grandTotalVal}</td>
                        <td className="p-3 text-right font-semibold text-emerald-700 whitespace-nowrap">{paidVal}</td>
                        <td className="p-3 text-right font-medium text-slate-600 whitespace-nowrap">{balanceVal}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className="bg-[#5cb85c] text-white text-xs px-2.5 py-1 rounded font-bold inline-block shadow-sm">
                            Completed
                          </span>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className="bg-[#5cb85c] text-white text-xs px-2.5 py-1 rounded font-bold inline-block shadow-sm">
                            Paid
                          </span>
                        </td>
                        <td className="p-3 text-center text-slate-700 font-medium whitespace-nowrap capitalize">{sale.paymentMethod || 'Cash'}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedSaleForReceipt(sale)}
                              title="View Receipt"
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button
                              onClick={() => handleDelete(sale.id)}
                              title="Delete Record"
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
