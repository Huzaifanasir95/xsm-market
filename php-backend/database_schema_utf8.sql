/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: xsm_market_local
-- ------------------------------------------------------
-- Server version	11.8.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `ads`
--

DROP TABLE IF EXISTS `ads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `channelUrl` varchar(500) NOT NULL,
  `primary_image` longtext DEFAULT NULL,
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
  `screenshots` longtext DEFAULT NULL,
  `tags` longtext DEFAULT NULL,
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
  KEY `idx_userId` (`userId`),
  KEY `idx_platform` (`platform`),
  KEY `idx_category` (`category`),
  KEY `idx_price` (`price`),
  KEY `idx_status` (`status`),
  KEY `idx_soldTo` (`soldTo`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `idx_ads_platform_status` (`platform`,`status`),
  KEY `idx_ads_category_price` (`category`,`price`),
  CONSTRAINT `ads_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ads_ibfk_2` FOREIGN KEY (`soldTo`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chat_participants`
--

DROP TABLE IF EXISTS `chat_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  UNIQUE KEY `unique_chat_user` (`chatId`,`userId`),
  KEY `idx_chatId` (`chatId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_isActive` (`isActive`),
  CONSTRAINT `chat_participants_ibfk_1` FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_participants_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chats`
--

DROP TABLE IF EXISTS `chats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  KEY `idx_type` (`type`),
  KEY `idx_adId` (`adId`),
  KEY `idx_lastMessageTime` (`lastMessageTime`),
  CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`adId`) REFERENCES `ads` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `crypto_payments`
--

DROP TABLE IF EXISTS `crypto_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `crypto_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deal_id` int(11) NOT NULL,
  `nowpayments_payment_id` varchar(255) NOT NULL,
  `order_id` varchar(255) NOT NULL,
  `payment_status` enum('waiting','confirming','confirmed','sending','finished','failed','refunded','expired') NOT NULL,
  `price_amount` decimal(20,8) NOT NULL,
  `price_currency` varchar(10) NOT NULL DEFAULT 'usd',
  `actually_paid` decimal(20,8) DEFAULT NULL,
  `pay_currency` varchar(10) DEFAULT NULL,
  `outcome_amount` decimal(20,8) DEFAULT NULL,
  `outcome_currency` varchar(10) DEFAULT NULL,
  `payment_url` text DEFAULT NULL,
  `qr_code_url` text DEFAULT NULL,
  `webhook_data` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_nowpayments_payment_id` (`nowpayments_payment_id`),
  KEY `idx_deal_id` (`deal_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_payment_status` (`payment_status`),
  CONSTRAINT `crypto_payments_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `deal_history`
--

