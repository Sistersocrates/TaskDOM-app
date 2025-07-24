-- Book Clubs Database Schema

-- Book clubs table
CREATE TABLE book_clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 50,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Club members table
CREATE TABLE club_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, user_id)
);

-- Club books table (books being read by the club)
CREATE TABLE club_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES book_clubs(id) ON DELETE CASCADE,
  book_title VARCHAR(255) NOT NULL,
  book_author VARCHAR(255),
  book_isbn VARCHAR(20),
  book_cover_url TEXT,
  total_pages INTEGER,
  start_date DATE,
  target_end_date DATE,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'current', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Club messages (chat)
CREATE TABLE club_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_nsfw BOOLEAN DEFAULT false,
  reply_to UUID REFERENCES club_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Club discussions (chapter-based discussions)
CREATE TABLE club_discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES book_clubs(id) ON DELETE CASCADE,
  book_id UUID REFERENCES club_books(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  chapter_number INTEGER,
  is_nsfw BOOLEAN DEFAULT false,
  has_spoilers BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion replies
CREATE TABLE discussion_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES club_discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_nsfw BOOLEAN DEFAULT false,
  has_spoilers BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion likes
CREATE TABLE discussion_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID REFERENCES club_discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(discussion_id, user_id)
);

-- Reply likes
CREATE TABLE reply_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- Club meetings
CREATE TABLE club_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES book_clubs(id) ON DELETE CASCADE,
  book_id UUID REFERENCES club_books(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_url TEXT,
  meeting_type VARCHAR(20) DEFAULT 'virtual' CHECK (meeting_type IN ('virtual', 'in-person', 'hybrid')),
  location TEXT,
  max_attendees INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting attendees
CREATE TABLE meeting_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES club_meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'attending', 'not_attending', 'maybe')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meeting_id, user_id)
);

-- Reading progress tracking
CREATE TABLE reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES book_clubs(id) ON DELETE CASCADE,
  book_id UUID REFERENCES club_books(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  last_read_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(club_id, book_id, user_id)
);

-- Club invitations
CREATE TABLE club_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES book_clubs(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading challenges
CREATE TABLE reading_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES book_clubs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  challenge_type VARCHAR(50) NOT NULL, -- 'pages_per_day', 'finish_by_date', 'reading_streak'
  target_value INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reward_description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge participants
CREATE TABLE challenge_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES reading_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_club_members_club_id ON club_members(club_id);
CREATE INDEX idx_club_members_user_id ON club_members(user_id);
CREATE INDEX idx_club_books_club_id ON club_books(club_id);
CREATE INDEX idx_club_messages_club_id ON club_messages(club_id);
CREATE INDEX idx_club_messages_created_at ON club_messages(created_at);
CREATE INDEX idx_club_discussions_club_id ON club_discussions(club_id);
CREATE INDEX idx_club_discussions_book_id ON club_discussions(book_id);
CREATE INDEX idx_reading_progress_club_book_user ON reading_progress(club_id, book_id, user_id);
CREATE INDEX idx_club_meetings_club_id ON club_meetings(club_id);
CREATE INDEX idx_club_meetings_date ON club_meetings(meeting_date);

-- Enable Row Level Security
ALTER TABLE book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Book clubs: Users can see public clubs and clubs they're members of
CREATE POLICY "Users can view public clubs and their own clubs" ON book_clubs
  FOR SELECT USING (
    NOT is_private OR 
    id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create clubs" ON book_clubs
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Club admins can update clubs" ON book_clubs
  FOR UPDATE USING (
    id IN (
      SELECT club_id FROM club_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Club members: Users can see members of clubs they belong to
CREATE POLICY "Users can view club members" ON club_members
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join clubs" ON club_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Club messages: Users can see messages from clubs they're members of
CREATE POLICY "Users can view club messages" ON club_messages
  FOR SELECT USING (
    club_id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send messages to their clubs" ON club_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    club_id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid())
  );

-- Similar policies for other tables...
-- (Additional RLS policies would be added for all tables following the same pattern)

