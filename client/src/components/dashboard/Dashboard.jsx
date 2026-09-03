import React, { useState, useEffect } from 'react';
import Sidebar from '../shared/Sidebar';
import Header from '../shared/Header';
import CategoryList from '../operation/category/CategoryList';
import AddCategory from '../operation/category/AddCategory';
import EditCategory from '../operation/category/EditCategory';
import UnitList from '../operation/unit/UnitList';
import AddUnit from '../operation/unit/AddUnit';
import EditUnit from '../operation/unit/EditUnit';
import ProductList from '../operation/product/ProductList';
import AddProduct from '../operation/product/AddProduct';
import EditProduct from '../operation/product/EditProduct';
import SupplierList from '../operation/supplier/SupplierList';
import AddSupplier from '../operation/supplier/AddSupplier';
import EditSupplier from '../operation/supplier/EditSupplier';
import PatientList from '../operation/patient/PatientList';
import AddPatient from '../operation/patient/AddPatient';
import EditPatient from '../operation/patient/EditPatient';
import PurchaseList from '../operation/purchase/PurchaseList';
import AddPurchase from '../operation/purchase/AddPurchase';
import EditPurchase from '../operation/purchase/EditPurchase';
import Dispensing from '../operation/dispensing/Dispensing';
import SalesList from '../operation/dispensing/SalesList';
import StaffList from '../operation/staff/StaffList';
import AddStaff from '../operation/staff/AddStaff';
import EditStaff from '../operation/staff/EditStaff';
import SystemSettings from '../operation/settings/SystemSettings';
import PaymentMethodsSetting from '../operation/settings/PaymentMethodsSetting';
import CurrencySetting from '../operation/settings/CurrencySetting';
import WarehouseSetting from '../operation/settings/WarehouseSetting';
import GroupPermissionsSetting from '../operation/settings/GroupPermissionsSetting';
import ReportsDashboard from '../reports/ReportsDashboard';
import ProductQuantityAlerts from '../reports/ProductQuantityAlerts';
import ProductExpiryAlerts from '../reports/ProductExpiryAlerts';
import ProductsReport from '../reports/ProductsReport';
import CategoriesReport from '../reports/CategoriesReport';
import PurchaseItemsReport from '../reports/PurchaseItemsReport';
import ProfitLossReport from '../reports/ProfitLossReport';
import ExpenseCategoryList from '../expenses/ExpenseCategoryList';
import ExpenseList from '../expenses/ExpenseList';
import AddExpense from '../expenses/AddExpense';

