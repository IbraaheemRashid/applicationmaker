import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-neutral-850 transition-colors ${
          error ? 'border-red-500/50' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
