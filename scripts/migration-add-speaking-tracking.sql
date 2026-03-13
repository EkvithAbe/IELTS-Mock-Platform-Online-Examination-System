-- Migration: Add speaking completion and module attempt tracking
-- Date: 2026-01-08
-- Purpose: Add fields to track speaking test completion and module attempts for subscription restrictions

-- Add columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS modules_attempted JSON DEFAULT NULL COMMENT 'Tracks which modules have been attempted (listening, reading, writing, speaking)',
ADD COLUMN IF NOT EXISTS speaking_completed BOOLEAN DEFAULT FALSE COMMENT 'Tracks if speaking appointment has been completed',
ADD COLUMN IF NOT EXISTS speaking_completed_at DATETIME DEFAULT NULL COMMENT 'Timestamp when speaking was completed';

-- Create index for speaking_completed for faster queries
ALTER TABLE subscriptions ADD INDEX IF NOT EXISTS idx_speaking_completed (speaking_completed);

-- Add comments to existing columns for clarity
ALTER TABLE subscriptions
MODIFY COLUMN tests_allowed INT DEFAULT 1 COMMENT 'Number of unique module attempts allowed (4 for full_package)',
MODIFY COLUMN tests_used INT DEFAULT 0 COMMENT 'Number of unique modules attempted';
