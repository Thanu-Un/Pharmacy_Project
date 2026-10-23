import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const FinalizeSaleModal = ({ grandTotal, isSubmitting, error, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [paymentMethodsList, setPaymentMethodsList] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [exchangeRate, setExchangeRate] = useState(4000);
  const [amountUSD, setAmountUSD] = useState('');
  const [amountKHR, setAmountKHR] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    // Fetch active payment methods from settings
    fetch('/api/operation/payment-methods', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.ok ? r.json() : []).then(data => {
      const active = data.filter(m => m.status !== 'Inactive');
      if (active.length > 0) {
        setPaymentMethodsList(active);
        setPaymentMethod(active[0].name);
      } else {
        setPaymentMethodsList([{ id: 1, name: 'Cash' }, { id: 2, name: 'ABA' }, { id: 3, name: 'ACLEDA' }]);
      }
    }).catch(() => {
      setPaymentMethodsList([{ id: 1, name: 'Cash' }, { id: 2, name: 'ABA' }, { id: 3, name: 'ACLEDA' }]);
    });

    // Fetch exchange rate setting
    fetch('/api/operation/settings', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.ok ? r.json() : []).then(data => {
      const exItem = data.find(s => s.settingKey === 'exchange_rate');
      if (exItem && parseFloat(exItem.settingValue)) {
        setExchangeRate(parseFloat(exItem.settingValue));
      }
    }).catch(() => {});
  }, []);

  // Calculate total paying in USD equivalent
  const totalPayingUSD = (parseFloat(amountUSD) || 0) + ((parseFloat(amountKHR) || 0) / exchangeRate);
  const balanceUSD = totalPayingUSD - grandTotal;
  const balanceKHR = balanceUSD * exchangeRate;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">{t('pos.finalize_sale')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 grid grid-cols-12 gap-4 sm:gap-8 bg-slate-50 overflow-y-auto">

          {/* Left Column - Inputs */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('pos.amount_received')} (៛)</label>
                <input type="number" value={amountKHR} onChange={e => setAmountKHR(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('pos.amount_received')} ($)</label>
                <input type="number" value={amountUSD} onChange={e => setAmountUSD(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('pos.paying_by')}</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white">
                  {paymentMethodsList.map(m => (
                    <option key={m.id || m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t('pos.payment_note')}</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>

            <div className="border border-slate-200 bg-white rounded overflow-hidden mt-4 shadow-sm">
              <table className="w-full text-right text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-3 text-left font-bold text-slate-700 w-1/3">{t('pos.total_payable')}</td>
                    <td className="p-3 font-bold text-slate-900">៛ {(grandTotal * exchangeRate).toLocaleString()} <br /> $ {grandTotal.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="p-3 text-left font-bold text-slate-700">{t('pos.total_paying')}</td>
                    <td className="p-3 font-bold text-slate-900">៛ {(totalPayingUSD * exchangeRate).toLocaleString()} <br /> $ {totalPayingUSD.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-left font-bold text-slate-700">{t('pos.change')}</td>
                    <td className={`p-3 font-bold ${balanceUSD >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                      ៛ {balanceKHR.toLocaleString()} <br /> $ {balanceUSD.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Quick Cash */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-2 sm:gap-4">
            {/* KHR Buttons */}
            <div>
              <div className="text-center font-bold text-slate-600 mb-2 sm:mb-3 text-xs uppercase tracking-wide">{t('pos.quick_cash_khm')}</div>
              <div className="space-y-2">
                <button
                  onClick={() => setAmountKHR(Math.ceil(grandTotal * exchangeRate))}
                  className="w-full bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded border border-indigo-200 shadow-sm hover:bg-indigo-100 transition-colors text-sm flex justify-between px-4 cursor-pointer"
                >
                  <span className="opacity-50 font-normal">៛</span>
                  <span>{(Math.ceil(grandTotal * exchangeRate)).toLocaleString()}</span>
                </button>
                {[5000, 10000, 20000, 50000, 100000].map(val => (
                  <button
                    key={val}
                    onClick={() => setAmountKHR((parseFloat(amountKHR) || 0) + val)}
                    className="w-full bg-white text-slate-700 font-bold py-2.5 rounded border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors text-sm flex justify-between px-4 cursor-pointer"
                  >
                    <span className="text-slate-400 font-normal">៛</span>
                    <span>{val.toLocaleString()}</span>
                  </button>
                ))}
                <button onClick={() => setAmountKHR('')} className="w-full bg-white text-rose-600 font-bold py-2 rounded border border-rose-200 shadow-sm hover:bg-rose-50 transition-colors text-sm cursor-pointer">{t('common.clear')}</button>
              </div>
            </div>

            {/* USD Buttons */}
            <div>
              <div className="text-center font-bold text-slate-600 mb-2 sm:mb-3 text-xs uppercase tracking-wide">{t('pos.quick_cash_usd')}</div>
              <div className="space-y-2">
                <button
                  onClick={() => setAmountUSD(grandTotal.toFixed(2))}
                  className="w-full bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded border border-indigo-200 shadow-sm hover:bg-indigo-100 transition-colors text-sm flex justify-between px-4 cursor-pointer"
                >
                  <span className="opacity-50 font-normal">$</span>
                  <span>{grandTotal.toFixed(2)}</span>
                </button>
                {[5, 10, 20, 50, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => setAmountUSD((parseFloat(amountUSD) || 0) + val)}
                    className="w-full bg-white text-slate-700 font-bold py-2.5 rounded border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors text-sm flex justify-between px-4 cursor-pointer"
                  >
                    <span className="text-slate-400 font-normal">$</span>
                    <span>{val.toFixed(2)}</span>
                  </button>
                ))}
                <button onClick={() => setAmountUSD('')} className="w-full bg-white text-rose-600 font-bold py-2 rounded border border-rose-200 shadow-sm hover:bg-rose-50 transition-colors text-sm cursor-pointer">{t('common.clear')}</button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded text-sm font-medium">
              ⚠️ {error}
            </div>
          )}
          <button
            onClick={() => onSubmit({
              paymentMethod,
              amountUSD: parseFloat(amountUSD) || 0,
              amountKHR: parseFloat(amountKHR) || 0,
              paidUSD: totalPayingUSD > 0 ? totalPayingUSD : grandTotal,
              paidKHR: totalPayingUSD > 0 ? (totalPayingUSD * exchangeRate) : (grandTotal * exchangeRate),
              changeUSD: Math.max(0, balanceUSD),
              changeKHR: Math.max(0, balanceKHR),
              note
            })}
            disabled={isSubmitting}
            className={`w-full text-white font-bold py-3 rounded shadow-sm uppercase tracking-wider transition-colors text-lg cursor-pointer ${isSubmitting ? 'bg-emerald-400 cursor-not-allowed opacity-70' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
          >
            {isSubmitting ? t('common.processing') : t('common.submit')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReceiptModal = ({ sale, onClose }) => {
  const { t, i18n } = useTranslation();
  const handlePrint = () => {
    window.print();
  };

  if (!sale) return null;

  return (
    <>
      {/* Print-only styles */}
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

      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4" style={{ zIndex: 99999 }}>
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-200 no-print">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">{t('common.receipt')}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Printable Area */}
          <div className="p-6 bg-slate-50 flex-1 overflow-y-auto">
            <div id="receipt-print-area" className="bg-white p-4 shadow-sm border border-slate-200 mx-auto" style={{ maxWidth: '300px' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>NUTHEB PHARMACY</div>
              <div style={{ textAlign: 'center', fontSize: '12px', marginBottom: '16px' }}>Phnom Penh, Cambodia<br />Tel: 096 573 4996</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>{t('common.date')}:</span>
                <span>{sale?.date ? new Date(sale.date).toLocaleString(i18n.language === 'km' ? 'km-KH' : 'en-US') : ''}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>{t('sales.reference')}:</span>
                <span style={{ fontWeight: 'bold' }}>{sale?.referenceNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', borderBottom: '1px dashed #999', paddingBottom: '8px' }}>
                <span>{t('sales.patient_client')}:</span>
                <span>{(sale?.customer?.name || t('pos.walk_in_patient')).replace(' (General)', '')}</span>
              </div>

              <table style={{ width: '100%', fontSize: '12px', marginBottom: '16px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px dashed #999' }}>
                    <th style={{ textAlign: 'left', fontWeight: 'normal', paddingBottom: '4px' }}>{t('pos.item')}</th>
                    <th style={{ textAlign: 'center', fontWeight: 'normal', paddingBottom: '4px' }}>{t('pos.qty')}</th>
                    <th style={{ textAlign: 'right', fontWeight: 'normal', paddingBottom: '4px' }}>{t('pos.price')}</th>
                    <th style={{ textAlign: 'right', fontWeight: 'normal', paddingBottom: '4px' }}>{t('pos.total')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(sale?.items || []).map((item, idx) => {
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
                  <span>{t('pos.subtotal')}:</span>
                  <span>${Number(sale?.total || 0).toFixed(2)}</span>
                </div>
                {Number(sale?.discount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>{t('pos.discount')}:</span>
                    <span>${Number(sale?.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #999' }}>
                  <span>{t('pos.grand_total')}:</span>
                  <span>${Number(sale?.grandTotal || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '2px', color: '#555' }}>
                  <span>{t('pos.grand_total')} (៛):</span>
                  <span>៛ {Number((sale?.grandTotal || 0) * (sale?.exchangeRate || 4000)).toLocaleString()}</span>
                </div>

                {/* Paid Amount and Change */}
                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #999' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>{t('sales.settled')} ($):</span>
                    <span>${Number(sale?.paidUSD || sale?.grandTotal || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>{t('sales.settled')} (៛):</span>
                    <span>៛ {Number(sale?.paidKHR || (sale?.grandTotal || 0) * (sale?.exchangeRate || 4000)).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #999' }}>
                    <span>{t('pos.change')} ($):</span>
                    <span>${Number(sale?.changeUSD || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginTop: '2px', color: '#16a34a' }}>
                    <span>{t('pos.change')} (៛):</span>
                    <span>៛ {Number(sale?.changeKHR || (sale?.changeUSD || 0) * 4000).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '24px', marginBottom: '8px' }}>Thank you!</div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex gap-4 no-print">
            <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded uppercase tracking-wider transition-colors cursor-pointer">
              {t('common.close')}
            </button>
            <button onClick={handlePrint} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded shadow-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              {t('common.print')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Dispensing({ onSaleComplete }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [success, setSuccess] = useState(false);

  const [unitsList, setUnitsList] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(4000);

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const parseJwt = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const authHeaders = { 'Authorization': `Bearer ${token}` };
    const decoded = parseJwt(token);
    
    let admin = false;
    if (decoded) {
      const role = decoded.role?.toUpperCase();
      const username = decoded.sub?.toLowerCase();
      if (role === 'OWNER' || role === 'ADMIN' || username === 'admin' || username === 'owner' || (decoded.permissions && decoded.permissions.includes('setting_permissions'))) {
        admin = true;
        setIsAdmin(true);
      } else if (decoded.warehouseId) {
        setSelectedWarehouseId(Number(decoded.warehouseId));
      }
    }

    const fetches = [
      fetch('/api/operation/products', { headers: authHeaders }).then(res => res.ok ? res.json() : []),
      fetch('/api/operation/patients', { headers: authHeaders }).then(res => res.ok ? res.json() : []),
      fetch('/api/operation/units', { headers: authHeaders }).then(res => res.ok ? res.json() : []),
      fetch('/api/operation/settings', { headers: authHeaders }).then(res => res.ok ? res.json() : []),
      fetch('/api/operation/warehouses', { headers: authHeaders }).then(res => res.ok ? res.json() : [])
    ];

    Promise.all(fetches).then((results) => {
      const [prods, custs, unts, stgs, whs] = results;
      setProducts(prods);
      setCustomers(custs);
      setUnitsList(unts);
      
      const exItem = stgs.find(s => s.settingKey === 'exchange_rate');
      if (exItem && parseFloat(exItem.settingValue)) {
        setExchangeRate(parseFloat(exItem.settingValue));
      }
      if (custs && custs.length > 0) {
        setSelectedCustomer(custs[0]);
      }
      
      if (whs && whs.length > 0) {
        setWarehouses(whs);
      }

      // Priority: 1. Assigned warehouse for staff, 2. activeWarehouseId from localStorage, 3. first warehouse
      if (!admin && decoded?.warehouseId) {
        setSelectedWarehouseId(Number(decoded.warehouseId));
      } else {
        const savedWh = localStorage.getItem('activeWarehouseId');
        if (savedWh && whs && whs.some(w => w.id === Number(savedWh))) {
          setSelectedWarehouseId(Number(savedWh));
        } else if (whs && whs.length > 0) {
          setSelectedWarehouseId(whs[0].id);
        }
      }
      
      setIsLoading(false);
    }).catch(err => {
      setError('Failed to load initial data.');
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleWhChange = (e) => {
      const newWhId = e.detail?.id ? Number(e.detail.id) : (localStorage.getItem('activeWarehouseId') ? Number(localStorage.getItem('activeWarehouseId')) : null);
      if (newWhId) {
        setSelectedWarehouseId(newWhId);
      }
    };
    window.addEventListener('warehousechange', handleWhChange);
    return () => window.removeEventListener('warehousechange', handleWhChange);
  }, []);

  const getProductStock = (product) => {
    if (!product) return 0;
    if (selectedWarehouseId && product.stocks && Array.isArray(product.stocks)) {
      const found = product.stocks.find(s => s.warehouse?.id === selectedWarehouseId);
      return found ? parseFloat(found.quantity) || 0 : 0;
    }
    return parseFloat(product.quantity) || 0;
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const calculateUnitMultiplier = (unitObj) => {
    if (!unitObj) return 1;
    let mult = 1;
    let curr = unitObj;
    let visited = new Set();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      const val = parseFloat(curr.operationValue || curr.unitValue || 1) || 1;
      const op = curr.operator || '*';
      if (op === '*') mult *= val;
      else if (op === '/') mult /= val;

      if (curr.baseUnitId && unitsList.length > 0) {
        curr = unitsList.find(u => u.id === curr.baseUnitId) || null;
      } else {
        break;
      }
    }
    return mult;
  };

  const getAvailableUnits = (product) => {
    if (!product) return [];
    const unitsMap = new Map();

    const addUnitToMap = (unitObj, priceVal) => {
      if (unitObj && unitObj.id) {
        const fullUnit = unitsList.find(u => u.id === unitObj.id) || unitObj;
        const multiplier = calculateUnitMultiplier(fullUnit);
        unitsMap.set(fullUnit.id, {
          id: fullUnit.id,
          name: fullUnit.name,
          price: priceVal,
          multiplier: multiplier,
          unitObj: fullUnit
        });
      }
    };

    if (product.unit) {
      addUnitToMap(product.unit, product.price);
    }
    if (product.saleUnit) {
      addUnitToMap(product.saleUnit, product.priceBaseUnit1 || product.price);
    }
    if (product.baseUnit1) {
      addUnitToMap(product.baseUnit1, product.priceBaseUnit1 || product.price);
    }
    if (product.baseUnit2) {
      addUnitToMap(product.baseUnit2, product.priceBaseUnit2 || product.price);
    }
    if (product.baseUnit3) {
      addUnitToMap(product.baseUnit3, product.priceBaseUnit3 || product.price);
    }
    if (product.baseUnit4) {
      addUnitToMap(product.baseUnit4, product.priceBaseUnit4 || product.price);
    }
    if (product.baseUnit5) {
      addUnitToMap(product.baseUnit5, product.priceBaseUnit5 || product.price);
    }
    return Array.from(unitsMap.values());
  };

  const addToCart = (product) => {
    setSuccess(false);
    setError(null);
    const availableStock = getProductStock(product);
    if (availableStock <= 0) {
      setError(`Cannot add ${product.name} - Out of stock in this warehouse!`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    const availableUnits = getAvailableUnits(product);
    const defaultUnit = availableUnits.length > 0 ? availableUnits[0] : (product.unit ? { id: product.unit.id, name: product.unit.name, price: product.price } : null);
    const initialPrice = defaultUnit ? parseFloat(defaultUnit.price) : parseFloat(product.price);

    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      const mult = existingItem.selectedUnit?.multiplier || 1;
      if ((existingItem.quantity + 1) * mult > availableStock) {
        setError(`Not enough stock for ${product.name} in this warehouse`);
        setTimeout(() => setError(null), 3000);
        return;
      }
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        product: product,
        selectedUnit: defaultUnit,
        price: initialPrice,
        quantity: 1,
        subtotal: initialPrice
      }]);
    }
  };

  const updateCartUnit = (productId, unitId) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const units = getAvailableUnits(item.product);
        const chosenUnit = units.find(u => u.id === unitId) || item.selectedUnit;
        const newPrice = chosenUnit ? parseFloat(chosenUnit.price) : item.price;
        return {
          ...item,
          selectedUnit: chosenUnit,
          price: newPrice,
          subtotal: item.quantity * newPrice
        };
      }
      return item;
    }));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    const availableStock = getProductStock(product);
    const cartItem = cart.find(i => i.product.id === productId);
    const mult = cartItem?.selectedUnit?.multiplier || 1;
    if (product && (newQuantity * mult) > availableStock) {
      setError(`Only ${Math.floor(availableStock / mult)} available for ${product.name} in this warehouse`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
  const grandTotal = subtotal - (parseFloat(discount) || 0);

  const handleCheckout = async (paymentDetails = {}) => {
    console.log('handleCheckout called, cart length:', cart.length, 'paymentDetails:', paymentDetails);

    if (cart.length === 0) {
      setError("Cart is empty.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Clean items array
      const cleanItems = cart.map(item => ({
        product: { id: item.product.id },
        quantity: item.quantity,
        price: item.price,
        unitPrice: item.price,
        subtotal: item.subtotal,
        unit: item.selectedUnit?.id ? { id: item.selectedUnit.id } : (item.product.unit?.id ? { id: item.product.unit.id } : null)
      }));

      // Generate reference no
      const ref = 'INV-' + Math.floor(100000 + Math.random() * 900000);

      const payload = {
        referenceNo: ref,
        date: new Date().toISOString().slice(0, 19),
        customer: selectedCustomer,
        warehouse: selectedWarehouseId ? { id: selectedWarehouseId } : null,
        total: subtotal,
        discount: parseFloat(discount) || 0,
        grandTotal: grandTotal,
        paymentStatus: 'paid',
        paymentMethod: paymentDetails.paymentMethod || 'Cash',
        items: cleanItems
      };
      console.log('Sending sale to API...', JSON.stringify(payload).substring(0, 200));

      const response = await fetch('/api/operation/sales', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(payload)
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Checkout failed:', response.status, errorText);
        throw new Error(`Checkout failed (${response.status}): ${errorText}`);
      }

      const savedSale = await response.json().catch(() => payload);
      console.log('Sale saved successfully:', savedSale);

      // Save cart items & payment details to use in receipt before clearing
      const receiptData = {
        ...savedSale,
        items: cart, // Use original cart which has full product details including names
        paidUSD: paymentDetails.paidUSD || grandTotal,
        paidKHR: paymentDetails.paidKHR || (grandTotal * exchangeRate),
        changeUSD: paymentDetails.changeUSD || 0,
        changeKHR: paymentDetails.changeKHR || 0,
        paymentMethod: paymentDetails.paymentMethod || 'Cash'
      };

      setSuccess(true);

      // Update local product stock and warehouse stock
      const updatedProducts = [...products];
      cart.forEach(cartItem => {
        const prod = updatedProducts.find(p => p.id === cartItem.product.id);
        if (prod) {
          const mult = cartItem.selectedUnit?.multiplier || 1;
          const deductUnits = cartItem.quantity * mult;
          prod.quantity = Math.max(0, (parseFloat(prod.quantity) || 0) - deductUnits);
          if (prod.stocks && Array.isArray(prod.stocks) && selectedWarehouseId) {
            const whStock = prod.stocks.find(s => s.warehouse?.id === selectedWarehouseId);
            if (whStock) {
              whStock.quantity = Math.max(0, (parseFloat(whStock.quantity) || 0) - deductUnits);
            }
          }
        }
      });
      setProducts(updatedProducts);

      setCart([]);
      setDiscount(0);
      setSelectedCustomer(customers[0] || null);
      setShowFinalizeModal(false);
      setLastSale(receiptData);

      console.log('Receipt modal should now show with:', receiptData);

    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading POS...</div>;
  }

  const currentWhObj = warehouses.find(w => w.id === selectedWarehouseId);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-slate-100/70 p-2 sm:p-2.5 gap-2 sm:gap-2.5 overflow-hidden max-w-none">

      {/* LEFT PANEL: Products Catalog (Flexible full width) */}
      <div className="w-full lg:flex-1 bg-white rounded-xl shadow-card border border-slate-200/80 flex flex-col h-[55vh] lg:h-full overflow-hidden shrink-0">
        
        {/* Active Warehouse Banner */}
        <div className="px-3.5 py-1.5 bg-brand-50/80 border-b border-brand-100 flex items-center justify-between text-xs text-brand-900 shrink-0">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-slate-500 font-medium">{t('pos.dispensing_from') || 'Branch'}:</span>
            <span className="font-bold text-brand-700 bg-white px-2 py-0.5 rounded border border-brand-200 shadow-xs">
              {currentWhObj?.name || localStorage.getItem('activeWarehouseName') || 'Main Warehouse'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
            {isAdmin ? `(${t('header.switch_in_header') || 'Switch branch from header'})` : '🔒 Strict Branch Mode'}
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="px-3.5 py-2.5 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-obsidian-900 text-white shadow-sm shadow-obsidian-900/10'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
            }`}
          >
            All Products
          </button>
          {[...new Set(products.map(p => p.category?.name).filter(Boolean))].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-obsidian-900 text-white shadow-sm shadow-obsidian-900/10'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              {cat === 'All' ? t('common.all') : cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3 bg-slate-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
            {filteredProducts.map(product => {
              const whStock = getProductStock(product);
              const inStock = whStock > 0;
              return (
                <div
                  key={product.id}
                  onClick={() => inStock && addToCart(product)}
                  className={`bg-white rounded-xl p-3 border transition-all duration-150 select-none flex flex-col justify-between ${
                    inStock 
                      ? 'border-slate-200/80 shadow-subtle hover:border-brand-400 hover:shadow-card cursor-pointer group' 
                      : 'border-slate-200/50 opacity-40 bg-slate-50 cursor-not-allowed'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
                      <span className="text-[10px] font-mono text-slate-400 uppercase truncate min-w-0 flex-1" title={product.code}>
                        {product.code || 'SKU'}
                      </span>
                      <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 ${
                        whStock > 10 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' :
                        whStock > 0 ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' :
                        'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                      }`}>
                        {inStock ? `${Math.round(whStock)} ${t('pos.in_stock')}` : t('pos.out_of_stock')}
                      </span>
                    </div>

                    {/* Image or Clinical Thumbnail */}
                    <div className="w-full h-20 mb-2 bg-slate-50/80 rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image.startsWith('http') || product.image.startsWith('data:') ? product.image : `/api/operation${product.image}`}
                          alt={product.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                    </div>

                    <h3 className="font-semibold text-slate-900 text-xs line-clamp-1 leading-snug group-hover:text-brand-700 transition-colors" title={product.name}>
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate mb-2">
                      {product.category?.name || 'Formulary'}
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 gap-1">
                    <span className="font-mono text-xs font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      ៛{Math.round(Number(product.price) * exchangeRate).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 text-xs">
                {t('pos.no_medications_found')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Cart & Financial Terminal */}
      <div className="w-full lg:w-[380px] xl:w-[420px] 2xl:w-[450px] shrink-0 bg-white rounded-xl shadow-card border border-slate-200/80 flex flex-col h-[65vh] lg:h-full overflow-hidden">

        {/* Customer & Search Bar Header */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/70 space-y-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <select
              className="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-brand-500 shadow-subtle"
              value={selectedCustomer ? selectedCustomer.id : ""}
              onChange={(e) => {
                const custId = parseInt(e.target.value);
                const cust = customers.find(c => c.id === custId);
                setSelectedCustomer(cust || null);
              }}
            >
              {customers.length === 0 && (
                <option value="">{t('pos.walk_in_patient')}</option>
              )}
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name.replace(' (General)', '')}{c.phone && c.phone !== 'N/A' ? ` - ${c.phone}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t('pos.search_medicine_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-brand-500 shadow-subtle"
            />
          </div>
        </div>

        {/* Cart Column Headers */}
        <div className="grid grid-cols-12 gap-1 bg-white border-b border-slate-200/70 text-slate-400 text-[10px] font-mono uppercase tracking-wider px-3 py-2 shrink-0">
          <div className="col-span-5 font-semibold">{t('dashboard.medication')}</div>
          <div className="col-span-2 text-center font-semibold">{t('pos.qty')}</div>
          <div className="col-span-2 text-right font-semibold">{t('pos.price')}</div>
          <div className="col-span-2 text-right font-semibold">{t('pos.total')}</div>
          <div className="col-span-1 text-center"></div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto bg-slate-50/40">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-slate-500">{t('pos.empty_cart')}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t('pos.cart_instruction')}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map(item => (
                <div key={item.product.id} className="grid grid-cols-12 gap-1 items-center px-3 py-2 bg-white text-xs hover:bg-slate-50/80 transition-colors">
                  <div className="col-span-5 flex flex-col justify-center pr-1 min-w-0">
                    <div className="truncate font-semibold text-slate-900 text-xs" title={item.product.name}>
                      {item.product.name}
                    </div>
                    {(() => {
                      const units = getAvailableUnits(item.product);
                      if (units.length > 0) {
                        return (
                          <select
                            value={item.selectedUnit?.id || ''}
                            onChange={(e) => updateCartUnit(item.product.id, parseInt(e.target.value))}
                            className="mt-0.5 w-full bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[10px] font-mono text-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
                          >
                            {units.map(u => (
                              <option key={u.id} value={u.id}>
                                {u.name} (${Number(u.price).toFixed(2)})
                              </option>
                            ))}
                          </select>
                        );
                      }
                      return (
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {item.product.unit ? item.product.unit.name : 'Unit'}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="col-span-2 flex justify-center items-center">
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} 
                      className="w-5 h-5 bg-slate-100 border border-slate-200 rounded-l flex items-center justify-center hover:bg-slate-200 text-slate-600 font-bold leading-none cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value) || 1)}
                      className="w-8 h-5 text-center border-y border-slate-200 focus:outline-none font-mono text-xs tabular-nums"
                    />
                    <button 
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} 
                      className="w-5 h-5 bg-slate-100 border border-slate-200 rounded-r flex items-center justify-center hover:bg-slate-200 text-slate-600 font-bold leading-none cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="col-span-2 text-right font-mono text-slate-500 tabular-nums">
                    ${Number(item.price).toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    ${Number(item.subtotal).toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button 
                      onClick={() => removeFromCart(item.product.id)} 
                      className="text-slate-300 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financial Settlement & Checkout Footer */}
        <div className="bg-white p-3.5 flex flex-col gap-2.5 border-t border-slate-200/90 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.03)] shrink-0">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{t('pos.subtotal')}:</span>
              <span className="font-mono font-medium text-slate-900 tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">{t('pos.discount')}:</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-mono text-[11px]">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-16 text-right border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono tabular-nums focus:outline-none focus:border-brand-500"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 font-mono">{t('pos.net_due')}:</span>
              <span className="block text-[11px] text-slate-400 font-mono">
                ៛{Math.round(Math.max(0, grandTotal) * exchangeRate).toLocaleString()}
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
              ${Math.max(0, grandTotal).toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-40 font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              {t('pos.clear_cart')}
            </button>
            <button
              onClick={() => setShowFinalizeModal(true)}
              disabled={cart.length === 0 || isSubmitting}
              className="bg-obsidian-900 hover:bg-obsidian-800 active:bg-obsidian-950 disabled:opacity-40 text-white font-semibold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all shadow-sm shadow-obsidian-900/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{t('pos.charge_due')}</span>
              <span className="font-mono tabular-nums">(${Math.max(0, grandTotal).toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {showFinalizeModal && (
        <FinalizeSaleModal
          grandTotal={grandTotal}
          isSubmitting={isSubmitting}
          error={error}
          onClose={() => setShowFinalizeModal(false)}
          onSubmit={(details) => {
            handleCheckout(details);
          }}
        />
      )}

      {lastSale && (
        <ReceiptModal
          sale={lastSale}
          onClose={() => {
            setLastSale(null);
          }}
        />
      )}
    </div>
  );
}
