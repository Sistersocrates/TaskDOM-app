// usePraise.ts - React hook for praise system integration

import { useState, useEffect, useCallback } from 'react';
import { 
  PraiseNotification, 
  UserPraisePreferences, 
  PraiseTriggerType, 
  PraiseCategory,
  PraiseAnalytics 
} from '../types/praise';
import { PraiseService } from '../services/praiseService';
import { useUserStore } from '../store/userStore';

interface UsePraiseReturn {
  // State
  preferences: UserPraisePreferences | null;
  currentPraise: PraiseNotification | null;
  analytics: PraiseAnalytics | null;
  loading: boolean;
  
  // Actions
  triggerPraise: (triggerType: PraiseTriggerType, context?: Record<string, any>) => Promise<void>;
  dismissPraise: () => void;
  updatePreferences: (updates: Partial<UserPraisePreferences>) => Promise<void>;
  reactToPraise: (reaction: 'liked' | 'loved' | 'dismissed' | 'disliked') => Promise<void>;
  
  // Utilities
  canReceivePraise: boolean;
  praiseQueue: PraiseNotification[];
}

export const usePraise = (): UsePraiseReturn => {
  const { user } = useUserStore();
  const [preferences, setPreferences] = useState<UserPraisePreferences | null>(null);
  const [currentPraise, setCurrentPraise] = useState<PraiseNotification | null>(null);
  const [analytics, setAnalytics] = useState<PraiseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [praiseQueue, setPraiseQueue] = useState<PraiseNotification[]>([]);

  // Load user preferences and analytics on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load preferences
      let userPrefs = await PraiseService.getUserPreferences(user.id);
      if (!userPrefs) {
        userPrefs = await PraiseService.initializeUserPreferences(user.id);
      }
      setPreferences(userPrefs);

      // Load analytics
      const userAnalytics = await PraiseService.getPraiseAnalytics(user.id);
      setAnalytics(userAnalytics);

    } catch (error) {
      console.error('Error loading praise data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger praise for specific events
  const triggerPraise = useCallback(async (
    triggerType: PraiseTriggerType, 
    context?: Record<string, any>
  ) => {
    if (!user || !preferences) return;

    try {
      const notification = await PraiseService.deliverPraise(user.id, {
        triggerType,
        context
      });

      if (notification) {
        // If there's already a praise showing, queue this one
        if (currentPraise) {
          setPraiseQueue(prev => [...prev, notification]);
        } else {
          setCurrentPraise(notification);
        }

        // Update analytics
        const updatedAnalytics = await PraiseService.getPraiseAnalytics(user.id);
        setAnalytics(updatedAnalytics);
      }
    } catch (error) {
      console.error('Error triggering praise:', error);
    }
  }, [user, preferences, currentPraise]);

  // Dismiss current praise and show next in queue
  const dismissPraise = useCallback(() => {
    setCurrentPraise(null);
    
    // Show next praise in queue
    if (praiseQueue.length > 0) {
      const [nextPraise, ...remainingQueue] = praiseQueue;
      setCurrentPraise(nextPraise);
      setPraiseQueue(remainingQueue);
    }
  }, [praiseQueue]);

  // Update user preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPraisePreferences>) => {
    if (!user || !preferences) return;

    try {
      const updatedPrefs = await PraiseService.updateUserPreferences(user.id, updates);
      if (updatedPrefs) {
        setPreferences(updatedPrefs);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }, [user, preferences]);

  // React to current praise
  const reactToPraise = useCallback(async (reaction: 'liked' | 'loved' | 'dismissed' | 'disliked') => {
    if (!currentPraise) return;

    try {
      // Record reaction (we'll need to track the history ID)
      // For now, we'll just dismiss the praise
      if (reaction === 'dismissed') {
        dismissPraise();
      }
      
      // Update analytics
      const updatedAnalytics = await PraiseService.getPraiseAnalytics(user.id);
      setAnalytics(updatedAnalytics);
      
    } catch (error) {
      console.error('Error reacting to praise:', error);
    }
  }, [currentPraise, dismissPraise]);

  // Computed values
  const canReceivePraise = Boolean(user && preferences && preferences.preferred_categories?.length > 0);

  return {
    // State
    preferences,
    currentPraise,
    analytics,
    loading,
    
    // Actions
    triggerPraise,
    dismissPraise,
    updatePreferences,
    reactToPraise,
    
    // Utilities
    canReceivePraise,
    praiseQueue
  };
};

// Hook for quick praise triggers (commonly used patterns)
export const useQuickPraise = () => {
  const { triggerPraise } = usePraise();

  const praiseTaskCompletion = useCallback((taskName?: string) => {
    triggerPraise('task_completion', { task: taskName });
  }, [triggerPraise]);

  const praiseReadingProgress = useCallback((pages: number, book?: string) => {
    triggerPraise('progress_update', { pages, book });
  }, [triggerPraise]);

  const praiseBookCompletion = useCallback((bookTitle: string, rating?: number) => {
    triggerPraise('book_completion', { book: bookTitle, rating });
  }, [triggerPraise]);

  const praiseReadingStreak = useCallback((days: number) => {
    triggerPraise('reading_streak', { streak_days: days });
  }, [triggerPraise]);

  const praiseBookClubActivity = useCallback((activity: string, clubName?: string) => {
    triggerPraise('book_club_participation', { activity, club: clubName });
  }, [triggerPraise]);

  const praiseAchievement = useCallback((achievement: string, milestone?: number) => {
    triggerPraise('achievement_unlock', { achievement, milestone });
  }, [triggerPraise]);

  const praiseButtonClick = useCallback((buttonName?: string) => {
    triggerPraise('button_interaction', { button: buttonName });
  }, [triggerPraise]);

  const praiseDailyLogin = useCallback(() => {
    triggerPraise('daily_login', { login_time: new Date().toISOString() });
  }, [triggerPraise]);

  return {
    praiseTaskCompletion,
    praiseReadingProgress,
    praiseBookCompletion,
    praiseReadingStreak,
    praiseBookClubActivity,
    praiseAchievement,
    praiseButtonClick,
    praiseDailyLogin
  };
};

// Hook for praise analytics and insights
export const usePraiseAnalytics = () => {
  const { analytics, loading } = usePraise();

  const getPraiseInsights = useCallback(() => {
    if (!analytics) return null;

    const insights = [];

    // Frequency insights
    if (analytics.praiseFrequency.daily > 5) {
      insights.push({
        type: 'frequency',
        message: "You're on fire today! You've received lots of praise.",
        positive: true
      });
    } else if (analytics.praiseFrequency.daily === 0) {
      insights.push({
        type: 'frequency',
        message: "Complete some tasks to earn praise today!",
        positive: false
      });
    }

    // Reaction insights
    const totalReactions = Object.values(analytics.reactionStats).reduce((a, b) => a + b, 0);
    const positiveReactions = analytics.reactionStats.liked + analytics.reactionStats.loved;
    
    if (totalReactions > 0) {
      const positiveRatio = positiveReactions / totalReactions;
      if (positiveRatio > 0.8) {
        insights.push({
          type: 'engagement',
          message: "You love the praise you're getting! Keep it up!",
          positive: true
        });
      } else if (positiveRatio < 0.3) {
        insights.push({
          type: 'engagement',
          message: "Consider adjusting your praise settings for better content.",
          positive: false
        });
      }
    }

    // Streak insights
    if (analytics.streakData.currentStreak > 7) {
      insights.push({
        type: 'streak',
        message: `Amazing ${analytics.streakData.currentStreak}-day streak! You're unstoppable!`,
        positive: true
      });
    }

    return insights;
  }, [analytics]);

  return {
    analytics,
    loading,
    getPraiseInsights
  };
};

