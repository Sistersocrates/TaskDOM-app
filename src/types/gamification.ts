export interface SmutStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_type: 'daily_reading' | 'spicy_scenes' | 'content_sharing' | 'book_club';
  created_at: string;
  updated_at: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  theme: ThemedDay;
  title: string;
  description: string;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  is_active: boolean;
}

interface ChallengeRequirement {
  type: 'reading_minutes' | 'spicy_scenes' | 'pages_read' | 'content_share' | 'book_club_participation';
  target: number;
  current: number;
}

interface ChallengeReward {
  type: 'voice_clip' | 'book_recommendation' | 'club_access' | 'badge' | 'points';
  value: string | number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'reading_session' | 'spicy_scene_marked' | 'content_shared' | 'book_completed' | 'club_participation';
  activity_data: Record<string, any>;
  points_earned: number;
  date: string;
  created_at: string;
}

export interface UnlockedReward {
  id: string;
  user_id: string;
  reward_type: 'voice_clip' | 'book_recommendation' | 'club_access' | 'badge';
  reward_data: Record<string, any>;
  unlocked_at: string;
  is_claimed: boolean;
  claimed_at?: string;
}

export interface ThemedDay {
  id: string;
  name: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  theme_color: string;
  icon: string;
  description: string;
  special_multipliers: {
    reading_points: number;
    spicy_scene_points: number;
    sharing_points: number;
  };
  exclusive_content?: {
    voice_clips: string[];
    book_recommendations: string[];
    club_topics: string[];
  };
}

export interface StreakStats {
  total_points: number;
  current_level: number;
  points_to_next_level: number;
  active_streaks: SmutStreak[];
  completed_challenges_today: number;
  total_challenges_completed: number;
  unlocked_rewards_count: number;
  favorite_themed_day: string;
}

export interface SpicySurprise {
  id: string;
  title: string;
  description: string;
  content_type: 'voice_clip' | 'nsfw_recommendation' | 'exclusive_scene' | 'club_conversation';
  content_url?: string;
  content_data: Record<string, any>;
  unlock_requirements: {
    streak_days: number;
    activity_points: number;
    themed_day?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_nsfw: boolean;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  display_name: string;
  profile_picture: string;
  total_points: number;
  longest_streak: number;
  current_streak: number;
  favorite_genre: string;
  rank: number;
}