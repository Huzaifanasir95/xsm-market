-- Add pinned columns to ads table
ALTER TABLE ads
ADD COLUMN pinned TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN pinnedAt DATETIME NULL,
ADD COLUMN lastPulledAt DATETIME NULL;

-- Add index for pinned ads
ALTER TABLE ads ADD INDEX idx_pinned (pinned, createdAt);
ALTER TABLE ads ADD INDEX idx_lastPulledAt (lastPulledAt);
