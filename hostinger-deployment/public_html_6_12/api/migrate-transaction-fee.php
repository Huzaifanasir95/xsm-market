<?php
require_once 'config/database.php';

try {
    $pdo = Database::getConnection();
    $sql = file_get_contents('add-transaction-fee-columns.sql');
    $statements = explode(';', $sql);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement)) {
            $pdo->exec($statement);
            echo "Executed: " . substr($statement, 0, 50) . "..." . PHP_EOL;
        }
    }
    
    echo "Migration completed successfully!" . PHP_EOL;
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . PHP_EOL;
}
?>
