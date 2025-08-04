-- Transaction Fee Payment Migration
-- Date: July 13, 2025
-- Purpose: Add transaction fee payment functionality to deals system
-- Database: xsm_market_local (MariaDB)

-- =====================================================
-- Step 1: Add transaction fee payment columns to deals table
-- =====================================================

ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_paid_at TIMESTAMP NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_paid_by ENUM('buyer', 'seller') NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_payment_method ENUM('stripe', 'crypto') NULL;

-- =====================================================
-- Step 2: Update deal_history action types to include fee_paid
-- =====================================================

ALTER TABLE deal_history MODIFY COLUMN action_type ENUM(
    'created', 
    'seller_notified', 
    'seller_agreed', 
    'payment_method_negotiated', 
    'escrow_paid', 
    'channel_transferred', 
    'payment_completed', 
    'completed', 
    'cancelled', 
    'disputed', 
    'note_added', 
    'fee_paid'
) NOT NULL;

-- =====================================================
-- Step 3: Update deal_status enum to include fee_paid status
-- =====================================================

ALTER TABLE deals MODIFY COLUMN deal_status ENUM(
    'pending', 
    'seller_reviewing', 
    'payment_negotiation', 
    'terms_agreed', 
    'fee_paid', 
    'escrow_paid', 
    'channel_transferred', 
    'payment_completed', 
    'completed', 
    'cancelled', 
    'disputed'
) DEFAULT 'pending';

-- =====================================================
-- Step 4: Create indexes for better query performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_transaction_fee_paid ON deals(transaction_fee_paid);
CREATE INDEX IF NOT EXISTS idx_transaction_fee_paid_by ON deals(transaction_fee_paid_by);

-- =====================================================
-- Step 5: Verification queries
-- =====================================================

-- Show the updated deals table structure
DESCRIBE deals;

-- Show updated deal_history table structure  
DESCRIBE deal_history;

-- Verify transaction fee columns were added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'xsm_market_local' 
  AND TABLE_NAME = 'deals' 
  AND COLUMN_NAME LIKE '%transaction_fee%'
ORDER BY ORDINAL_POSITION;

-- Show current indexes on deals table
SHOW INDEX FROM deals WHERE Key_name LIKE '%transaction_fee%';

-- =====================================================
-- Migration completed successfully!
-- =====================================================
