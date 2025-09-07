-- Add reset code columns to support code-based password reset
ALTER TABLE users ADD COLUMN IF NOT EXISTS resetCode VARCHAR(6) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS resetCodeExpires DATETIME DEFAULT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reset_code ON users(resetCode);
