-- Arithmetica Database Schema
-- Run this in Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('tutor', 'student', 'parent');
CREATE TYPE lesson_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE resource_type AS ENUM ('pdf', 'video', 'link', 'document');
CREATE TYPE item_category AS ENUM ('hair', 'outfit', 'accessory', 'background', 'special');
CREATE TYPE item_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  year_group TEXT NOT NULL,
  subjects TEXT[] DEFAULT '{}',
  overall_progress INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  avatar_items JSONB DEFAULT '{"hair": null, "outfit": null, "accessory": null, "background": null}',
  achievements TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parents table
CREATE TABLE parents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  student_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status lesson_status DEFAULT 'scheduled',
  notes TEXT,
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources table
CREATE TABLE resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type resource_type NOT NULL,
  url TEXT NOT NULL,
  subject TEXT NOT NULL,
  year_group TEXT NOT NULL,
  assigned_to UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments table
CREATE TABLE assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  date DATE NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop items table
CREATE TABLE shop_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category item_category NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  rarity item_rarity DEFAULT 'common',
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student purchases table
CREATE TABLE student_purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, item_id)
);

-- Achievements table
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature settings table (tutor-level feature toggles)
CREATE TABLE feature_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tutor_id, feature_name)
);

-- Student feature overrides (per-student feature toggles)
CREATE TABLE student_feature_overrides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, feature_name)
);

-- Progress history table (for charts)
CREATE TABLE progress_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_students_tutor ON students(tutor_id);
CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_lessons_tutor ON lessons(tutor_id);
CREATE INDEX idx_lessons_student ON lessons(student_id);
CREATE INDEX idx_lessons_date ON lessons(date);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_resources_tutor ON resources(tutor_id);
CREATE INDEX idx_assessments_student ON assessments(student_id);
CREATE INDEX idx_progress_student ON progress_history(student_id);
CREATE INDEX idx_feature_settings_tutor ON feature_settings(tutor_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_feature_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Tutors can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'tutor')
  );

-- Students policies
CREATE POLICY "Tutors can manage their students" ON students
  FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Students can view their own record" ON students
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Parents can view their children" ON students
  FOR SELECT USING (
    id = ANY(
      SELECT unnest(student_ids) FROM parents WHERE user_id = auth.uid()
    )
  );

-- Lessons policies
CREATE POLICY "Tutors can manage their lessons" ON lessons
  FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Students can view their lessons" ON lessons
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view children's lessons" ON parents
  FOR SELECT USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can mark messages as read" ON messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- Resources policies
CREATE POLICY "Tutors can manage resources" ON resources
  FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Students can view assigned resources" ON resources
  FOR SELECT USING (
    (SELECT id FROM students WHERE user_id = auth.uid()) = ANY(assigned_to)
    OR array_length(assigned_to, 1) IS NULL
  );

-- Assessments policies
CREATE POLICY "Tutors can manage assessments" ON assessments
  FOR ALL USING (tutor_id = auth.uid());

CREATE POLICY "Students can view their assessments" ON assessments
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Shop items policies (public read, tutor write)
CREATE POLICY "Anyone can view shop items" ON shop_items
  FOR SELECT USING (available = true);

CREATE POLICY "Tutors can manage shop items" ON shop_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'tutor')
  );

-- Student purchases policies
CREATE POLICY "Students can view their purchases" ON student_purchases
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Students can make purchases" ON student_purchases
  FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Feature settings policies
CREATE POLICY "Tutors can manage their feature settings" ON feature_settings
  FOR ALL USING (tutor_id = auth.uid());

-- Student feature overrides policies
CREATE POLICY "Tutors can manage student feature overrides" ON student_feature_overrides
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE tutor_id = auth.uid())
  );

-- Progress history policies
CREATE POLICY "Tutors can manage progress history" ON progress_history
  FOR ALL USING (
    student_id IN (SELECT id FROM students WHERE tutor_id = auth.uid())
  );

CREATE POLICY "Students can view their progress" ON progress_history
  FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can view children's progress" ON progress_history
  FOR SELECT USING (
    student_id = ANY(
      SELECT unnest(student_ids) FROM parents WHERE user_id = auth.uid()
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_feature_settings_updated_at BEFORE UPDATE ON feature_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert default achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, points_reward) VALUES
  ('First Steps', 'Complete your first lesson', 'Star', 'lessons_completed', 1, 50),
  ('Week Warrior', 'Maintain a 7-day streak', 'Flame', 'streak_days', 7, 100),
  ('Perfect Score', 'Get 100% on an assessment', 'Trophy', 'perfect_scores', 1, 150),
  ('Bookworm', 'Complete 10 lessons', 'BookOpen', 'lessons_completed', 10, 200),
  ('Math Master', 'Complete 20 maths lessons', 'Calculator', 'maths_lessons', 20, 300),
  ('Rising Star', 'Earn 1000 points', 'Sparkles', 'total_points', 1000, 250),
  ('Dedicated Learner', 'Maintain a 30-day streak', 'Award', 'streak_days', 30, 500),
  ('Subject Expert', 'Score 90%+ on 5 assessments', 'GraduationCap', 'high_scores', 5, 400);

-- Insert default shop items
INSERT INTO shop_items (name, description, category, price, image_url, rarity) VALUES
  ('Cosmic Blue Hair', 'A stunning blue hairstyle with star sparkles', 'hair', 100, '/avatars/hair/cosmic-blue.png', 'common'),
  ('Golden Crown', 'A majestic crown for top achievers', 'accessory', 500, '/avatars/accessories/golden-crown.png', 'legendary'),
  ('Space Suit', 'Official Arithmetica astronaut suit', 'outfit', 300, '/avatars/outfits/space-suit.png', 'rare'),
  ('Nebula Background', 'A beautiful nebula backdrop', 'background', 200, '/avatars/backgrounds/nebula.png', 'rare'),
  ('Star Glasses', 'Cool star-shaped glasses', 'accessory', 75, '/avatars/accessories/star-glasses.png', 'common'),
  ('Galaxy Hair', 'Hair with swirling galaxy patterns', 'hair', 250, '/avatars/hair/galaxy.png', 'epic'),
  ('Rocket Backpack', 'A jetpack for the ambitious learner', 'accessory', 400, '/avatars/accessories/rocket-backpack.png', 'epic'),
  ('Constellation Outfit', 'Clothing with constellation patterns', 'outfit', 150, '/avatars/outfits/constellation.png', 'common');

-- Insert default feature settings for demo
-- (These will be created per-tutor when they sign up)
