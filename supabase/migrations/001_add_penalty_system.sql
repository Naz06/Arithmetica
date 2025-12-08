-- Migration: Add Penalty System Columns
-- This migration adds columns required for the gamification penalty system

-- Add penalty-related columns to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS penalty_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS low_engagement_weeks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS missed_sessions_count INTEGER DEFAULT 0;

-- Add weekly progress data column for Stellar Journey
ALTER TABLE students
ADD COLUMN IF NOT EXISTS weekly_progress JSONB DEFAULT '[]';

-- Add columns for student stats that may be missing
ALTER TABLE students
ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_assignments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS attendance_rate INTEGER DEFAULT 100;

-- Comment on the new columns
COMMENT ON COLUMN students.penalty_history IS 'JSON array of penalty records for gamification system';
COMMENT ON COLUMN students.low_engagement_weeks IS 'Count of consecutive low engagement weeks';
COMMENT ON COLUMN students.missed_sessions_count IS 'Count of missed tutoring sessions';
COMMENT ON COLUMN students.weekly_progress IS 'JSON array of weekly progress data for Stellar Journey visualization';
