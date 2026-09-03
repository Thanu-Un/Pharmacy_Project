import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const navItems = [
  { name: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', active: false, permission: 'dashboard_view' },
  {
    name: 'Categories',
    icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    permission: 'category_view',
    subItems: [
      { name: 'List Categories', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', permission: 'category_view' },
      { name: 'Add Category', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'category_add' }
    ]
  },
  {
    name: 'Unit',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    permission: 'unit_view',
    subItems: [
      { name: 'List Units', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', permission: 'unit_view' },
      { name: 'Add Unit', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'unit_add' }
    ]
  },
  {
    name: 'Medicines',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    permission: 'medicine_view',
    subItems: [
      { name: 'List Medicines', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', permission: 'medicine_view' },
      { name: 'Add Medicine', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'medicine_add' },
      { name: 'Import Medicines', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permission: 'medicine_import' },
      { name: 'Print Barcode/Label', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', permission: 'medicine_barcode' }
    ]
  },
  {
    name: 'Stock In',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    permission: 'purchase_view',
    subItems: [
      { name: 'List Purchases', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', permission: 'purchase_view' },
      { name: 'Add Purchase', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'purchase_add' }
    ]
  },
  {
    name: 'Dispensing (POS)',
    icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
    permission: 'pos_access',
    subItems: [
      { name: 'Sales List', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', permission: 'pos_sales_view' },
      { name: 'New Sale', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'pos_access' },
      { name: 'POS Cashier', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', permission: 'pos_access' },
    ]
  },
  {
    name: 'Suppliers',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7',
    permission: 'supplier_view',
    subItems: [
      { name: 'List Suppliers', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', permission: 'supplier_view' },
      { name: 'Add Supplier', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'supplier_add' }
    ]
  },
  {
    name: 'Patients',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    permission: 'patient_view',
    subItems: [
      { name: 'List Patients', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', permission: 'patient_view' },
      { name: 'Add Patient', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'patient_add' }
    ]
  },
  {
    name: 'Staff',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    permission: 'staff_view',
    subItems: [
      { name: 'List Staff', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', permission: 'staff_view' },
      { name: 'Add Staff', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'staff_register' }
    ]
  },
  {
    name: 'Expenses',
    icon: 'M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z M2 17l10 5 10-5M2 12l10 5 10-5M2 7l10 5 10-5',
    permission: 'expense_view',
    subItems: [
      { name: 'Expense Categories', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', permission: 'expense_view' },
      { name: 'List Expenses', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', permission: 'expense_view' },
      { name: 'Add Expense', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'expense_add' }
    ]
  },
  {
    name: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    subItems: [
      { name: 'System Settings', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', permission: 'setting_permissions' },
      { name: 'Payment Methods', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', permission: 'setting_payment' },
      { name: 'Currency', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'setting_currency' },
      { name: 'Warehouses', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', permission: 'setting_permissions' },
      { name: 'Group Permissions', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', permission: 'setting_permissions' }
    ]
  },
  {
    name: 'Reports',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    permission: 'report_view',
    subItems: [
      { name: 'Product Quantity Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', permission: 'report_view' },
      { name: 'Product Expiry Alerts', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', permission: 'report_view' },
      { name: 'Products Report', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permission: 'report_view' },
      { name: 'Categories Report', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', permission: 'report_view' },
      { name: 'Purchases Report', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', permission: 'report_view' },
      { name: 'Purchases Item Report', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', permission: 'report_view' },
      { name: 'Profit and Loss Report', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', permission: 'report_view' }
    ]
  },
];

export default function Sidebar({ currentView, onMenuSelect, permissions = [], isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { t } = useTranslation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const parseJwt = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
  };

  const hasPermission = (perm) => {
    // If no permission defined, allow it
    if (!perm) return true;
    
    // Check if user is OWNER via JWT
    const token = localStorage.getItem('token');
    let isOwner = false;
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        const role = decoded.role?.toUpperCase();
        const username = decoded.sub?.toLowerCase();
        if (role === 'OWNER' || username === 'owner') {
          isOwner = true;
        }
      }
    }

    // Owner sees everything
    if (isOwner) return true;

    // Special case: Only Owner can see Warehouses and Group Permissions
    if (perm === 'setting_permissions') {
      return false; // Already returned true above if Owner
    }

    // Fallback to checking the permissions array
    if (permissions.length === 0) return true;
    return permissions.includes(perm);
  };

  const toggleMenu = (name) => {
    setExpandedMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className={`
      w-64 bg-white min-h-screen text-slate-600 flex flex-col shrink-0 overflow-y-auto border-r border-slate-200
      fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0
    `}>
      {/* Brand Header (click to go to Dashboard & refresh) */}
      <div className="flex items-center justify-between px-4 h-14 bg-white border-b border-slate-100 shrink-0">
        <div
          onClick={() => {
            if (onMenuSelect) onMenuSelect('Dashboard');
            try { window.dispatchEvent(new Event('refreshDashboard')); } catch (e) { /* ignore */ }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (onMenuSelect) onMenuSelect('Dashboard'); try { window.dispatchEvent(new Event('refreshDashboard')); } catch (e) { } } }}
          className="flex items-center gap-2 cursor-pointer text-slate-800 font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <svg className="w-8 h-8 text-indigo-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
          </svg>
          <span className="whitespace-nowrap overflow-hidden text-ellipsis text-[14px] tracking-wide uppercase">NUTHEB PHARMACY</span>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
          className="md:hidden text-slate-400 hover:text-slate-600 p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {currentView === 'New Sale' ? null : (
          navItems.map((item) => {
            if (item.permission && !hasPermission(item.permission)) return null;
            
            // Filter subItems based on permissions
            const visibleSubItems = item.subItems ? item.subItems.filter(sub => hasPermission(sub.permission)) : null;
            if (item.subItems && visibleSubItems.length === 0) return null;

            return (
            <div key={item.name} className="flex flex-col">
              <div
                onClick={() => visibleSubItems ? toggleMenu(item.name) : (onMenuSelect ? onMenuSelect(item.name) : null)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 group ${(!item.subItems && currentView === item.name) || (item.active && !item.subItems)
                  ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-semibold'
                  : item.subItems && expandedMenus[item.name]
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 font-semibold'
                    : 'hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent font-medium'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <svg className={`w-5 h-5 transition-colors duration-200 ${(!item.subItems && currentView === item.name) || item.active || (item.subItems && expandedMenus[item.name]) ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                  </svg>
                  <span className={`text-sm transition-colors duration-200 ${(!item.subItems && currentView === item.name) || item.active || (item.subItems && expandedMenus[item.name]) ? 'text-indigo-700' : 'text-slate-600 group-hover:text-slate-900'}`}>{t(`sidebar.${item.name.toLowerCase()}`)}</span>
                </div>
                {visibleSubItems ? (
                  <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedMenus[item.name] ? 'rotate-180 text-indigo-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                ) : null}
              </div>

              {/* Sub Items Rendering */}
              {visibleSubItems && expandedMenus[item.name] && (
                <div className="flex flex-col mt-1 ml-4 border-l border-slate-200 pl-2 space-y-1">
                  {visibleSubItems.map(subItem => {
                    const isActive = currentView === subItem.name || subItem.active;
                    return (
                      <div
                        key={subItem.name}
                        onClick={() => {
                          if (onMenuSelect) onMenuSelect(subItem.name);
                        }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors duration-150 group ${isActive
                          ? 'bg-indigo-50/50 text-indigo-700 font-semibold'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
                          }`}
                      >
                        <svg className={`w-4 h-4 transition-colors duration-150 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={subItem.icon}></path>
                        </svg>
                        <span className="text-sm">{t(`sidebar.${subItem.name.toLowerCase()}`)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            );
          })
        )}
      </nav>
    </div>
  );
}
