<?php
// Add media columns to messages table
require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "Adding media columns to messages table...\n";

    // Add columns
    $queries = [
        "ALTER TABLE `messages` ADD COLUMN `mediaUrl` varchar(500) DEFAULT NULL AFTER `messageType`",
        "ALTER TABLE `messages` ADD COLUMN `fileName` varchar(255) DEFAULT NULL AFTER `mediaUrl`",
        "ALTER TABLE `messages` ADD COLUMN `fileSize` int(11) DEFAULT NULL AFTER `fileName`",
        "ALTER TABLE `messages` ADD COLUMN `thumbnail` varchar(500) DEFAULT NULL AFTER `fileSize`",
        "CREATE INDEX `idx_messages_media` ON `messages` (`messageType`, `mediaUrl`)"
    ];

    foreach ($queries as $query) {
        try {
            $db->exec($query);
            echo "✓ Executed: " . substr($query, 0, 50) . "...\n";
        } catch (PDOException $e) {
            // Check if column already exists or index already exists
            if (strpos($e->getMessage(), 'Duplicate column name') !== false || 
                strpos($e->getMessage(), 'Duplicate key name') !== false) {
                echo "- Skipped (already exists): " . substr($query, 0, 50) . "...\n";
            } else {
                throw $e;
            }
        }
    }

    echo "\n✅ Media columns migration completed successfully!\n";

} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
