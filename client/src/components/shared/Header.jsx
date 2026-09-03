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
    <div className="h-11 bg-white/90 backdrop-blur-md flex items-center justify-between px-3 md:px-5 text-slate-800 shrink-0 border-b border-slate-100 relative z-40 gap-2 md:gap-4">
      
      {/* Mobile Hamburger Menu Button */}
      {!showBrand && (
        <button 
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      )}
      {showBrand && (
        <div 
          onClick={onBrandClick}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </div>
          <span className="font-bold text-slate-800 tracking-wider whitespace-nowrap hidden sm:block">NUTHEB PHARMACY</span>
        </div>
        
      )}

      <div className="flex-1"></div>

      {/* Right side icons */}
      <div className="flex items-center gap-2 md:gap-5 ml-auto">

        {/* Language Switcher */}
        <div className="relative" ref={langDropdownRef}>
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 bg-white border border-transparent text-slate-600 text-sm font-medium rounded-full hover:bg-slate-50 hover:border-slate-200 focus:border-indigo-500 px-3 py-1.5 transition-colors cursor-pointer outline-none"
          >
            <img src={currentLangObj.flag} alt={currentLangObj.name} className="w-5 rounded-[2px]" />
            <span className="hidden sm:inline">{currentLangObj.name}</span>
            <svg className={`w-4 h-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${i18n.language === lang.code ? 'bg-indigo-50/50 text-indigo-700 font-semibold' : 'text-slate-600'}`}
                >
                  <img src={lang.flag} alt={lang.name} className="w-5 rounded-[2px]" />
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Indicators (hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors relative">
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </button>
        </div>

        {/* User Profile - Pill Style */}
        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200">
          <div className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 pr-4 p-1 rounded-full cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
              {username ? username.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-semibold text-slate-800 text-sm leading-tight">{username || 'Admin User'}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>
          
          <button onClick={onLogout} className="text-slate-400 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50 transition-colors" title="Logout">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
