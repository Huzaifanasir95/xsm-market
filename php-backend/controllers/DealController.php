<?php

class DealController {
    private $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function createDeal($data) {
        try {
            // Validate required fields
            $requiredFields = ['sellerId', 'adId', 'transactionId', 'channelTitle', 'channelPrice', 'escrowFee', 'buyerEmail', 'paymentMethods', 'transactionType'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || $data[$field] === '') {
                    throw new Exception("Missing required field: $field");
                }
            }

            // Get user info
            $user = AuthMiddleware::getCurrentUser();
            if (!$user) {
                throw new Exception("User not authenticated");
            }

            // Validate that buyer is not the seller
            if ($user['id'] == $data['sellerId']) {
                throw new Exception("You cannot create a deal with yourself");
            }

            // Check if ad exists and belongs to the seller
            $stmt = $this->db->prepare("SELECT id, userId, title FROM ads WHERE id = ? AND userId = ?");
            $stmt->execute([$data['adId'], $data['sellerId']]);
            $ad = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$ad) {
                throw new Exception("Ad not found or doesn't belong to the specified seller");
            }

            // Check if transaction ID already exists
            $stmt = $this->db->prepare("SELECT id FROM deals WHERE transactionId = ?");
            $stmt->execute([$data['transactionId']]);
            if ($stmt->fetch()) {
                throw new Exception("Transaction ID already exists");
            }

            // Create the deal
            $stmt = $this->db->prepare("
                INSERT INTO deals (
                    buyerId, sellerId, adId, transactionId, channelTitle, 
                    channelPrice, escrowFee, transactionType, buyerEmail, 
                    paymentMethods, buyerName, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            ");

            $paymentMethodsJson = json_encode($data['paymentMethods']);
            $buyerName = $data['buyerName'] ?? $user['fullName'] ?? $user['username'];

            $stmt->execute([
                $user['id'],
                $data['sellerId'],
                $data['adId'],
                $data['transactionId'],
                $data['channelTitle'],
                $data['channelPrice'],
                $data['escrowFee'],
                $data['transactionType'],
                $data['buyerEmail'],
                $paymentMethodsJson,
                $buyerName
            ]);

            $dealId = $this->db->lastInsertId();

            // Get the created deal with user details
            $stmt = $this->db->prepare("
                SELECT d.*, 
                       buyer.username as buyerUsername, buyer.fullName as buyerFullName,
                       seller.username as sellerUsername, seller.fullName as sellerFullName
                FROM deals d
                LEFT JOIN users buyer ON d.buyerId = buyer.id
                LEFT JOIN users seller ON d.sellerId = seller.id
                WHERE d.id = ?
            ");

            $stmt->execute([$dealId]);
            $deal = $stmt->fetch(PDO::FETCH_ASSOC);
            $deal['paymentMethods'] = json_decode($deal['paymentMethods'], true);

            return Response::success([
                'message' => 'Deal created successfully',
                'deal' => $deal
            ]);

        } catch (Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function getDeals() {
        try {
            $user = AuthMiddleware::getCurrentUser();
            if (!$user) {
                throw new Exception("User not authenticated");
            }

            // Get deals where user is either buyer or seller
            $stmt = $this->db->prepare("
                SELECT d.*, 
                       buyer.username as buyerUsername, buyer.fullName as buyerFullName,
                       seller.username as sellerUsername, seller.fullName as sellerFullName,
                       a.title as adTitle, a.thumbnail, a.platform
                FROM deals d
                LEFT JOIN users buyer ON d.buyerId = buyer.id
                LEFT JOIN users seller ON d.sellerId = seller.id
                LEFT JOIN ads a ON d.adId = a.id
                WHERE d.buyerId = ? OR d.sellerId = ?
                ORDER BY d.createdAt DESC
            ");

            $stmt->execute([$user['id'], $user['id']]);
            $deals = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Parse JSON payment methods for each deal
            foreach ($deals as &$deal) {
                $deal['paymentMethods'] = json_decode($deal['paymentMethods'], true);
                $deal['userRole'] = ($deal['buyerId'] == $user['id']) ? 'buyer' : 'seller';
            }

            return Response::success(['deals' => $deals]);

        } catch (Exception $e) {
            return Response::error($e->getMessage(), 500);
        }
    }

    public function agreeToDeal($data) {
        try {
            $user = AuthMiddleware::getCurrentUser();
            if (!$user) {
                throw new Exception("User not authenticated");
            }

            // Validate required fields
            if (!isset($data['dealId']) || !isset($data['agreedPaymentMethod'])) {
                throw new Exception("Missing required fields: dealId and agreedPaymentMethod");
            }

            $dealId = $data['dealId'];
            $agreedPaymentMethod = $data['agreedPaymentMethod'];

            // Check if deal exists and user is the seller
            $stmt = $this->db->prepare("
                SELECT d.*, buyer.username as buyerUsername, buyer.fullName as buyerFullName
                FROM deals d
                LEFT JOIN users buyer ON d.buyerId = buyer.id
                WHERE d.id = ? AND d.sellerId = ?
            ");
            $stmt->execute([$dealId, $user['id']]);
            $deal = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$deal) {
                throw new Exception("Deal not found or you are not the seller of this deal");
            }

            if ($deal['status'] !== 'pending') {
                throw new Exception("Deal is not in pending status");
            }

            // Validate that the agreed payment method is one of the buyer's options
            $paymentMethods = json_decode($deal['paymentMethods'], true);
            $validPaymentMethod = false;

            foreach ($paymentMethods as $method) {
                if ($method['id'] === $agreedPaymentMethod || $method['name'] === $agreedPaymentMethod) {
                    $validPaymentMethod = true;
                    $agreedPaymentMethod = $method['name']; // Use the name for storage
                    break;
                }
            }

            if (!$validPaymentMethod) {
                throw new Exception("Selected payment method is not available in buyer's options");
            }

            // Update deal status to seller_agreed
            $stmt = $this->db->prepare("
                UPDATE deals 
                SET status = 'seller_agreed', 
                    sellerAgreedAt = NOW(), 
                    sellerAgreedPaymentMethod = ?,
                    updatedAt = NOW()
                WHERE id = ?
            ");

            $stmt->execute([$agreedPaymentMethod, $dealId]);

            // Get updated deal
            $stmt = $this->db->prepare("
                SELECT d.*, 
                       buyer.username as buyerUsername, buyer.fullName as buyerFullName,
                       seller.username as sellerUsername, seller.fullName as sellerFullName
                FROM deals d
                LEFT JOIN users buyer ON d.buyerId = buyer.id
                LEFT JOIN users seller ON d.sellerId = seller.id
                WHERE d.id = ?
            ");

            $stmt->execute([$dealId]);
            $updatedDeal = $stmt->fetch(PDO::FETCH_ASSOC);
            $updatedDeal['paymentMethods'] = json_decode($updatedDeal['paymentMethods'], true);

            return Response::success([
                'message' => 'Deal terms accepted successfully',
                'deal' => $updatedDeal
            ]);

        } catch (Exception $e) {
            return Response::error($e->getMessage(), 400);
        }
    }

    public function createTable() {
        try {
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

            $this->db->exec($sql);

            return Response::success(['message' => 'Deals table created successfully!']);

        } catch (Exception $e) {
            return Response::error('Error creating deals table: ' . $e->getMessage(), 500);
        }
    }
}
?>
