-- Add video support to messages table
ALTER TABLE `messages` 
MODIFY COLUMN `messageType` enum('text','image','video','file','system') NOT NULL DEFAULT 'text';

-- Add media-related columns if they don't exist
ALTER TABLE `messages` 
ADD COLUMN IF NOT EXISTS `mediaUrl` varchar(500) DEFAULT NULL AFTER `content`,
ADD COLUMN IF NOT EXISTS `fileName` varchar(255) DEFAULT NULL AFTER `mediaUrl`,
ADD COLUMN IF NOT EXISTS `fileSize` bigint DEFAULT NULL AFTER `fileName`,
ADD COLUMN IF NOT EXISTS `thumbnail` varchar(500) DEFAULT NULL AFTER `fileSize`;
