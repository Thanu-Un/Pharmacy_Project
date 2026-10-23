import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Header({ username, onLogout, onPOSClick, showBrand, onBrandClick, onMobileMenuToggle }) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const [warehouses, setWarehouses] = useState([]);
  const [activeWarehouseId, setActiveWarehouseId] = useState(() => {
    return localStorage.getItem('activeWarehouseId') ? Number(localStorage.getItem('activeWarehouseId')) : null;
  });
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);
  const warehouseDropdownRef = useRef(null);

  const parseJwt = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
  };

  const token = localStorage.getItem('token');
  const userPayload = token ? parseJwt(token) : null;
  const userRole = userPayload?.role?.toUpperCase();
  const userName = userPayload?.sub?.toLowerCase();
  const isOwner = userRole === 'OWNER' || userName === 'owner';
  const isAdmin = userRole === 'ADMIN' || userName === 'admin' || isOwner;
  const assignedWarehouseId = userPayload?.warehouseId ? Number(userPayload.warehouseId) : null;

  const [isDark, setIsDark] = useState(() => {
    try {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    } catch (_) {
      return false;
    }
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      try { window.dispatchEvent(new Event('themechange')); } catch (_) {}
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      try { window.dispatchEvent(new Event('themechange')); } catch (_) {}
    }
  };

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await fetch('/api/operation/warehouses', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWarehouses(data);
          
          if (!isAdmin && assignedWarehouseId) {
            // Staff / Cashier is strictly locked to their assigned warehouse
            setActiveWarehouseId(assignedWarehouseId);
            localStorage.setItem('activeWarehouseId', String(assignedWarehouseId));
            const found = data.find(w => w.id === assignedWarehouseId);
            if (found) localStorage.setItem('activeWarehouseName', found.name);
          } else if (data.length > 0) {
            // Admin / Owner
            const saved = localStorage.getItem('activeWarehouseId');
            const valid = saved ? data.find(w => w.id === Number(saved)) : null;
            const chosen = valid ? valid.id : data[0].id;
            setActiveWarehouseId(chosen);
            localStorage.setItem('activeWarehouseId', String(chosen));
            const found = data.find(w => w.id === chosen);
            if (found) localStorage.setItem('activeWarehouseName', found.name);
          }
        }
      } catch (e) {
        console.error('Failed to fetch warehouses in header', e);
      }
    };
    fetchWarehouses();
    const handleWarehousesUpdated = () => fetchWarehouses();
    window.addEventListener('warehousesUpdated', handleWarehousesUpdated);
    return () => {
      window.removeEventListener('warehousesUpdated', handleWarehousesUpdated);
    };
  }, [isAdmin, assignedWarehouseId]);

  const handleSelectWarehouse = (wh) => {
    setActiveWarehouseId(wh.id);
    localStorage.setItem('activeWarehouseId', String(wh.id));
    localStorage.setItem('activeWarehouseName', wh.name);
    setIsWarehouseOpen(false);
    window.dispatchEvent(new CustomEvent('warehousechange', { detail: wh }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
      if (warehouseDropdownRef.current && !warehouseDropdownRef.current.contains(event.target)) {
        setIsWarehouseOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w20/gb.png' },
    { code: 'km', name: 'ខ្មែរ', flag: 'https://flagcdn.com/w20/kh.png' }
  ];

  const currentLangObj = languages.find(l => l.code === i18n.language) || languages[0];
  return (
    <header className="h-12 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-between px-3 md:px-5 text-slate-800 dark:text-slate-100 shrink-0 border-b border-slate-200/80 dark:border-slate-800 relative z-40 gap-3">
      
      {/* Left: Mobile Toggle & Brand or Breadcrumb Context */}
      <div className="flex items-center gap-3">
        {!showBrand && (
          <button 
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}

        {showBrand ? (
          <div 
            onClick={onBrandClick}
            className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-obsidian-900 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-xs uppercase leading-none hidden sm:block">Nutheb Pharmacy</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-500 dark:text-slate-400">{t('header.workspace') || 'Workspace'}</span>
            <span>/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{t('header.pharmacy_system') || 'Pharmacy System'}</span>
          </div>
        )}
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">

        {/* Warehouse Selector (Admin) or Assigned Warehouse Indicator (Staff) */}
        {warehouses.length > 0 && (
          isAdmin ? (
            <div className="relative" ref={warehouseDropdownRef}>
              <button
                onClick={() => setIsWarehouseOpen(!isWarehouseOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
                title={t('header.active_warehouse') || 'Active Warehouse'}
              >
                <svg className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-semibold text-slate-800 dark:text-slate-100 max-w-[80px] sm:max-w-[120px] truncate">
                  {warehouses.find(w => w.id === activeWarehouseId)?.name || t('header.warehouse') || 'Warehouse'}
                </span>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isWarehouseOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isWarehouseOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700/60">
                    {t('header.switch_warehouse') || 'Switch Warehouse'}
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {warehouses.map(w => {
                      const isSelected = w.id === activeWarehouseId;
                      return (
                        <button
                          key={w.id}
                          onClick={() => handleSelectWarehouse(w)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                            <span className="truncate">{w.name}</span>
                          </div>
                          {w.code && <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">[{w.code}]</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-50/80 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 text-xs font-medium rounded-lg border border-brand-200/60 dark:border-brand-800/40 shadow-sm"
              title={t('header.assigned_warehouse') || 'Assigned Warehouse'}
            >
              <svg className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-semibold max-w-[80px] sm:max-w-[120px] truncate">
                {warehouses.find(w => w.id === activeWarehouseId)?.name || t('header.warehouse') || 'Warehouse'}
              </span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-brand-200/50 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-mono">
                🔒
              </span>
            </div>
          )
        )}

        {/* POS Cashier Button (Moved to Right Side) */}
        {onPOSClick && (
          <button
            onClick={onPOSClick}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-obsidian-900 hover:bg-obsidian-800 active:bg-obsidian-950 text-white rounded-lg text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="hidden sm:inline">{t('header.pos_cashier') || 'POS Cashier'}</span>
            <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.2 bg-white/20 text-white text-[10px] font-mono rounded">
              POS
            </kbd>
          </button>
        )}

        {/* Night / Light Mode Toggle Button (Near Language Button) */}
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={isDark ? "Switch to light mode" : "Switch to night mode"}
          title={isDark ? (t('header.light_mode') || 'Light Mode') : (t('header.night_mode') || 'Night Mode')}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-amber-400 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm"
        >
          {isDark ? (
            <svg className="w-4 h-4 text-amber-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-slate-600 hover:text-slate-900 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Language Switcher */}
        <div className="relative" ref={langDropdownRef}>
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-2.5 py-1.5 transition-colors cursor-pointer outline-none"
          >
            <img src={currentLangObj.flag} alt={currentLangObj.name} className="w-4 h-2.5 object-cover rounded-sm" />
            <span className="hidden sm:inline">{currentLangObj.name}</span>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isLangOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl shadow-dropdown z-50 overflow-hidden py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${i18n.language === lang.code ? 'bg-brand-50/70 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  <div className="flex items-center gap-2">
                    <img src={lang.flag} alt={lang.name} className="w-4 h-2.5 object-cover rounded-sm" />
                    <span>{lang.name}</span>
                  </div>
                  {i18n.language === lang.code && (
                    <svg className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200/70 dark:border-slate-700">
          <div className="flex items-center gap-2 p-1 pr-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/80 transition-colors">
            <div className="w-6 h-6 rounded-md bg-obsidian-900 dark:bg-brand-700 text-white font-mono text-[11px] font-semibold flex items-center justify-center shrink-0 uppercase">
              {username ? username.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <span className="hidden md:inline text-xs font-medium text-slate-800 dark:text-slate-200 capitalize max-w-[100px] truncate">
              {username || 'Staff'}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
