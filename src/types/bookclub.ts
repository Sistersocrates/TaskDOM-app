// Book Club Types

export interface BookClub {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  is_private: boolean;
  max_members: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  current_book?: ClubBook;
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user?: {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export interface ClubBook {
  id: string;
  club_id: string;
  book_title: string;
  book_author?: string;
  book_isbn?: string;
  book_cover_url?: string;
  total_pages?: number;
  start_date?: string;
  target_end_date?: string;
  status: 'upcoming' | 'current' | 'completed';
  created_at: string;
}

export interface ClubMessage {
  id: string;
  club_id: string;
  user_id: string;
  content: string;
  is_nsfw: boolean;
  reply_to?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  reply_to_message?: ClubMessage;
}

export interface ClubDiscussion {
  id: string;
  club_id: string;
  book_id?: string;
  user_id: string;
  title?: string;
  content: string;
  chapter_number?: number;
  is_nsfw: boolean;
  has_spoilers: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  book?: ClubBook;
  user_has_liked?: boolean;
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  is_nsfw: boolean;
  has_spoilers: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  user_has_liked?: boolean;
}

export interface ClubMeeting {
  id: string;
  club_id: string;
  book_id?: string;
  title: string;
  description?: string;
  meeting_date: string;
  duration_minutes: number;
  meeting_url?: string;
  meeting_type: 'virtual' | 'in-person' | 'hybrid';
  location?: string;
  max_attendees?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  book?: ClubBook;
  attendee_count?: number;
  user_attendance_status?: 'pending' | 'attending' | 'not_attending' | 'maybe';
}

export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  user_id: string;
  status: 'pending' | 'attending' | 'not_attending' | 'maybe';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export interface ReadingProgress {
  id: string;
  club_id: string;
  book_id: string;
  user_id: string;
  current_page: number;
  progress_percentage: number;
  last_read_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  book?: ClubBook;
}

export interface ClubInvitation {
  id: string;
  club_id: string;
  invited_by: string;
  invited_user_id?: string;
  email?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
  updated_at: string;
  club?: BookClub;
  invited_by_user?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export interface ReadingChallenge {
  id: string;
  club_id: string;
  title: string;
  description?: string;
  challenge_type: 'pages_per_day' | 'finish_by_date' | 'reading_streak';
  target_value: number;
  start_date: string;
  end_date: string;
  reward_description?: string;
  created_by: string;
  created_at: string;
  participant_count?: number;
  user_participation?: ChallengeParticipant;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string;
  joined_at: string;
  user?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
}

// Form types for creating/updating
export interface CreateBookClubForm {
  name: string;
  description?: string;
  cover_image_url?: string;
  is_private: boolean;
  max_members: number;
}

export interface CreateClubBookForm {
  book_title: string;
  book_author?: string;
  book_isbn?: string;
  book_cover_url?: string;
  total_pages?: number;
  start_date?: string;
  target_end_date?: string;
}

export interface CreateMeetingForm {
  title: string;
  description?: string;
  meeting_date: string;
  duration_minutes: number;
  meeting_url?: string;
  meeting_type: 'virtual' | 'in-person' | 'hybrid';
  location?: string;
  max_attendees?: number;
  book_id?: string;
}

export interface CreateDiscussionForm {
  title?: string;
  content: string;
  chapter_number?: number;
  is_nsfw: boolean;
  has_spoilers: boolean;
  book_id?: string;
}

export interface UpdateProgressForm {
  current_page: number;
  notes?: string;
}

// API response types
export interface BookClubsResponse {
  data: BookClub[];
  count: number;
}

export interface ClubMembersResponse {
  data: ClubMember[];
  count: number;
}

export interface ClubMessagesResponse {
  data: ClubMessage[];
  count: number;
}

export interface ClubDiscussionsResponse {
  data: ClubDiscussion[];
  count: number;
}

