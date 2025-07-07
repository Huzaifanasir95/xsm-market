<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Chat.php';
require_once __DIR__ . '/../models/Message.php';
require_once __DIR__ . '/../models/ChatParticipant.php';
require_once __DIR__ . '/../models/Ad.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validation.php';

class ChatController {
    
    // Get all chats for a user
    public function getUserChats() {
        $user = AuthMiddleware::authenticate();
        $userId = $user['id'];
        
        error_log("Getting chats for user ID: $userId");
        
        try {
            $chats = Chat::getUserChats($userId);
            error_log("Found " . count($chats) . " chats for user $userId");
            Response::json($chats);
        } catch (Exception $e) {
            error_log('Error fetching user chats: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Create or get existing chat
    public function createOrGetChat() {
        $user = AuthMiddleware::authenticate();
        $currentUserId = $user['id'];
        
        $input = json_decode(file_get_contents('php://input'), true);
        $participantId = $input['participantId'] ?? null;
        $adId = $input['adId'] ?? null;
        $type = $input['type'] ?? 'direct';
        
        if (!$participantId) {
            Response::error('Participant ID is required', 400);
        }
        
        try {
            $participantIdInt = intval($participantId);
            
            // Check if direct chat already exists between these users
            if ($type === 'direct') {
                $existingChat = Chat::findDirectChatBetweenUsers($currentUserId, $participantIdInt);
                if ($existingChat) {
                    Response::json($existingChat);
                }
            }
            
            // Create new chat
            $chatData = [
                'type' => $type,
                'adId' => $adId ?: null,
                'name' => $type === 'group' ? ($input['name'] ?? null) : null
            ];
            
            $newChatId = Chat::create($chatData);
            
            // Add participants
            ChatParticipant::bulkCreate([
                ['chatId' => $newChatId, 'userId' => $currentUserId, 'role' => 'admin'],
                ['chatId' => $newChatId, 'userId' => $participantIdInt, 'role' => 'member']
            ]);
            
            // Fetch complete chat data
            $chatWithDetails = Chat::findByIdWithDetails($newChatId);
            
            Response::json($chatWithDetails, 201);
        } catch (Exception $e) {
            error_log('Error creating chat: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Get messages for a chat
    public function getChatMessages($chatId) {
        $user = AuthMiddleware::authenticate();
        $userId = $user['id'];
        
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 50;
        $since = $_GET['since'] ?? null;

        try {
            // Verify user is participant in this chat
            $participant = ChatParticipant::findOne($chatId, $userId);
            if (!$participant || !$participant['isActive']) {
                Response::error('Access denied', 403);
            }

            // If 'since' parameter is provided, get only new messages
            if ($since !== null && $since > 0) {
                $messages = Message::getNewMessagesSince($chatId, $since);
                Response::json($messages);
                return;
            }

            // Otherwise get paginated messages
            $messages = Message::getChatMessages($chatId, $page, $limit);
            
            // Update last seen only for full message loads (not polling)
            ChatParticipant::updateLastSeen($chatId, $userId);
            
            Response::json(array_reverse($messages));
        } catch (Exception $e) {
            error_log('Error fetching messages: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Send a message
    public function sendMessage($chatId) {
        $user = AuthMiddleware::authenticate();
        $senderId = $user['id'];
        
        error_log("Attempting to send message to chat $chatId from user $senderId");
        
        $input = json_decode(file_get_contents('php://input'), true);
        $content = trim($input['content'] ?? '');
        $messageType = $input['messageType'] ?? 'text';
        $replyToId = $input['replyToId'] ?? null;
        
        error_log("Message data - Content: '$content', Type: $messageType");
        
        // Allow empty content for non-text messages (like images)
        if (empty($content) && $messageType === 'text') {
            error_log("Message content validation failed - empty content for text message");
            Response::error('Message content is required', 400);
        }
        
        try {
            // Verify user is participant in this chat
            $participant = ChatParticipant::findOne($chatId, $senderId);
            error_log("Participant query result: " . json_encode($participant));
            
            if (!$participant) {
                error_log("No participant found for user $senderId in chat $chatId");
                Response::error('Access denied - not a participant', 403);
            }
            
            if (!$participant['isActive']) {
                error_log("User $senderId is not active in chat $chatId");
                Response::error('Access denied - not active', 403);
            }
            
            // Create message
            $messageId = Message::create([
                'content' => $content,
                'senderId' => $senderId,
                'chatId' => $chatId,
                'messageType' => $messageType,
                'replyToId' => $replyToId
            ]);
            
            error_log("Created message with ID: $messageId");
            
            // Update chat's last message
            Chat::updateLastMessage($chatId, $content);
            
            // Fetch complete message data
            $messageWithDetails = Message::findByIdWithDetails($messageId);
            
            error_log("Sending message response: " . json_encode($messageWithDetails));
            Response::json($messageWithDetails, 201);
        } catch (Exception $e) {
            error_log('Error sending message: ' . $e->getMessage());
            error_log('Stack trace: ' . $e->getTraceAsString());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Mark messages as read
    public function markMessagesAsRead($chatId) {
        $user = AuthMiddleware::authenticate();
        $userId = $user['id'];
        
        try {
            // Verify user is participant
            $participant = ChatParticipant::findOne($chatId, $userId);
            if (!$participant || !$participant['isActive']) {
                Response::error('Access denied', 403);
            }
            
            // Mark all unread messages as read
            Message::markAsRead($chatId, $userId);
            
            Response::json(['message' => 'Messages marked as read']);
        } catch (Exception $e) {
            error_log('Error marking messages as read: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Create ad inquiry chat
    public function createAdInquiryChat() {
        $user = AuthMiddleware::authenticate();
        $buyerId = $user['id'];
        
        $input = json_decode(file_get_contents('php://input'), true);
        $adId = $input['adId'] ?? null;
        $message = trim($input['message'] ?? '');
        $sellerId = $input['sellerId'] ?? null;
        $sellerName = $input['sellerName'] ?? null;
        
        if (!$adId || empty($message)) {
            Response::error('Ad ID and message are required', 400);
        }
        
        try {
            // Get ad details
            $ad = Ad::findByIdWithSeller($adId);
            if (!$ad) {
                Response::error('Ad not found', 404);
            }
            
            $actualSellerId = $sellerId ?: $ad['userId'];
            $actualSellerName = $sellerName ?: ($ad['seller_username'] ?? 'Unknown Seller');
            
            if ($actualSellerId == $buyerId) {
                Response::error('Cannot create chat with yourself', 400);
            }
            
            // Check if chat already exists between these users for this ad
            $existingChat = Chat::findAdInquiryChatBetweenUsers($adId, $buyerId, $actualSellerId);
            
            if ($existingChat) {
                // Use existing chat - don't send a new message
                $chat = $existingChat;
                error_log("Using existing chat {$chat['id']} for buyer $buyerId and seller $actualSellerId for ad $adId");
            } else {
                // Create new ad inquiry chat
                $chatId = Chat::create([
                    'type' => 'ad_inquiry',
                    'adId' => $adId,
                    'name' => "Chat with $actualSellerName"
                ]);
                
                // Add participants
                ChatParticipant::bulkCreate([
                    ['chatId' => $chatId, 'userId' => $actualSellerId, 'role' => 'admin'],
                    ['chatId' => $chatId, 'userId' => $buyerId, 'role' => 'member']
                ]);
                
                // Send initial message only for new chats
                Message::create([
                    'content' => $message,
                    'senderId' => $buyerId,
                    'chatId' => $chatId,
                    'messageType' => 'text'
                ]);
                
                // Update chat's last message
                Chat::updateLastMessage($chatId, $message);
                
                $chat = ['id' => $chatId];
                error_log("Created new chat $chatId for buyer $buyerId and seller $actualSellerId for ad $adId");
            }
            
            // Return chat with details
            $chatWithDetails = Chat::findByIdWithFullDetails($chat['id']);
            
            $statusCode = $existingChat ? 200 : 201;
            Response::json($chatWithDetails, $statusCode);
        } catch (Exception $e) {
            error_log('Error creating ad inquiry chat: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
}
?>
