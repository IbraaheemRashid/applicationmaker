import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className = '', ...props }: TextAreaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-neutral-850 transition-colors resize-y ${
          error ? 'border-red-500/50' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
