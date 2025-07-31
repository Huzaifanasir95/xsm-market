<?php
// Migration script to add video support to messages table
require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "Starting migration to add video support...\n";
    
    // Read the migration SQL
    $migrationSQL = file_get_contents(__DIR__ . '/migrations/add_video_support.sql');
    
    // Split by semicolon and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $migrationSQL)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            echo "Executing: " . substr($statement, 0, 50) . "...\n";
            $db->exec($statement);
            echo "✓ Success\n";
        }
    }
    
    echo "\n✅ Migration completed successfully!\n";
    echo "Messages table now supports video message type and media fields.\n";
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
