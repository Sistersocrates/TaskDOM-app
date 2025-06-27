import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className,
  ...props
}) => {
  const inputId = props.id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={cn('mb-4', fullWidth && 'w-full', className)}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-primary-text mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'px-4 py-2 bg-card border rounded-lg transition-all duration-200 text-primary-text placeholder-secondary-text',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
          'hover:border-accent/50',
          error 
            ? 'border-error-500 bg-error-900/20' 
            : 'border-border',
          fullWidth && 'w-full'
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-400">{error}</p>
      )}
    </div>
  );
};

export default Input;