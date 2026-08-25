import React, { useState, useEffect } from 'react';

const FinalizeSaleModal = ({ grandTotal, isSubmitting, error, onClose, onSubmit }) => {
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Finalize Sale</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-12 gap-8 bg-slate-50">

          {/* Left Column - Inputs */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (៛)</label>
                <input type="number" value={amountKHR} onChange={e => setAmountKHR(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($)</label>
                <input type="number" value={amountUSD} onChange={e => setAmountUSD(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Paying by</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 bg-white">
                  {paymentMethodsList.map(m => (
                    <option key={m.id || m.name} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Note</label>
              <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
            </div>

            <div className="border border-slate-200 bg-white rounded overflow-hidden mt-4 shadow-sm">
              <table className="w-full text-right text-sm">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-3 text-left font-bold text-slate-700 w-1/3">Total Payable</td>
                    <td className="p-3 font-bold text-slate-900">៛ {(grandTotal * exchangeRate).toLocaleString()} <br /> $ {grandTotal.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td className="p-3 text-left font-bold text-slate-700">Total Paying</td>
                    <td className="p-3 font-bold text-slate-900">៛ {(totalPayingUSD * exchangeRate).toLocaleString()} <br /> $ {totalPayingUSD.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-left font-bold text-slate-700">Balance</td>
                    <td className={`p-3 font-bold ${balanceUSD >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                      ៛ {balanceKHR.toLocaleString()} <br /> $ {balanceUSD.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Quick Cash */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
            {/* KHR Buttons */}
            <div>
              <div className="text-center font-bold text-slate-600 mb-3 text-xs uppercase tracking-wide">Quick Cash KHM</div>
              <div className="space-y-2">
                <button
                  onClick={() => setAmountKHR(Math.ceil(grandTotal * exchangeRate))}
                  className="w-full bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded border border-indigo-200 shadow-sm hover:bg-indigo-100 transition-colors text-sm flex justify-between px-4"
                >
                  <span className="opacity-50 font-normal">៛</span>
                  <span>{(Math.ceil(grandTotal * exchangeRate)).toLocaleString()}</span>
                </button>
                {[5000, 10000, 20000, 50000, 100000].map(val => (
                  <button
                    key={val}
                    onClick={() => setAmountKHR((parseFloat(amountKHR) || 0) + val)}
                    className="w-full bg-white text-slate-700 font-bold py-2.5 rounded border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors text-sm flex justify-between px-4"
                  >
                    <span className="text-slate-400 font-normal">៛</span>
                    <span>{val.toLocaleString()}</span>
                  </button>
                ))}
                <button onClick={() => setAmountKHR('')} className="w-full bg-white text-rose-600 font-bold py-2 rounded border border-rose-200 shadow-sm hover:bg-rose-50 transition-colors text-sm">Clear</button>
              </div>
            </div>

            {/* USD Buttons */}
            <div>
              <div className="text-center font-bold text-slate-600 mb-3 text-xs uppercase tracking-wide">Quick Cash USD</div>
              <div className="space-y-2">
                <button
                  onClick={() => setAmountUSD(grandTotal.toFixed(2))}
                  className="w-full bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded border border-indigo-200 shadow-sm hover:bg-indigo-100 transition-colors text-sm flex justify-between px-4"
                >
                  <span className="opacity-50 font-normal">$</span>
                  <span>{grandTotal.toFixed(2)}</span>
                </button>
                {[5, 10, 20, 50, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => setAmountUSD((parseFloat(amountUSD) || 0) + val)}
                    className="w-full bg-white text-slate-700 font-bold py-2.5 rounded border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors text-sm flex justify-between px-4"
                  >
                    <span className="text-slate-400 font-normal">$</span>
                    <span>{val.toFixed(2)}</span>
                  </button>
                ))}
                <button onClick={() => setAmountUSD('')} className="w-full bg-white text-rose-600 font-bold py-2 rounded border border-rose-200 shadow-sm hover:bg-rose-50 transition-colors text-sm">Clear</button>
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
            className={`w-full text-white font-bold py-3 rounded shadow-sm uppercase tracking-wider transition-colors text-lg ${isSubmitting ? 'bg-emerald-400 cursor-not-allowed opacity-70' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
          >
            {isSubmitting ? 'PROCESSING...' : 'SUBMIT'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReceiptModal = ({ sale, onClose }) => {
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
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Receipt</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Printable Area */}
          <div className="p-6 bg-slate-50 flex-1 overflow-y-auto">
            <div id="receipt-print-area" className="bg-white p-4 shadow-sm border border-slate-200 mx-auto" style={{ maxWidth: '300px' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>NUTHEB PHARMACY</div>
              <div style={{ textAlign: 'center', fontSize: '12px', marginBottom: '16px' }}>Phnom Penh, Cambodia<br />Tel: 096 573 4996</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Date:</span>
                <span>{sale?.date ? new Date(sale.date).toLocaleString() : ''}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Ref No:</span>
                <span style={{ fontWeight: 'bold' }}>{sale?.referenceNo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', borderBottom: '1px dashed #999', paddingBottom: '8px' }}>
                <span>Customer:</span>
                <span>{(sale?.customer?.name || 'Walk-in Patient').replace(' (General)', '')}</span>
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
                  <span>Subtotal:</span>
                  <span>${Number(sale?.total || 0).toFixed(2)}</span>
                </div>
                {Number(sale?.discount || 0) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Discount:</span>
                    <span>${Number(sale?.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #999' }}>
                  <span>Grand Total:</span>
                  <span>${Number(sale?.grandTotal || 0).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '2px', color: '#555' }}>
                  <span>Grand Total (៛):</span>
                  <span>៛ {Number((sale?.grandTotal || 0) * (sale?.exchangeRate || 4000)).toLocaleString()}</span>
                </div>

                {/* Paid Amount and Change */}
                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #999' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Paid ($):</span>
                    <span>${Number(sale?.paidUSD || sale?.grandTotal || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Paid (៛):</span>
                    <span>៛ {Number(sale?.paidKHR || (sale?.grandTotal || 0) * (sale?.exchangeRate || 4000)).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #999' }}>
                    <span>Change ($):</span>
                    <span>${Number(sale?.changeUSD || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginTop: '2px', color: '#16a34a' }}>
                    <span>Change (៛):</span>
                    <span>៛ {Number(sale?.changeKHR || (sale?.changeUSD || 0) * 4000).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '24px', marginBottom: '8px' }}>Thank you!</div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex gap-4 no-print">
            <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded uppercase tracking-wider transition-colors">
              Close
            </button>
            <button onClick={handlePrint} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded shadow-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Dispensing({ onSaleComplete }) {
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

  useEffect(() => {
    const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    Promise.all([
      fetch('/api/operation/products', { headers: authHeaders }).then(res => res.ok ? res.json() : []),
      fetch('/api/operation/patients', { headers: authHeaders }).then(res => res.ok ? res.json() : []),
      fetch('/api/operation/units', { headers: authHeaders }).then(res => res.ok ? res.json() : []),
      fetch('/api/operation/settings', { headers: authHeaders }).then(res => res.ok ? res.json() : [])
    ]).then(([prods, custs, unts, stgs]) => {
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
      setIsLoading(false);
    }).catch(err => {
      setError('Failed to load products or customers.');
      setIsLoading(false);
    });
  }, []);

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
    if (!product.quantity || product.quantity <= 0) {
      setError(`Cannot add ${product.name} - Out of stock!`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    const availableUnits = getAvailableUnits(product);
    const defaultUnit = availableUnits.length > 0 ? availableUnits[0] : (product.unit ? { id: product.unit.id, name: product.unit.name, price: product.price } : null);
    const initialPrice = defaultUnit ? parseFloat(defaultUnit.price) : parseFloat(product.price);

    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity + 1 > product.quantity) {
        setError(`Not enough stock for ${product.name}`);
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
    if (product && newQuantity > product.quantity) {
      setError(`Only ${product.quantity} units available for ${product.name}`);
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

      // Update local product stock
      const updatedProducts = [...products];
      cart.forEach(cartItem => {
        const prod = updatedProducts.find(p => p.id === cartItem.product.id);
        if (prod) {
          const mult = cartItem.selectedUnit?.multiplier || 1;
          prod.quantity -= (cartItem.quantity * mult);
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

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full bg-slate-100 p-2 gap-2 overflow-hidden">

      {/* LEFT PANEL: Products List (2/3 width) */}
      <div className="w-[65%] bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
        {/* Category Tabs */}
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto scrollbar-hide shadow-sm z-10 relative">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-5 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === 'All'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md transform -translate-y-px'
              : 'bg-white text-slate-600 border-slate-300 shadow-sm hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400'
              }`}
          >
            All Categories
          </button>
          {[...new Set(products.map(p => p.category?.name).filter(Boolean))].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md transform -translate-y-px'
                : 'bg-white text-slate-600 border-slate-300 shadow-sm hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3 bg-slate-50/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className={`bg-white rounded-lg p-3 border transition-all cursor-pointer shadow-sm hover:shadow-md ${product.quantity > 0 ? 'border-slate-200 hover:border-indigo-400' : 'border-rose-200 opacity-60'
                  }`}
              >
                <div className="flex justify-end items-start mb-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${product.quantity > 10 ? 'bg-emerald-100 text-emerald-700' :
                    product.quantity > 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                    {product.quantity > 0 ? `${Math.round(product.quantity)} Qty` : 'Out'}
                  </span>
                </div>

                {/* Product Image */}
                <div className="w-full h-28 mb-3 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image.startsWith('http') || product.image.startsWith('data:') ? product.image : `http://localhost:8081/uploads/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-contain p-1 mix-blend-multiply"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>

                <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 leading-tight" title={product.name}>{product.name}</h3>
                <p className="text-xs text-slate-400 mb-2 truncate">{product.category?.name || 'Gen.'}</p>
                <div className="text-indigo-600 font-bold text-lg">${Number(product.price).toFixed(2)}</div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-10 text-center text-slate-500 italic">No medicines found.</div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Cart & Checkout (1/3 width) */}
      <div className="w-[35%] bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">

        {/* Customer Selection & Search */}
        <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
          <select
            className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            value={selectedCustomer ? selectedCustomer.id : ""}
            onChange={(e) => {
              const custId = parseInt(e.target.value);
              const cust = customers.find(c => c.id === custId);
              setSelectedCustomer(cust || null);
            }}
          >
            {customers.length === 0 && (
              <option value="">Walk-in Patient</option>
            )}
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name.replace(' (General)', '')}{c.phone && c.phone !== 'N/A' ? ` - ${c.phone}` : ''}
              </option>
            ))}
          </select>

          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search barcode or name here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Cart Table Header */}
        <div className="grid grid-cols-12 gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-2">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Total</div>
          <div className="col-span-1 text-center"></div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <svg className="w-16 h-16 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {cart.map(item => (
                <div key={item.product.id} className="grid grid-cols-12 gap-1 items-center px-2 py-2 bg-white text-sm hover:bg-slate-50 border-b border-slate-100">
                  <div className="col-span-5 flex flex-col justify-center pr-1">
                    <div className="truncate font-semibold text-slate-800 text-xs" title={item.product.name}>
                      {item.product.name}
                    </div>
                    {(() => {
                      const units = getAvailableUnits(item.product);
                      if (units.length > 0) {
                        return (
                          <select
                            value={item.selectedUnit?.id || ''}
                            onChange={(e) => updateCartUnit(item.product.id, parseInt(e.target.value))}
                            className="mt-0.5 w-full bg-emerald-50/60 border border-emerald-200 rounded px-1 py-0.5 text-[11px] font-medium text-emerald-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {item.product.unit ? item.product.unit.name : 'គ្រាប់'}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="col-span-2 flex justify-center items-center">
                    <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 bg-slate-100 border border-slate-300 rounded-l flex items-center justify-center hover:bg-slate-200 text-slate-600 font-bold leading-none">-</button>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value) || 1)}
                      className="w-10 h-6 text-center border-y border-slate-300 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                    <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 bg-slate-100 border border-slate-300 rounded-r flex items-center justify-center hover:bg-slate-200 text-slate-600 font-bold leading-none">+</button>
                  </div>
                  <div className="col-span-2 text-right text-slate-600">
                    ${Number(item.price).toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-bold text-slate-800">
                    ${Number(item.subtotal).toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removeFromCart(item.product.id)} className="text-rose-500 hover:text-rose-700 p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Section */}
        <div className="bg-slate-800 text-white p-3 flex flex-col gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between text-sm items-center">
            <span className="text-slate-300">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-slate-300">Discount:</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-16 text-right border-b border-slate-600 bg-transparent px-1 py-0.5 focus:outline-none focus:border-emerald-400"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-between text-xl font-bold text-emerald-400 pt-2 border-t border-slate-600">
            <span>Total:</span>
            <span>${Math.max(0, grandTotal).toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => setCart([])}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded uppercase text-sm tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowFinalizeModal(true)}
              disabled={cart.length === 0 || isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-sm transition-colors"
            >
              PAY
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