DROP TABLE IF EXISTS `deal_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `deal_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deal_id` int(11) NOT NULL,
  `action_type` enum('created','seller_notified','seller_agreed','payment_method_negotiated','escrow_paid','channel_transferred','payment_completed','completed','cancelled','disputed','note_added','fee_paid','agent_email_sent','seller_gave_rights','timer_started','timer_completed','seller_made_primary_owner','buyer_paid_seller','seller_confirmed_payment','admin_delivered_account','buyer_received_account','deal_completed') NOT NULL,
  `action_by` int(11) NOT NULL,
  `action_description` text DEFAULT NULL,
  `metadata` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_deal_id` (`deal_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_action_by` (`action_by`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `deal_history_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `deal_history_ibfk_2` FOREIGN KEY (`action_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `deal_payment_methods`
--

DROP TABLE IF EXISTS `deal_payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `deal_payment_methods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deal_id` int(11) NOT NULL,
  `payment_method_id` varchar(50) NOT NULL,
  `payment_method_name` varchar(255) NOT NULL,
  `payment_method_category` enum('bank','digital','crypto','other') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_deal_id` (`deal_id`),
  KEY `idx_payment_method_id` (`payment_method_id`),
  CONSTRAINT `deal_payment_methods_ibfk_1` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `deals`
--

DROP TABLE IF EXISTS `deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
  `buyer_payment_methods` longtext NOT NULL,
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
  UNIQUE KEY `unique_transaction_id` (`transaction_id`),
  KEY `idx_buyer_id` (`buyer_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_deal_status` (`deal_status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_transaction_fee_paid` (`transaction_fee_paid`),
  KEY `idx_transaction_fee_paid_by` (`transaction_fee_paid_by`),
  KEY `idx_agent_email_sent` (`agent_email_sent`),
  KEY `idx_seller_gave_rights` (`seller_gave_rights`),
  KEY `idx_rights_timer_expires_at` (`rights_timer_expires_at`),
  KEY `idx_timer_completed` (`timer_completed`),
  KEY `idx_seller_made_primary_owner` (`seller_made_primary_owner`),
  KEY `idx_platform_type` (`platform_type`),
  KEY `idx_buyer_paid_seller` (`buyer_paid_seller`),
  KEY `idx_deals_status_created` (`deal_status`,`created_at`),
  CONSTRAINT `deals_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `deals_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chatId` int(11) NOT NULL,
  `senderId` int(11) NOT NULL,
  `content` text NOT NULL,
  `messageType` enum('text','image','file','system','video') NOT NULL DEFAULT 'text',
  `mediaUrl` varchar(500) DEFAULT NULL,
  `fileName` varchar(255) DEFAULT NULL,
  `fileSize` int(11) DEFAULT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `replyToId` int(11) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_chatId` (`chatId`),
  KEY `idx_senderId` (`senderId`),
  KEY `idx_messageType` (`messageType`),
  KEY `idx_replyToId` (`replyToId`),
  KEY `idx_isRead` (`isRead`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `idx_messages_chat_created` (`chatId`,`createdAt`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`chatId`) REFERENCES `chats` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`replyToId`) REFERENCES `messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
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
  `pendingEmail` varchar(255) DEFAULT NULL COMMENT 'New email address pending verification',
  `emailChangeToken` varchar(64) DEFAULT NULL COMMENT 'Token for email change verification',
  `pendingPassword` varchar(255) DEFAULT NULL COMMENT 'New password pending verification',
  `passwordChangeToken` varchar(64) DEFAULT NULL COMMENT 'Token for password change verification',
  `lastEmailChange` datetime DEFAULT NULL COMMENT 'Timestamp of last successful email change',
  `lastPasswordChange` datetime DEFAULT NULL COMMENT 'Timestamp of last successful password change',
  `currentEmailOTP` varchar(10) DEFAULT NULL COMMENT 'OTP sent to current email for verification',
  `currentEmailOTPExpires` datetime DEFAULT NULL COMMENT 'Expiry time for current email OTP',
  `newEmailOTP` varchar(10) DEFAULT NULL COMMENT 'OTP sent to new email for verification',
  `newEmailOTPExpires` datetime DEFAULT NULL COMMENT 'Expiry time for new email OTP',
  `currentEmailVerified` tinyint(1) DEFAULT 0 COMMENT 'Whether current email has been verified for email change',
  `emailChangeRequestedAt` datetime DEFAULT NULL COMMENT 'When the email change was first requested',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_username` (`username`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `idx_googleId` (`googleId`),
  KEY `idx_isEmailVerified` (`isEmailVerified`),
  KEY `idx_isAdmin` (`isAdmin`),
  KEY `idx_isBanned` (`isBanned`),
  KEY `idx_users_provider_verified` (`authProvider`,`isEmailVerified`),
  KEY `idx_email_change_token` (`emailChangeToken`),
  KEY `idx_current_email_otp` (`currentEmailOTP`),
  KEY `idx_new_email_otp` (`newEmailOTP`),
  KEY `idx_email_change_requested` (`emailChangeRequestedAt`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'xsm_market_local'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-08-10 18:24:09
