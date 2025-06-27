import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  height?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'success';
  showValue?: boolean;
  animated?: boolean;
  glowing?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  height = 'md',
  color = 'primary',
  showValue = false,
  animated = true,
  glowing = false,
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const heightClasses = {
    sm: 'h-1',
    md: 'h-3',
    lg: 'h-4',
  };
  
  const colorClasses = {
    primary: 'bg-gradient-to-r from-accent to-accent-hover',
    secondary: 'bg-gradient-to-r from-secondary-600 to-secondary-500',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-400',
    success: 'bg-gradient-to-r from-success-600 to-success-500',
  };
  
  return (
    <div className="w-full">
      <div className={cn(
        'w-full bg-border rounded-full overflow-hidden',
        heightClasses[height],
        className
      )}>
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[color],
            animated && percentage < 100 && 'animate-pulse-red',
            glowing && 'shadow-red'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showValue && (
        <p className="text-xs text-secondary-text mt-1 text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
};

export default ProgressBar;