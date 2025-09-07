-- Add buyer payment confirmation columns to deals table
-- Run this script to add the new columns for buyer payment confirmation

-- Add buyer payment confirmation columns
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_paid_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS buyer_paid_seller_at TIMESTAMP NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buyer_paid_seller ON deals(buyer_paid_seller);

-- Update any existing column descriptions or add comments
-- COMMENT ON COLUMN deals.buyer_paid_seller IS 'Whether the buyer has confirmed payment to the seller';
-- COMMENT ON COLUMN deals.buyer_paid_seller_at IS 'Timestamp when buyer confirmed payment to seller';

-- Show sample of updated data to verify columns exist
SELECT 
    'buyer_paid_seller',
    'buyer_paid_seller_at'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'deals' 
    AND TABLE_SCHEMA = DATABASE()
    AND COLUMN_NAME IN (
        'buyer_paid_seller',
        'buyer_paid_seller_at'
    );

COMMIT;
