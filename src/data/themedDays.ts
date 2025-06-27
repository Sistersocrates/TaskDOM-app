import { ThemedDay } from '../types/gamification';

const themedDays: ThemedDay[] = [
  {
    id: 'sinful_sunday',
    name: 'Sinful Sunday',
    day_of_week: 0,
    theme_color: '#7C3AED',
    icon: '😈',
    description: 'Indulge in your darkest desires with extra spicy content',
    special_multipliers: {
      reading_points: 1.5,
      spicy_scene_points: 2.0,
      sharing_points: 1.3
    },
    exclusive_content: {
      voice_clips: ['sinful_sunday_greeting', 'dark_romance_praise'],
      book_recommendations: ['dark_romance', 'taboo_romance'],
      club_topics: ['Forbidden Desires Discussion', 'Dark Romance Book Club']
    }
  },
  {
    id: 'manic_monday',
    name: 'Manic Monday',
    day_of_week: 1,
    theme_color: '#EF4444',
    icon: '🔥',
    description: 'Start your week with intense passion and energy',
    special_multipliers: {
      reading_points: 1.3,
      spicy_scene_points: 1.5,
      sharing_points: 1.2
    },
    exclusive_content: {
      voice_clips: ['monday_motivation', 'intense_passion_praise'],
      book_recommendations: ['enemies_to_lovers', 'workplace_romance'],
      club_topics: ['Monday Motivation Reads', 'Intense Romance Discussion']
    }
  },
  {
    id: 'tempting_tuesday',
    name: 'Tempting Tuesday',
    day_of_week: 2,
    theme_color: '#F59E0B',
    icon: '😏',
    description: 'Give in to temptation with seductive stories',
    special_multipliers: {
      reading_points: 1.2,
      spicy_scene_points: 1.8,
      sharing_points: 1.4
    },
    exclusive_content: {
      voice_clips: ['tempting_tuesday_tease', 'seductive_praise'],
      book_recommendations: ['billionaire_romance', 'seduction_stories'],
      club_topics: ['Temptation Tales', 'Seductive Heroes Discussion']
    }
  },
  {
    id: 'wild_wednesday',
    name: 'Wild Wednesday',
    day_of_week: 3,
    theme_color: '#10B981',
    icon: '🌿',
    description: 'Explore wild fantasies and untamed desires',
    special_multipliers: {
      reading_points: 1.4,
      spicy_scene_points: 1.7,
      sharing_points: 1.5
    },
    exclusive_content: {
      voice_clips: ['wild_wednesday_roar', 'fantasy_praise'],
      book_recommendations: ['paranormal_romance', 'shifter_romance'],
      club_topics: ['Wild Fantasy Reads', 'Paranormal Romance Club']
    }
  },
  {
    id: 'thirsty_thursday',
    name: 'Thirsty Thursday',
    day_of_week: 4,
    theme_color: '#3B82F6',
    icon: '💧',
    description: 'Quench your thirst for steamy romance',
    special_multipliers: {
      reading_points: 1.6,
      spicy_scene_points: 2.2,
      sharing_points: 1.3
    },
    exclusive_content: {
      voice_clips: ['thirsty_thursday_quench', 'steamy_praise'],
      book_recommendations: ['steamy_romance', 'erotic_fiction'],
      club_topics: ['Thirsty Reads Club', 'Steamy Romance Discussion']
    }
  },
  {
    id: 'feral_friday',
    name: 'Feral Friday',
    day_of_week: 5,
    theme_color: '#DB2777',
    icon: '🐺',
    description: 'Unleash your feral side with the wildest content',
    special_multipliers: {
      reading_points: 2.0,
      spicy_scene_points: 3.0,
      sharing_points: 2.0
    },
    exclusive_content: {
      voice_clips: ['feral_friday_howl', 'primal_praise', 'weekend_ready'],
      book_recommendations: ['monster_romance', 'primal_romance', 'alpha_romance'],
      club_topics: ['Feral Friday Feast', 'Monster Romance Club', 'Alpha Appreciation']
    }
  },
  {
    id: 'sultry_saturday',
    name: 'Sultry Saturday',
    day_of_week: 6,
    theme_color: '#8B5CF6',
    icon: '🌙',
    description: 'End your week with sultry, sophisticated passion',
    special_multipliers: {
      reading_points: 1.7,
      spicy_scene_points: 2.1,
      sharing_points: 1.6
    },
    exclusive_content: {
      voice_clips: ['sultry_saturday_whisper', 'sophisticated_praise'],
      book_recommendations: ['historical_romance', 'sophisticated_erotica'],
      club_topics: ['Sultry Saturday Soirée', 'Historical Romance Club']
    }
  }
];

export const getCurrentThemedDay = (): ThemedDay => {
  const today = new Date().getDay();
  return themedDays.find(day => day.day_of_week === today) || themedDays[0];
};

const getThemedDayByName = (name: string): ThemedDay | undefined => {
  return themedDays.find(day => day.id === name);
};