<?php
require_once __DIR__ . '/config/database.php';

try {
    echo "Testing database connection...\n";
    $db = Database::getConnection();
    echo "✅ Database connection successful!\n";
    
    // Test if messages table exists
    $stmt = $db->query("SHOW TABLES LIKE 'messages'");
    if ($stmt->fetch()) {
        echo "✅ Messages table exists.\n";
        
        // Check if media columns exist
        $stmt = $db->query("DESCRIBE messages");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $requiredColumns = ['mediaUrl', 'fileName', 'fileSize', 'thumbnail'];
        $missingColumns = [];
        
        foreach ($requiredColumns as $column) {
            if (!in_array($column, $columns)) {
                $missingColumns[] = $column;
            }
        }
        
        if (empty($missingColumns)) {
            echo "✅ All media columns exist in messages table.\n";
        } else {
            echo "❌ Missing columns: " . implode(', ', $missingColumns) . "\n";
            echo "Running migration...\n";
            
            // Add missing columns
            foreach ($missingColumns as $column) {
                switch ($column) {
                    case 'mediaUrl':
                        $db->exec("ALTER TABLE `messages` ADD COLUMN `mediaUrl` varchar(500) DEFAULT NULL AFTER `messageType`");
                        break;
                    case 'fileName':
                        $db->exec("ALTER TABLE `messages` ADD COLUMN `fileName` varchar(255) DEFAULT NULL AFTER `mediaUrl`");
                        break;
                    case 'fileSize':
                        $db->exec("ALTER TABLE `messages` ADD COLUMN `fileSize` int(11) DEFAULT NULL AFTER `fileName`");
                        break;
                    case 'thumbnail':
                        $db->exec("ALTER TABLE `messages` ADD COLUMN `thumbnail` varchar(500) DEFAULT NULL AFTER `fileSize`");
                        break;
                }
                echo "✅ Added column: $column\n";
            }
            
            // Add index
            try {
                $db->exec("CREATE INDEX `idx_messages_media` ON `messages` (`messageType`, `mediaUrl`)");
                echo "✅ Added media index.\n";
            } catch (PDOException $e) {
                if (strpos($e->getMessage(), 'Duplicate key name') === false) {
                    throw $e;
                }
                echo "- Index already exists.\n";
            }
        }
    } else {
        echo "❌ Messages table does not exist.\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
