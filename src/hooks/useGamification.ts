import { useState, useEffect, useCallback } from 'react';
import { 
  StreakStats, 
  DailyChallenge, 
  UserActivity, 
  SpicySurprise,
  LeaderboardEntry 
} from '../types/gamification';
import { gamificationService } from '../services/gamificationService';
import { getCurrentThemedDay } from '../data/themedDays';

interface UseGamificationReturn {
  streakStats: StreakStats | null;
  todaysChallenges: DailyChallenge[];
  recentActivities: UserActivity[];
  availableRewards: SpicySurprise[];
  leaderboard: LeaderboardEntry[];
  currentThemedDay: any;
  isLoading: boolean;
  error: string | null;
  recordActivity: (type: UserActivity['activity_type'], data: Record<string, any>) => Promise<void>;
  claimReward: (rewardId: string) => Promise<void>;
  shareAchievement: (type: string, data: Record<string, any>) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useGamification = (): UseGamificationReturn => {
  const [streakStats, setStreakStats] = useState<StreakStats | null>(null);
  const [todaysChallenges, setTodaysChallenges] = useState<DailyChallenge[]>([]);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [availableRewards, setAvailableRewards] = useState<SpicySurprise[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentThemedDay = getCurrentThemedDay();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [stats, challenges] = await Promise.all([
        gamificationService.getStreakStats(),
        gamificationService.getTodaysChallenges()
      ]);

      setStreakStats(stats);
      setTodaysChallenges(challenges);

      // Check for new rewards
      if (stats) {
        const newRewards = await gamificationService.checkAndUnlockRewards(stats);
        setAvailableRewards(newRewards);
      }

    } catch (err) {
      setError('Failed to load gamification data');
      console.error('Error loading gamification data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordActivity = useCallback(async (
    type: UserActivity['activity_type'],
    data: Record<string, any>
  ) => {
    try {
      setError(null);
      const activity = await gamificationService.recordActivity(type, data);
      
      if (activity) {
        setRecentActivities(prev => [activity, ...prev.slice(0, 9)]);
        // Refresh stats to reflect new activity
        await loadData();
      }
    } catch (err) {
      setError('Failed to record activity');
      console.error('Error recording activity:', err);
    }
  }, [loadData]);

  const claimReward = useCallback(async (rewardId: string) => {
    try {
      setError(null);
      // Implementation for claiming rewards
      setAvailableRewards(prev => prev.filter(reward => reward.id !== rewardId));
    } catch (err) {
      setError('Failed to claim reward');
      console.error('Error claiming reward:', err);
    }
  }, []);

  const shareAchievement = useCallback(async (type: string, data: Record<string, any>) => {
    try {
      setError(null);
      const success = await gamificationService.shareAchievement(type, data);
      
      if (success) {
        await recordActivity('content_shared', { achievement_type: type, ...data });
      }
    } catch (err) {
      setError('Failed to share achievement');
      console.error('Error sharing achievement:', err);
    }
  }, [recordActivity]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    streakStats,
    todaysChallenges,
    recentActivities,
    availableRewards,
    leaderboard,
    currentThemedDay,
    isLoading,
    error,
    recordActivity,
    claimReward,
    shareAchievement,
    refreshData
  };
};