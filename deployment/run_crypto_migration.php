<?php
require_once 'config/database.php';

try {
    $pdo = Database::getConnection();
    $sql = file_get_contents('migrations/create_crypto_payments_table.sql');
    $pdo->exec($sql);
    echo "Crypto payments table created successfully!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
