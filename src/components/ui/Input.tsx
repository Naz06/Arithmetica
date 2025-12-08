import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 placeholder-neutral-500
              focus:outline-none focus:border-primary-500 focus:shadow-[0_0_24px_0_rgba(14,165,233,0.15)]
              transition-all duration-300 ${icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100 placeholder-neutral-500
            focus:outline-none focus:border-primary-500 focus:shadow-[0_0_24px_0_rgba(14,165,233,0.15)]
            transition-all duration-300 resize-none ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-100
            focus:outline-none focus:border-primary-500 focus:shadow-[0_0_24px_0_rgba(14,165,233,0.15)]
            transition-all duration-300 ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
