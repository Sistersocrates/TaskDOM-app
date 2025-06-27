import React from 'react';
import { cn } from '../utils/cn';

interface SpiceRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  className?: string;
}

const SpiceRating: React.FC<SpiceRatingProps> = ({
  value,
  onChange,
  size = 'md',
  readonly = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };
  
  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };
  
  return (
    <div className={cn('flex items-center', className)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const rating = index + 1;
        return (
          <button
            key={index}
            type="button"
            className={cn(
              sizeClasses[size],
              'transition-transform duration-200',
              !readonly && 'hover:scale-110 cursor-pointer',
              readonly && 'cursor-default'
            )}
            onClick={() => handleClick(rating)}
            disabled={readonly}
            aria-label={`Rate ${rating} out of 5`}
          >
            <span className={cn(
              rating <= value ? 'text-accent' : 'text-border',
              'transition-colors duration-200'
            )}>
              🌶️
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SpiceRating;