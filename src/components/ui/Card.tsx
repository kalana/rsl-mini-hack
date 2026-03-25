import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'income' | 'expense' | 'savings';
  interactive?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'default',
  interactive = false,
  padding = 'md',
  children,
  className = '',
  ...props
}: CardProps) {
  const paddings = { sm: 'p-3', md: 'p-4', lg: 'p-6' };

  const variants = {
    default:  '',
    gradient: 'gradient-card',
    income:   'gradient-income',
    expense:  'gradient-expense',
    savings:  'gradient-savings',
  };

  return (
    <div
      className={`${interactive ? 'card-interactive' : 'card'} ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
