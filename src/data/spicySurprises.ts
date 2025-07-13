import { SpicySurprise } from '../types/gamification';

const spicySurprises: SpicySurprise[] = [
  // Common Rewards (1-3 day streaks)
  {
    id: 'flirty_encouragement',
    title: 'Flirty Encouragement',
    description: 'A special voice message just for you',
    content_type: 'voice_clip',
    content_data: {
      voice_id: 'flirty_voice',
      text: "Look at you, keeping up that streak! You're absolutely irresistible when you're dedicated.",
      duration: 8
    },
    unlock_requirements: {
      streak_days: 1,
      activity_points: 50
    },
    rarity: 'common',
    is_nsfw: false
  },
  {
    id: 'spicy_book_rec',
    title: 'Personalized Spicy Recommendation',
    description: 'A book recommendation based on your reading history',
    content_type: 'nsfw_recommendation',
    content_data: {
      genre_preferences: ['dark_romance', 'enemies_to_lovers'],
      spice_level: 4,
      personalized: true
    },
    unlock_requirements: {
      streak_days: 2,
      activity_points: 100
    },
    rarity: 'common',
    is_nsfw: true
  },

  // Rare Rewards (5-7 day streaks)
  {
    id: 'exclusive_scene_preview',
    title: 'Exclusive Scene Preview',
    description: 'Get early access to a steamy scene from an upcoming release',
    content_type: 'exclusive_scene',
    content_data: {
      book_title: 'Forbidden Desires: The Alpha\'s Claim',
      scene_type: 'first_encounter',
      word_count: 1500,
      spice_rating: 5
    },
    unlock_requirements: {
      streak_days: 5,
      activity_points: 300
    },
    rarity: 'rare',
    is_nsfw: true
  },
  {
    id: 'feral_friday_special',
    title: 'Feral Friday Special Voice',
    description: 'Unlock exclusive Feral Friday voice content',
    content_type: 'voice_clip',
    content_data: {
      voice_id: 'dominant_voice',
      text: "It's Feral Friday and you've earned something special. You've been such a good reader this week...",
      duration: 15,
      themed_day: 'feral_friday'
    },
    unlock_requirements: {
      streak_days: 5,
      activity_points: 250,
      themed_day: 'feral_friday'
    },
    rarity: 'rare',
    is_nsfw: true
  },

  // Epic Rewards (10-14 day streaks)
  {
    id: 'private_book_club',
    title: 'VIP Book Club Access',
    description: 'Join an exclusive 18+ book club discussion',
    content_type: 'club_conversation',
    content_data: {
      club_name: 'The Spice Cabinet',
      topic: 'Analyzing the Psychology of Alpha Heroes',
      member_limit: 20,
      duration_days: 7
    },
    unlock_requirements: {
      streak_days: 10,
      activity_points: 600
    },
    rarity: 'epic',
    is_nsfw: true
  },
  {
    id: 'author_voice_message',
    title: 'Personal Message from Your Favorite Author',
    description: 'A personalized voice message from a popular romance author',
    content_type: 'voice_clip',
    content_data: {
      author_name: 'Sarah J. Maas',
      message_type: 'congratulations',
      duration: 20,
      personalized: true
    },
    unlock_requirements: {
      streak_days: 12,
      activity_points: 800
    },
    rarity: 'epic',
    is_nsfw: false
  },

  // Legendary Rewards (21+ day streaks)
  {
    id: 'custom_voice_assistant',
    title: 'Custom Voice Assistant Personality',
    description: 'Unlock a completely new voice personality with exclusive content',
    content_type: 'voice_clip',
    content_data: {
      personality_name: 'The Seductress',
      voice_count: 50,
      exclusive_phrases: true,
      customizable: true
    },
    unlock_requirements: {
      streak_days: 21,
      activity_points: 1500
    },
    rarity: 'legendary',
    is_nsfw: true
  },
  {
    id: 'early_access_book',
    title: 'Early Access to Upcoming Release',
    description: 'Read a highly anticipated book 2 weeks before public release',
    content_type: 'nsfw_recommendation',
    content_data: {
      book_title: 'Claimed by the Dragon King',
      author: 'Ruby Dixon',
      early_access_days: 14,
      exclusive: true
    },
    unlock_requirements: {
      streak_days: 30,
      activity_points: 2000
    },
    rarity: 'legendary',
    is_nsfw: true
  },

  // Themed Day Specials
  {
    id: 'sinful_sunday_confession',
    title: 'Sinful Sunday Confession',
    description: 'Share your deepest reading desires in a private confession booth',
    content_type: 'club_conversation',
    content_data: {
      confession_type: 'anonymous',
      theme: 'guilty_pleasures',
      responses_enabled: true
    },
    unlock_requirements: {
      streak_days: 7,
      activity_points: 400,
      themed_day: 'sinful_sunday'
    },
    rarity: 'rare',
    is_nsfw: true
  },
  {
    id: 'wild_wednesday_fantasy',
    title: 'Wild Wednesday Fantasy Generator',
    description: 'AI-generated personalized fantasy scenarios based on your preferences',
    content_type: 'exclusive_scene',
    content_data: {
      generator_type: 'ai_fantasy',
      personalization_level: 'high',
      scenario_count: 5
    },
    unlock_requirements: {
      streak_days: 14,
      activity_points: 700,
      themed_day: 'wild_wednesday'
    },
    rarity: 'epic',
    is_nsfw: true
  }
];

export const getAvailableSurprises = (
  streakDays: number,
  activityPoints: number,
  currentThemedDay?: string
): SpicySurprise[] => {
  return spicySurprises.filter(surprise => {
    const meetsStreak = streakDays >= surprise.unlock_requirements.streak_days;
    const meetsPoints = activityPoints >= surprise.unlock_requirements.activity_points;
    const meetsTheme = !surprise.unlock_requirements.themed_day || 
                      surprise.unlock_requirements.themed_day === currentThemedDay;
    
    return meetsStreak && meetsPoints && meetsTheme;
  });
};
