import React from 'react';

export default function Card({
  title,
  subtitle,
  action,
  children,
  footer,
  className = '',
  contentClassName = '',
  headerClassName = '',
  hover = false,
}) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl ${
        hover ? 'hover:border-slate-300 hover:shadow-card-hover' : ''
      } shadow-card transition-all duration-150 overflow-hidden ${className}`}
    >
      {(title || subtitle || action) && (
        <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4 ${headerClassName}`}>
          <div>
            {title && (
              <h3 className="font-semibold text-slate-900 text-sm md:text-base tracking-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`p-5 ${contentClassName}`}>{children}</div>

      {footer && (
        <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}
