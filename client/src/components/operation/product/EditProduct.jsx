import React, { useState, useEffect, useRef } from 'react';

export default function EditProduct({ product, onBack, onSave }) {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: product?.code || '',
    name: product?.name || '',
    category: product?.category || null,
    
    unit: product?.unit || null,
    
    baseUnit1: product?.baseUnit1 || null,
    priceBaseUnit1: product?.priceBaseUnit1 || '',
    
    baseUnit2: product?.baseUnit2 || null,
    priceBaseUnit2: product?.priceBaseUnit2 || '',
    
    baseUnit3: product?.baseUnit3 || null,
    priceBaseUnit3: product?.priceBaseUnit3 || '',
    
    baseUnit4: product?.baseUnit4 || null,
    priceBaseUnit4: product?.priceBaseUnit4 || '',
    
    baseUnit5: product?.baseUnit5 || null,
    priceBaseUnit5: product?.priceBaseUnit5 || '',
    
    cost: product?.cost || '',
    price: product?.price || '',
    
    quantity: product?.quantity || '',
    alertQuantity: product?.alertQuantity || '',
    trackQuantity: product?.trackQuantity !== undefined ? product.trackQuantity : true,
    
    image: product?.image || '',
    details: product?.details || ''
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    // Fetch Categories and Units
    Promise.all([
      fetch('/api/operation/categories').then(res => res.json()),
      fetch('/api/operation/units').then(res => res.json())
    ]).then(([cats, unts]) => {
      setCategories(cats);
      setUnits(unts);
    }).catch(err => {
      setError('Failed to load categories or units.');
    });
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (formData.unit) {
      const matchedSubUnits = units.filter(u => u.baseUnitId === formData.unit.id);
      setFormData(prev => {
        const updated = { ...prev };
        for (let i = 1; i <= 5; i++) {
          updated[`baseUnit${i}`] = null;
          updated[`priceBaseUnit${i}`] = '';
        }
        matchedSubUnits.forEach((subUnit, idx) => {
          if (idx < 5) {
            updated[`baseUnit${idx + 1}`] = subUnit;
          }
        });
        return updated;
      });
    } else {
      setFormData(prev => {
        const updated = { ...prev };
        for (let i = 1; i <= 5; i++) {
          updated[`baseUnit${i}`] = null;
          updated[`priceBaseUnit${i}`] = '';
        }
        return updated;
      });
    }
  }, [formData.unit, units]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, objId, list) => {
    const selectedObj = list.find(item => item.id === parseInt(objId)) || null;
    setFormData(prev => ({
      ...prev,
      [name]: selectedObj
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      ...formData,
      priceBaseUnit1: formData.priceBaseUnit1 || 0,
      priceBaseUnit2: formData.priceBaseUnit2 || 0,
      priceBaseUnit3: formData.priceBaseUnit3 || 0,
      priceBaseUnit4: formData.priceBaseUnit4 || 0,
      priceBaseUnit5: formData.priceBaseUnit5 || 0,
      cost: formData.cost || 0,
      price: formData.price || 0,
      quantity: formData.quantity || 0,
      alertQuantity: formData.alertQuantity || 0,
    };

    try {
      const response = await fetch(`/api/operation/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to update medicine');
      }

      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomCode = () => {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000).toString();
    setFormData(prev => ({
      ...prev,
      code: randomNum
    }));
  };

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          type="button" 
          onClick={onBack} 
          className="p-2 border border-slate-200/80 bg-white hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
          title="Back to Medicines"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Edit Medicine</h1>
          <p className="text-xs text-slate-500 mt-0.5">Update details for {product?.name}</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2 border border-rose-200/60">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Basic Information */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Formulary Item Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Barcode / Identifier <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  name="code" 
                  required 
                  value={formData.code} 
                  onChange={handleChange} 
                  className="flex-1 bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 font-mono font-medium transition-all" 
                  placeholder="Scan or enter barcode" 
                />
                <button 
                  type="button" 
                  onClick={generateRandomCode} 
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-medium rounded-lg transition-colors shadow-sm"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Medicine Name <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 font-medium transition-all" 
                placeholder="e.g. Paracetamol 500mg" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Therapeutic Category <span className="text-rose-500">*</span>
              </label>
              <select 
                required 
                value={formData.category?.id || ''} 
                onChange={(e) => handleSelectChange('category', e.target.value, categories)} 
                className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 font-medium transition-all"
              >
                <option value="">Select therapeutic classification</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name} ({cat.code})</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Costs & Stock */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Pricing & Stock Thresholds</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Cost / Purchase Price (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-400">$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  name="cost" 
                  value={formData.cost} 
                  onChange={handleChange} 
                  className="w-full bg-white border border-slate-200/90 rounded-lg pl-7 pr-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 font-mono font-medium transition-all" 
                  placeholder="0.00" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Dispense / Sell Price (USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-xs font-semibold text-slate-400">$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  name="price" 
                  required 
                  value={formData.price} 
                  onChange={handleChange} 
                  className="w-full bg-white border border-slate-200/90 rounded-lg pl-7 pr-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 font-mono font-medium transition-all" 
                  placeholder="0.00" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Alert Threshold (Low Stock Notice)
              </label>
              <input 
                type="number" 
                step="0.01" 
                name="alertQuantity" 
                value={formData.alertQuantity} 
                onChange={handleChange} 
                className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 font-mono font-medium transition-all" 
                placeholder="10" 
              />
            </div>

            <div className="flex items-center gap-2.5 pt-5">
              <input 
                type="checkbox" 
                id="trackQuantity" 
                name="trackQuantity" 
                checked={formData.trackQuantity} 
                onChange={handleChange} 
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20 accent-slate-900" 
              />
              <label htmlFor="trackQuantity" className="text-xs font-medium text-slate-700 cursor-pointer">
                Track Inventory (Deduct stock upon sales)
              </label>
            </div>
          </div>
        </div>

        {/* 3. Units & Custom Prices */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Packaging Units & Secondary Pricing</h2>
          </div>
          
          <div className="max-w-md">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Primary Dispensing Unit
            </label>
            <select 
              value={formData.unit?.id || ''} 
              onChange={(e) => handleSelectChange('unit', e.target.value, units)} 
              className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 font-medium transition-all"
            >
              <option value="">Select Primary Unit</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.code})</option>)}
            </select>
          </div>

          {(() => {
            const subUnits = units.filter(u => u.baseUnitId === formData.unit?.id);
            if (subUnits.length === 0) return null;
            return (
              <div className="space-y-3 pt-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Secondary Units & Specific Pricing (Optional)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subUnits.map((subUnit, idx) => {
                    const num = idx + 1;
                    return (
                      <div key={subUnit.id} className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">{subUnit.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">{subUnit.code}</span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 mb-1">Price per {subUnit.name} ($)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            name={`priceBaseUnit${num}`} 
                            value={formData[`priceBaseUnit${num}`]} 
                            onChange={handleChange} 
                            className="w-full bg-white border border-slate-200/90 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono font-medium transition-all" 
                            placeholder="0.00" 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* 4. Details */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Documentation & Packaging Asset</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Product Packaging Image
              </label>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly
                  value={formData.image ? (formData.image.startsWith('data:') ? 'Selected Image Attachment' : formData.image) : ''} 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-500 outline-none cursor-pointer" 
                  placeholder="No packaging file attached"
                  onClick={triggerFileSelect}
                />
                <button 
                  type="button" 
                  onClick={triggerFileSelect} 
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors shadow-sm"
                >
                  Browse...
                </button>
                {formData.image && (
                  <button 
                    type="button" 
                    onClick={handleRemoveImage} 
                    className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium rounded-lg border border-rose-200/60 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              {formData.image && (
                <div className="mt-3 p-1.5 bg-slate-50 border border-slate-200/80 rounded-lg w-fit">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="h-24 w-24 object-cover rounded border border-slate-200"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Clinical Details / Usage Protocol
              </label>
              <textarea 
                name="details" 
                value={formData.details} 
                onChange={handleChange} 
                rows="3" 
                className="w-full bg-white border border-slate-200/90 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 font-medium transition-all resize-y" 
                placeholder="Dosage guidelines, active ingredients, contraindications..." 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2.5 pt-2 pb-8">
          <button 
            type="button" 
            onClick={onBack} 
            disabled={isLoading}
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
                <span>Updating Medicine...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                <span>Update Medicine</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
