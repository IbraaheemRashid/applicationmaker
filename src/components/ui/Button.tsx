import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary:
    'bg-neutral-100 text-neutral-950 hover:bg-white active:bg-neutral-200 font-medium',
  secondary:
    'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-neutral-700',
  ghost:
    'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800',
  danger:
    'bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30',
};

const sizes = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
