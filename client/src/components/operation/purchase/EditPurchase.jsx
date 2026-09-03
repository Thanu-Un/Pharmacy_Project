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

export default function EditPurchase({ purchase, onBack, onSave }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    referenceNo: purchase?.referenceNo || '',
    date: purchase?.date ? new Date(purchase.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    supplier: purchase?.supplier || null,
    warehouse: purchase?.warehouse || null,
    status: purchase?.status || 'received',
    paymentStatus: purchase?.paymentStatus || 'paid',
    note: purchase?.note || ''
  });

  const [items, setItems] = useState([]);

  useEffect(() => {
    // Fetch Suppliers, Products, and Warehouses
    Promise.all([
      fetch('/api/operation/suppliers').then(res => res.ok ? res.json() : []),
      fetch('/api/operation/products').then(res => res.ok ? res.json() : []),
      fetch('/api/operation/warehouses').then(res => res.ok ? res.json() : [])
    ]).then(([supps, prods, whs]) => {
      setSuppliers(supps);
      setProducts(prods);
      setWarehouses(whs);

      // Populate items from purchase
      if (purchase?.items && purchase.items.length > 0) {
        const existingItems = purchase.items.map((item, idx) => {
          const prodObj = item.product || prods.find(p => p.id === item.productId || p.code === item.productCode) || null;
          return {
            id: item.id || Date.now() + idx,
            product: prodObj,
            productCode: item.productCode || prodObj?.code || '',
            productName: item.productName || prodObj?.name || '',
            unitCost: item.unitCost || prodObj?.cost || 0,
            quantityReceived: item.quantityReceived || item.quantity || 1,
            subtotal: item.subtotal || ((item.unitCost || 0) * (item.quantityReceived || 1)),
            expiry: item.expiry || ''
          };
        });
        setItems(existingItems);
      }
    }).catch(err => {
      setError('Failed to load suppliers or products.');
    });
  }, [purchase]);

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
      productCode: item.productCode || item.product?.code,
      productName: item.productName || item.product?.name,
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
      const response = await fetch(`/api/operation/purchases/${purchase.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to update purchase');
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
          <h1 className="text-2xl font-bold text-slate-800">Edit Purchase: {purchase?.referenceNo}</h1>
          <p className="text-sm text-slate-500 mt-1">Update supplier invoice details and received stock quantities</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-rose-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Reference No *</label>
            <input
              type="text"
              name="referenceNo"
              value={formData.referenceNo}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-sm bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Supplier *</label>
            <select
              value={formData.supplier ? formData.supplier.id : ''}
              onChange={handleSupplierChange}
              required
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
            >
              <option value="">Select Supplier...</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.companyName ? `(${s.companyName})` : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Warehouse *</label>
            <select 
              required 
              name="warehouse"
              value={formData.warehouse ? formData.warehouse.id : ''}
              onChange={(e) => {
                const selected = warehouses.find(w => w.id === parseInt(e.target.value)) || null;
                setFormData(prev => ({ ...prev, warehouse: selected }));
              }} 
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
            >
              <option value="">Select a warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Purchase Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
            >
              <option value="received">Received</option>
              <option value="pending">Pending</option>
              <option value="ordered">Ordered</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Status</label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
            >
              <option value="paid">Paid</option>
              <option value="due">Due</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Note / Remark</label>
            <input
              type="text"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="e.g. Invoice #1024"
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>
        </div>

        {/* Purchase Items Table Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">Purchase Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-semibold px-3 py-1.5 rounded-lg text-sm transition-colors border border-emerald-200 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3 w-36">Unit Cost ($)</th>
                  <th className="p-3 w-36">Qty Received</th>
                  <th className="p-3 w-40">Expiry Date</th>
                  <th className="p-3 w-36 text-right">Subtotal ($)</th>
                  <th className="p-3 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 italic">No products added. Click "+ Add Item" to add medicines/products to this purchase.</td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <ProductSelect
                          item={item}
                          products={products}
                          onChange={(prodId) => handleItemChange(item.id, 'product', prodId)}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitCost}
                          onChange={(e) => handleItemChange(item.id, 'unitCost', e.target.value)}
                          placeholder="0.00"
                          required
                          className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantityReceived}
                          onChange={(e) => handleItemChange(item.id, 'quantityReceived', e.target.value)}
                          placeholder="1"
                          required
                          className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="date"
                          value={item.expiry}
                          onChange={(e) => handleItemChange(item.id, 'expiry', e.target.value)}
                          className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        ${Number(item.subtotal || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                  <td colSpan="4" className="p-3 text-right text-slate-700">Grand Total:</td>
                  <td className="p-3 text-right text-emerald-600 text-base">${calculateGrandTotal().toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? 'Saving Changes...' : 'Update Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
}
