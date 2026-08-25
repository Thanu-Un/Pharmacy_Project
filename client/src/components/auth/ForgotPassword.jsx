import React, { useState } from 'react';

export default function ForgotPassword({ onSwitchTab }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setIsLoading(true);

    try {
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus({ type: 'success', message: 'If that email is in our system, we have sent a verification link.' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Reset Password</h3>
        <p className="text-slate-400 text-xs">Enter your email to verify your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-400"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {status && (
          <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${status.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-rose-50 border border-rose-100 text-rose-600'}`}>
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{status.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || status?.type === 'success'}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2"
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Send Verification Email'
          )}
        </button>

        <div className="text-center mt-4">
          <p className="text-slate-500 text-xs">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => onSwitchTab('login')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
