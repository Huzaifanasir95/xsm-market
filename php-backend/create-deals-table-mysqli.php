<?php
// Simple script to create deals table without PDO dependencies

$host = 'localhost';
$dbname = 'xsm_market_local';
$username = 'root';
$password = 'localpassword123';

// Create connection using mysqli
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL to create deals table
$sql = "CREATE TABLE IF NOT EXISTS `deals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transactionId` varchar(50) NOT NULL UNIQUE,
  `buyerId` int(11) NOT NULL,
  `sellerId` int(11) NOT NULL,
  `adId` int(11) DEFAULT NULL,
  `channelTitle` varchar(255) NOT NULL,
  `channelPrice` decimal(10,2) NOT NULL,
  `escrowFee` decimal(10,2) NOT NULL,
  `escrowFeePercent` decimal(5,2) NOT NULL DEFAULT 4.80,
  `minEscrowFee` decimal(10,2) NOT NULL DEFAULT 3.00,
  `transactionType` enum('safest','recommended') NOT NULL DEFAULT 'safest',
  `buyerEmail` varchar(255) NOT NULL,
  `paymentMethods` json NOT NULL,
  `selectedPaymentMethods` json NOT NULL,
  `status` enum('pending','seller_reviewing','payment_pending','in_escrow','completed','cancelled','disputed') NOT NULL DEFAULT 'pending',
  `buyerAgreedToTerms` tinyint(1) NOT NULL DEFAULT 1,
  `sellerAgreedToTerms` tinyint(1) NOT NULL DEFAULT 0,
  `sellerAgreedAt` datetime DEFAULT NULL,
  `buyerNotes` text DEFAULT NULL,
  `sellerNotes` text DEFAULT NULL,
  `adminNotes` text DEFAULT NULL,
  `chatId` int(11) DEFAULT NULL,
  `escrowAgentId` int(11) DEFAULT NULL,
  `completedAt` datetime DEFAULT NULL,
  `cancelledAt` datetime DEFAULT NULL,
  `cancelReason` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `transactionId` (`transactionId`),
  KEY `buyerId` (`buyerId`),
  KEY `sellerId` (`sellerId`),
  KEY `adId` (`adId`),
  KEY `status` (`status`),
  KEY `chatId` (`chatId`),
  KEY `createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) {
    echo "✅ Deals table created successfully!\n";
    
    // Create indexes
    $indexes = [
        "CREATE INDEX IF NOT EXISTS `idx_deals_buyer_status` ON `deals`(`buyerId`, `status`)",
        "CREATE INDEX IF NOT EXISTS `idx_deals_seller_status` ON `deals`(`sellerId`, `status`)",
        "CREATE INDEX IF NOT EXISTS `idx_deals_transaction_lookup` ON `deals`(`transactionId`, `status`)"
    ];
    
    foreach ($indexes as $index) {
        if ($conn->query($index) === TRUE) {
            echo "✅ Index created successfully\n";
        } else {
            echo "⚠️ Index creation warning: " . $conn->error . "\n";
        }
    }
    
    echo "✅ Database updated with deals tracking functionality.\n";
} else {
    echo "❌ Error creating deals table: " . $conn->error . "\n";
}

$conn->close();
?>
