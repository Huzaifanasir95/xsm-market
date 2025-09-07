-- Add transaction fee payment columns to deals table
-- Date: July 13, 2025
-- Purpose: Support transaction fee payment functionality

ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_paid_at TIMESTAMP NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_paid_by ENUM('buyer', 'seller') NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_payment_method ENUM('stripe', 'crypto') NULL;

-- Add new action type to deal_history enum
ALTER TABLE deal_history MODIFY COLUMN action_type ENUM('created', 'seller_notified', 'seller_agreed', 'payment_method_negotiated', 'escrow_paid', 'channel_transferred', 'payment_completed', 'completed', 'cancelled', 'disputed', 'note_added', 'fee_paid') NOT NULL;

-- Add new deal status for fee_paid
ALTER TABLE deals MODIFY COLUMN deal_status ENUM('pending', 'seller_reviewing', 'payment_negotiation', 'terms_agreed', 'fee_paid', 'escrow_paid', 'channel_transferred', 'payment_completed', 'completed', 'cancelled', 'disputed') DEFAULT 'pending';

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_transaction_fee_paid ON deals(transaction_fee_paid);
CREATE INDEX IF NOT EXISTS idx_transaction_fee_paid_by ON deals(transaction_fee_paid_by);

-- Show updated table structure
DESCRIBE deals;




mysql -h localhost -u root -plocalpassword123 -D xsm_market_local -e "
-- First, let's run the migration
ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_paid_at TIMESTAMP NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_paid_by ENUM('buyer', 'seller') NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS transaction_fee_payment_method ENUM('stripe', 'crypto') NULL;

-- Update deal_status enum
ALTER TABLE deals MODIFY COLUMN deal_status ENUM('pending', 'seller_reviewing', 'payment_negotiation', 'terms_agreed', 'fee_paid', 'escrow_paid', 'channel_transferred', 'payment_completed', 'completed', 'cancelled', 'disputed') DEFAULT 'pending';

-- Check the actual data
SELECT d.id, d.transaction_id, d.buyer_id, d.seller_id, d.channel_title, d.deal_status, d.seller_agreed, d.buyer_agreed, 
       buyer.username as buyer_username, seller.username as seller_username
FROM deals d
LEFT JOIN users buyer ON d.buyer_id = buyer.id
LEFT JOIN users seller ON d.seller_id = seller.id
ORDER BY d.created_at DESC;
"