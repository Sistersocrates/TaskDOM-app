-- Praise System Database Schema for TaskDOM
-- This migration creates tables for the comprehensive praise system

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Praise Scripts Table
CREATE TABLE IF NOT EXISTS praise_scripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL, -- 'dominant_dirty', 'flirty_fun', 'achievement', 'book_club', etc.
    sub_category TEXT NOT NULL, -- 'achievement_based', 'soft_seductive', etc.
    vibe_tone TEXT NOT NULL, -- 'possessive_commanding', 'playful_charming', etc.
    script_text TEXT NOT NULL, -- The actual praise text
    audio_url TEXT, -- Optional audio file URL for voice praise
    trigger_type TEXT NOT NULL, -- 'task_completion', 'reading_milestone', 'button_click', etc.
    is_nsfw BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Praise Preferences Table
CREATE TABLE IF NOT EXISTS user_praise_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_categories TEXT[] DEFAULT ARRAY['flirty_fun'], -- Array of preferred categories
    delivery_method TEXT DEFAULT 'text', -- 'text', 'audio', 'both'
    frequency_setting TEXT DEFAULT 'normal', -- 'high', 'normal', 'low', 'milestone_only'
    voice_enabled BOOLEAN DEFAULT false,
    voice_type TEXT DEFAULT 'female_voice', -- 'male_voice', 'female_voice'
    nsfw_enabled BOOLEAN DEFAULT false,
    trigger_preferences JSONB DEFAULT '{}', -- Custom trigger settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Praise History Table (track what praise was given when)
CREATE TABLE IF NOT EXISTS praise_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    praise_script_id UUID REFERENCES praise_scripts(id) ON DELETE CASCADE,
    trigger_event TEXT NOT NULL, -- What triggered the praise
    trigger_context JSONB, -- Additional context about the trigger
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_method TEXT NOT NULL, -- How it was delivered
    user_reaction TEXT, -- 'liked', 'dismissed', 'loved', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Praise Triggers Table (define when praise should be triggered)
CREATE TABLE IF NOT EXISTS praise_triggers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trigger_name TEXT NOT NULL UNIQUE, -- 'task_completion', 'reading_milestone', etc.
    trigger_description TEXT,
    default_enabled BOOLEAN DEFAULT true,
    trigger_config JSONB DEFAULT '{}', -- Configuration for the trigger
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_praise_scripts_category ON praise_scripts(category);
CREATE INDEX IF NOT EXISTS idx_praise_scripts_trigger_type ON praise_scripts(trigger_type);
CREATE INDEX IF NOT EXISTS idx_praise_scripts_active ON praise_scripts(is_active);
CREATE INDEX IF NOT EXISTS idx_user_praise_preferences_user_id ON user_praise_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_praise_history_user_id ON praise_history(user_id);
CREATE INDEX IF NOT EXISTS idx_praise_history_delivered_at ON praise_history(delivered_at);

-- Enable Row Level Security
ALTER TABLE praise_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_praise_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE praise_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE praise_triggers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Praise Scripts: Everyone can read active scripts
CREATE POLICY "Anyone can read active praise scripts" ON praise_scripts
    FOR SELECT USING (is_active = true);

-- User Praise Preferences: Users can only access their own preferences
CREATE POLICY "Users can view own praise preferences" ON user_praise_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own praise preferences" ON user_praise_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own praise preferences" ON user_praise_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Praise History: Users can only access their own history
CREATE POLICY "Users can view own praise history" ON praise_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own praise history" ON praise_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own praise history" ON praise_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Praise Triggers: Everyone can read
CREATE POLICY "Anyone can read praise triggers" ON praise_triggers
    FOR SELECT USING (true);

-- Insert default praise triggers
INSERT INTO praise_triggers (trigger_name, trigger_description, default_enabled, trigger_config) VALUES
('task_completion', 'When a user completes any task', true, '{"frequency": "normal"}'),
('reading_milestone', 'When a user reaches reading milestones', true, '{"milestones": [10, 25, 50, 100]}'),
('book_completion', 'When a user finishes reading a book', true, '{"frequency": "always"}'),
('daily_login', 'When a user logs in daily', true, '{"frequency": "once_per_day"}'),
('reading_streak', 'When a user maintains reading streaks', true, '{"streak_days": [3, 7, 14, 30]}'),
('book_club_participation', 'When a user participates in book clubs', true, '{"actions": ["join", "post", "meeting_attend"]}'),
('button_interaction', 'For button clicks and UI interactions', true, '{"frequency": "low"}'),
('achievement_unlock', 'When a user unlocks achievements', true, '{"frequency": "always"}'),
('progress_update', 'When a user updates reading progress', true, '{"frequency": "normal"}'),
('voice_praise_request', 'When a user specifically requests voice praise', true, '{"frequency": "always"}')
ON CONFLICT (trigger_name) DO NOTHING;

