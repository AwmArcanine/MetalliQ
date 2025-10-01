import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  size?: 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  leftIcon,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center border font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-background)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200';

  const variantClasses = {
    primary: 'border-transparent text-white bg-[var(--color-brand-primary)] hover:bg-opacity-90 focus:ring-[var(--color-brand-primary)]',
    secondary: 'border-[var(--color-border)] text-[var(--text-primary)] bg-white hover:bg-gray-50 focus:ring-[var(--color-brand-accent)]',
    ghost: 'border-transparent text-[var(--text-secondary)] bg-transparent hover:bg-gray-100 focus:ring-[var(--color-brand-accent)]',
  };
  
  const sizeClasses = {
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
  );
};

export default Button;