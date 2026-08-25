import React, { useState, useEffect, useRef } from 'react';

export default function AddProduct({ onBack, onSave }) {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: null,
    
    unit: null,
    
    baseUnit1: null,
    priceBaseUnit1: '',
    
    baseUnit2: null,
    priceBaseUnit2: '',
    
    baseUnit3: null,
    priceBaseUnit3: '',
    
    baseUnit4: null,
    priceBaseUnit4: '',
    
    baseUnit5: null,
    priceBaseUnit5: '',
    
    cost: '',
    price: '',
    
    quantity: '',
    alertQuantity: '',
    trackQuantity: true,
    
    image: '',
    details: ''
  });

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
    if (formData.unit) {
      const matchedSubUnits = units.filter(u => u.baseUnitId === formData.unit.id);
      setFormData(prev => {
        const updated = { ...prev };
        // Reset all base units first
        for (let i = 1; i <= 5; i++) {
          updated[`baseUnit${i}`] = null;
        }
        // Set the matched ones
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

    // Format numbers
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
      const response = await fetch('/api/operation/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Failed to create product');
      }

      onSave(); // Go back to list
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomCode = () => {
    // Generate a random 8-digit numeric barcode
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
          image: reader.result // Base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Add New Medicine</h1>
          <p className="text-sm text-slate-500 mt-1">Fill in the details to create a new product</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 flex items-center gap-3 border border-rose-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">1. Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Code / Barcode *</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  name="code" 
                  required 
                  value={formData.code} 
                  onChange={handleChange} 
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" 
                  placeholder="Enter product code" 
                />
                <button 
                  type="button" 
                  onClick={generateRandomCode} 
                  className="px-4 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold rounded-lg border border-emerald-200 transition-colors shadow-sm"
                >
                  Generate
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Medicine Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" placeholder="Enter medicine name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
              <select required onChange={(e) => handleSelectChange('category', e.target.value, categories)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white">
                <option value="">Select a category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Costs & Stock */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">2. Costs & Stock Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cost (Buy Price)</label>
              <input type="number" step="0.01" name="cost" value={formData.cost} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Base Price (Sell Price)</label>
              <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
            </div>
            {/* Removed Current Quantity in Stock input as per user request to avoid breaking reports */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Alert Quantity (Low Stock Warning)</label>
              <input type="number" step="0.01" name="alertQuantity" value={formData.alertQuantity} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0" />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="trackQuantity" name="trackQuantity" checked={formData.trackQuantity} onChange={handleChange} className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500" />
              <label htmlFor="trackQuantity" className="text-sm font-medium text-slate-700">Track Quantity (Deduct stock upon sale)</label>
            </div>
          </div>
        </div>

        {/* 3. Units & Custom Prices */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">3. Units Configuration</h2>
          
          <div className="max-w-md mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Main Unit</label>
            <select onChange={(e) => handleSelectChange('unit', e.target.value, units)} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="">Select Main Unit</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          {(() => {
            const subUnits = units.filter(u => u.baseUnitId === formData.unit?.id);
            if (subUnits.length === 0) return null;
            return (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Custom Prices for Sub-Units (Optional)</p>
                {subUnits.map((subUnit, idx) => {
                  const num = idx + 1;
                  return (
                    <div key={subUnit.id} className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Sub Unit (ឯកតារង)</label>
                        <div className="w-full bg-slate-100 border border-slate-200 text-slate-700 rounded-md px-3 py-2 text-sm font-medium">
                          {subUnit.name}
                        </div>
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Price for {subUnit.name} (តម្លៃលក់សម្រាប់ {subUnit.name})</label>
                        <input type="number" step="0.01" name={`priceBaseUnit${num}`} value={formData[`priceBaseUnit${num}`]} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* 4. Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">4. Additional Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Product Image (រូបភាពផលិតផល)</label>
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
                  value={formData.image ? (formData.image.startsWith('data:') ? 'Selected Image File' : formData.image) : ''} 
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 bg-slate-50 text-slate-500 outline-none cursor-pointer" 
                  placeholder="No image selected"
                  onClick={triggerFileSelect}
                />
                <button 
                  type="button" 
                  onClick={triggerFileSelect} 
                  className="px-4 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold rounded-lg border border-emerald-200 transition-colors shadow-sm"
                >
                  Browse
                </button>
                {formData.image && (
                  <button 
                    type="button" 
                    onClick={handleRemoveImage} 
                    className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold rounded-lg border border-rose-200 transition-colors shadow-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              {formData.image && (
                <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg w-fit">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="h-28 w-28 object-cover rounded-md border border-slate-300"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Product Details / Usage Notes</label>
              <textarea name="details" value={formData.details} onChange={handleChange} rows="4" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Describe the medicine..." />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-10">
          <button type="button" onClick={onBack} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-emerald-500/20">
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Medicine'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
