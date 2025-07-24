// praiseScripts.ts - Initial praise scripts data based on Google Sheets analysis

import { PraiseScript } from '../types/praise';

export const initialPraiseScripts: Omit<PraiseScript, 'id' | 'created_at' | 'updated_at'>[] = [
  // Dominant & Dirty Category
  {
    category: 'dominant_dirty',
    sub_category: 'commanding',
    vibe_tone: 'sultry_commanding',
    script_text: "Good girl, you finished that chapter like I knew you would. Now keep going, I want to see you devour that entire book.",
    trigger_type: 'reading_milestone',
    is_nsfw: true,
    is_active: true
  },
  {
    category: 'dominant_dirty',
    sub_category: 'possessive',
    vibe_tone: 'possessive_praise',
    script_text: "That's my smart little reader. You're doing exactly what I want - getting lost in those pages while I watch you succeed.",
    trigger_type: 'task_completion',
    is_nsfw: true,
    is_active: true
  },
  {
    category: 'dominant_dirty',
    sub_category: 'reward_based',
    vibe_tone: 'sultry_reward',
    script_text: "Mmm, you've been such a good girl finishing your reading goals. I think you've earned yourself a very special reward tonight.",
    trigger_type: 'achievement_unlock',
    is_nsfw: true,
    is_active: true
  },

  // Flirty & Fun Category
  {
    category: 'flirty_fun',
    sub_category: 'playful',
    vibe_tone: 'cheeky_flirty',
    script_text: "Look at you being all smart and sexy, crushing those reading goals! I'm definitely impressed by your dedication.",
    trigger_type: 'reading_milestone',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'flirty_fun',
    sub_category: 'charming',
    vibe_tone: 'sweet_flirty',
    script_text: "You know what's really attractive? Someone who finishes what they start. And you, gorgeous, just did exactly that.",
    trigger_type: 'book_completion',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'flirty_fun',
    sub_category: 'encouraging',
    vibe_tone: 'supportive_flirty',
    script_text: "Every page you read makes you more irresistible. Keep going, beautiful - I love watching you grow.",
    trigger_type: 'progress_update',
    is_nsfw: false,
    is_active: true
  },

  // Book Club Category
  {
    category: 'book_club',
    sub_category: 'community',
    vibe_tone: 'warm_community',
    script_text: "Your book club discussion was absolutely brilliant! You brought such thoughtful insights that really elevated the conversation.",
    trigger_type: 'book_club_participation',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'book_club',
    sub_category: 'leadership',
    vibe_tone: 'encouraging_leader',
    script_text: "The way you're fostering discussion in your book club is incredible. You're creating such a welcoming space for everyone to share.",
    trigger_type: 'book_club_participation',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'book_club',
    sub_category: 'engagement',
    vibe_tone: 'enthusiastic_community',
    script_text: "Your book recommendations are always spot-on! The club members are so lucky to have someone with your literary taste.",
    trigger_type: 'book_club_participation',
    is_nsfw: false,
    is_active: true
  },

  // Analytics Category
  {
    category: 'analytics',
    sub_category: 'progress_tracking',
    vibe_tone: 'data_driven_praise',
    script_text: "Impressive! You've read 25% more this week than last week. Your consistency is paying off in measurable ways.",
    trigger_type: 'reading_milestone',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'analytics',
    sub_category: 'goal_achievement',
    vibe_tone: 'achievement_focused',
    script_text: "Your reading velocity has increased by 15% this month! You're not just reading more, you're reading smarter.",
    trigger_type: 'achievement_unlock',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'analytics',
    sub_category: 'streak_recognition',
    vibe_tone: 'data_celebration',
    script_text: "7 days straight of hitting your reading goals! Your dedication is showing up in the data, and it's beautiful to see.",
    trigger_type: 'reading_streak',
    is_nsfw: false,
    is_active: true
  },

  // General Category
  {
    category: 'general',
    sub_category: 'daily_motivation',
    vibe_tone: 'uplifting_general',
    script_text: "Every time you open a book, you're choosing growth over comfort. That's the mark of someone truly special.",
    trigger_type: 'daily_login',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'general',
    sub_category: 'task_completion',
    vibe_tone: 'encouraging_general',
    script_text: "You did it! Another task completed, another step forward. Your consistency is building something amazing.",
    trigger_type: 'task_completion',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'general',
    sub_category: 'app_interaction',
    vibe_tone: 'friendly_general',
    script_text: "I love seeing you here, making progress and staying committed to your reading journey. You're doing great!",
    trigger_type: 'button_interaction',
    is_nsfw: false,
    is_active: true
  },

  // Achievement Category
  {
    category: 'achievement',
    sub_category: 'milestone_celebration',
    vibe_tone: 'celebratory_achievement',
    script_text: "🎉 You just unlocked a major milestone! Your dedication to reading is truly paying off in the best way.",
    trigger_type: 'achievement_unlock',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'achievement',
    sub_category: 'book_completion',
    vibe_tone: 'proud_achievement',
    script_text: "Another book conquered! You're building an incredible library of knowledge and experiences. I'm so proud of you.",
    trigger_type: 'book_completion',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'achievement',
    sub_category: 'streak_achievement',
    vibe_tone: 'momentum_achievement',
    script_text: "Your reading streak is on fire! This kind of consistency is what separates dreamers from achievers.",
    trigger_type: 'reading_streak',
    is_nsfw: false,
    is_active: true
  },

  // Reading Category
  {
    category: 'reading',
    sub_category: 'progress_praise',
    vibe_tone: 'encouraging_reading',
    script_text: "Every page you turn is a victory. You're not just reading, you're actively choosing to expand your world.",
    trigger_type: 'progress_update',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'reading',
    sub_category: 'comprehension',
    vibe_tone: 'intellectual_praise',
    script_text: "The way you absorb and process what you read is remarkable. You're not just consuming content, you're truly learning.",
    trigger_type: 'reading_milestone',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'reading',
    sub_category: 'dedication',
    vibe_tone: 'admiring_dedication',
    script_text: "Your commitment to reading, even on busy days, shows incredible character. You're investing in the best version of yourself.",
    trigger_type: 'daily_login',
    is_nsfw: false,
    is_active: true
  },

  // Additional Dominant & Dirty Scripts
  {
    category: 'dominant_dirty',
    sub_category: 'teasing',
    vibe_tone: 'playful_dominant',
    script_text: "I love watching you get so focused when you read. The way you bite your lip when you're concentrating is absolutely irresistible.",
    trigger_type: 'progress_update',
    is_nsfw: true,
    is_active: true
  },
  {
    category: 'dominant_dirty',
    sub_category: 'control',
    vibe_tone: 'controlling_praise',
    script_text: "You're being such an obedient little bookworm, following my reading plan perfectly. I might have to reward you for being so good.",
    trigger_type: 'task_completion',
    is_nsfw: true,
    is_active: true
  },

  // Additional Flirty & Fun Scripts
  {
    category: 'flirty_fun',
    sub_category: 'complimentary',
    vibe_tone: 'sweet_compliment',
    script_text: "Smart is the new sexy, and honey, you are absolutely glowing with intelligence right now.",
    trigger_type: 'reading_milestone',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'flirty_fun',
    sub_category: 'motivational',
    vibe_tone: 'upbeat_flirty',
    script_text: "You're like a reading superhero! Saving the day one chapter at a time, and looking amazing while doing it.",
    trigger_type: 'achievement_unlock',
    is_nsfw: false,
    is_active: true
  },

  // Voice Praise Request Scripts
  {
    category: 'flirty_fun',
    sub_category: 'voice_response',
    vibe_tone: 'intimate_voice',
    script_text: "You wanted to hear my voice? Well, here I am telling you how incredibly proud I am of your reading progress.",
    trigger_type: 'voice_praise_request',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'dominant_dirty',
    sub_category: 'voice_response',
    vibe_tone: 'sultry_voice',
    script_text: "You called for me? Good. I want you to hear exactly how pleased I am with your dedication to reading.",
    trigger_type: 'voice_praise_request',
    is_nsfw: true,
    is_active: true
  },

  // Button Interaction Scripts
  {
    category: 'general',
    sub_category: 'button_praise',
    vibe_tone: 'quick_encouragement',
    script_text: "Nice click! Every interaction shows you're engaged and committed to your reading journey.",
    trigger_type: 'button_interaction',
    is_nsfw: false,
    is_active: true
  },
  {
    category: 'flirty_fun',
    sub_category: 'button_praise',
    vibe_tone: 'playful_button',
    script_text: "Ooh, someone's being interactive today! I love it when you're hands-on with your reading goals.",
    trigger_type: 'button_interaction',
    is_nsfw: false,
    is_active: true
  }
];

// Function to seed the database with initial scripts
export const seedPraiseScripts = async () => {
  // This would be called during app initialization or migration
  // Implementation would depend on your database setup
  console.log('Seeding praise scripts...', initialPraiseScripts.length, 'scripts to add');
  return initialPraiseScripts;
};

