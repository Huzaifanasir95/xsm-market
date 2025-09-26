-- Fix profilePicture column size issue
-- Change from TEXT (65KB limit) to MEDIUMTEXT (16MB limit) to handle base64 images

ALTER TABLE users MODIFY COLUMN profilePicture MEDIUMTEXT DEFAULT NULL;

-- Verify the change
DESCRIBE users;