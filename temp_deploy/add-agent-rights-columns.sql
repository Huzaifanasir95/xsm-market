-- Add agent rights tracking columns to deals table
-- Date: July 13, 2025
-- Purpose: Support agent email sharing and rights confirmation functionality

ALTER TABLE deals ADD COLUMN IF NOT EXISTS agent_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS agent_email_sent_at TIMESTAMP NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS seller_gave_rights BOOLEAN DEFAULT FALSE;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS seller_gave_rights_at TIMESTAMP NULL;

-- Add new deal status for agent access phase
ALTER TABLE deals MODIFY COLUMN deal_status ENUM('pending', 'seller_reviewing', 'payment_negotiation', 'terms_agreed', 'fee_paid', 'agent_access_pending', 'agent_access_confirmed', 'escrow_paid', 'channel_transferred', 'payment_completed', 'completed', 'cancelled', 'disputed') DEFAULT 'pending';

-- Add new action types to deal_history enum
ALTER TABLE deal_history MODIFY COLUMN action_type ENUM('created', 'seller_notified', 'seller_agreed', 'payment_method_negotiated', 'escrow_paid', 'channel_transferred', 'payment_completed', 'completed', 'cancelled', 'disputed', 'note_added', 'fee_paid', 'agent_email_sent', 'seller_gave_rights') NOT NULL;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_agent_email_sent ON deals(agent_email_sent);
CREATE INDEX IF NOT EXISTS idx_seller_gave_rights ON deals(seller_gave_rights);

-- Show updated table structure
DESCRIBE deals;


mysql -h localhost -u root -plocalpassword123 -D xsm_market_local -e "SELECT id, transaction_id, deal_status, transaction_fee_paid, agent_email_sent, seller_gave_rights FROM deals ORDER BY created_at DESC LIMIT 5;"





mysql -h localhost -u root -plocalpassword123 -D xsm_market_local -e "
UPDATE deals 
SET agent_email_sent = TRUE,
    agent_email_sent_at = NOW(),
    deal_status = 'agent_access_pending'
WHERE id = 5;

SELECT id, transaction_id, deal_status, agent_email_sent, seller_gave_rights FROM deals WHERE id = 5;
"