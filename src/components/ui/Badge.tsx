interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  className?: string;
}

const variants = {
  default: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
  success: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  danger: 'bg-red-500/10 text-red-300 border border-red-500/30',
  info: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
  accent: 'bg-accent-500/10 text-accent-400 border border-accent-500/30',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
