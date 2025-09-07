-- =============================================================================
-- XSM MARKET DATABASE SCHEMA - PRODUCTION VERSION FOR HOSTINGER
-- Generated from local database: xsm_market_local
-- Date: August 2, 2025
-- Tables: 9 total (users, ads, chats, messages, chat_participants, deals, 
--         deal_history, deal_payment_methods, crypto_payments)
-- Compatible with: Hostinger shared hosting restrictions
-- =============================================================================

-- Use your existing database (provided by Hostinger)
-- Database name should be: u718696665_xsm_market_db

-- =============================================================================
-- Drop existing tables if they exist (safer than DROP DATABASE)
-- =============================================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS crypto_payments;
DROP TABLE IF EXISTS deal_payment_methods;
DROP TABLE IF EXISTS deal_history;
DROP TABLE IF EXISTS deals;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chat_participants;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS ads;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. USERS TABLE - User accounts and authentication
-- =============================================================================
CREATE TABLE users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) DEFAULT NULL,
    fullName VARCHAR(100) DEFAULT '',
    phone VARCHAR(20) DEFAULT NULL,
    location VARCHAR(100) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    profilePicture TEXT DEFAULT NULL,
    googleId VARCHAR(255) DEFAULT NULL,
    authProvider ENUM('email','google') NOT NULL DEFAULT 'email',
    isEmailVerified TINYINT(1) NOT NULL DEFAULT 0,
    emailOTP VARCHAR(10) DEFAULT NULL,
    otpExpires DATETIME DEFAULT NULL,
    passwordResetToken VARCHAR(255) DEFAULT NULL,
    passwordResetExpires DATETIME DEFAULT NULL,
    isAdmin TINYINT(1) NOT NULL DEFAULT 0,
    isBanned TINYINT(1) NOT NULL DEFAULT 0,
    banReason TEXT DEFAULT NULL,
    bannedAt DATETIME DEFAULT NULL,
    bannedBy INT(11) DEFAULT NULL,
    unbannedAt DATETIME DEFAULT NULL,
    unbannedBy INT(11) DEFAULT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY unique_username (username),
    UNIQUE KEY unique_email (email),
    KEY idx_googleId (googleId),
    KEY idx_isEmailVerified (isEmailVerified),
    KEY idx_isAdmin (isAdmin),
    KEY idx_isBanned (isBanned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. ADS TABLE - Channel listings and advertisements
-- =============================================================================
CREATE TABLE ads (
    id INT(11) NOT NULL AUTO_INCREMENT,
    userId INT(11) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    channelUrl VARCHAR(500) NOT NULL,
    primary_image LONGTEXT DEFAULT NULL,
    platform ENUM('facebook','instagram','twitter','tiktok','youtube') NOT NULL,
    category VARCHAR(100) NOT NULL,
    contentType ENUM('Unique content','Rewritten','Not unique content','Mixed') DEFAULT NULL,
    contentCategory VARCHAR(100) DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    subscribers INT(11) DEFAULT 0,
    monthlyIncome DECIMAL(10,2) DEFAULT 0.00,
    isMonetized TINYINT(1) NOT NULL DEFAULT 0,
    incomeDetails TEXT DEFAULT NULL,
    promotionDetails TEXT DEFAULT NULL,
    status ENUM('active','pending','sold','suspended','rejected') NOT NULL DEFAULT 'active',
    verified TINYINT(1) NOT NULL DEFAULT 0,
    premium TINYINT(1) NOT NULL DEFAULT 0,
    views INT(11) NOT NULL DEFAULT 0,
    totalViews BIGINT(20) DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    thumbnail TEXT DEFAULT NULL,
    screenshots LONGTEXT DEFAULT NULL,
    tags LONGTEXT DEFAULT NULL,
    socialBladeUrl VARCHAR(500) DEFAULT NULL,
    location VARCHAR(100) DEFAULT NULL,
    sellCondition TEXT DEFAULT NULL,
    soldTo INT(11) DEFAULT NULL,
    soldAt DATETIME DEFAULT NULL,
    approvedAt DATETIME DEFAULT NULL,
    approvedBy INT(11) DEFAULT NULL,
    rejectedAt DATETIME DEFAULT NULL,
    rejectedBy INT(11) DEFAULT NULL,
    rejectionReason TEXT DEFAULT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    KEY idx_userId (userId),
    KEY idx_platform (platform),
    KEY idx_category (category),
    KEY idx_price (price),
    KEY idx_status (status),
    KEY idx_soldTo (soldTo),
    KEY idx_createdAt (createdAt),
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (soldTo) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. CHATS TABLE - Chat conversations
-- =============================================================================
CREATE TABLE chats (
    id INT(11) NOT NULL AUTO_INCREMENT,
    type ENUM('direct','group','ad_inquiry') NOT NULL DEFAULT 'direct',
    name VARCHAR(255) DEFAULT NULL,
    adId INT(11) DEFAULT NULL,
    lastMessage TEXT DEFAULT NULL,
    lastMessageTime DATETIME DEFAULT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    KEY idx_type (type),
    KEY idx_adId (adId),
    KEY idx_lastMessageTime (lastMessageTime),
    
    FOREIGN KEY (adId) REFERENCES ads(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. CHAT_PARTICIPANTS TABLE - Users in chat conversations
-- =============================================================================
CREATE TABLE chat_participants (
    id INT(11) NOT NULL AUTO_INCREMENT,
    chatId INT(11) NOT NULL,
    userId INT(11) NOT NULL,
    role ENUM('admin','member') NOT NULL DEFAULT 'member',
    isActive TINYINT(1) NOT NULL DEFAULT 1,
    joinedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastSeenAt DATETIME DEFAULT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    KEY idx_chatId (chatId),
    KEY idx_userId (userId),
    KEY idx_isActive (isActive),
    UNIQUE KEY unique_chat_user (chatId, userId),
    
    FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. MESSAGES TABLE - Individual chat messages with media support
-- =============================================================================
CREATE TABLE messages (
    id INT(11) NOT NULL AUTO_INCREMENT,
    chatId INT(11) NOT NULL,
    senderId INT(11) NOT NULL,
    content TEXT NOT NULL,
    messageType ENUM('text','image','file','system','video') NOT NULL DEFAULT 'text',
    mediaUrl VARCHAR(500) DEFAULT NULL,
    fileName VARCHAR(255) DEFAULT NULL,
    fileSize INT(11) DEFAULT NULL,
    thumbnail VARCHAR(500) DEFAULT NULL,
    replyToId INT(11) DEFAULT NULL,
    isRead TINYINT(1) NOT NULL DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    KEY idx_chatId (chatId),
    KEY idx_senderId (senderId),
    KEY idx_messageType (messageType),
    KEY idx_replyToId (replyToId),
    KEY idx_isRead (isRead),
    KEY idx_createdAt (createdAt),
    
    FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (replyToId) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. DEALS TABLE - Complete deal management with all transaction steps
-- =============================================================================
CREATE TABLE deals (
    id INT(11) NOT NULL AUTO_INCREMENT,
    transaction_id VARCHAR(50) NOT NULL,
    buyer_id INT(11) NOT NULL,
    seller_id INT(11) NOT NULL,
    channel_id VARCHAR(255) NOT NULL,
    channel_title VARCHAR(500) NOT NULL,
    channel_price DECIMAL(10,2) NOT NULL,
    escrow_fee DECIMAL(10,2) NOT NULL,
    transaction_type ENUM('safest','fastest') DEFAULT 'safest',
    buyer_email VARCHAR(255) NOT NULL,
    buyer_payment_methods LONGTEXT NOT NULL,
    seller_agreed TINYINT(1) DEFAULT 0,
    seller_agreed_at TIMESTAMP NULL DEFAULT NULL,
    buyer_agreed TINYINT(1) DEFAULT 1,
    buyer_agreed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    deal_status ENUM('pending','seller_reviewing','payment_negotiation','terms_agreed','fee_paid','agent_access_pending','agent_access_confirmed','waiting_promotion_timer','promotion_timer_complete','admin_ownership_confirmed','payment_pending','payment_completed','buyer_paid_seller','seller_confirmed_payment','admin_delivered_account','buyer_received_account','transfer_to_buyer_pending','completed','cancelled','disputed') DEFAULT 'pending',
    chat_id INT(11) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    transaction_fee_paid TINYINT(1) DEFAULT 0,
    transaction_fee_paid_at TIMESTAMP NULL DEFAULT NULL,
    transaction_fee_paid_by ENUM('buyer','seller') DEFAULT NULL,
    transaction_fee_payment_method ENUM('stripe','crypto') DEFAULT NULL,
    agent_email_sent TINYINT(1) DEFAULT 0,
    agent_email_sent_at TIMESTAMP NULL DEFAULT NULL,
    seller_gave_rights TINYINT(1) DEFAULT 0,
    seller_gave_rights_at TIMESTAMP NULL DEFAULT NULL,
    rights_timer_started_at TIMESTAMP NULL DEFAULT NULL,
    rights_timer_expires_at TIMESTAMP NULL DEFAULT NULL,
    timer_completed TINYINT(1) DEFAULT 0,
    seller_made_primary_owner TINYINT(1) DEFAULT 0,
    seller_made_primary_owner_at TIMESTAMP NULL DEFAULT NULL,
    platform_type VARCHAR(50) DEFAULT 'unknown',
    buyer_paid_seller TINYINT(1) DEFAULT 0,
    buyer_paid_seller_at TIMESTAMP NULL DEFAULT NULL,
    seller_confirmed_payment TINYINT(1) DEFAULT 0,
    seller_confirmed_payment_at TIMESTAMP NULL DEFAULT NULL,
    admin_confirmed_ownership TINYINT(1) DEFAULT 0,
    admin_confirmed_ownership_at TIMESTAMP NULL DEFAULT NULL,
    admin_transferred_to_buyer TINYINT(1) DEFAULT 0,
    admin_transferred_to_buyer_at TIMESTAMP NULL DEFAULT NULL,
    rights_verified TINYINT(1) DEFAULT 0,
    rights_verified_at TIMESTAMP NULL DEFAULT NULL,
    admin_delivered_account TINYINT(1) DEFAULT 0,
    admin_delivered_account_at TIMESTAMP NULL DEFAULT NULL,
    buyer_received_account TINYINT(1) DEFAULT 0,
    buyer_received_account_at TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (id),
    UNIQUE KEY unique_transaction_id (transaction_id),
    KEY idx_buyer_id (buyer_id),
    KEY idx_seller_id (seller_id),
    KEY idx_deal_status (deal_status),
    KEY idx_created_at (created_at),
    KEY idx_transaction_fee_paid (transaction_fee_paid),
    KEY idx_transaction_fee_paid_by (transaction_fee_paid_by),
    KEY idx_agent_email_sent (agent_email_sent),
    KEY idx_seller_gave_rights (seller_gave_rights),
    KEY idx_rights_timer_expires_at (rights_timer_expires_at),
    KEY idx_timer_completed (timer_completed),
    KEY idx_seller_made_primary_owner (seller_made_primary_owner),
    KEY idx_platform_type (platform_type),
    KEY idx_buyer_paid_seller (buyer_paid_seller),
    
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. DEAL_HISTORY TABLE - Complete audit trail of deal actions
-- =============================================================================
CREATE TABLE deal_history (
    id INT(11) NOT NULL AUTO_INCREMENT,
    deal_id INT(11) NOT NULL,
    action_type ENUM('created','seller_notified','seller_agreed','payment_method_negotiated','escrow_paid','channel_transferred','payment_completed','completed','cancelled','disputed','note_added','fee_paid','agent_email_sent','seller_gave_rights','timer_started','timer_completed','seller_made_primary_owner','buyer_paid_seller','seller_confirmed_payment','admin_delivered_account','buyer_received_account','deal_completed') NOT NULL,
    action_by INT(11) NOT NULL,
    action_description TEXT DEFAULT NULL,
    metadata LONGTEXT DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    KEY idx_deal_id (deal_id),
    KEY idx_action_type (action_type),
    KEY idx_action_by (action_by),
    KEY idx_created_at (created_at),
    
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 8. DEAL_PAYMENT_METHODS TABLE - Payment methods for deals
-- =============================================================================
CREATE TABLE deal_payment_methods (
    id INT(11) NOT NULL AUTO_INCREMENT,
    deal_id INT(11) NOT NULL,
    payment_method_id VARCHAR(50) NOT NULL,
    payment_method_name VARCHAR(255) NOT NULL,
    payment_method_category ENUM('bank','digital','crypto','other') NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    KEY idx_deal_id (deal_id),
    KEY idx_payment_method_id (payment_method_id),
    
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 9. CRYPTO_PAYMENTS TABLE - NOWPayments cryptocurrency transactions
-- =============================================================================
CREATE TABLE crypto_payments (
    id INT(11) NOT NULL AUTO_INCREMENT,
    deal_id INT(11) NOT NULL,
    nowpayments_payment_id VARCHAR(255) NOT NULL,
    order_id VARCHAR(255) NOT NULL,
    payment_status ENUM('waiting','confirming','confirmed','sending','finished','failed','refunded','expired') NOT NULL,
    price_amount DECIMAL(20,8) NOT NULL,
    price_currency VARCHAR(10) NOT NULL DEFAULT 'usd',
    actually_paid DECIMAL(20,8) DEFAULT NULL,
    pay_currency VARCHAR(10) DEFAULT NULL,
    outcome_amount DECIMAL(20,8) DEFAULT NULL,
    outcome_currency VARCHAR(10) DEFAULT NULL,
    payment_url TEXT DEFAULT NULL,
    qr_code_url TEXT DEFAULT NULL,
    webhook_data LONGTEXT DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id),
    UNIQUE KEY unique_nowpayments_payment_id (nowpayments_payment_id),
    KEY idx_deal_id (deal_id),
    KEY idx_order_id (order_id),
    KEY idx_payment_status (payment_status),
    
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert admin user
INSERT INTO users (id, username, email, password, fullName, authProvider, isEmailVerified, isAdmin) VALUES
(1, 'admin', 'admin@xsmmarket.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'email', 1, 1);

-- Insert sample regular users
INSERT INTO users (id, username, email, fullName, authProvider, isEmailVerified) VALUES
(2, 'john_seller', 'john@example.com', 'John Smith', 'email', 1),
(3, 'jane_buyer', 'jane@example.com', 'Jane Doe', 'email', 1),
(4, 'google_user', 'google@example.com', 'Google User', 'google', 1);

-- Insert sample channel ads
INSERT INTO ads (userId, title, description, channelUrl, platform, category, price, subscribers, status) VALUES
(2, 'Gaming YouTube Channel - 100K Subs', 'Monetized gaming channel with consistent views', 'https://youtube.com/channel/UCexample1', 'youtube', 'Gaming', 5000.00, 100000, 'active'),
(2, 'Instagram Fashion Page - 50K Followers', 'Fashion and lifestyle Instagram account', 'https://instagram.com/fashionexample', 'instagram', 'Fashion', 2500.00, 50000, 'active'),
(3, 'TikTok Dance Channel - 200K Followers', 'Viral dance content with high engagement', 'https://tiktok.com/@danceexample', 'tiktok', 'Entertainment', 7500.00, 200000, 'active'),
(4, 'Facebook Business Page - 25K Likes', 'Established business page with local following', 'https://facebook.com/businessexample', 'facebook', 'Business', 1500.00, 25000, 'active'),
(2, 'Twitter Tech Account - 75K Followers', 'Technology news and updates account', 'https://twitter.com/techexample', 'twitter', 'Technology', 3500.00, 75000, 'active');

-- =============================================================================
-- INDEXES FOR PERFORMANCE (Additional)
-- =============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_ads_platform_status ON ads(platform, status);
CREATE INDEX idx_ads_category_price ON ads(category, price);
CREATE INDEX idx_messages_chat_created ON messages(chatId, createdAt);
CREATE INDEX idx_deals_status_created ON deals(deal_status, created_at);
CREATE INDEX idx_users_provider_verified ON users(authProvider, isEmailVerified);

-- =============================================================================
-- DATABASE SCHEMA COMPLETE - HOSTINGER COMPATIBLE
-- =============================================================================
-- Total Tables: 9
-- Total Sample Records: 9 (1 admin + 3 users + 5 ads)
-- Features: Complete chat system, deal management, crypto payments, user auth
-- Compatible with: XSM Market Frontend & PHP Backend + Hostinger Restrictions
-- =============================================================================
