import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ForgotPassword from './components/auth/ForgotPassword';
import pharmacyIllustration from './assets/pharmacy_illustration.png';

function App() {
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [permissions, setPermissions] = useState(() => {
    const savedPerms = localStorage.getItem('permissions');
    return savedPerms ? JSON.parse(savedPerms) : [];
  });
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('token') ? 'dashboard' : 'login');

  // Night Mode state for auth pages
  const [isDark, setIsDark] = useState(() => {
    try {
      return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    } catch (_) {
      return false;
    }
  });

  // Language Dropdown state for auth pages
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

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangOpen(false);
  };

  const handleLoginSuccess = (jwt, user, userPermissions = []) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('username', user);
    localStorage.setItem('permissions', JSON.stringify(userPermissions));
    setToken(jwt);
    setUsername(user);
    setPermissions(userPermissions);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('permissions');
    setToken(null);
    setUsername('');
    setPermissions([]);
    setCurrentTab('login');
  };

  return (
    <div className={currentTab === 'dashboard' ? 'w-full h-screen' : 'min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-3 sm:p-4 lg:py-3 lg:px-6 relative selection:bg-brand-500 selection:text-white'}>
      {currentTab === 'dashboard' ? (
        <main className="w-full h-full">
          <Dashboard username={username} token={token} permissions={permissions} onLogout={handleLogout} />
        </main>
      ) : (
        <div className="w-full max-w-5xl mx-auto flex flex-col flex-1 justify-between relative z-10">
          {/* Subtle Ambient Grid Background */}
          <div 
            className="fixed inset-0 opacity-[0.035] pointer-events-none"
            style={{ 
              backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', 
              backgroundSize: '24px 24px' 
            }}
          />

          {/* Top Bar on Login Screen */}
          <div className="w-full flex items-center justify-end py-1 relative z-20">
            {/* Language & Night Mode Switcher */}
            <div className="flex items-center gap-2">
              {/* Night Mode Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Night Mode"}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-sm"
              >
                {isDark ? (
                  <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Language Selector */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <img src={currentLangObj.flag} alt={currentLangObj.name} className="w-4 h-2.5 object-cover rounded-sm" />
                  <span className="hidden sm:inline">{currentLangObj.name}</span>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isLangOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden py-1 z-30">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-800 transition-colors ${i18n.language === lang.code ? 'bg-brand-950/60 text-brand-400 font-semibold' : 'text-slate-300'}`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={lang.flag} alt={lang.name} className="w-4 h-2.5 object-cover rounded-sm" />
                          <span>{lang.name}</span>
                        </div>
                        {i18n.language === lang.code && (
                          <svg className="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Unified Modal/Card */}
          <div className="my-auto py-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row w-full max-w-4xl mx-auto">
              
              {/* Left Pane: Clean Clinical Form */}
              <div className="w-full md:w-7/12 p-5 sm:p-7 lg:p-8 flex flex-col justify-between bg-white dark:bg-slate-900">
                {/* Brand Identity Header */}
                <div className="flex items-center gap-2.5 pb-3.5 mb-3.5 sm:pb-4 sm:mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-obsidian-900 dark:bg-brand-600 flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-bold text-xs tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                      Nutheb Pharmacy
                    </h2>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                      {t('auth.clinical_suite') || 'Clinical Suite & Dispensary ERP'}
                    </p>
                  </div>
                </div>

                {/* Dynamic Forms (Login, Register, Forgot Password) */}
                <div className="w-full">
                  {currentTab === 'login' && (
                    <Login onLoginSuccess={handleLoginSuccess} onSwitchTab={setCurrentTab} />
                  )}
                  {currentTab === 'register' && (
                    <Register onSwitchTab={setCurrentTab} />
                  )}
                  {currentTab === 'forgot_password' && (
                    <ForgotPassword onSwitchTab={setCurrentTab} />
                  )}
                </div>

                {/* Form Bottom Footnote */}
                <div className="pt-3.5 mt-3.5 sm:pt-4 sm:mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{t('auth.terminal_workstation') || 'Terminal Workstation'}</span>
                  <span className="font-mono">v1.2.0 • ISO-27001</span>
                </div>
              </div>

              {/* Right Pane: Clinical Intelligence Showcase */}
              <div className="hidden md:flex md:w-5/12 bg-[#0b1329] border-l border-slate-800 p-5 sm:p-6 lg:p-7 flex-col justify-between relative overflow-hidden text-white">
                {/* Subtle Ambient Backlight Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 text-brand-300 text-[9px] font-mono uppercase tracking-wider border border-white/10">
                    <svg className="w-2.5 h-2.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>{t('auth.showcase_badge') || 'Pharmacological Intelligence'}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2 tracking-tight leading-snug">
                    {t('auth.showcase_title') || 'Unified Dispensary & Cashier Platform'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {t('auth.showcase_desc') || 'High-speed checkout, barcode scanning, and multi-tier pharmacy stock management.'}
                  </p>
                </div>

                {/* Center Image / Visual */}
                <div className="my-auto py-2 sm:py-3 flex items-center justify-center relative z-10">
                  <div className="relative p-1.5 rounded-xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-sm">
                    <img
                      src={pharmacyIllustration}
                      alt="Pharmacy Operations"
                      className="w-36 sm:w-44 h-auto object-contain rounded-lg drop-shadow-md"
                    />
                  </div>
                </div>

                {/* Operational Highlights */}
                <div className="space-y-1.5 pt-3 border-t border-white/10 relative z-10 text-[11px]">
                  <div className="flex items-center gap-2 text-slate-300">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('auth.feature_pos') || 'Instant POS Cashier & Receipt Generation'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('auth.feature_stock') || 'Real-time Multi-Warehouse Stock Sync'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('auth.feature_audit') || 'Cryptographic Audit Trail & RBAC Security'}</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Bottom Footer */}
          <div className="w-full text-center py-2 text-[11px] text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} {t('auth.all_rights_reserved') || 'Nutheb Pharmacy Clinical Suite. All rights reserved.'}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
