import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-250 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950';

  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-700 hover:scale-[1.03] active:scale-[0.98] focus:ring-primary-500 shadow-[0_0_24px_0_rgba(14,165,233,0.15)] hover:shadow-[0_0_32px_0_rgba(14,165,233,0.25)]',
    secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 hover:scale-[1.02] active:scale-[0.98] focus:ring-neutral-500 border border-neutral-700',
    ghost: 'bg-transparent text-neutral-100 hover:bg-neutral-800/50 hover:scale-[1.02] active:scale-[0.98] focus:ring-neutral-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:scale-[1.03] active:scale-[0.98] focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm h-10',
    md: 'px-6 py-3 text-base h-12',
    lg: 'px-8 py-4 text-lg h-14',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? disabledStyles : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
