import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

const badgeStyles = {
  default: 'bg-gray-100 text-gray-800 border border-gray-200',
  success: 'bg-gray-100 text-black border border-black',
  warning: 'bg-gray-50 text-gray-600 border border-gray-300',
  error: 'bg-black text-white',
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeStyles[variant]}`}
    >
      {children}
    </span>
  );
}
