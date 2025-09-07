<?php
/**
 * YouTube Timer Notification Script
 * 
 * This script checks for YouTube deals where the 7-day timer has completed
 * and sends notifications to sellers to promote the agent to primary owner.
 * 
 * Should be run via cron job every hour or day.
 */

require_once __DIR__ . '/config/database.php';

try {
    $pdo = Database::getConnection();
    
    // Find deals where YouTube timer has expired but seller hasn't made agent primary owner yet
    $stmt = $pdo->prepare("
        SELECT d.*, 
               seller.username as seller_username,
               buyer.username as buyer_username
        FROM deals d
        LEFT JOIN users seller ON d.seller_id = seller.id
        LEFT JOIN users buyer ON d.buyer_id = buyer.id
        WHERE d.platform_type = 'youtube'
        AND d.seller_gave_rights = TRUE
        AND d.rights_timer_expires_at IS NOT NULL
        AND d.rights_timer_expires_at <= NOW()
        AND d.timer_completed = FALSE
        AND d.seller_made_primary_owner = FALSE
    ");
    $stmt->execute();
    $expiredDeals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($expiredDeals) . " deals with expired YouTube timers\n";
    
    foreach ($expiredDeals as $deal) {
        echo "Processing deal #{$deal['id']} - {$deal['channel_title']}\n";
        
        try {
            $pdo->beginTransaction();
            
            // Mark timer as completed
            $stmt = $pdo->prepare("
                UPDATE deals 
                SET timer_completed = TRUE, updated_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$deal['id']]);
            
            // Find the chat between buyer and seller
            $stmt = $pdo->prepare("
                SELECT c.id as chat_id FROM chats c
                INNER JOIN chat_participants cp1 ON c.id = cp1.chatId
                INNER JOIN chat_participants cp2 ON c.id = cp2.chatId
                WHERE cp1.userId = ? AND cp1.isActive = 1
                AND cp2.userId = ? AND cp2.isActive = 1
                AND cp1.chatId = cp2.chatId
                ORDER BY c.createdAt DESC
                LIMIT 1
            ");
            $stmt->execute([$deal['buyer_id'], $deal['seller_id']]);
            $chat = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($chat) {
                $message_content = "⏰ **YOUTUBE TIMER COMPLETED** ⏰\n\n" .
                    "Great news! The 7-day YouTube waiting period has now completed.\n\n" .
                    "**Channel**: {$deal['channel_title']}\n" .
                    "**Transaction ID**: #{$deal['id']}\n" .
                    "**Timer started**: " . date('M j, Y \a\t g:i A', strtotime($deal['rights_timer_started_at'])) . "\n" .
                    "**Timer completed**: " . date('M j, Y \a\t g:i A') . "\n\n" .
                    "🎯 **You can now promote our agent to Primary Owner of your YouTube channel.**\n\n" .
                    "📋 **Note**: Our admin can also manually confirm the promotion at any time once you've made the agent Primary Owner.\n\n" .
                    "⚠️ **Important**: Only promote to Primary Owner, don't transfer ownership yet. Our agent will handle the final transfer securely after confirmation.";
                
                // Insert system message
                $stmt = $pdo->prepare("
                    INSERT INTO messages (chatId, senderId, content, messageType, isRead, createdAt, updatedAt)
                    VALUES (?, 1, ?, 'system', 0, NOW(), NOW())
                ");
                $stmt->execute([$chat['chat_id'], $message_content]);
                
                // Update chat's last message
                $stmt = $pdo->prepare("
                    UPDATE chats SET lastMessage = ?, lastMessageTime = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$message_content, $chat['chat_id']]);
                
                echo "✅ Timer completion notification sent for deal #{$deal['id']}\n";
            } else {
                echo "❌ No chat found for deal #{$deal['id']}\n";
            }
            
            $pdo->commit();
            
        } catch (Exception $e) {
            $pdo->rollBack();
            echo "❌ Error processing deal #{$deal['id']}: " . $e->getMessage() . "\n";
        }
    }
    
    echo "YouTube timer notification check completed\n";
    
} catch (Exception $e) {
    echo "❌ Script error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "✅ YouTube timer notification script completed successfully\n";
?>
