-- Migration: Add Penalty and Bonus System Columns
-- This migration adds columns required for the gamification penalty and reward system

-- Add penalty-related columns to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS penalty_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS low_engagement_weeks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS missed_sessions_count INTEGER DEFAULT 0;

-- Add bonus/reward system columns
ALTER TABLE students
ADD COLUMN IF NOT EXISTS bonus_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS homework_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMPTZ;

-- Add weekly progress data column for Stellar Journey
ALTER TABLE students
ADD COLUMN IF NOT EXISTS weekly_progress JSONB DEFAULT '[]';

-- Add columns for student stats that may be missing
ALTER TABLE students
ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_assignments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attendance_rate INTEGER DEFAULT 100;

-- Add username column for leaderboard privacy
ALTER TABLE students
ADD COLUMN IF NOT EXISTS username VARCHAR(20);

-- Add Command Center / Space Shop columns
ALTER TABLE students
ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS equipped_items JSONB,
ADD COLUMN IF NOT EXISTS active_boosters JSONB DEFAULT '[]';

-- Add topic mastery tracking for Constellation Skill Tree
ALTER TABLE students
ADD COLUMN IF NOT EXISTS topic_mastery JSONB DEFAULT '[]';

-- Comment on the new columns
COMMENT ON COLUMN students.penalty_history IS 'JSON array of penalty records for gamification system';
COMMENT ON COLUMN students.low_engagement_weeks IS 'Count of consecutive low engagement weeks';
COMMENT ON COLUMN students.missed_sessions_count IS 'Count of missed tutoring sessions';
COMMENT ON COLUMN students.weekly_progress IS 'JSON array of weekly progress data for Stellar Journey visualization';
COMMENT ON COLUMN students.bonus_history IS 'JSON array of bonus/reward records for gamification system';
COMMENT ON COLUMN students.homework_streak IS 'Count of consecutive on-time homework submissions';
COMMENT ON COLUMN students.last_activity_date IS 'Last activity timestamp for streak detection';
COMMENT ON COLUMN students.username IS 'Public display name for leaderboard (privacy protection)';
COMMENT ON COLUMN students.inventory IS 'JSON array of owned item IDs from Command Center shop';
COMMENT ON COLUMN students.equipped_items IS 'JSON object of currently equipped items (title, frame, avatar, spaceship, celebration)';
COMMENT ON COLUMN students.active_boosters IS 'JSON array of currently active booster effects';
COMMENT ON COLUMN students.topic_mastery IS 'JSON array of topic mastery records for Constellation Skill Tree (updated by tutor)';
