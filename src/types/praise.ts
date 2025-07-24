// TypeScript types for the TaskDOM Praise System

export interface PraiseScript {
  id: string;
  category: PraiseCategory;
  sub_category: string;
  vibe_tone: string;
  script_text: string;
  audio_url?: string;
  trigger_type: PraiseTriggerType;
  is_nsfw: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PraiseCategory = 
  | 'dominant_dirty'
  | 'flirty_fun'
  | 'book_club'
  | 'analytics'
  | 'general'
  | 'achievement'
  | 'reading';

export type PraiseTriggerType =
  | 'task_completion'
  | 'reading_milestone'
  | 'book_completion'
  | 'daily_login'
  | 'reading_streak'
  | 'book_club_participation'
  | 'button_interaction'
  | 'achievement_unlock'
  | 'progress_update'
  | 'voice_praise_request';

export interface UserPraisePreferences {
  id: string;
  user_id: string;
  preferred_categories: PraiseCategory[];
  delivery_method: 'text' | 'audio' | 'both';
  frequency_setting: 'high' | 'normal' | 'low' | 'milestone_only';
  voice_enabled: boolean;
  voice_type: 'male_voice' | 'female_voice';
  nsfw_enabled: boolean;
  trigger_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PraiseHistory {
  id: string;
  user_id: string;
  praise_script_id: string;
  trigger_event: string;
  trigger_context?: Record<string, any>;
  delivered_at: string;
  delivery_method: string;
  user_reaction?: 'liked' | 'dismissed' | 'loved' | 'disliked';
  created_at: string;
}

export interface PraiseTrigger {
  id: string;
  trigger_name: string;
  trigger_description?: string;
  default_enabled: boolean;
  trigger_config: Record<string, any>;
  created_at: string;
}

export interface PraiseDeliveryOptions {
  category?: PraiseCategory;
  triggerType: PraiseTriggerType;
  context?: Record<string, any>;
  forceDelivery?: boolean;
  preferredVibe?: string;
}

export interface PraiseNotification {
  id: string;
  script: PraiseScript;
  deliveryMethod: 'text' | 'audio' | 'both';
  timestamp: Date;
  context?: Record<string, any>;
}

export interface PraiseSettings {
  categories: {
    category: PraiseCategory;
    enabled: boolean;
    label: string;
    description: string;
    nsfw: boolean;
  }[];
  triggers: {
    trigger: PraiseTriggerType;
    enabled: boolean;
    label: string;
    description: string;
    frequency: 'high' | 'normal' | 'low' | 'off';
  }[];
  delivery: {
    method: 'text' | 'audio' | 'both';
    voiceEnabled: boolean;
    voiceType: 'male_voice' | 'female_voice';
    showAnimations: boolean;
    soundEnabled: boolean;
  };
  content: {
    nsfwEnabled: boolean;
    personalizedEnabled: boolean;
    contextAware: boolean;
  };
}

export interface PraiseAnalytics {
  totalPraiseReceived: number;
  favoriteCategory: PraiseCategory;
  mostTriggeredEvent: PraiseTriggerType;
  praiseFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  reactionStats: {
    liked: number;
    loved: number;
    dismissed: number;
    disliked: number;
  };
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastPraiseDate: string;
  };
}

// Utility types for component props
export interface PraiseComponentProps {
  onPraiseDelivered?: (praise: PraiseNotification) => void;
  onSettingsChange?: (settings: Partial<UserPraisePreferences>) => void;
  className?: string;
}

export interface PraiseModalProps extends PraiseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  praise: PraiseNotification;
}

export interface PraiseSettingsProps extends PraiseComponentProps {
  currentSettings: UserPraisePreferences;
  onSave: (settings: UserPraisePreferences) => void;
}

// Constants for praise system
export const PRAISE_CATEGORIES: Record<PraiseCategory, { label: string; description: string; nsfw: boolean }> = {
  dominant_dirty: {
    label: 'Dominant & Dirty',
    description: 'Commanding, sultry praise with adult themes',
    nsfw: true
  },
  flirty_fun: {
    label: 'Flirty & Fun',
    description: 'Playful, charming praise with light spice',
    nsfw: false
  },
  book_club: {
    label: 'Book Club',
    description: 'Community-focused praise for book club activities',
    nsfw: false
  },
  analytics: {
    label: 'Reading Analytics',
    description: 'Data-driven praise for progress tracking',
    nsfw: false
  },
  general: {
    label: 'General',
    description: 'Universal praise for app usage and achievements',
    nsfw: false
  },
  achievement: {
    label: 'Achievement',
    description: 'Milestone and goal completion praise',
    nsfw: false
  },
  reading: {
    label: 'Reading Progress',
    description: 'Book reading and progress-specific praise',
    nsfw: false
  }
};

export const PRAISE_TRIGGERS: Record<PraiseTriggerType, { label: string; description: string }> = {
  task_completion: {
    label: 'Task Completion',
    description: 'When you complete any task or action'
  },
  reading_milestone: {
    label: 'Reading Milestones',
    description: 'When you reach reading goals or milestones'
  },
  book_completion: {
    label: 'Book Completion',
    description: 'When you finish reading a book'
  },
  daily_login: {
    label: 'Daily Login',
    description: 'When you log in to the app'
  },
  reading_streak: {
    label: 'Reading Streaks',
    description: 'When you maintain consistent reading habits'
  },
  book_club_participation: {
    label: 'Book Club Activity',
    description: 'When you participate in book club discussions'
  },
  button_interaction: {
    label: 'Button Interactions',
    description: 'For quick interactions and button clicks'
  },
  achievement_unlock: {
    label: 'Achievement Unlocks',
    description: 'When you unlock new achievements or badges'
  },
  progress_update: {
    label: 'Progress Updates',
    description: 'When you update your reading progress'
  },
  voice_praise_request: {
    label: 'Voice Praise Request',
    description: 'When you specifically request voice praise'
  }
};