export default function Dashboard({ username, token, permissions = [], onLogout }) {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('dashboard_currentView') || 'Dashboard';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    localStorage.setItem('dashboard_currentView', currentView);
  }, [currentView]);

  const renderContent = () => {
    switch (currentView) {
      case 'Dashboard':
        return (
          <div className="p-6 h-full flex flex-col bg-slate-50/50">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                  <p className="text-slate-500 text-sm font-medium mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-800">{stat.amount}</h3>
                  <p className="text-slate-400 text-xs mt-2">{stat.subtext}</p>
                </div>
              ))}
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Welcome to Nutheb Pharmacy</h3>
              <p className="text-slate-500 max-w-md">
                Select an option from the sidebar to start managing your inventory, processing sales, or viewing reports.
              </p>
            </div>
          </div>
        );

      // Operation - Category
      case 'Categories':
        return <CategoryList onAdd={() => setCurrentView('Add Category')} onEdit={(cat) => { setEditingCategory(cat); setCurrentView('Edit Category'); }} permissions={permissions} />;
      case 'Add Category':
        return <AddCategory onBack={() => setCurrentView('Categories')} onSave={() => setCurrentView('Categories')} />;
      case 'Edit Category':
        return <EditCategory category={editingCategory} onBack={() => setCurrentView('Categories')} onSave={() => setCurrentView('Categories')} />;

      // Operation - Unit
      case 'Unit':
        return <UnitList onAdd={() => setCurrentView('Add Unit')} onEdit={(unit) => { setEditingUnit(unit); setCurrentView('Edit Unit'); }} permissions={permissions} />;
      case 'Add Unit':
        return <AddUnit onBack={() => setCurrentView('Unit')} onSave={() => setCurrentView('Unit')} />;
      case 'Edit Unit':
        return <EditUnit unit={editingUnit} onBack={() => setCurrentView('Unit')} onSave={() => setCurrentView('Unit')} />;

      // Operation - Product (Medicines)
      case 'List Medicines':
        return <ProductList onAdd={() => setCurrentView('Add Medicine')} onEdit={(product) => { setEditingProduct(product); setCurrentView('Edit Medicine'); }} permissions={permissions} />;
      case 'Add Medicine':
        return <AddProduct onBack={() => setCurrentView('List Medicines')} onSave={() => setCurrentView('List Medicines')} />;
      case 'Edit Medicine':
        return <EditProduct product={editingProduct} onBack={() => setCurrentView('List Medicines')} onSave={() => setCurrentView('List Medicines')} />;

      // Operation - Supplier
      case 'List Suppliers':
        return <SupplierList onAdd={() => setCurrentView('Add Supplier')} onEdit={(supplier) => { setEditingSupplier(supplier); setCurrentView('Edit Supplier'); }} permissions={permissions} />;
      case 'Add Supplier':
        return <AddSupplier onBack={() => setCurrentView('List Suppliers')} onSave={() => setCurrentView('List Suppliers')} />;
      case 'Edit Supplier':
        return <EditSupplier supplier={editingSupplier} onBack={() => setCurrentView('List Suppliers')} onSave={() => setCurrentView('List Suppliers')} />;

      // Operation - Patients
      case 'List Patients':
        return <PatientList onAdd={() => setCurrentView('Add Patient')} onEdit={(patient) => { setEditingPatient(patient); setCurrentView('Edit Patient'); }} permissions={permissions} />;
      case 'Add Patient':
        return <AddPatient onBack={() => setCurrentView('List Patients')} onSave={() => setCurrentView('List Patients')} />;
      case 'Edit Patient':
        return <EditPatient patient={editingPatient} onBack={() => setCurrentView('List Patients')} onSave={() => setCurrentView('List Patients')} />;

      // Operation - Stock In (Purchases)
      case 'List Purchases':
        return <PurchaseList onAdd={() => setCurrentView('Add Purchase')} onEdit={(purchase) => { setEditingPurchase(purchase); setCurrentView('Edit Purchase'); }} permissions={permissions} />;
      case 'Add Purchase':
        return <AddPurchase onBack={() => setCurrentView('List Purchases')} onSave={() => setCurrentView('List Purchases')} />;
      case 'Edit Purchase':
        return <EditPurchase purchase={editingPurchase} onBack={() => setCurrentView('List Purchases')} onSave={() => setCurrentView('List Purchases')} />;

      // Operation - Dispensing (Sales)
      case 'Dispensing':
        return <Dispensing onBack={() => setCurrentView('Dashboard')} onSave={() => setCurrentView('List Sales')} />;
      case 'List Sales':
        return <SalesList onAdd={() => setCurrentView('Dispensing')} permissions={permissions} />;

      // Operation - Staff
      case 'List Staff':
        return <StaffList onAdd={() => setCurrentView('Add Staff')} onEdit={(staff) => { setEditingStaff(staff); setCurrentView('Edit Staff'); }} permissions={permissions} />;
      case 'Add Staff':
        return <AddStaff onBack={() => setCurrentView('List Staff')} onSave={() => setCurrentView('List Staff')} />;
      case 'Edit Staff':
        return <EditStaff staff={editingStaff} onBack={() => setCurrentView('List Staff')} onSave={() => setCurrentView('List Staff')} />;

      // Expenses
      case 'Expense Categories':
        return <ExpenseCategoryList />;
      case 'List Expenses':
        return <ExpenseList onAdd={() => setCurrentView('Add Expense')} />;
      case 'Add Expense':
        return <AddExpense onBack={() => setCurrentView('List Expenses')} onSave={() => setCurrentView('List Expenses')} />;

      // Settings
      case 'System Settings':
        return <SystemSettings />;
      case 'Payment Methods':
        return <PaymentMethodsSetting />;
      case 'Currency Setting':
        return <CurrencySetting />;
      case 'Warehouses':
        return <WarehouseSetting />;
      case 'Group Permissions':
        return <GroupPermissionsSetting />;

      // Custom Reports Sub-menu items
      case 'Product Quantity Alerts':
        return <ProductQuantityAlerts />;
      case 'Product Expiry Alerts':
        return <ProductExpiryAlerts />;

      default:
        // Handle generic fallback for reports
        return (
          ['Reports', 'Products Report', 'Categories Report', 'Purchases Report', 'Purchases Item Report'].includes(currentView) ? (
            <ReportsDashboard permissions={permissions} currentView={currentView} />
          ) : (
            <div className="p-8 text-slate-500">View not found</div>
          )
        );
    }
  };

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handler = () => setRefreshKey(k => k + 1);
    window.addEventListener('refreshDashboard', handler);
    return () => window.removeEventListener('refreshDashboard', handler);
  }, []);

  // Real dashboard data
  const [dashData, setDashData] = useState({
    totalMedicines: 0,
    inStock: 'In Stock',
    todaySales: 0,
    invoiceCount: 0,
    lowStockAlerts: 0,
    expiringSoon: 0,
    totalPurchases: 0,
    todaysPatients: 0
  });

  useEffect(() => {
    if (currentView !== 'Dashboard') return;
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const dateToFetch = selectedDate;

    // Fetch inventory status (low stock) + product count
    fetch('/api/reporting/inventory-status', { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setDashData(prev => ({
          ...prev,
          lowStockAlerts: data.lowStockItems || 0
        }));
      }).catch(() => {});

    // Fetch total medicine names count
    fetch('/api/operation/products', { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && Array.isArray(data)) {
          const now = new Date();
          const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          const expiringCount = data.filter(p => {
            if (!p.expiryDate) return false;
            const exp = new Date(p.expiryDate);
            return exp >= now && exp <= thirtyDays;
          }).length;
          setDashData(prev => ({
            ...prev,
            totalMedicines: data.length,
            expiringSoon: expiringCount
          }));
        }
      }).catch(() => {});

    // Fetch today's sales summary
    fetch(`/api/reporting/sales-summary?startDate=${dateToFetch}&endDate=${dateToFetch}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setDashData(prev => ({
          ...prev,
          todaySales: data.totalRevenue || 0,
          invoiceCount: data.invoiceCount || 0
        }));
      }).catch(() => {});

    // Fetch purchases count
    fetch('/api/operation/purchases', { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && Array.isArray(data)) {
          setDashData(prev => ({ ...prev, totalPurchases: data.length }));
        }
      }).catch(() => {});

    // Fetch patients count
    fetch('/api/operation/patients', { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && Array.isArray(data)) {
          setDashData(prev => ({ ...prev, todaysPatients: data.length }));
        }
      }).catch(() => {});
  }, [currentView, refreshKey, selectedDate]);

  const stats = [
    {
      title: 'Total Medicines',
      amount: dashData.totalMedicines.toLocaleString(),
      subtext: 'In Stock',
      footerText: 'View Inventory',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      title: 'Today\'s Sales',
      amount: `$${Number(dashData.todaySales).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      subtext: `${dashData.invoiceCount} Invoices`,
      footerText: '',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: 'Low Stock Alerts',
      amount: dashData.lowStockAlerts.toString(),
      subtext: 'Items below threshold',
      footerText: 'Order pending',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    {
      title: 'Expiring Soon',
      amount: dashData.expiringSoon.toString(),
      subtext: 'Items expiring < 30 days',
      footerText: 'Review Items',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      title: 'Total Purchases',
      amount: dashData.totalPurchases.toString(),
      subtext: 'Stock In Records',
      footerText: '',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      iconPath: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z',
    },
    {
      title: 'Total Patients',
      amount: dashData.todaysPatients.toLocaleString(),
      subtext: 'Registered',
      footerText: '',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative">
      {currentView !== 'New Sale' && (
        <>
          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
          )}
          <Sidebar
            currentView={currentView}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            onMenuSelect={(view) => {
              setEditingCategory(null);
              setEditingUnit(null);
              setEditingProduct(null);
              setEditingSupplier(null);
              setEditingPatient(null);
              setEditingPurchase(null);
              setEditingStaff(null);
              setCurrentView(view);
              setIsMobileMenuOpen(false); // Close mobile menu when navigating
            }}
            permissions={permissions}
          />
        </>
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        <Header
          username={username}
          onLogout={onLogout}
          onPOSClick={() => setCurrentView('New Sale')}
          showBrand={currentView === 'New Sale'}
          onBrandClick={() => setCurrentView('Dashboard')}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Main Scrollable Area */}
        <main key={refreshKey} className={`flex-1 overflow-y-auto ${currentView === 'New Sale' ? '' : 'p-4 md:p-6'} bg-slate-50`}>

          {currentView === 'Dashboard' ? (
            <>
              {/* Breadcrumb Area */}
              <div className="mb-4 text-sm text-gray-500">
                <span>Dashboard</span>
              </div>

              {/* Daily Summary Box */}
              <div className="bg-white rounded shadow-sm border border-gray-200">
                {/* Box Header */}
                <div className="flex justify-between items-center border-b border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                    <span className="font-semibold text-sm">Daily Summary</span>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1 text-sm text-gray-600 bg-white hover:border-emerald-500 transition-colors">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="outline-none bg-transparent cursor-pointer font-medium"
                    />
                  </div>
                </div>

                {/* Box Content - 6 Cards Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border-0 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden group hover:shadow-md transition-all duration-300 ring-1 ring-slate-100">
                        <div className="p-5 md:p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-slate-500 text-sm font-medium mb-1">{stat.title}</p>
                              <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stat.amount}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                              <svg className={`w-6 h-6 ${stat.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.iconPath} />
                              </svg>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-slate-50">
                            <span className="text-slate-400 font-medium">{stat.subtext}</span>
                            {stat.footerText && (
                              <button className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                {stat.footerText}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : currentView === 'List Categories' ? (
            <CategoryList
              onAddClick={() => setCurrentView('Add Category')}
              onEditClick={(cat) => {
                setEditingCategory(cat);
                setCurrentView('Edit Category');
              }}
            />
          ) : currentView === 'Add Category' ? (
            <AddCategory
              onSaveSuccess={() => setCurrentView('List Categories')}
              onCancel={() => setCurrentView('List Categories')}
            />
          ) : currentView === 'Edit Category' && editingCategory ? (
            <EditCategory
              category={editingCategory}
              onSaveSuccess={() => setCurrentView('List Categories')}
              onCancel={() => setCurrentView('List Categories')}
            />
          ) : currentView === 'List Units' ? (
            <UnitList
              onAddClick={() => setCurrentView('Add Unit')}
              onEditClick={(u) => {
                setEditingUnit(u);
                setCurrentView('Edit Unit');
              }}
            />
          ) : currentView === 'Add Unit' ? (
            <AddUnit
              onSaveSuccess={() => setCurrentView('List Units')}
              onCancel={() => setCurrentView('List Units')}
            />
          ) : currentView === 'Edit Unit' ? (
            <EditUnit
              unit={editingUnit}
              onBack={() => setCurrentView('List Units')}
              onSave={() => setCurrentView('List Units')}
            />
          ) : currentView === 'List Medicines' ? (
            <ProductList
              onAddClick={() => setCurrentView('Add Medicine')}
              onEditClick={(product) => {
                setEditingProduct(product);
                setCurrentView('Edit Medicine');
              }}
            />
          ) : currentView === 'Add Medicine' ? (
            <AddProduct
              onBack={() => setCurrentView('List Medicines')}
              onSave={() => setCurrentView('List Medicines')}
            />
          ) : currentView === 'Edit Medicine' ? (
            <EditProduct
              product={editingProduct}
              onBack={() => setCurrentView('List Medicines')}
              onSave={() => setCurrentView('List Medicines')}
            />
          ) : currentView === 'List Suppliers' ? (
            <SupplierList
              onAddClick={() => setCurrentView('Add Supplier')}
              onEditClick={(s) => {
                setEditingSupplier(s);
                setCurrentView('Edit Supplier');
              }}
            />
          ) : currentView === 'Add Supplier' ? (
            <AddSupplier
              onBack={() => setCurrentView('List Suppliers')}
              onSave={() => setCurrentView('List Suppliers')}
            />
          ) : currentView === 'Edit Supplier' ? (
            <EditSupplier
              supplier={editingSupplier}
              onBack={() => setCurrentView('List Suppliers')}
              onSave={() => setCurrentView('List Suppliers')}
            />
          ) : currentView === 'List Patients' ? (
            <PatientList
              onAddClick={() => setCurrentView('Add Patient')}
              onEditClick={(patient) => {
                setEditingPatient(patient);
                setCurrentView('Edit Patient');
              }}
            />
          ) : currentView === 'Add Patient' ? (
            <AddPatient
              onBack={() => setCurrentView('List Patients')}
              onSave={() => setCurrentView('List Patients')}
            />
          ) : currentView === 'Edit Patient' && editingPatient ? (
            <EditPatient
              customer={editingPatient}
              onBack={() => setCurrentView('List Patients')}
              onSave={() => setCurrentView('List Patients')}
            />
          ) : currentView === 'List Purchases' ? (
            <PurchaseList
              onAddClick={() => setCurrentView('Add Purchase')}
              onEditClick={(purchase) => {
                setEditingPurchase(purchase);
                setCurrentView('Edit Purchase');
              }}
            />
          ) : currentView === 'Add Purchase' ? (
            <AddPurchase
              onBack={() => setCurrentView('List Purchases')}
              onSave={() => setCurrentView('List Purchases')}
            />
          ) : currentView === 'Edit Purchase' && editingPurchase ? (
            <EditPurchase
              purchase={editingPurchase}
              onBack={() => setCurrentView('List Purchases')}
              onSave={() => setCurrentView('List Purchases')}
            />
          ) : (currentView === 'List Staff' || currentView === 'Staff') ? (
            <StaffList
              onAddClick={() => setCurrentView('Add Staff')}
              onEditClick={(staff) => {
                setEditingStaff(staff);
                setCurrentView('Edit Staff');
              }}
            />
          ) : currentView === 'Add Staff' ? (
            <AddStaff
              onBack={() => setCurrentView('List Staff')}
              onSave={() => setCurrentView('List Staff')}
            />
          ) : currentView === 'Edit Staff' && editingStaff ? (
            <EditStaff
              staff={editingStaff}
              onBack={() => setCurrentView('List Staff')}
              onSave={() => setCurrentView('List Staff')}
            />
          ) : (currentView === 'Sales List' || currentView === 'Dispensing (POS)') ? (
            <SalesList onNewSaleClick={() => setCurrentView('New Sale')} />
          ) : (currentView === 'New Sale' || currentView === 'POS Cashier') ? (
            <Dispensing onSaleComplete={() => setCurrentView('Sales List')} />
          ) : currentView === 'Payment Methods' ? (
            <PaymentMethodsSetting />
          ) : currentView === 'Currency' ? (
            <CurrencySetting />
          ) : currentView === 'Warehouses' ? (
            <WarehouseSetting />
          ) : currentView === 'Group Permissions' ? (
            <GroupPermissionsSetting />
          ) : (currentView === 'Settings' || currentView === 'System Settings' || currentView === 'Pharmacy POS') ? (
            <SystemSettings />
          ) : currentView === 'Products Report' ? (
            <ProductsReport />
          ) : currentView === 'Categories Report' ? (
            <CategoriesReport />
          ) : currentView === 'Purchases Item Report' ? (
            <PurchaseItemsReport />
          ) : currentView === 'Profit and Loss Report' ? (
            <ProfitLossReport />
          ) : currentView === 'Product Expiry Alerts' ? (
            <ProductExpiryAlerts />
          ) : ['Reports', 'Purchases Report'].includes(currentView) ? (
            <ReportsDashboard permissions={permissions} currentView={currentView} />
          ) : currentView === 'Product Quantity Alerts' ? (
            <ProductQuantityAlerts />
          ) : currentView === 'Expense Categories' ? (
            <ExpenseCategoryList />
          ) : currentView === 'List Expenses' ? (
            <ExpenseList onAdd={() => setCurrentView('Add Expense')} />
          ) : currentView === 'Add Expense' ? (
            <AddExpense onBack={() => setCurrentView('List Expenses')} onSave={() => setCurrentView('List Expenses')} />
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200 mt-4 animate-in fade-in zoom-in duration-300">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-xl font-bold text-slate-700 mb-2">{currentView}</h2>
              <p className="text-slate-500 max-w-md mx-auto">This page is currently under construction. Please check back later when it's ready.</p>
              <button
                onClick={() => setCurrentView('Dashboard')}
                className="mt-6 text-emerald-600 font-medium hover:text-emerald-700 hover:underline"
              >
                Return to Dashboard
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
