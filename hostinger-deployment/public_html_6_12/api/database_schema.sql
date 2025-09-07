-- XSM Market Database Schema
-- This SQL creates all the necessary tables for the PHP backend

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `fullName` varchar(100) DEFAULT '',
  `phone` varchar(20) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `profilePicture` text DEFAULT NULL,
  `googleId` varchar(255) DEFAULT NULL,
  `authProvider` enum('email','google') NOT NULL DEFAULT 'email',
  `isEmailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `emailOTP` varchar(10) DEFAULT NULL,
  `otpExpires` datetime DEFAULT NULL,
  `passwordResetToken` varchar(255) DEFAULT NULL,
  `passwordResetExpires` datetime DEFAULT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT 0,
  `isBanned` tinyint(1) NOT NULL DEFAULT 0,
  `banReason` text DEFAULT NULL,
  `bannedAt` datetime DEFAULT NULL,
  `bannedBy` int(11) DEFAULT NULL,
  `unbannedAt` datetime DEFAULT NULL,
  `unbannedBy` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `googleId` (`googleId`),
  KEY `isEmailVerified` (`isEmailVerified`),
  KEY `isAdmin` (`isAdmin`),
  KEY `isBanned` (`isBanned`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ads table
CREATE TABLE IF NOT EXISTS `ads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `channelUrl` varchar(500) NOT NULL,
  `platform` enum('facebook','instagram','twitter','tiktok','youtube') NOT NULL,
  `category` varchar(100) NOT NULL,
  `contentType` enum('Unique content','Rewritten','Not unique content','Mixed') DEFAULT NULL,
  `contentCategory` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `subscribers` int(11) DEFAULT 0,
  `monthlyIncome` decimal(10,2) DEFAULT 0.00,
  `isMonetized` tinyint(1) NOT NULL DEFAULT 0,
  `incomeDetails` text DEFAULT NULL,
  `promotionDetails` text DEFAULT NULL,
  `status` enum('active','pending','sold','suspended','rejected') NOT NULL DEFAULT 'active',
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `premium` tinyint(1) NOT NULL DEFAULT 0,
  `views` int(11) NOT NULL DEFAULT 0,
  `totalViews` bigint(20) DEFAULT 0,
  `rating` decimal(2,1) DEFAULT 0.0,
  `thumbnail` text DEFAULT NULL,
  `screenshots` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `socialBladeUrl` varchar(500) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `sellCondition` text DEFAULT NULL,
  `soldTo` int(11) DEFAULT NULL,
  `soldAt` datetime DEFAULT NULL,
  `pinned` tinyint(1) NOT NULL DEFAULT 0,
  `pinnedAt` datetime DEFAULT NULL,
  `lastPulledAt` datetime DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `approvedBy` int(11) DEFAULT NULL,
  `rejectedAt` datetime DEFAULT NULL,
  `rejectedBy` int(11) DEFAULT NULL,
  `rejectionReason` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `platform` (`platform`),
  KEY `category` (`category`),
  KEY `status` (`status`),
  KEY `price` (`price`),
  KEY `createdAt` (`createdAt`),
  KEY `soldTo` (`soldTo`),
  CONSTRAINT `ads_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ads_ibfk_2` FOREIGN KEY (`soldTo`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chats table
CREATE TABLE IF NOT EXISTS `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('direct','group','ad_inquiry') NOT NULL DEFAULT 'direct',
  `name` varchar(255) DEFAULT NULL,
  `adId` int(11) DEFAULT NULL,
  `lastMessage` text DEFAULT NULL,
  `lastMessageTime` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `adId` (`adId`),
  KEY `lastMessageTime` (`lastMessageTime`),
  CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`adId`) REFERENCES `ads` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat participants table
CREATE TABLE IF NOT EXISTS `chat_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chatId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `role` enum('admin','member') NOT NULL DEFAULT 'member',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `joinedAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `lastSeenAt` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `chat_user_unique` (`chatId`,`userId`),
  KEY `chatId` (`chatId`),
  KEY `userId` (`userId`),
  KEY `isActive` (`isActive`),
  CONSTRAINT `chat_participants_ibfk_1` FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_participants_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chatId` int(11) NOT NULL,
  `senderId` int(11) NOT NULL,
  `content` text NOT NULL,
  `messageType` enum('text','image','file','system') NOT NULL DEFAULT 'text',
  `replyToId` int(11) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `chatId` (`chatId`),
  KEY `senderId` (`senderId`),
  KEY `replyToId` (`replyToId`),
  KEY `isRead` (`isRead`),
  KEY `createdAt` (`createdAt`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`replyToId`) REFERENCES `messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX `idx_users_email_verified` ON `users` (`email`, `isEmailVerified`);
CREATE INDEX `idx_ads_status_platform` ON `ads` (`status`, `platform`);
CREATE INDEX `idx_ads_user_status` ON `ads` (`userId`, `status`);
CREATE INDEX `idx_messages_chat_created` ON `messages` (`chatId`, `createdAt`);
CREATE INDEX `idx_chat_participants_user_active` ON `chat_participants` (`userId`, `isActive`);

-- Insert a default admin user (password: admin123 - change this!)
INSERT INTO `users` (`username`, `email`, `password`, `fullName`, `isEmailVerified`, `isAdmin`, `authProvider`) VALUES
('admin', 'admin@xsmmarket.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 1, 1, 'email');

-- Sample categories and platforms data can be added here if needed
