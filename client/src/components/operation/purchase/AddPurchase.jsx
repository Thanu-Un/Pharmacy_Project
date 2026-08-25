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
        placeholder="Search by code or name..."
        value={open ? search : (item.product ? displayValue : '')}
        onFocus={() => { setOpen(true); setSearch(''); }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full min-w-[200px] border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm"
      />
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.length > 0 ? filtered.map(p => (
            <div 
              key={p.id}
              onMouseDown={(e) => { e.preventDefault(); onChange(p.id); setOpen(false); }}
              className="px-3 py-2 cursor-pointer hover:bg-slate-50 text-sm border-b border-slate-50 last:border-0"
            >
              <div className="font-semibold text-slate-800">{p.name}</div>
              <div className="text-xs text-slate-500 font-mono">{p.code}</div>
            </div>
          )) : (
            <div className="px-3 py-4 text-center text-sm text-slate-500 italic">No products found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default function AddPurchase({ onBack, onSave }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    referenceNo: '',
    date: new Date().toISOString().slice(0, 16),
    supplier: null,
    status: 'pending',
    paymentStatus: 'due',
    note: ''
  });

  const [items, setItems] = useState([]);
  
  useEffect(() => {
    // Generate a simple reference no
    const ref = 'PR-' + Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, referenceNo: ref }));

    // Fetch Suppliers and Products
    Promise.all([
      fetch('/api/operation/suppliers').then(res => res.ok ? res.json() : []),
      fetch('/api/operation/products').then(res => res.ok ? res.json() : [])
    ]).then(([supps, prods]) => {
      setSuppliers(supps);
      setProducts(prods);
    }).catch(err => {
      setError('Failed to load suppliers or products.');
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
        
        // Auto-fill cost if product is selected
        if (field === 'product') {
          const prod = products.find(p => p.id === parseInt(value));
          updated.product = prod || null;
          if (prod) {
            updated.unitCost = prod.cost || 0;
            updated.productCode = prod.code;
            updated.productName = prod.name;
          }
        }
        
        // Calculate subtotal
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
      setError("Please add at least one item to the purchase.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const grandTotal = calculateGrandTotal();
    
    // Clean up items for backend
    const cleanItems = items.map(item => ({
      product: item.product,
      productCode: item.productCode,
      productName: item.productName,
      unitCost: parseFloat(item.unitCost) || 0,
      quantityReceived: parseFloat(item.quantityReceived) || 0,
      quantity: parseFloat(item.quantityReceived) || 0, // In this simple version, ordered = received
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
        throw new Error(errorMsg || 'Failed to create purchase');
      }

      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Add New Purchase</h1>
          <p className="text-sm text-slate-500 mt-1">Create a new supplier invoice and update stock</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-rose-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Basic Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Purchase Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reference No *</label>
              <input type="text" name="referenceNo" required value={formData.referenceNo} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
              <input type="datetime-local" name="date" required value={formData.date} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Supplier *</label>
              <select required onChange={handleSupplierChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="">Select a supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.company} ({s.name})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Status *</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium text-slate-700">
                <option value="pending">Pending (No stock update)</option>
                <option value="received">Received (Updates stock)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Status *</label>
              <select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                <option value="due">Due / Unpaid</option>
                <option value="partial">Partial Payment</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Items */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
            <h2 className="text-lg font-bold text-slate-800">Order Items</h2>
            <button type="button" onClick={addItem} className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Add Item
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-slate-500 uppercase text-xs tracking-wider bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-tl-lg">Product</th>
                  <th className="px-4 py-3 font-semibold text-right">Unit Cost</th>
                  <th className="px-4 py-3 font-semibold text-right">Quantity Received</th>
                  <th className="px-4 py-3 font-semibold">Expiry Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Subtotal</th>
                  <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400 italic">No items added yet. Click "Add Item" to start.</td>
                  </tr>
                ) : items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <ProductSelect 
                        item={item} 
                        products={products} 
                        onChange={(productId) => handleItemChange(item.id, 'product', productId)} 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" step="0.01" required min="0"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(item.id, 'unitCost', e.target.value)}
                        className="w-full text-right border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" step="0.01" required min="0.01"
                        value={item.quantityReceived}
                        onChange={(e) => handleItemChange(item.id, 'quantityReceived', e.target.value)}
                        className="w-full text-right border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium text-emerald-600"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="date"
                        value={item.expiry}
                        onChange={(e) => handleItemChange(item.id, 'expiry', e.target.value)}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-slate-700"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">
                      ${Number(item.subtotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => removeItem(item.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {items.length > 0 && (
                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-right font-semibold text-slate-700 uppercase tracking-wider text-xs">Grand Total</td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-emerald-600">${calculateGrandTotal().toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-10">
          <button type="button" onClick={onBack} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-emerald-500/20">
            {isLoading ? 'Saving...' : 'Submit Purchase'}
          </button>
        </div>

      </form>
    </div>
  );
}
