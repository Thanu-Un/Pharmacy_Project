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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
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
    <header className="h-12 bg-white/95 backdrop-blur-sm flex items-center justify-between px-3 md:px-5 text-slate-800 shrink-0 border-b border-slate-200/80 relative z-40 gap-3">
      
      {/* Left: Mobile Toggle & Brand or Breadcrumb Context */}
      <div className="flex items-center gap-3">
        {!showBrand && (
          <button 
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
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
            <span className="font-bold text-slate-900 tracking-tight text-xs uppercase leading-none hidden sm:block">Nutheb Pharmacy</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-500">Workspace</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">Pharmacy System</span>
          </div>
        )}
      </div>

      {/* Center / Quick Actions: Quick POS Button */}
      {onPOSClick && (
        <div className="flex items-center">
          <button
            onClick={onPOSClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-obsidian-900 hover:bg-obsidian-800 active:bg-obsidian-950 text-white rounded-lg text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>POS Cashier</span>
            <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.2 bg-white/20 text-white text-[10px] font-mono rounded">
              POS
            </kbd>
          </button>
        </div>
      )}

      {/* Right Side Tools */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        
        {/* Language Switcher */}
        <div className="relative" ref={langDropdownRef}>
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-100 hover:border-slate-300 px-2.5 py-1.5 transition-colors cursor-pointer outline-none"
          >
            <img src={currentLangObj.flag} alt={currentLangObj.name} className="w-4 h-2.5 object-cover rounded-sm" />
            <span className="hidden sm:inline">{currentLangObj.name}</span>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isLangOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200/90 rounded-xl shadow-dropdown z-50 overflow-hidden py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${i18n.language === lang.code ? 'bg-brand-50/70 text-brand-700 font-semibold' : 'text-slate-600'}`}
                >
                  <div className="flex items-center gap-2">
                    <img src={lang.flag} alt={lang.name} className="w-4 h-2.5 object-cover rounded-sm" />
                    <span>{lang.name}</span>
                  </div>
                  {i18n.language === lang.code && (
                    <svg className="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200/70">
          <div className="flex items-center gap-2 p-1 pr-2.5 rounded-lg bg-slate-50 border border-slate-200/60 hover:bg-slate-100/70 transition-colors">
            <div className="w-6 h-6 rounded-md bg-obsidian-900 text-white font-mono text-[11px] font-semibold flex items-center justify-center shrink-0 uppercase">
              {username ? username.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <span className="hidden md:inline text-xs font-medium text-slate-800 capitalize max-w-[100px] truncate">
              {username || 'Staff'}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
