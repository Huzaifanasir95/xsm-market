<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Ad.php';
require_once __DIR__ . '/../models/Chat-complete.php';
require_once __DIR__ . '/../config/database.php';

class AdminController {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }
    
    // Helper method to check if current user is admin
    private function isCurrentUserAdmin() {
        // First authenticate the user
        $currentUser = AuthMiddleware::authenticate();
        
        // Get admin email from environment (check both formats)
        $adminEmail = getenv('ADMIN_EMAIL') ?: getenv('admin_email');
        
        // Check if user is admin by email or isAdmin flag
        $isAdminByEmail = $adminEmail && strtolower($currentUser['email']) === strtolower($adminEmail);
        $isAdminByFlag = !empty($currentUser['isAdmin']);
        
        if (!$isAdminByEmail && !$isAdminByFlag) {
            http_response_code(403);
            echo json_encode(['message' => 'Access denied. Admin privileges required.']);
            exit;
        }
        
        return $currentUser;
    }
    
    // Get all users for admin
    public function getAllUsers() {
        try {
            $this->isCurrentUserAdmin();
            
            $stmt = $this->db->prepare("
                SELECT id, username, email, profilePicture, isEmailVerified, authProvider, createdAt, updatedAt
                FROM users
                ORDER BY createdAt DESC
            ");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Transform data to match the frontend expectations
            $transformedUsers = array_map(function($user) {
                return [
                    'id' => (int)$user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'status' => $user['isEmailVerified'] ? 'active' : 'pending',
                    'role' => strpos($user['username'], 'admin') !== false ? 'admin' : 'user',
                    'joinDate' => $user['createdAt'],
                    'lastActive' => $user['updatedAt'] ?: $user['createdAt']
                ];
            }, $users);
            
            http_response_code(200);
            echo json_encode($transformedUsers);
        } catch (Exception $e) {
            error_log('Error fetching all users: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Get user by ID for admin
    public function getUserById($userId) {
        try {
            $this->isCurrentUserAdmin();
            
            $stmt = $this->db->prepare("
                SELECT id, username, email, profilePicture, isEmailVerified, authProvider, createdAt, updatedAt
                FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                http_response_code(404);
                echo json_encode(['message' => 'User not found']);
                return;
            }
            
            $result = [
                'id' => (int)$user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'status' => $user['isEmailVerified'] ? 'active' : 'pending',
                'role' => strpos($user['username'], 'admin') !== false ? 'admin' : 'user',
                'joinDate' => $user['createdAt'],
                'lastActive' => $user['updatedAt'] ?: $user['createdAt']
            ];
            
            http_response_code(200);
            echo json_encode($result);
        } catch (Exception $e) {
            error_log('Error fetching user by ID: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Update user status
    public function updateUserStatus($userId) {
        try {
            $this->isCurrentUserAdmin();
            $input = json_decode(file_get_contents('php://input'), true);
            $status = $input['status'] ?? null;
            
            $stmt = $this->db->prepare("SELECT id FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['message' => 'User not found']);
                return;
            }
            
            // Map frontend status to database fields
            $isEmailVerified = null;
            if ($status === 'active') {
                $isEmailVerified = 1;
            } elseif ($status === 'suspended') {
                $isEmailVerified = 0;
            }
            
            if ($isEmailVerified !== null) {
                $stmt = $this->db->prepare("UPDATE users SET isEmailVerified = ? WHERE id = ?");
                $stmt->execute([$isEmailVerified, $userId]);
            }
            
            http_response_code(200);
            echo json_encode([
                'message' => 'User status updated successfully',
                'user' => [
                    'id' => (int)$userId,
                    'status' => $status
                ]
            ]);
        } catch (Exception $e) {
            error_log('Error updating user status: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Delete user
    public function deleteUser($userId) {
        try {
            $this->isCurrentUserAdmin();
            
            $stmt = $this->db->prepare("SELECT id FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['message' => 'User not found']);
                return;
            }
            
            $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            
            http_response_code(200);
            echo json_encode(['message' => 'User deleted successfully']);
        } catch (Exception $e) {
            error_log('Error deleting user: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Delete ad as admin (no ownership check)
    public function deleteAdAsAdmin($adId) {
        try {
            $this->isCurrentUserAdmin();
            
            // Check if ad exists
            $stmt = $this->db->prepare("SELECT id FROM ads WHERE id = ?");
            $stmt->execute([$adId]);
            if (!$stmt->fetch()) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Ad not found']);
                return;
            }
            
            // Delete the ad
            $stmt = $this->db->prepare("DELETE FROM ads WHERE id = ?");
            $stmt->execute([$adId]);
            
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Ad deleted successfully']);
        } catch (Exception $e) {
            error_log('Error deleting ad: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
        }
    }
    
    // Get all chats for admin review
    public function getAllChats() {
        try {
            $this->isCurrentUserAdmin();
            
            $stmt = $this->db->prepare("
                SELECT c.*, GROUP_CONCAT(DISTINCT CONCAT(u.id, ':', u.username) SEPARATOR ',') as participants_data
                FROM chats c
                INNER JOIN chat_participants cp ON c.id = cp.chatId
                INNER JOIN users u ON cp.userId = u.id
                WHERE cp.isActive = 1
                GROUP BY c.id
                ORDER BY c.lastMessageTime DESC
            ");
            $stmt->execute();
            $chats = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $result = [];
            foreach ($chats as $chat) {
                // Parse participants data
                $participants = [];
                if ($chat['participants_data']) {
                    $participantPairs = explode(',', $chat['participants_data']);
                    foreach ($participantPairs as $pair) {
                        list($id, $username) = explode(':', $pair, 2);
                        $participants[] = [
                            'id' => (int)$id,
                            'username' => $username
                        ];
                    }
                }
                
                // Get messages for this chat
                $msgStmt = $this->db->prepare("
                    SELECT m.id, m.content, m.createdAt, u.username as sender
                    FROM messages m
                    INNER JOIN users u ON m.senderId = u.id
                    WHERE m.chatId = ?
                    ORDER BY m.createdAt ASC
                ");
                $msgStmt->execute([$chat['id']]);
                $messages = $msgStmt->fetchAll(PDO::FETCH_ASSOC);
                
                $formattedMessages = array_map(function($msg) {
                    return [
                        'id' => (int)$msg['id'],
                        'content' => $msg['content'],
                        'sender' => $msg['sender'],
                        'timestamp' => $msg['createdAt']
                    ];
                }, $messages);
                
                $result[] = [
                    'id' => (int)$chat['id'],
                    'participants' => $participants,
                    'messages' => $formattedMessages,
                    'lastMessage' => $chat['lastMessage'],
                    'lastMessageTime' => $chat['lastMessageTime']
                ];
            }
            
            http_response_code(200);
            echo json_encode($result);
        } catch (Exception $e) {
            error_log('Error fetching all chats for admin: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Get dashboard stats
    public function getDashboardStats() {
        try {
            $this->isCurrentUserAdmin();
            
            $totalUsersStmt = $this->db->prepare("SELECT COUNT(*) as count FROM users");
            $totalUsersStmt->execute();
            $totalUsers = (int)$totalUsersStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $totalListingsStmt = $this->db->prepare("SELECT COUNT(*) as count FROM ads");
            $totalListingsStmt->execute();
            $totalListings = (int)$totalListingsStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $totalChatsStmt = $this->db->prepare("SELECT COUNT(*) as count FROM chats");
            $totalChatsStmt->execute();
            $totalChats = (int)$totalChatsStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            http_response_code(200);
            echo json_encode([
                'totalUsers' => $totalUsers,
                'totalListings' => $totalListings,
                'totalChats' => $totalChats
            ]);
        } catch (Exception $e) {
            error_log('Error fetching dashboard stats: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Get recent activities
    public function getRecentActivities() {
        try {
            $this->isCurrentUserAdmin();
            
            $activities = [];
            
            // Recent users
            $usersStmt = $this->db->prepare("
                SELECT username, createdAt FROM users 
                ORDER BY createdAt DESC LIMIT 5
            ");
            $usersStmt->execute();
            $users = $usersStmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($users as $user) {
                $activities[] = [
                    'type' => 'user',
                    'user' => $user['username'],
                    'action' => 'New registration',
                    'time' => $user['createdAt']
                ];
            }
            
            // Recent ads
            $adsStmt = $this->db->prepare("
                SELECT a.createdAt, u.username as sellerUsername
                FROM ads a
                LEFT JOIN users u ON a.userId = u.id
                ORDER BY a.createdAt DESC LIMIT 5
            ");
            $adsStmt->execute();
            $ads = $adsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($ads as $ad) {
                $activities[] = [
                    'type' => 'listing',
                    'user' => $ad['sellerUsername'] ?: 'Unknown',
                    'action' => 'Created new listing',
                    'time' => $ad['createdAt']
                ];
            }
            
            // Recent chats
            $chatsStmt = $this->db->prepare("
                SELECT id, createdAt FROM chats 
                ORDER BY createdAt DESC LIMIT 5
            ");
            $chatsStmt->execute();
            $chats = $chatsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($chats as $chat) {
                $activities[] = [
                    'type' => 'chat',
                    'user' => (string)$chat['id'],
                    'action' => 'New chat started',
                    'time' => $chat['createdAt']
                ];
            }
            
            // Sort by time descending and take top 10
            usort($activities, function($a, $b) {
                return strtotime($b['time']) - strtotime($a['time']);
            });
            
            $recent = array_slice($activities, 0, 10);
            
            http_response_code(200);
            echo json_encode($recent);
        } catch (Exception $e) {
            error_log('Error fetching recent activities: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Get all deals for admin review
    public function getAllDeals() {
        try {
            $this->isCurrentUserAdmin();
            
            $stmt = $this->db->prepare("
                SELECT 
                    d.*,
                    buyer.username as buyer_username,
                    buyer.email as buyer_email,
                    seller.username as seller_username,
                    seller.email as seller_email
                FROM deals d
                LEFT JOIN users buyer ON d.buyer_id = buyer.id
                LEFT JOIN users seller ON d.seller_id = seller.id
                ORDER BY d.created_at DESC
            ");
            $stmt->execute();
            $deals = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Transform data for frontend
            $transformedDeals = array_map(function($deal) {
                $status = 'Pending';
                $progress = 0;
                
                // Determine deal status and progress with new agent rights flow
                if ($deal['seller_made_primary_owner']) {
                    $status = 'Primary Owner Confirmed';
                    $progress = 100;
                } elseif ($deal['seller_gave_rights']) {
                    if ($deal['platform_type'] === 'youtube' && !$deal['timer_completed']) {
                        $status = 'YouTube Timer Running';
                        $progress = 90;
                    } else {
                        $status = 'Agent Access Confirmed';
                        $progress = 85;
                    }
                } elseif ($deal['agent_email_sent']) {
                    $status = 'Waiting for Agent Access';
                    $progress = 75;
                } elseif ($deal['transaction_fee_paid']) {
                    $status = 'Fee Paid - Sending Agent Email';
                    $progress = 65;
                } elseif ($deal['seller_agreed']) {
                    $status = 'Seller Agreed - Awaiting Payment';
                    $progress = 50;
                } else {
                    $status = 'Pending Seller Agreement';
                    $progress = 25;
                }
                
                return [
                    'id' => (int)$deal['id'],
                    'channel_title' => $deal['channel_title'],
                    'platform' => 'Social Media', // Default since platform info not in deals table
                    'price' => (float)$deal['channel_price'],
                    'buyer' => [
                        'id' => (int)$deal['buyer_id'],
                        'username' => $deal['buyer_username'],
                        'email' => $deal['buyer_email']
                    ],
                    'seller' => [
                        'id' => (int)$deal['seller_id'],
                        'username' => $deal['seller_username'],
                        'email' => $deal['seller_email']
                    ],
                    'status' => $status,
                    'progress' => $progress,
                    'seller_agreed' => (bool)$deal['seller_agreed'],
                    'seller_agreed_at' => $deal['seller_agreed_at'],
                    'transaction_fee_paid' => (bool)$deal['transaction_fee_paid'],
                    'transaction_fee_paid_at' => $deal['transaction_fee_paid_at'],
                    'transaction_fee_paid_by' => $deal['transaction_fee_paid_by'],
                    'transaction_fee_payment_method' => $deal['transaction_fee_payment_method'],
                    'agent_email_sent' => (bool)$deal['agent_email_sent'],
                    'agent_email_sent_at' => $deal['agent_email_sent_at'],
                    'seller_gave_rights' => (bool)$deal['seller_gave_rights'],
                    'seller_gave_rights_at' => $deal['seller_gave_rights_at'],
                    'seller_made_primary_owner' => (bool)$deal['seller_made_primary_owner'],
                    'seller_made_primary_owner_at' => $deal['seller_made_primary_owner_at'],
                    'platform_type' => $deal['platform_type'],
                    'timer_completed' => (bool)$deal['timer_completed'],
                    'created_at' => $deal['created_at'],
                    'updated_at' => $deal['updated_at']
                ];
            }, $deals);
            
            http_response_code(200);
            echo json_encode($transformedDeals);
        } catch (Exception $e) {
            error_log('Error fetching all deals for admin: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }

    // Get admin email from .env file (public endpoint)
    public function getAdminEmail() {
        try {
            // Load environment variables
            $envFile = __DIR__ . '/../.env';
            $adminEmail = null;
            $adminUsername = null;
            
            if (file_exists($envFile)) {
                $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (strpos($line, 'admin_email') === 0) {
                        $parts = explode('=', $line, 2);
                        if (count($parts) === 2) {
                            $adminEmail = trim(trim($parts[1]), ' "\'');
                        }
                    }
                    if (strpos($line, 'admin_username') === 0) {
                        $parts = explode('=', $line, 2);
                        if (count($parts) === 2) {
                            $adminUsername = trim(trim($parts[1]), ' "\'');
                        }
                    }
                }
            }
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'adminEmail' => $adminEmail,
                'adminUsername' => $adminUsername
            ]);
            
        } catch (Exception $e) {
            error_log('Get admin email error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Server error']);
        }
    }

    // Admin confirms that agent has been made primary owner
    public function confirmPrimaryOwnerMade($dealId) {
        try {
            $this->isCurrentUserAdmin();
            
            $this->db->beginTransaction();
            
            // Get deal details
            $stmt = $this->db->prepare("
                SELECT d.*, 
                       seller.username as seller_username,
                       buyer.username as buyer_username
                FROM deals d
                LEFT JOIN users seller ON d.seller_id = seller.id
                LEFT JOIN users buyer ON d.buyer_id = buyer.id
                WHERE d.id = ?
            ");
            $stmt->execute([$dealId]);
            $deal = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$deal) {
                throw new Exception('Deal not found');
            }
            
            // Validate that seller has given rights and agent is not already marked as primary owner
            if (!$deal['seller_gave_rights']) {
                throw new Exception('Seller has not given agent access yet');
            }
            
            if ($deal['seller_made_primary_owner']) {
                throw new Exception('Agent is already marked as primary owner');
            }
            
            // Update deal to mark that admin has confirmed primary owner status
            $stmt = $this->db->prepare("
                UPDATE deals 
                SET seller_made_primary_owner = TRUE,
                    seller_made_primary_owner_at = NOW(),
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$dealId]);
            
            // Add history record
            $stmt = $this->db->prepare("
                INSERT INTO deal_history (deal_id, action_type, action_by, action_description)
                VALUES (?, 'seller_made_primary_owner', 1, ?)
            ");
            $action_description = "Admin confirmed that agent has been made primary owner of the channel";
            $stmt->execute([$dealId, $action_description]);
            
            // Send ownership confirmation message to chat
            try {
                // Find the chat for this deal
                $stmt = $this->db->prepare("
                    SELECT c.id as chat_id FROM chats c
                    INNER JOIN chat_participants cp1 ON c.id = cp1.chatId
                    INNER JOIN chat_participants cp2 ON c.id = cp2.chatId
                    WHERE c.type = 'ad_inquiry'
                    AND cp1.userId = ? AND cp1.isActive = 1
                    AND cp2.userId = ? AND cp2.isActive = 1
                    AND cp1.chatId = cp2.chatId
                    LIMIT 1
                ");
                $stmt->execute([$deal['buyer_id'], $deal['seller_id']]);
                $chat = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($chat) {
                    // Create ownership confirmation message
                    $message_content = "🎉 **AGENT OWNERSHIP CONFIRMED** 🎉\n\n" .
                        "Great news! Our agent has successfully been made the Primary Owner of the channel.\n\n" .
                        "**Channel**: {$deal['channel_title']}\n" .
                        "**Transaction ID**: #{$dealId}\n" .
                        "**Status**: Agent now has full control\n\n" .
                        "📸 **Next Steps:**\n" .
                        "1. Agent will take final screenshots of the account\n" .
                        "2. Agent will remove all seller access and secure the account\n" .
                        "3. Screenshots will be shared in this chat as proof\n" .
                        "4. Buyer can then proceed with payment to seller\n\n" .
                        "💰 **For the Buyer**: Once you see the screenshots confirming agent control, you can safely pay the seller via your agreed payment method and then click \"I HAVE PAID THE SELLER\" button in your deal interface.\n\n" .
                        "🔒 **Security**: The account is now fully secured under our agent's control until final transfer to buyer.";
                    
                    // Insert system message
                    $stmt = $this->db->prepare("
                        INSERT INTO messages (chatId, senderId, content, messageType, isRead, createdAt, updatedAt)
                        VALUES (?, 1, ?, 'system', 0, NOW(), NOW())
                    ");
                    $stmt->execute([$chat['chat_id'], $message_content]);
                    
                    // Update chat last message
                    $stmt = $this->db->prepare("
                        UPDATE chats SET lastMessage = ?, lastMessageTime = NOW(), updatedAt = NOW()
                        WHERE id = ?
                    ");
                    $stmt->execute(['Admin: Agent ownership confirmed - ready for payment', $chat['chat_id']]);
                }
            } catch (Exception $e) {
                error_log('Error sending ownership confirmation message: ' . $e->getMessage());
                // Don't fail the confirmation if message fails
            }
            
            $this->db->commit();
            
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Primary owner status confirmed successfully',
                'deal_id' => $dealId,
                'transaction_id' => $deal['transaction_id']
            ]);
            
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log('Admin confirm primary owner error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
}
