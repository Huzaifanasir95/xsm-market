<?php
require_once __DIR__ . '/php-backend/config/database.php';

// Test script to verify image storage in database
try {
    $pdo = Database::getConnection();
    
    // Create a test ad with base64 image
    $testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    $sql = "INSERT INTO ads (userId, title, description, channelUrl, platform, category, price, primary_image, status) 
            VALUES (:userId, :title, :description, :channelUrl, :platform, :category, :price, :primary_image, :status)";
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([
        ':userId' => 1, // Assuming user ID 1 exists
        ':title' => 'Test Channel with Image',
        ':description' => 'Test channel for image storage verification',
        ':channelUrl' => 'https://www.youtube.com/test',
        ':platform' => 'youtube',
        ':category' => 'Testing',
        ':price' => 100.00,
        ':primary_image' => $testImage,
        ':status' => 'active'
    ]);
    
    if ($result) {
        $adId = $pdo->lastInsertId();
        echo "✅ Test ad created successfully with ID: $adId\n";
        
        // Retrieve the ad to verify image storage
        $stmt = $pdo->prepare("SELECT id, title, primary_image FROM ads WHERE id = :id");
        $stmt->execute([':id' => $adId]);
        $ad = $stmt->fetch();
        
        if ($ad && $ad['primary_image']) {
            echo "✅ Image stored successfully in database\n";
            echo "Image data length: " . strlen($ad['primary_image']) . " characters\n";
            echo "Image starts with: " . substr($ad['primary_image'], 0, 50) . "...\n";
        } else {
            echo "❌ Image not stored properly\n";
        }
        
        // Clean up - delete test ad
        $stmt = $pdo->prepare("DELETE FROM ads WHERE id = :id");
        $stmt->execute([':id' => $adId]);
        echo "🧹 Test ad cleaned up\n";
        
    } else {
        echo "❌ Failed to create test ad\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
