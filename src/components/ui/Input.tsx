'use client';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-heading)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-[var(--radius-btn)] border bg-[var(--color-surface)] px-3 py-2.5 text-sm
              text-[var(--color-heading)] placeholder:text-[var(--color-muted)]
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent
              ${error ? 'border-[var(--color-expense)]' : 'border-[var(--color-border)]'}
              ${leftIcon  ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[var(--color-expense)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--color-muted)]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
