export type VoiceStyle = 'flirty' | 'dominant' | 'wholesome';

export type UserRole = 'guest' | 'reader' | 'club_host' | 'admin';

export interface User {
  id: string;
  username: string;
  displayName: string;
  pronouns: string;
  profilePicture: string;
  preferredGenres: string[];
  praiseStyle: PraiseStyle;
  dailyReadingGoal: ReadingGoal;
  role: UserRole;
  email: string;
  settings: UserSettings;
  clubs: string[];
  createdAt: Date;
}

export interface UserSettings {
  mode: 'nsfw' | 'sfw' | 'auto';
  voiceProfile: VoiceStyle;
  spiceTolerance: number;
  autoSwitchWorkHours?: {
    start: string;
    end: string;
  };
  notifications: {
    readingReminders: boolean;
    clubUpdates: boolean;
    achievements: boolean;
  };
}

interface BookClub {
  id: string;
  name: string;
  description: string;
  hostId: string;
  members: string[];
  currentBook?: string;
  readingGoal?: {
    startDate: Date;
    endDate: Date;
    pagesPerDay: number;
  };
  isNSFW: boolean;
  createdAt: Date;
}

interface ClubMessage {
  id: string;
  clubId: string;
  userId: string;
  content: string;
  isNSFW: boolean;
  hasSpoilers: boolean;
  reactions: {
    userId: string;
    emoji: string;
  }[];
  createdAt: Date;
}

type PraiseStyle = 'flirty' | 'funny' | 'wholesome' | 'dominant' | 'submissive';

export interface ReadingGoal {
  type: 'minutes' | 'chapters' | 'pages';
  amount: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  totalPages: number;
  currentPage: number;
  spiceRating: number; // 0-5
  tropes: string[];
  status: 'currentlyReading' | 'wantToRead' | 'finished' | 'dnf';
  spicyScenes: SpicyScene[];
  // Additional fields from Google Books API
  description?: string;
  publishedDate?: string;
  isbn?: string;
  language?: string;
  averageRating?: number;
  ratingsCount?: number;
}

interface SpicyScene {
  id: string;
  page: number;
  rating: number; // 0-5
  note?: string;
}

interface ReadingSession {
  id: string;
  bookId: string;
  startTime: Date;
  endTime?: Date;
  pagesRead?: number;
  minutesRead?: number;
}