-- Add file upload columns to messages table
ALTER TABLE `messages` ADD COLUMN `mediaUrl` varchar(500) DEFAULT NULL AFTER `messageType`;
ALTER TABLE `messages` ADD COLUMN `fileName` varchar(255) DEFAULT NULL AFTER `mediaUrl`;
ALTER TABLE `messages` ADD COLUMN `fileSize` int(11) DEFAULT NULL AFTER `fileName`;
ALTER TABLE `messages` ADD COLUMN `thumbnail` varchar(500) DEFAULT NULL AFTER `fileSize`;

-- Add index for media files
CREATE INDEX `idx_messages_media` ON `messages` (`messageType`, `mediaUrl`);
