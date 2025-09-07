-- Add buyer payment confirmation columns to deals table
-- This supports the "I Have Paid The Seller" functionality

-- Add buyer payment confirmation fields
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_paid_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_paid_seller_at TIMESTAMP NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_buyer_paid_seller ON deals(buyer_paid_seller);

-- Update any existing deals that might be in completed state to have buyer_paid_seller = TRUE
-- This is for data migration purposes
UPDATE deals 
SET buyer_paid_seller = TRUE, buyer_paid_seller_at = updated_at 
WHERE deal_status IN ('completed', 'payment_confirmed') AND buyer_paid_seller IS NULL;

-- Show the columns that were added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'deals' 
AND COLUMN_NAME IN (
    'buyer_paid_seller',
    'buyer_paid_seller_at'
);
