<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=xsm_market_local', 'root', 'localpassword123');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔍 Checking users table:\n";
    $stmt = $pdo->query('SELECT id, username, email FROM users ORDER BY id');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $user) {
        echo "User ID: {$user['id']}, Username: {$user['username']}, Email: {$user['email']}\n";
    }
    
    echo "\n🔍 Checking ads table:\n";
    $stmt = $pdo->query('SELECT id, title, userId, status FROM ads ORDER BY id');
    $ads = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($ads as $ad) {
        echo "Ad ID: {$ad['id']}, Title: {$ad['title']}, UserID: {$ad['userId']}, Status: {$ad['status']}\n";
    }
    
    echo "\n🔍 Checking table structure:\n";
    $stmt = $pdo->query('DESCRIBE ads');
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $column) {
        echo "Column: {$column['Field']}, Type: {$column['Type']}\n";
    }
    
    echo "\n🔍 Checking specific user huzaifanasir111:\n";
    $stmt = $pdo->prepare('SELECT id, username FROM users WHERE username = ?');
    $stmt->execute(['huzaifanasir111']);
    $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($targetUser) {
        echo "Found user: ID={$targetUser['id']}, Username={$targetUser['username']}\n";
        
        $stmt = $pdo->prepare('SELECT COUNT(*) as count FROM ads WHERE userId = ?');
        $stmt->execute([$targetUser['id']]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "Ads count for this user: $count\n";
        
        $stmt = $pdo->prepare('SELECT id, title, status FROM ads WHERE userId = ?');
        $stmt->execute([$targetUser['id']]);
        $userAds = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($userAds as $ad) {
            echo "  - Ad ID: {$ad['id']}, Title: {$ad['title']}, Status: {$ad['status']}\n";
        }
    } else {
        echo "User 'huzaifanasir111' not found!\n";
    }
    
} catch (Exception $e) {
    echo 'Database Error: ' . $e->getMessage() . "\n";
}
?>
