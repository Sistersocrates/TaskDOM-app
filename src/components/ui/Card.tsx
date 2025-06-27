import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'dark' | 'red';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className,
  hover = false,
  variant = 'dark'
}) => {
  const variantStyles = {
    default: 'bg-card border border-border',
    dark: 'bg-card border border-border',
    red: 'bg-gradient-to-br from-accent/20 to-accent-hover/10 border border-accent/50'
  };

  return (
    <div className={cn(
      'rounded-xl shadow-lg overflow-hidden backdrop-blur-sm',
      variantStyles[variant],
      hover && 'transition-all duration-300 hover:scale-[1.02] hover:shadow-red hover:border-accent/50',
      className
    )}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 border-b border-border', className)}>
      {children}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 border-t border-border', className)}>
      {children}
    </div>
  );
};