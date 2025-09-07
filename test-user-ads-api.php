<?php
// Test the API endpoint directly
require_once __DIR__ . '/php-backend/config/database.php';
require_once __DIR__ . '/php-backend/models/Ad.php';

try {
    echo "🔍 Testing API endpoint directly...\n";
    
    // Simulate a user session for user ID 5 (huzaifanasir111)
    $mockUser = [
        'id' => 5,
        'username' => 'huzaifanasir111',
        'email' => 'nasirhuzaifa95@gmail.com'
    ];
    
    echo "👤 Testing for user: ID={$mockUser['id']}, Username={$mockUser['username']}\n";
    
    // Test the Ad model method directly
    $result = Ad::getUserAdsWithPagination($mockUser['id'], 10, 0, null);
    
    echo "\n📊 getUserAdsWithPagination results:\n";
    echo "Total Items: {$result['totalItems']}\n";
    echo "Total Pages: {$result['totalPages']}\n";
    echo "Ads Count: " . count($result['ads']) . "\n";
    
    foreach ($result['ads'] as $ad) {
        echo "  - Ad ID: {$ad['id']}, Title: {$ad['title']}, Status: {$ad['status']}, UserID: {$ad['userId']}\n";
    }
    
    // Test with status filter
    echo "\n🎯 Testing with status filter 'active':\n";
    $resultActive = Ad::getUserAdsWithPagination($mockUser['id'], 10, 0, 'active');
    echo "Active Ads Count: " . count($resultActive['ads']) . "\n";
    
    foreach ($resultActive['ads'] as $ad) {
        echo "  - Ad ID: {$ad['id']}, Title: {$ad['title']}, Status: {$ad['status']}\n";
    }
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . "\n";
    echo 'Stack trace: ' . $e->getTraceAsString() . "\n";
}
?>
