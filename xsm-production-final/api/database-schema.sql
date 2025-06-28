-- XSM Market Database Schema Export
-- Generated for production deployment

SET FOREIGN_KEY_CHECKS = 0;

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `fullName` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profilePicture` text DEFAULT NULL,
  `googleId` varchar(255) DEFAULT NULL,
  `authProvider` enum('email','google') NOT NULL DEFAULT 'email',
  `isEmailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `emailOTP` varchar(10) DEFAULT NULL,
  `otpExpires` datetime DEFAULT NULL,
  `passwordResetToken` varchar(255) DEFAULT NULL,
  `passwordResetExpires` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create ads table
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
  `adminNotes` text DEFAULT NULL,
  `soldAt` datetime DEFAULT NULL,
  `soldTo` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `soldTo` (`soldTo`),
  CONSTRAINT `ads_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ads_ibfk_2` FOREIGN KEY (`soldTo`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- Insert sample admin user (optional)
-- INSERT INTO `users` (`username`, `fullName`, `email`, `password`, `authProvider`, `isEmailVerified`, `isVerified`, `createdAt`, `updatedAt`) 
-- VALUES ('admin', 'XSM Admin', 'admin@xsmmarket.com', '$2a$10$encrypted_password_here', 'email', 1, 1, NOW(), NOW());
