import { createClient } from '@supabase/supabase-js';
import { 
  SmutStreak, 
  DailyChallenge, 
  UserActivity, 
  UnlockedReward, 
  StreakStats,
  LeaderboardEntry,
  SpicySurprise
} from '../types/gamification';
import { getCurrentThemedDay } from '../data/themedDays';
import { getAvailableSurprises } from '../data/spicySurprises';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

class GamificationService {
  // Streak Management
  async updateStreak(
    streakType: SmutStreak['streak_type'],
    activityData?: Record<string, any>
  ): Promise<SmutStreak | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: existingStreak } = await supabase
        .from('smut_streaks')
        .select('*')
        .eq('streak_type', streakType)
        .single();

      if (existingStreak) {
        const lastActivity = new Date(existingStreak.last_activity_date);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

        let newStreak = existingStreak.current_streak;
        
        if (daysDiff === 1) {
          // Continue streak
          newStreak += 1;
        } else if (daysDiff > 1) {
          // Streak broken, reset
          newStreak = 1;
        }
        // If daysDiff === 0, it's the same day, don't change streak

        const { data, error } = await supabase
          .from('smut_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: Math.max(existingStreak.longest_streak, newStreak),
            last_activity_date: today,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStreak.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new streak
        const { data, error } = await supabase
          .from('smut_streaks')
          .insert({
            streak_type: streakType,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  }

  async getStreakStats(): Promise<StreakStats | null> {
    try {
      const { data: streaks } = await supabase
        .from('smut_streaks')
        .select('*');

      const { data: activities } = await supabase
        .from('user_activities')
        .select('points_earned')
        .gte('date', new Date().toISOString().split('T')[0]);

      const { data: challenges } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0]);

      const { data: rewards } = await supabase
        .from('unlocked_rewards')
        .select('*');

      const totalPoints = activities?.reduce((sum, activity) => sum + activity.points_earned, 0) || 0;
      const currentLevel = Math.floor(totalPoints / 1000) + 1;
      const pointsToNextLevel = (currentLevel * 1000) - totalPoints;

      return {
        total_points: totalPoints,
        current_level: currentLevel,
        points_to_next_level: pointsToNextLevel,
        active_streaks: streaks || [],
        completed_challenges_today: challenges?.filter(c => c.is_active).length || 0,
        total_challenges_completed: challenges?.length || 0,
        unlocked_rewards_count: rewards?.length || 0,
        favorite_themed_day: 'feral_friday' // This would be calculated based on activity
      };
    } catch (error) {
      console.error('Error fetching streak stats:', error);
      return null;
    }
  }

  // Activity Tracking
  async recordActivity(
    activityType: UserActivity['activity_type'],
    activityData: Record<string, any>
  ): Promise<UserActivity | null> {
    try {
      const themedDay = getCurrentThemedDay();
      const basePoints = this.calculateBasePoints(activityType, activityData);
      
      // Apply themed day multipliers
      const multiplier = this.getThemedDayMultiplier(activityType, themedDay);
      const finalPoints = Math.floor(basePoints * multiplier);

      const { data, error } = await supabase
        .from('user_activities')
        .insert({
          activity_type: activityType,
          activity_data: activityData,
          points_earned: finalPoints,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      // Update relevant streaks
      await this.updateStreak(this.getStreakTypeForActivity(activityType), activityData);

      return data;
    } catch (error) {
      console.error('Error recording activity:', error);
      return null;
    }
  }

  private calculateBasePoints(
    activityType: UserActivity['activity_type'],
    activityData: Record<string, any>
  ): number {
    switch (activityType) {
      case 'reading_session':
        return Math.floor((activityData.minutes || 0) * 2);
      case 'spicy_scene_marked':
        return 25;
      case 'content_shared':
        return 15;
      case 'book_completed':
        return 100;
      case 'club_participation':
        return 30;
      default:
        return 10;
    }
  }

  private getThemedDayMultiplier(
    activityType: UserActivity['activity_type'],
    themedDay: any
  ): number {
    switch (activityType) {
      case 'reading_session':
        return themedDay.special_multipliers.reading_points;
      case 'spicy_scene_marked':
        return themedDay.special_multipliers.spicy_scene_points;
      case 'content_shared':
        return themedDay.special_multipliers.sharing_points;
      default:
        return 1.0;
    }
  }

  private getStreakTypeForActivity(activityType: UserActivity['activity_type']): SmutStreak['streak_type'] {
    switch (activityType) {
      case 'reading_session':
        return 'daily_reading';
      case 'spicy_scene_marked':
        return 'spicy_scenes';
      case 'content_shared':
        return 'content_sharing';
      case 'club_participation':
        return 'book_club';
      default:
        return 'daily_reading';
    }
  }

  // Challenge Management
  async getTodaysChallenges(): Promise<DailyChallenge[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('date', today)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return [];
    }
  }

  async generateDailyChallenges(): Promise<DailyChallenge[]> {
    const themedDay = getCurrentThemedDay();
    const today = new Date().toISOString().split('T')[0];

    const challenges: Omit<DailyChallenge, 'id'>[] = [
      {
        date: today,
        theme: themedDay,
        title: `${themedDay.name} Reading Marathon`,
        description: `Read for ${themedDay.name === 'feral_friday' ? '60' : '45'} minutes to embrace today's theme`,
        requirements: [
          {
            type: 'reading_minutes',
            target: themedDay.name === 'feral_friday' ? 60 : 45,
            current: 0
          }
        ],
        rewards: [
          {
            type: 'points',
            value: themedDay.name === 'feral_friday' ? 150 : 100,
            rarity: 'common'
          },
          {
            type: 'voice_clip',
            value: `${themedDay.id}_completion`,
            rarity: 'rare'
          }
        ],
        difficulty: 'medium',
        is_active: true
      },
      {
        date: today,
        theme: themedDay,
        title: 'Spice Hunter',
        description: 'Mark 3 spicy scenes to unlock exclusive content',
        requirements: [
          {
            type: 'spicy_scenes',
            target: 3,
            current: 0
          }
        ],
        rewards: [
          {
            type: 'book_recommendation',
            value: 'personalized_spicy',
            rarity: 'rare'
          }
        ],
        difficulty: 'easy',
        is_active: true
      }
    ];

    // Add special Feral Friday challenge
    if (themedDay.name === 'Feral Friday') {
      challenges.push({
        date: today,
        theme: themedDay,
        title: 'Go Completely Feral',
        description: 'Complete all daily activities to unlock legendary Feral Friday content',
        requirements: [
          {
            type: 'reading_minutes',
            target: 90,
            current: 0
          },
          {
            type: 'spicy_scenes',
            target: 5,
            current: 0
          },
          {
            type: 'content_share',
            target: 1,
            current: 0
          }
        ],
        rewards: [
          {
            type: 'voice_clip',
            value: 'feral_friday_legendary',
            rarity: 'legendary'
          },
          {
            type: 'club_access',
            value: 'feral_friday_exclusive',
            rarity: 'epic'
          }
        ],
        difficulty: 'legendary',
        is_active: true
      });
    }

    try {
      const { data, error } = await supabase
        .from('daily_challenges')
        .insert(challenges)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error generating challenges:', error);
      return [];
    }
  }

  // Reward Management
  async checkAndUnlockRewards(streakStats: StreakStats): Promise<SpicySurprise[]> {
    try {
      const themedDay = getCurrentThemedDay();
      const maxStreak = Math.max(...streakStats.active_streaks.map(s => s.current_streak));
      
      const availableSurprises = getAvailableSurprises(
        maxStreak,
        streakStats.total_points,
        themedDay.id
      );

      const newRewards: SpicySurprise[] = [];

      for (const surprise of availableSurprises) {
        // Check if already unlocked
        const { data: existing } = await supabase
          .from('unlocked_rewards')
          .select('id')
          .eq('reward_type', surprise.content_type)
          .eq('reward_data->surprise_id', surprise.id)
          .single();

        if (!existing) {
          // Unlock new reward
          const { data, error } = await supabase
            .from('unlocked_rewards')
            .insert({
              reward_type: surprise.content_type,
              reward_data: { ...surprise.content_data, surprise_id: surprise.id },
              is_claimed: false
            })
            .select()
            .single();

          if (!error) {
            newRewards.push(surprise);
          }
        }
      }

      return newRewards;
    } catch (error) {
      console.error('Error checking rewards:', error);
      return [];
    }
  }

  // Leaderboard
  async getLeaderboard(timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<LeaderboardEntry[]> {
    try {
      // This would be a complex query joining multiple tables
      // For now, returning mock data structure
      const { data, error } = await supabase
        .from('leaderboard_view')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  // Social Features
  async shareAchievement(achievementType: string, achievementData: Record<string, any>): Promise<boolean> {
    try {
      await this.recordActivity('content_shared', {
        achievement_type: achievementType,
        achievement_data: achievementData,
        platform: 'internal'
      });

      return true;
    } catch (error) {
      console.error('Error sharing achievement:', error);
      return false;
    }
  }
}

export const gamificationService = new GamificationService();