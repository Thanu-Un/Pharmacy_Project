import React from 'react';

const VARIANTS = {
  primary: 'bg-obsidian-900 text-white hover:bg-obsidian-800 active:bg-obsidian-950 border border-obsidian-900 shadow-sm shadow-obsidian-900/10 focus-visible:ring-obsidian-900/20',
  brand: 'bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700 border border-brand-700/80 shadow-sm shadow-brand-600/20 focus-visible:ring-brand-500/25',
  secondary: 'bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 border border-slate-200/90 shadow-sm focus-visible:ring-slate-300',
  outline: 'bg-transparent text-slate-700 hover:bg-slate-100/70 active:bg-slate-200/60 border border-slate-300 focus-visible:ring-slate-300',
  danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200/70 border border-rose-200/80 shadow-sm focus-visible:ring-rose-500/20',
  dangerSolid: 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 border border-rose-700 shadow-sm shadow-rose-600/20 focus-visible:ring-rose-500/25',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70 border border-transparent focus-visible:ring-slate-300',
};

const SIZES = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-3.5 py-2 gap-2 rounded-lg',
  lg: 'text-base px-5 py-2.5 gap-2.5 rounded-xl font-semibold',
  icon: 'p-2 rounded-lg',
};

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon = null,
  iconRight: IconRight = null,
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.985] ${VARIANTS[variant] || VARIANTS.secondary} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-0.5 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <span className="shrink-0">{typeof Icon === 'function' ? <Icon className="w-4 h-4" /> : Icon}</span>
      ) : null}
      
      {children}

      {IconRight && !loading && (
        <span className="shrink-0">{typeof IconRight === 'function' ? <IconRight className="w-4 h-4" /> : IconRight}</span>
      )}
    </button>
  );
}
