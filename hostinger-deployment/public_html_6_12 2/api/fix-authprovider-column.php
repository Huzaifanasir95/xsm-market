<?php
require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getConnection();
    
    echo "🔧 Fixing authProvider column size...\n";
    
    // Check current column definition
    $stmt = $pdo->query("DESCRIBE users authProvider");
    $columnInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Current authProvider column: " . json_encode($columnInfo) . "\n";
    
    // Update the column to allow longer values
    $pdo->exec("ALTER TABLE users MODIFY COLUMN authProvider VARCHAR(20) DEFAULT 'email'");
    
    echo "✅ authProvider column updated to VARCHAR(20)\n";
    
    // Verify the change
    $stmt = $pdo->query("DESCRIBE users authProvider");
    $columnInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Updated authProvider column: " . json_encode($columnInfo) . "\n";
    
    echo "🎉 Database schema fix completed!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
