import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function AddTransfer({ onBack, onSave }) {
  const { t } = useTranslation();
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [referenceNo, setReferenceNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);

  // Product Search State
  const [productSearch, setProductSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const ref = 'TRF-' + Math.floor(100000 + Math.random() * 900000);
    setReferenceNo(ref);

    const token = localStorage.getItem('token');
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch('/api/operation/warehouses', { headers: authHeaders }).then(r => r.ok ? r.json() : []),
      fetch('/api/operation/products', { headers: authHeaders }).then(r => r.ok ? r.json() : []),
      fetch('/api/operation/units', { headers: authHeaders }).then(r => r.ok ? r.json() : [])
    ]).then(([whs, prods, unts]) => {
      setWarehouses(whs);
      setProducts(prods);
      setUnits(unts);

      if (whs.length >= 2) {
        setFromWarehouseId(String(whs[0].id));
        setToWarehouseId(String(whs[1].id));
      } else if (whs.length === 1) {
        setFromWarehouseId(String(whs[0].id));
      }
    }).catch(err => {
      setError(t('transfer.failed_load') || 'Failed to load initial master data.');
    });
  }, []);

  // Helper to get available stock of a product in the selected source warehouse
  const getProductSourceStock = (product, whId) => {
    if (!product || !whId) return 0;
    if (product.stocks && Array.isArray(product.stocks)) {
      const found = product.stocks.find(s => s.warehouse?.id === Number(whId));
      return found ? parseFloat(found.quantity) || 0 : 0;
    }
    return 0;
  };

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

      if (curr.baseUnitId && units.length > 0) {
        curr = units.find(u => u.id === curr.baseUnitId) || null;
      } else {
        break;
      }
    }
    return mult;
  };

  const getAvailableUnits = (product) => {
    if (!product) return [];
    const unitsMap = new Map();
    const addUnit = (u) => {
      if (u && u.id) {
        const fullUnit = units.find(item => item.id === u.id) || u;
        unitsMap.set(fullUnit.id, fullUnit);
      }
    };
    if (product.unit) addUnit(product.unit);
    if (product.saleUnit) addUnit(product.saleUnit);
    if (product.purchaseUnit) addUnit(product.purchaseUnit);
    if (product.baseUnit1) addUnit(product.baseUnit1);
    if (product.baseUnit2) addUnit(product.baseUnit2);
    if (product.baseUnit3) addUnit(product.baseUnit3);
    if (product.baseUnit4) addUnit(product.baseUnit4);
    if (product.baseUnit5) addUnit(product.baseUnit5);
    return Array.from(unitsMap.values());
  };

  const handleAddProduct = (product) => {
    if (!fromWarehouseId) {
      setError('Please select a Source Warehouse (From Warehouse) first!');
      return;
    }

    const available = getProductSourceStock(product, fromWarehouseId);
    if (available <= 0) {
      setError(`Cannot transfer ${product.name} - Zero stock in source warehouse!`);
      setTimeout(() => setError(null), 4000);
      return;
    }

    // Check if already in items
    const existing = items.find(it => it.product.id === product.id);
    if (existing) {
      if (existing.quantity + 1 > available) {
        setError(`Cannot add more than ${available} available in source warehouse`);
        setTimeout(() => setError(null), 3000);
        return;
      }
      setItems(items.map(it => 
        it.product.id === product.id 
          ? { ...it, quantity: it.quantity + 1 } 
          : it
      ));
    } else {
      const availUnits = getAvailableUnits(product);
      setItems([...items, {
        product: product,
        quantity: 1,
        unit: availUnits.length > 0 ? availUnits[0] : (product.unit || null),
        availableStock: available
      }]);
    }
    setProductSearch('');
    setIsSearchOpen(false);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    const val = parseFloat(newQty) || 0;
    setItems(items.map(it => {
      if (it.product.id === productId) {
        return { ...it, quantity: val };
      }
      return it;
    }));
  };

  const handleUpdateUnit = (productId, unitId) => {
    const chosenUnit = units.find(u => u.id === Number(unitId)) || null;
    setItems(items.map(it => {
      if (it.product.id === productId) {
        return { ...it, unit: chosenUnit };
      }
      return it;
    }));
  };

  const handleRemoveItem = (productId) => {
    setItems(items.filter(it => it.product.id !== productId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fromWarehouseId || !toWarehouseId) {
      setError(t('transfer.err_select_both_wh') || 'Please select both Source and Destination warehouses.');
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      setError(t('transfer.err_same_wh') || 'Source and Destination warehouses cannot be the same!');
      return;
    }
    if (items.length === 0) {
      setError(t('transfer.err_add_one_item') || 'Please add at least one medicine item to transfer.');
      return;
    }

    // Validate quantities against source stock
    for (const it of items) {
      const available = getProductSourceStock(it.product, fromWarehouseId);
      const mult = calculateUnitMultiplier(it.unit);
      const baseQty = it.quantity * mult;

      if (it.quantity <= 0) {
        setError(`${t('common.quantity') || 'Quantity'} (${it.product.name}) ${t('transfer.err_qty_positive') || 'must be greater than 0.'}`);
        return;
      }
      if (baseQty > available) {
        setError(`${t('transfer.err_insufficient') || 'Insufficient stock for'} ${it.product.name}. ${t('transfer.available_in_source')}: ${available}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        referenceNo: referenceNo,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        fromWarehouse: { id: Number(fromWarehouseId) },
        toWarehouse: { id: Number(toWarehouseId) },
        note: note,
        items: items.map(it => ({
          product: { id: it.product.id },
          quantity: it.quantity,
          unit: it.unit?.id ? { id: it.unit.id } : null
        }))
      };

      const response = await fetch('/api/operation/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit transfer');
      }

      if (onSave) {
        onSave();
      } else if (onBack) {
        onBack();
      }
    } catch (err) {
      setError(err.message || 'An error occurred during transfer creation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q);
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={t('common.back') || 'Back'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('transfer.create_transfer') || 'Create Stock Transfer'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('transfer.create_desc') || 'Transfer inventory from one warehouse or branch to another'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl text-xs flex justify-between items-center animate-in fade-in">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Route & General Information Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('transfer.route_info') || '1. Transfer Route & Information'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Reference No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('transfer.reference') || 'Reference No'}
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('transfer.date') || 'Transfer Date'}
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Source Warehouse (From) */}
            <div>
              <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {t('transfer.from_warehouse') || 'Source Warehouse (From)'} *
              </label>
              <select
                value={fromWarehouseId}
                onChange={(e) => {
                  setFromWarehouseId(e.target.value);
                  // Refresh items source stock check
                  setItems([]);
                }}
                required
                className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">{t('transfer.select_source') || '-- Select Source --'}</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name} {w.code ? `[${w.code}]` : ''}</option>
                ))}
              </select>
            </div>

            {/* Destination Warehouse (To) */}
            <div>
              <label className="block text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {t('transfer.to_warehouse') || 'Destination (To)'} *
              </label>
              <select
                value={toWarehouseId}
                onChange={(e) => setToWarehouseId(e.target.value)}
                required
                className="w-full bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">{t('transfer.select_destination') || '-- Select Destination --'}</option>
                {warehouses.filter(w => String(w.id) !== String(fromWarehouseId)).map(w => (
                  <option key={w.id} value={w.id}>{w.name} {w.code ? `[${w.code}]` : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Medicines / Items Selection Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t('transfer.items_to_transfer') || '2. Medicines To Transfer'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('transfer.search_medicines_tip') || 'Search and select medicines to shift into destination warehouse'}
              </p>
            </div>

            {/* Product Search & Dropdown Picker */}
            <div className="relative w-full sm:w-80">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
                <input
                  type="text"
                  placeholder={t('transfer.search_medicine_placeholder') || "Search medicine by name or code..."}
                  value={productSearch}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>

              {isSearchOpen && productSearch.length > 0 && (
                <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto p-1">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(p => {
                      const availInSrc = getProductSourceStock(p, fromWarehouseId);
                      return (
                        <div
                          key={p.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleAddProduct(p);
                          }}
                          className={`px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            availInSrc > 0 
                              ? 'hover:bg-slate-50 dark:hover:bg-slate-700/60' 
                              : 'opacity-50 bg-slate-50/50 cursor-not-allowed'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                              availInSrc > 0 
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60' 
                                : 'bg-rose-50 text-rose-600'
                            }`}>
                              {availInSrc} {t('transfer.in_source') || 'in source'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-xs text-slate-400 italic">
                      {t('transfer.no_match_search') || 'No medicines match search'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Transfer Table */}
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-3">{t('transfer.medicine') || 'Medicine'}</th>
                  <th className="py-2.5 px-3 text-center">{t('transfer.available_in_source') || 'Available in Source'}</th>
                  <th className="py-2.5 px-3 text-center">{t('transfer.transfer_quantity') || 'Transfer Quantity'}</th>
                  <th className="py-2.5 px-3">{t('common.unit') || 'Unit'}</th>
                  <th className="py-2.5 px-3 text-right">{t('common.action') || 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 italic">
                      {t('transfer.no_items_added') || 'No medicines added yet. Use the search bar above to add items.'}
                    </td>
                  </tr>
                ) : (
                  items.map(it => {
                    const avail = getProductSourceStock(it.product, fromWarehouseId);
                    const mult = calculateUnitMultiplier(it.unit);
                    const isExceeding = (it.quantity * mult) > avail;

                    return (
                      <tr key={it.product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">{it.product.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{it.product.code}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200/60 text-xs">
                            {avail}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={it.quantity}
                            onChange={(e) => handleUpdateQuantity(it.product.id, e.target.value)}
                            className={`w-24 text-center bg-white dark:bg-slate-800 border rounded-lg px-2.5 py-1 text-xs font-mono font-bold focus:outline-none ${
                              isExceeding 
                                ? 'border-rose-500 text-rose-600 bg-rose-50/30 ring-1 ring-rose-500' 
                                : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:border-brand-500'
                            }`}
                          />
                          {isExceeding && (
                            <div className="text-[10px] text-rose-500 font-semibold mt-0.5">
                              {t('transfer.exceeds_stock') || 'Exceeds stock!'}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {getAvailableUnits(it.product).length > 1 ? (
                            <select
                              value={it.unit?.id || ''}
                              onChange={(e) => handleUpdateUnit(it.product.id, e.target.value)}
                              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                            >
                              {getAvailableUnits(it.product).map(u => (
                                 <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-500 text-xs font-mono">{it.unit?.name || t('transfer.base_unit') || 'Base'}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.product.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200/80 dark:border-slate-800 p-5 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('transfer.note_label') || t('common.notes') || 'Transfer Note & Reason'}
          </label>
          <textarea
            rows="2"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('transfer.note_placeholder') || "e.g. Weekly stock replenishment for Branch 2, emergency rebalance..."}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-obsidian-900 hover:bg-obsidian-800 active:bg-obsidian-950 shadow-md shadow-obsidian-900/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('common.processing') || 'Processing Transfer...'}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('transfer.confirm_and_shift') || 'Confirm & Shift Stock'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
