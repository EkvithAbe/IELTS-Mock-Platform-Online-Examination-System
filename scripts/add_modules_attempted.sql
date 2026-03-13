-- Add modules_attempted column to subscriptions table
-- This tracks which specific module types have been attempted for full packages
ALTER TABLE subscriptions 
ADD COLUMN modules_attempted JSON DEFAULT NULL COMMENT 'Tracks which modules (listening/reading/writing/speaking) have been attempted';

-- Example data format: {"listening": true, "reading": true, "writing": false, "speaking": false}
