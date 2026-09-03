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
    <div className="h-14 bg-white/90 backdrop-blur-md flex items-center justify-between px-3 md:px-6 text-slate-800 shrink-0 border-b border-slate-100 relative z-40 gap-3 md:gap-6">
      
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

      <div className="flex-1 hidden sm:block">
        {/* Search bar removed as requested */}
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-2 md:gap-5 ml-auto">

        {/* Language Switcher */}
        {/* Custom Language Switcher (Fix for Windows Emojis) */}
        <div className="relative" ref={langDropdownRef}>
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 focus:border-indigo-500 px-2.5 py-1.5 transition-colors cursor-pointer outline-none shadow-sm"
          >
            <img src={currentLangObj.flag} alt={currentLangObj.name} className="w-5 rounded-[2px]" />
            <span className="hidden sm:inline">{currentLangObj.name}</span>
            <svg className={`w-4 h-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          
          {isLangOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${i18n.language === lang.code ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'}`}
                >
                  <img src={lang.flag} alt={lang.name} className="w-5 rounded-[2px]" />
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dispensing Button */}
        <button 
          onClick={onPOSClick}
          className="flex items-center gap-1 md:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors shadow-sm shadow-indigo-600/20"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11h-4V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v4H5a2 2 0 00-2 2v2a2 2 0 002 2h4v4a2 2 0 002 2h2a2 2 0 002-2v-4h4a2 2 0 002-2v-2a2 2 0 00-2-2z" /></svg>
          <span className="hidden sm:inline">{t('header.dispensing')}</span>
          <span className="sm:hidden">POS</span>
        </button>

        {/* Status Indicators (hidden on mobile) */}
        <div className="hidden lg:flex items-center bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
          <button className="p-2 hover:bg-slate-50 border-r border-slate-200 transition-colors relative">
            <svg className="w-4 h-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          <button className="p-2 hover:bg-slate-50 border-r border-slate-200 transition-colors relative">
            <svg className="w-4 h-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </button>
          <button className="p-2 hover:bg-slate-50 border-r border-slate-200 transition-colors relative">
            <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border border-white"></span>
            <svg className="w-4 h-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          <button className="p-2 hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
          </button>
        </div>

        {/* Warning Indicator */}
        <button className="hidden sm:block bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 p-1.5 rounded-md relative transition-colors shadow-sm">
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm border border-white">9</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-slate-200">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm">
            <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
          </div>
          <div className="text-sm hidden md:block">
            <p className="text-slate-500 text-[11px] font-medium leading-tight">{t('header.welcome_back')}</p>
            <p className="font-bold text-slate-800 leading-tight">{username || 'Admin'}</p>
          </div>
          <button onClick={onLogout} className="ml-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Logout">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
