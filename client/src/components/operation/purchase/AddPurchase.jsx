import React, { useState, useEffect } from 'react';

const ProductSelect = ({ item, products, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const displayValue = item.product ? `${item.product.code} - ${item.product.name}` : search;
  const filtered = products.filter(p => `${p.code} ${p.name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <input 
        type="text"
        placeholder="Search code or name..."
        value={open ? search : (item.product ? displayValue : '')}
        onFocus={() => { setOpen(true); setSearch(''); }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full min-w-[200px] bg-white border border-slate-200/90 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 font-medium transition-all"
      />
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200/90 rounded-xl shadow-lg max-h-60 overflow-y-auto p-1">
          {filtered.length > 0 ? filtered.map(p => (
            <div 
              key={p.id}
              onMouseDown={(e) => { e.preventDefault(); onChange(p.id); setOpen(false); }}
              className="px-3 py-2 cursor-pointer hover:bg-slate-50 rounded-lg text-xs transition-colors"
            >
              <div className="font-semibold text-slate-900">{p.name}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.code}</div>
            </div>
          )) : (
            <div className="px-3 py-4 text-center text-xs text-slate-400 italic">No products matching</div>
          )}
        </div>
      )}
    </div>
  );
};

export default function AddPurchase({ onBack, onSave }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    referenceNo: '',
    date: new Date().toISOString().slice(0, 16),
    supplier: null,
    warehouse: null,
    status: 'pending',
    paymentStatus: 'due',
    note: ''
  });

  const [items, setItems] = useState([]);
  
  useEffect(() => {
    const ref = 'PR-' + Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, referenceNo: ref }));

    Promise.all([
      fetch('/api/operation/suppliers').then(res => res.ok ? res.json() : []),
      fetch('/api/operation/products').then(res => res.ok ? res.json() : []),
      fetch('/api/operation/warehouses').then(res => res.ok ? res.json() : [])
    ]).then(([supps, prods, whs]) => {
      setSuppliers(supps);
      setProducts(prods);
      setWarehouses(whs);
    }).catch(err => {
      setError('Failed to load initial data.');
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSupplierChange = (e) => {
    const selected = suppliers.find(s => s.id === parseInt(e.target.value)) || null;
    setFormData(prev => ({ ...prev, supplier: selected }));
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now(),
      product: null,
      unitCost: '',
      quantityReceived: '',
      subtotal: 0,
      expiry: ''
    }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let updated = { ...item, [field]: value };
        
        if (field === 'product') {
          const prod = products.find(p => p.id === parseInt(value));
          updated.product = prod || null;
          if (prod) {
            updated.unitCost = prod.cost || 0;
            updated.productCode = prod.code;
            updated.productName = prod.name;
          }
        }
        
        const cost = parseFloat(updated.unitCost) || 0;
        const qty = parseFloat(updated.quantityReceived) || 0;
        updated.subtotal = cost * qty;
        
        return updated;
      }
      return item;
    }));
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Please add at least one line item to the purchase.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const grandTotal = calculateGrandTotal();
    
    const cleanItems = items.map(item => ({
      product: item.product,
      productCode: item.productCode,
      productName: item.productName,
      unitCost: parseFloat(item.unitCost) || 0,
      quantityReceived: parseFloat(item.quantityReceived) || 0,
      quantity: parseFloat(item.quantityReceived) || 0,
      subtotal: parseFloat(item.subtotal) || 0,
      expiry: item.expiry || null
    }));

    const payload = {
      ...formData,
      total: grandTotal,
      grandTotal: grandTotal,
      items: cleanItems
    };

    try {
      const response = await fetch('/api/operation/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to record purchase invoice');
      }

      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack} 
          className="p-2 border border-slate-200/80 bg-white hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
          title="Back to Purchases"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">New Purchase Order</h1>
          <p className="text-xs text-slate-500 mt-0.5">Receive supplier inventory and generate accounts payable</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-rose-200/60">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Purchase Metadata</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Reference Code <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                name="referenceNo" 
                required 
                value={formData.referenceNo} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 font-mono font-medium focus:outline-none focus:border-sky-500 transition-all" 
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Date & Time <span className="text-rose-500">*</span>
              </label>
              <input 
                type="datetime-local" 
                name="date" 
                required 
                value={formData.date} 
                onChange={handleChange} 
                className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all" 
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Supplier Vendor <span className="text-rose-500">*</span>
              </label>
              <select 
                required 
                onChange={handleSupplierChange} 
                className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
              >
                <option value="">Select supplier vendor</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.company} ({s.name})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Target Warehouse <span className="text-rose-500">*</span>
              </label>
              <select 
                required 
                name="warehouse"
                onChange={(e) => {
                  const selected = warehouses.find(w => w.id === parseInt(e.target.value)) || null;
                  setFormData(prev => ({ ...prev, warehouse: selected }));
                }} 
                className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
              >
                <option value="">Select destination warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Receiving Status <span className="text-rose-500">*</span>
              </label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
              >
                <option value="pending">Pending (Awaiting Delivery)</option>
                <option value="received">Received (Increments Stock)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Payment Status <span className="text-rose-500">*</span>
              </label>
              <select 
                name="paymentStatus" 
                value={formData.paymentStatus} 
                onChange={handleChange} 
                className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium transition-all"
              >
                <option value="due">Due / Unpaid</option>
                <option value="partial">Partial Payment</option>
                <option value="paid">Paid in Full</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Items Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Line Items</h2>
            <button 
              type="button" 
              onClick={addItem} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <span>Add Line Item</span>
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-slate-200/70">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Product / Formulary</th>
                  <th className="py-2.5 px-3 text-right w-32">Unit Cost ($)</th>
                  <th className="py-2.5 px-3 text-right w-28">Quantity</th>
                  <th className="py-2.5 px-3 w-36">Expiry Date</th>
                  <th className="py-2.5 px-3 text-right w-32">Subtotal</th>
                  <th className="py-2.5 px-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400 italic">No line items added yet. Click "Add Line Item" to record products.</td>
                  </tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3">
                      <ProductSelect 
                        item={item} 
                        products={products} 
                        onChange={(productId) => handleItemChange(item.id, 'product', productId)} 
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input 
                        type="number" step="0.01" required min="0"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(item.id, 'unitCost', e.target.value)}
                        className="w-full text-right bg-white border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono font-medium focus:outline-none focus:border-sky-500 transition-all"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input 
                        type="number" step="0.01" required min="0.01"
                        value={item.quantityReceived}
                        onChange={(e) => handleItemChange(item.id, 'quantityReceived', e.target.value)}
                        className="w-full text-right bg-white border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono font-semibold focus:outline-none focus:border-sky-500 transition-all"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input 
                        type="date"
                        value={item.expiry}
                        onChange={(e) => handleItemChange(item.id, 'expiry', e.target.value)}
                        className="w-full bg-white border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-sky-500 transition-all"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                      ${Number(item.subtotal).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button 
                        type="button" 
                        onClick={() => removeItem(item.id)} 
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Remove Item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {items.length > 0 && (
                <tfoot className="bg-slate-50/90 border-t border-slate-200">
                  <tr>
                    <td colSpan="4" className="py-3 px-3 text-right font-semibold text-slate-600 uppercase tracking-wider text-[11px]">Total Invoice Valuation</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-slate-900">${calculateGrandTotal().toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2.5 pt-2 pb-8">
          <button 
            type="button" 
            onClick={onBack} 
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading} 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                <span>Recording Order...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span>Submit Purchase Order</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
