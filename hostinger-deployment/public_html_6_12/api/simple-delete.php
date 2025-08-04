<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get ad ID from query parameter
$adId = $_GET['id'] ?? null;

if (!$adId || !is_numeric($adId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid ad ID']);
    exit();
}

try {
    // Database connection (adjust these values to match your database)
    $host = 'localhost';
    $dbname = 'xsm_market';
    $username = 'root';  // Change to your DB username
    $password = '';      // Change to your DB password
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Simple delete query - just delete the ad, no questions asked
    $stmt = $pdo->prepare("DELETE FROM ads WHERE id = ?");
    $stmt->execute([$adId]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['message' => 'Ad deleted successfully', 'success' => true]);
    } else {
        echo json_encode(['message' => 'Ad not found or already deleted', 'success' => false]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
