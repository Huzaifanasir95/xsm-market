-- Add primary owner tracking columns to deals table
-- Date: July 14, 2025
-- Purpose: Support 7-day YouTube timer and primary owner promotion functionality

-- Add new columns for primary owner promotion tracking
ALTER TABLE deals ADD COLUMN IF NOT EXISTS rights_timer_started_at TIMESTAMP NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS rights_timer_expires_at TIMESTAMP NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS timer_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS seller_made_primary_owner BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS seller_made_primary_owner_at TIMESTAMP NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS platform_type VARCHAR(50) DEFAULT 'unknown';

-- Update deal status enum to include new states
ALTER TABLE deals MODIFY COLUMN deal_status ENUM(
    'pending', 
    'seller_reviewing', 
    'payment_negotiation', 
    'terms_agreed', 
    'fee_paid', 
    'agent_access_pending', 
    'agent_access_confirmed',
    'waiting_promotion_timer',
    'promotion_timer_complete',
    'escrow_paid', 
    'channel_transferred', 
    'payment_completed', 
    'completed', 
    'cancelled', 
    'disputed'
) DEFAULT 'pending';

-- Update action types enum to include new actions
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
    'fee_paid', 
    'agent_email_sent', 
    'seller_gave_rights',
    'timer_started',
    'timer_completed',
    'seller_made_primary_owner'
) NOT NULL;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_timer_completed ON deals(timer_completed);
CREATE INDEX IF NOT EXISTS idx_seller_made_primary_owner ON deals(seller_made_primary_owner);
CREATE INDEX IF NOT EXISTS idx_platform_type ON deals(platform_type);
CREATE INDEX IF NOT EXISTS idx_rights_timer_expires_at ON deals(rights_timer_expires_at);

-- Show updated table structure
DESCRIBE deals;