-- Insert sample praise scripts from the Google Sheets data
INSERT INTO praise_scripts (category, sub_category, vibe_tone, script_text, trigger_type, is_nsfw) VALUES

-- Dominant & Dirty Praise
('dominant_dirty', 'achievement_based', 'possessive_commanding', 'Good girl. You didn''t stop until it was done.', 'task_completion', true),
('dominant_dirty', 'achievement_based', 'possessive_commanding', 'Look at you, devouring those pages. Hungry little thing.', 'reading_milestone', true),
('dominant_dirty', 'achievement_based', 'possessive_commanding', 'You obeyed. I like that.', 'task_completion', true),
('dominant_dirty', 'achievement_based', 'possessive_commanding', 'Every time you finish a task, you make it harder for me to behave.', 'task_completion', true),
('dominant_dirty', 'achievement_based', 'possessive_commanding', 'You''re getting off on praise, aren''t you?', 'achievement_unlock', true),
('dominant_dirty', 'achievement_based', 'possessive_commanding', 'Such discipline... I might reward you for that.', 'reading_streak', true),

('dominant_dirty', 'soft_seductive', 'gentle_dominance', 'You''re so good for me, baby.', 'task_completion', true),
('dominant_dirty', 'soft_seductive', 'gentle_dominance', 'Just like that. That''s how I want you to finish.', 'book_completion', true),
('dominant_dirty', 'soft_seductive', 'gentle_dominance', 'Sweet thing... you make obedience look so good.', 'reading_milestone', true),
('dominant_dirty', 'soft_seductive', 'gentle_dominance', 'Every time you listen, I fall a little deeper.', 'task_completion', true),
('dominant_dirty', 'soft_seductive', 'gentle_dominance', 'You make me want to turn the world for you.', 'achievement_unlock', true),

('dominant_dirty', 'dark_fantasy', 'morally_gray', 'You disobeyed. Want to tell me why, or should I enjoy the punishment?', 'task_completion', true),
('dominant_dirty', 'dark_fantasy', 'morally_gray', 'I warned you I''d ruin you. And still, you keep proving me right.', 'reading_streak', true),
('dominant_dirty', 'dark_fantasy', 'morally_gray', 'Your devotion tastes like sin — and I''m starving.', 'book_completion', true),
('dominant_dirty', 'dark_fantasy', 'morally_gray', 'Be a good girl and finish that task for me.', 'task_completion', true),
('dominant_dirty', 'dark_fantasy', 'morally_gray', 'That''s what I thought. Obedient little thing.', 'achievement_unlock', true),

-- Flirty & Fun Praise
('flirty_fun', 'achievement_based', 'playful_charming', 'You''re turning pages and turning me on.', 'reading_milestone', false),
('flirty_fun', 'achievement_based', 'playful_charming', 'Another chapter down? Babe, you''re doing so good.', 'progress_update', false),
('flirty_fun', 'achievement_based', 'playful_charming', 'You just climaxed—your reading goal, I mean. Obviously.', 'reading_milestone', false),
('flirty_fun', 'achievement_based', 'playful_charming', 'You keep finishing tasks like that, and I might start calling you my favorite.', 'task_completion', false),
('flirty_fun', 'achievement_based', 'playful_charming', 'Ooh, that was hot... your productivity, I mean. Or was it?', 'task_completion', false),
('flirty_fun', 'achievement_based', 'playful_charming', 'Well well well, if it isn''t the main character finally getting things done.', 'achievement_unlock', false),

('flirty_fun', 'cheeky_puns', 'fun_suggestive', 'That''s the energy I like.', 'task_completion', false),
('flirty_fun', 'cheeky_puns', 'fun_suggestive', 'If you keep performing like this, I''m gonna need a cold shower — or a reread.', 'reading_streak', false),
('flirty_fun', 'cheeky_puns', 'fun_suggestive', 'That brain? That drive? You''re the full package, Love.', 'achievement_unlock', false),
('flirty_fun', 'cheeky_puns', 'fun_suggestive', 'Get back in the saddle — this isn''t your DNF era.', 'daily_login', false),
('flirty_fun', 'cheeky_puns', 'fun_suggestive', 'Let''s spice up your TBR and your to-do list.', 'task_completion', false),

