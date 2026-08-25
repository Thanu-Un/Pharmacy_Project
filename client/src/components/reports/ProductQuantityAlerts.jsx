import React, { useState, useEffect } from 'react';

export default function ProductQuantityAlerts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');

  const fetchAlertProducts = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const response = await fetch('http://localhost:8080/api/operation/products', { headers });
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      // Filter products where quantity <= alertQuantity
      const alerts = data.filter(p => p.quantity <= p.alertQuantity);
      setProducts(alerts);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertProducts();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500">Loading alerts...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
  }

  const filteredProducts = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="bg-white px-8 py-6 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Product Quantity Alerts</h1>
            <p className="text-slate-500 mt-1">Products that are low in stock and need to be reordered.</p>
          </div>
          <span className="bg-rose-100 text-rose-700 py-1 px-3 rounded-full text-sm font-bold">
            {products.length} {products.length === 1 ? 'Item' : 'Items'} below alert level
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          {/* Header Controls */}
          <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search by name or code..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="bg-emerald-600 text-white font-semibold border-b border-emerald-700 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">Image</th>
                  <th className="px-6 py-4">Product Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                  <th className="px-6 py-4 text-right">Alert Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-center">
                        {product.image ? (
                          <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden mx-auto">
                            <img 
                              src={`http://localhost:8080${product.image}`} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                 e.target.onerror = null; 
                                 e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-emerald-600">
                        <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">
                          {product.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-md text-sm font-bold border border-rose-100">
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">
                        {product.alertQuantity}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      {searchTerm ? 'No products matching your search.' : 'No products are currently low on stock.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
