// PraiseProvider.tsx - Context provider for app-wide praise system

import React, { createContext, useContext, ReactNode } from 'react';
import { usePraise, useQuickPraise } from '../../hooks/usePraise';
import { PraiseNotification } from './PraiseNotification';
import { 
  PraiseNotification as PraiseNotificationType,
  UserPraisePreferences, 
  PraiseTriggerType,
  PraiseAnalytics 
} from '../../types/praise';

interface PraiseContextType {
  // State
  preferences: UserPraisePreferences | null;
  currentPraise: PraiseNotificationType | null;
  analytics: PraiseAnalytics | null;
  loading: boolean;
  canReceivePraise: boolean;
  
  // Actions
  triggerPraise: (triggerType: PraiseTriggerType, context?: Record<string, any>) => Promise<void>;
  dismissPraise: () => void;
  updatePreferences: (updates: Partial<UserPraisePreferences>) => Promise<void>;
  reactToPraise: (reaction: 'liked' | 'loved' | 'dismissed' | 'disliked') => Promise<void>;
  
  // Quick praise methods
  praiseTaskCompletion: (taskName?: string) => void;
  praiseReadingProgress: (pages: number, book?: string) => void;
  praiseBookCompletion: (bookTitle: string, rating?: number) => void;
  praiseReadingStreak: (days: number) => void;
  praiseBookClubActivity: (activity: string, clubName?: string) => void;
  praiseAchievement: (achievement: string, milestone?: number) => void;
  praiseButtonClick: (buttonName?: string) => void;
  praiseDailyLogin: () => void;
}

const PraiseContext = createContext<PraiseContextType | undefined>(undefined);

interface PraiseProviderProps {
  children: ReactNode;
  showNotifications?: boolean;
  notificationPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const PraiseProvider: React.FC<PraiseProviderProps> = ({
  children,
  showNotifications = true,
  notificationPosition = 'top-right'
}) => {
  const praise = usePraise();
  const quickPraise = useQuickPraise();

  const handlePraiseReaction = async (reaction: 'liked' | 'loved' | 'dismissed' | 'disliked') => {
    await praise.reactToPraise(reaction);
  };

  const getNotificationPositionClasses = () => {
    switch (notificationPosition) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const contextValue: PraiseContextType = {
    // State from usePraise
    preferences: praise.preferences,
    currentPraise: praise.currentPraise,
    analytics: praise.analytics,
    loading: praise.loading,
    canReceivePraise: praise.canReceivePraise,
    
    // Actions from usePraise
    triggerPraise: praise.triggerPraise,
    dismissPraise: praise.dismissPraise,
    updatePreferences: praise.updatePreferences,
    reactToPraise: praise.reactToPraise,
    
    // Quick praise methods
    praiseTaskCompletion: quickPraise.praiseTaskCompletion,
    praiseReadingProgress: quickPraise.praiseReadingProgress,
    praiseBookCompletion: quickPraise.praiseBookCompletion,
    praiseReadingStreak: quickPraise.praiseReadingStreak,
    praiseBookClubActivity: quickPraise.praiseBookClubActivity,
    praiseAchievement: quickPraise.praiseAchievement,
    praiseButtonClick: quickPraise.praiseButtonClick,
    praiseDailyLogin: quickPraise.praiseDailyLogin
  };

  return (
    <PraiseContext.Provider value={contextValue}>
      {children}
      
      {/* Render praise notifications */}
      {showNotifications && praise.currentPraise && (
        <div className={`fixed z-50 ${getNotificationPositionClasses()}`}>
          <PraiseNotification
            notification={praise.currentPraise}
            onClose={praise.dismissPraise}
            onReaction={handlePraiseReaction}
            autoClose={true}
            duration={5000}
          />
        </div>
      )}
    </PraiseContext.Provider>
  );
};

// Hook to use praise context
export const usePraiseContext = (): PraiseContextType => {
  const context = useContext(PraiseContext);
  if (context === undefined) {
    throw new Error('usePraiseContext must be used within a PraiseProvider');
  }
  return context;
};

// Higher-order component for adding praise to any component
export const withPraise = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { praiseEnabled?: boolean }> => {
  return ({ praiseEnabled = true, ...props }: P & { praiseEnabled?: boolean }) => {
    const praise = usePraiseContext();

    // Add praise methods to component props
    const enhancedProps = {
      ...props,
      praise: praiseEnabled ? praise : undefined
    } as P;

    return <Component {...enhancedProps} />;
  };
};

// Component for manual praise triggers (useful for testing)
export const PraiseTrigger: React.FC<{
  triggerType: PraiseTriggerType;
  context?: Record<string, any>;
  children: ReactNode;
  className?: string;
}> = ({ triggerType, context, children, className = '' }) => {
  const { triggerPraise, canReceivePraise } = usePraiseContext();

  const handleClick = () => {
    if (canReceivePraise) {
      triggerPraise(triggerType, context);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canReceivePraise}
      className={`${className} ${!canReceivePraise ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

// Component for praise-enabled buttons
export const PraiseButton: React.FC<{
  onClick?: () => void;
  praiseOnClick?: boolean;
  praiseContext?: Record<string, any>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ 
  onClick, 
  praiseOnClick = false, 
  praiseContext, 
  children, 
  className = '',
  disabled = false 
}) => {
  const { praiseButtonClick } = usePraiseContext();

  const handleClick = () => {
    onClick?.();
    
    if (praiseOnClick) {
      praiseButtonClick(praiseContext?.buttonName);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};

// Component for automatic praise on task completion
export const TaskCompletionPraise: React.FC<{
  taskName: string;
  onComplete: () => void;
  children: ReactNode;
  className?: string;
}> = ({ taskName, onComplete, children, className = '' }) => {
  const { praiseTaskCompletion } = usePraiseContext();

  const handleComplete = () => {
    onComplete();
    praiseTaskCompletion(taskName);
  };

  return (
    <button onClick={handleComplete} className={className}>
      {children}
    </button>
  );
};

// Component for reading progress praise
export const ReadingProgressPraise: React.FC<{
  pages: number;
  book?: string;
  onProgress: (pages: number) => void;
  children: ReactNode;
  className?: string;
}> = ({ pages, book, onProgress, children, className = '' }) => {
  const { praiseReadingProgress } = usePraiseContext();

  const handleProgress = () => {
    onProgress(pages);
    praiseReadingProgress(pages, book);
  };

  return (
    <button onClick={handleProgress} className={className}>
      {children}
    </button>
  );
};

