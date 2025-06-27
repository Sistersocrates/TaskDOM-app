import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  fullWidth = false,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-accent to-accent-hover text-accent-text hover:from-accent-hover hover:to-accent focus:ring-accent shadow-red',
    secondary: 'bg-card text-primary-text hover:bg-border focus:ring-border border border-border',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 focus:ring-accent-400 shadow-red',
    outline: 'bg-transparent border border-accent text-primary-text hover:bg-accent hover:text-accent-text focus:ring-accent',
    ghost: 'bg-transparent text-primary-text hover:bg-border focus:ring-border',
    danger: 'bg-gradient-to-r from-error-700 to-error-800 text-white hover:from-error-800 hover:to-error-900 focus:ring-error-600 shadow-red-lg'
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;