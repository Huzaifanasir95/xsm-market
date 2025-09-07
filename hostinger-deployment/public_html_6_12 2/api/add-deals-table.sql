-- Create deals table to store deal transactions and payment method preferences
-- Date: July 13, 2025
-- Database: xsm_market_local (MariaDB)

CREATE TABLE IF NOT EXISTS deals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    channel_id VARCHAR(255) NOT NULL,
    channel_title VARCHAR(500) NOT NULL,
    channel_price DECIMAL(10, 2) NOT NULL,
    escrow_fee DECIMAL(10, 2) NOT NULL,
    transaction_type ENUM('safest', 'fastest') DEFAULT 'safest',
    buyer_email VARCHAR(255) NOT NULL,
    buyer_payment_methods JSON NOT NULL, -- Store selected payment methods as JSON array
    seller_agreed BOOLEAN DEFAULT FALSE,
    seller_agreed_at TIMESTAMP NULL,
    buyer_agreed BOOLEAN DEFAULT TRUE, -- Auto-set to true when deal is created
    buyer_agreed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deal_status ENUM('pending', 'seller_reviewing', 'payment_negotiation', 'terms_agreed', 'escrow_paid', 'channel_transferred', 'payment_completed', 'completed', 'cancelled', 'disputed') DEFAULT 'pending',
    chat_id INT NULL, -- Reference to chat table when implemented
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints (assuming users table exists)
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for better query performance
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_seller_id (seller_id),
    INDEX idx_deal_status (deal_status),
    INDEX idx_created_at (created_at)
);

-- Create deal_payment_methods table to store individual payment method selections
CREATE TABLE IF NOT EXISTS deal_payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    payment_method_id VARCHAR(50) NOT NULL,
    payment_method_name VARCHAR(255) NOT NULL,
    payment_method_category ENUM('bank', 'digital', 'crypto', 'other') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate payment methods for same deal
    UNIQUE KEY unique_deal_payment (deal_id, payment_method_id),
    
    INDEX idx_deal_id (deal_id),
    INDEX idx_payment_method_id (payment_method_id)
);

-- Create deal_history table to track status changes and important events
CREATE TABLE IF NOT EXISTS deal_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deal_id INT NOT NULL,
    action_type ENUM('created', 'seller_notified', 'seller_agreed', 'payment_method_negotiated', 'escrow_paid', 'channel_transferred', 'payment_completed', 'completed', 'cancelled', 'disputed', 'note_added') NOT NULL,
    action_by INT NOT NULL, -- User ID who performed the action
    action_description TEXT,
    metadata JSON NULL, -- Store additional action-specific data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
    FOREIGN KEY (action_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_deal_id (deal_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);

-- Insert initial deal statuses for reference
INSERT IGNORE INTO deal_history (deal_id, action_type, action_by, action_description) VALUES
(0, 'created', 0, 'System initialization - this record serves as a reference for deal status types');

-- Show table structures
DESCRIBE deals;
DESCRIBE deal_payment_methods;
DESCRIBE deal_history;
