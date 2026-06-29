import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-black">{label}</label>
      )}
      <input
        className={`w-full px-3 py-2 border rounded-md text-sm text-black bg-white
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
          disabled:opacity-50 disabled:bg-gray-50
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
