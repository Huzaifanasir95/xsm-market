-- XSM Market Database Schema
-- Generated on: July 27, 2025
-- Database: xsm_market_local

-- =============================================================================
-- TABLE: users
-- Purpose: Store user account information and authentication data
-- =============================================================================
CREATE TABLE `users` (
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
  KEY `isBanned` (`isBanned`),
  KEY `idx_users_email_verified` (`email`,`isEmailVerified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: ads
-- Purpose: Store social media channel listings for sale
-- =============================================================================
CREATE TABLE `ads` (
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
  `screenshots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`screenshots`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `socialBladeUrl` varchar(500) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `sellCondition` text DEFAULT NULL,
  `soldTo` int(11) DEFAULT NULL,
  `soldAt` datetime DEFAULT NULL,
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
  KEY `idx_ads_status_platform` (`status`,`platform`),
  KEY `idx_ads_user_status` (`userId`,`status`),
  CONSTRAINT `ads_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ads_ibfk_2` FOREIGN KEY (`soldTo`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: chats
-- Purpose: Store chat conversations between users
-- =============================================================================
CREATE TABLE `chats` (
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

-- =============================================================================
-- TABLE: chat_participants
-- Purpose: Store which users participate in which chats
-- =============================================================================
CREATE TABLE `chat_participants` (
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
  KEY `idx_chat_participants_user_active` (`userId`,`isActive`),
  CONSTRAINT `chat_participants_ibfk_1` FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_participants_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: messages
-- Purpose: Store individual messages within chats
-- =============================================================================
CREATE TABLE `messages` (
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
  KEY `idx_messages_chat_created` (`chatId`,`createdAt`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`replyToId`) REFERENCES `messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: deals
-- Purpose: Store transaction deals between buyers and sellers
-- =============================================================================
CREATE TABLE `deals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(50) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `channel_id` varchar(255) NOT NULL,
  `channel_title` varchar(500) NOT NULL,
  `channel_price` decimal(10,2) NOT NULL,
  `escrow_fee` decimal(10,2) NOT NULL,
  `transaction_type` enum('safest','fastest') DEFAULT 'safest',
  `buyer_email` varchar(255) NOT NULL,
  `buyer_payment_methods` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`buyer_payment_methods`)),
  `seller_agreed` tinyint(1) DEFAULT 0,
  `seller_agreed_at` timestamp NULL DEFAULT NULL,
  `buyer_agreed` tinyint(1) DEFAULT 1,
  `buyer_agreed_at` timestamp NULL DEFAULT current_timestamp(),
  `deal_status` enum('pending','seller_reviewing','payment_negotiation','terms_agreed','fee_paid','agent_access_pending','agent_access_confirmed','waiting_promotion_timer','promotion_timer_complete','admin_ownership_confirmed','payment_pending','payment_completed','buyer_paid_seller','seller_confirmed_payment','admin_delivered_account','buyer_received_account','transfer_to_buyer_pending','completed','cancelled','disputed') DEFAULT 'pending',
  `chat_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `transaction_fee_paid` tinyint(1) DEFAULT 0,
  `transaction_fee_paid_at` timestamp NULL DEFAULT NULL,
  `transaction_fee_paid_by` enum('buyer','seller') DEFAULT NULL,
  `transaction_fee_payment_method` enum('stripe','crypto') DEFAULT NULL,
  `agent_email_sent` tinyint(1) DEFAULT 0,
  `agent_email_sent_at` timestamp NULL DEFAULT NULL,
  `seller_gave_rights` tinyint(1) DEFAULT 0,
  `seller_gave_rights_at` timestamp NULL DEFAULT NULL,
  `rights_timer_started_at` timestamp NULL DEFAULT NULL,
  `rights_timer_expires_at` timestamp NULL DEFAULT NULL,
  `timer_completed` tinyint(1) DEFAULT 0,
  `seller_made_primary_owner` tinyint(1) DEFAULT 0,
  `seller_made_primary_owner_at` timestamp NULL DEFAULT NULL,
  `platform_type` varchar(50) DEFAULT 'unknown',
  `buyer_paid_seller` tinyint(1) DEFAULT 0,
  `buyer_paid_seller_at` timestamp NULL DEFAULT NULL,
  `seller_confirmed_payment` tinyint(1) DEFAULT 0,
  `seller_confirmed_payment_at` timestamp NULL DEFAULT NULL,
  `admin_confirmed_ownership` tinyint(1) DEFAULT 0,
  `admin_confirmed_ownership_at` timestamp NULL DEFAULT NULL,
  `admin_transferred_to_buyer` tinyint(1) DEFAULT 0,
  `admin_transferred_to_buyer_at` timestamp NULL DEFAULT NULL,
  `rights_verified` tinyint(1) DEFAULT 0,
  `rights_verified_at` timestamp NULL DEFAULT NULL,
  `admin_delivered_account` tinyint(1) DEFAULT 0,
  `admin_delivered_account_at` timestamp NULL DEFAULT NULL,
  `buyer_received_account` tinyint(1) DEFAULT 0,
  `buyer_received_account_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `idx_transaction_id` (`transaction_id`),
  KEY `idx_buyer_id` (`buyer_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_deal_status` (`deal_status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_transaction_fee_paid` (`transaction_fee_paid`),
  KEY `idx_transaction_fee_paid_by` (`transaction_fee_paid_by`),
  KEY `idx_agent_email_sent` (`agent_email_sent`),
  KEY `idx_seller_gave_rights` (`seller_gave_rights`),
  KEY `idx_timer_completed` (`timer_completed`),
  KEY `idx_seller_made_primary_owner` (`seller_made_primary_owner`),
  KEY `idx_platform_type` (`platform_type`),
  KEY `idx_rights_timer_expires_at` (`rights_timer_expires_at`),
  KEY `idx_buyer_paid_seller` (`buyer_paid_seller`),
  CONSTRAINT `deals_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `deals_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: deal_history
-- Purpose: Store audit trail of all deal-related actions
-- =============================================================================
CREATE TABLE `deal_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deal_id` int(11) NOT NULL,
  `action_type` enum('created','seller_notified','seller_agreed','payment_method_negotiated','escrow_paid','channel_transferred','payment_completed','completed','cancelled','disputed','note_added','fee_paid','agent_email_sent','seller_gave_rights','timer_started','timer_completed','seller_made_primary_owner','buyer_paid_seller','seller_confirmed_payment','admin_delivered_account','buyer_received_account','deal_completed') NOT NULL,
  `action_by` int(11) NOT NULL,
  `action_description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `action_by` (`action_by`),
  KEY `idx_deal_id` (`deal_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `deal_history_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `deal_history_ibfk_2` FOREIGN KEY (`action_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: deal_payment_methods
-- Purpose: Store payment methods associated with deals
-- =============================================================================
CREATE TABLE `deal_payment_methods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deal_id` int(11) NOT NULL,
  `payment_method_id` varchar(50) NOT NULL,
  `payment_method_name` varchar(255) NOT NULL,
  `payment_method_category` enum('bank','digital','crypto','other') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_deal_payment` (`deal_id`,`payment_method_id`),
  KEY `idx_deal_id` (`deal_id`),
  KEY `idx_payment_method_id` (`payment_method_id`),
  CONSTRAINT `deal_payment_methods_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