('flirty_fun', 'sassy_encouragement', 'playful_pushing', 'Babe, you better finish that goal, baby', 'reading_milestone', false),
('flirty_fun', 'sassy_encouragement', 'playful_pushing', 'Don''t go quiet on me. That''s how my girl gets captured.', 'daily_login', false),
('flirty_fun', 'sassy_encouragement', 'playful_pushing', 'You''re doing amazing, sweetie.', 'task_completion', false),
('flirty_fun', 'sassy_encouragement', 'playful_pushing', 'You''re like the cinnamon roll in the streets, feral in the spreadsheets.', 'achievement_unlock', false),
('flirty_fun', 'sassy_encouragement', 'playful_pushing', 'Look at you, rising and grinding. I''d swipe right on that hustle.', 'reading_streak', false),

('flirty_fun', 'wholesome_flirty', 'gentle_cute', 'You''re glowing like you just hit a streak.', 'reading_streak', false),
('flirty_fun', 'wholesome_flirty', 'gentle_cute', 'You''re the main character. I''m just here to cheer my girl on.', 'achievement_unlock', false),
('flirty_fun', 'wholesome_flirty', 'gentle_cute', 'You''re on fire.', 'task_completion', false),

-- Mini Praise Clips for buttons
('flirty_fun', 'mini_clips', 'short_buttons', 'You''re on fire.', 'button_interaction', false),
('flirty_fun', 'mini_clips', 'short_buttons', 'Main character energy!', 'button_interaction', false),
('flirty_fun', 'mini_clips', 'short_buttons', 'Hot AND productive!', 'button_interaction', false),
('flirty_fun', 'mini_clips', 'short_buttons', 'Getting things done is a sexy look on you.', 'button_interaction', false),
('flirty_fun', 'mini_clips', 'short_buttons', 'That''s so sexy of you.', 'button_interaction', false),

-- Bookish Flirt Tropes
('flirty_fun', 'bookish_tropes', 'easter_eggs', 'Enemies to lovers? More like me and your progress.', 'reading_milestone', false),
('flirty_fun', 'bookish_tropes', 'easter_eggs', 'I''d slow burn with you any day.', 'book_completion', false),
('flirty_fun', 'bookish_tropes', 'easter_eggs', 'Touch her reading list and die.', 'task_completion', false),
('flirty_fun', 'bookish_tropes', 'easter_eggs', 'Fake dating your motivation? Looks real to me.', 'achievement_unlock', false),
('flirty_fun', 'bookish_tropes', 'easter_eggs', 'I''m morally gray.', 'daily_login', false),

-- Book Club specific praise
('book_club', 'participation', 'community_building', 'Look at you building that reading community!', 'book_club_participation', false),
('book_club', 'participation', 'community_building', 'Your book club discussions are fire.', 'book_club_participation', false),
('book_club', 'participation', 'community_building', 'Leading by example in your book club.', 'book_club_participation', false),
('book_club', 'participation', 'community_building', 'Your insights are making everyone think deeper.', 'book_club_participation', false),

-- Reading Analytics praise
('analytics', 'progress_tracking', 'data_appreciation', 'Those reading stats are looking spicy.', 'progress_update', false),
('analytics', 'progress_tracking', 'data_appreciation', 'Your reading consistency is so attractive.', 'reading_streak', false),
('analytics', 'progress_tracking', 'data_appreciation', 'Data never looked so good.', 'achievement_unlock', false),
('analytics', 'progress_tracking', 'data_appreciation', 'Your progress chart is a work of art.', 'reading_milestone', false),

-- General app usage
('general', 'app_mastery', 'user_appreciation', 'You''re mastering this app like a pro.', 'daily_login', false),
('general', 'app_mastery', 'user_appreciation', 'Your reading journey is inspiring.', 'achievement_unlock', false),
('general', 'app_mastery', 'user_appreciation', 'Every login makes me happy.', 'daily_login', false),
('general', 'app_mastery', 'user_appreciation', 'You''re making the most of every feature.', 'task_completion', false);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_praise_scripts_updated_at BEFORE UPDATE ON praise_scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_praise_preferences_updated_at BEFORE UPDATE ON user_praise_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

