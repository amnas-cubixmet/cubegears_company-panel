import React from 'react';

const variants = {
  primary: 'border border-primary bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-line bg-surface text-content hover:bg-surface-2',
  ghost: 'border border-transparent bg-transparent text-secondary hover:bg-surface-2 hover:text-content',
  danger: 'border border-danger bg-danger text-white hover:opacity-90',
};
const sizes = { sm: 'min-h-9 px-3 text-xs', md: 'min-h-11 px-4 text-[13px]', lg: 'min-h-12 px-5 text-sm' };

export const Button = ({ children, variant = 'primary', size = 'md', loading = false, block = false, className = '', type = 'button', disabled, ...props }) => (
  <button type={type} className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${block ? 'w-full' : ''} ${className}`.trim()} disabled={disabled || loading} {...props}>
    {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
    {children}
  </button>
);
