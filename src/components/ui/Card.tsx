import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  glow = false,
  onClick,
}) => {
  const baseStyles = 'bg-neutral-900 rounded-xl border border-neutral-800 p-6';
  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all duration-300 hover:border-primary-700 hover:-translate-y-1 hover:shadow-[0_0_32px_0_rgba(14,165,233,0.25)]'
    : '';
  const glowStyles = glow ? 'shadow-[0_0_24px_0_rgba(14,165,233,0.15)]' : '';

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${glowStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold text-neutral-100 ${className}`}>{children}</h3>
);

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-neutral-400 mt-1 ${className}`}>{children}</p>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);
