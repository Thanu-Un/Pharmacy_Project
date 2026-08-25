import { useState } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ForgotPassword from './components/auth/ForgotPassword';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [permissions, setPermissions] = useState(() => {
    const savedPerms = localStorage.getItem('permissions');
    return savedPerms ? JSON.parse(savedPerms) : [];
  });
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('token') ? 'dashboard' : 'login');

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
    <div className={currentTab === 'dashboard' ? 'w-full h-screen' : 'min-h-screen w-full bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center overflow-y-auto p-4 sm:p-6 lg:p-8 relative'}>
      {currentTab === 'dashboard' ? (
        <main className="w-full h-full">
          <Dashboard username={username} token={token} permissions={permissions} onLogout={handleLogout} />
        </main>
      ) : (
        <div className="w-full flex flex-col items-center justify-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}>
          </div>

          {/* Main Centered Content Wrapper (Unified Card) */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row w-full max-w-3xl relative z-10 my-auto">

            {/* Left Pane: Forms (Clean White) */}
            <div className="w-full md:w-3/5 p-8 sm:p-10 flex flex-col justify-center bg-white">
              {/* THANUTHEB PHARMACY Title at the top of the form */}
              <div className="flex items-center gap-3 justify-center mb-6 border-b border-slate-100 pb-4">
                <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 10h-5V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5H5a1 1 0 00-1 1v2a1 1 0 001 1h5v5a1 1 0 001 1h2a1 1 0 001-1v-5h5a1 1 0 001-1v-2a1 1 0 00-1-1z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-extrabold text-base tracking-wider text-slate-800 uppercase leading-none">THANUTHEB PHARMACY</h2>
                  <p className="text-slate-400 text-[9px] mt-1 font-medium">POS & Management System</p>
                </div>
              </div>

              {/* Dynamic Form */}
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
            </div>

            {/* Right Pane: Illustration (Soft Teal/Cyan Background matching the main page background) */}
            <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-cyan-400 via-teal-500 flex-col items-center justify-center border-l">
              <div className="w-full text-center flex flex-col items-center">
                <img
                  src="/src/assets/pharmacy_illustration.png"
                  alt="Pharmacy Illustration"
                  className="w-full h-auto object-contain rounded-xl shadow-md border border-white/20 transform hover:scale-[1.01] transition-transform duration-300 mb-4 mix-blend-multiply"
                />
              </div>
            </div>

          </div>

          {/* Absolute Footer */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-teal-100/70 text-[9px] pointer-events-none">
            &copy; {new Date().getFullYear()} THANUTHEB PHARMACY. All rights reserved. | v1.2.0
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
