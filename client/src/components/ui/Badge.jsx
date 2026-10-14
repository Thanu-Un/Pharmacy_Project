import React from 'react';

const VARIANTS = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-200/50',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 border-amber-200/50',
  danger: 'bg-rose-50 text-rose-700 ring-rose-600/20 border-rose-200/50',
  brand: 'bg-brand-50 text-brand-700 ring-brand-600/20 border-brand-200/50',
  neutral: 'bg-slate-50 text-slate-600 ring-slate-500/20 border-slate-200/50',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 border-indigo-200/50',
};

const DOT_COLORS = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  brand: 'bg-brand-500',
  neutral: 'bg-slate-400',
  indigo: 'bg-indigo-500',
};

export default function Badge({
  children,
  variant = 'neutral',
  dot = false,
  size = 'md',
  className = ''
}) {
  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-1.5 py-0.5' 
    : 'text-xs px-2.5 py-0.5';

  const dotSize = size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ring-1 ring-inset border ${VARIANTS[variant] || VARIANTS.neutral} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span className={`rounded-full shrink-0 ${DOT_COLORS[variant] || DOT_COLORS.neutral} ${dotSize}`} />
      )}
      {children}
    </span>
  );
}
