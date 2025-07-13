<?php
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $pdo = Database::getConnection();
    
    // Create deals table
    $sql = "
    CREATE TABLE IF NOT EXISTS `deals` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `buyerId` int(11) NOT NULL,
      `sellerId` int(11) NOT NULL,
      `adId` int(11) NOT NULL,
      `transactionId` varchar(100) NOT NULL UNIQUE,
      `channelTitle` varchar(255) NOT NULL,
      `channelPrice` decimal(10,2) NOT NULL,
      `escrowFee` decimal(10,2) NOT NULL,
      `transactionType` enum('safest','fastest') NOT NULL DEFAULT 'safest',
      `buyerEmail` varchar(255) NOT NULL,
      `paymentMethods` json NOT NULL,
      `status` enum('pending','seller_agreed','in_progress','completed','cancelled','disputed') NOT NULL DEFAULT 'pending',
      `buyerName` varchar(100) NOT NULL,
      `sellerAgreedAt` datetime DEFAULT NULL,
      `sellerAgreedPaymentMethod` varchar(100) DEFAULT NULL,
      `chatId` int(11) DEFAULT NULL,
      `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
      `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (`id`),
      UNIQUE KEY `transactionId` (`transactionId`),
      KEY `buyerId` (`buyerId`),
      KEY `sellerId` (`sellerId`),
      KEY `adId` (`adId`),
      KEY `status` (`status`),
      KEY `createdAt` (`createdAt`),
      FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
      FOREIGN KEY (`sellerId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
      FOREIGN KEY (`adId`) REFERENCES `ads` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $pdo->exec($sql);
    
    echo json_encode([
        'success' => true,
        'message' => 'Deals table created successfully!'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error creating deals table: ' . $e->getMessage()
    ]);
}
?>
