<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Only POST allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$adId = $input['adId'] ?? null;

if (!$adId) {
    echo json_encode(['error' => 'No ad ID provided']);
    exit();
}

try {
    $pdo = new PDO("mysql:host=localhost;dbname=xsm_market;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->prepare("DELETE FROM ads WHERE id = ?");
    $stmt->execute([$adId]);
    
    echo json_encode(['success' => true, 'message' => 'Ad deleted']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
