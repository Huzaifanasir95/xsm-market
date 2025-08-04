<?php
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Ad.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validation.php';

class AdController {
    
    // Get all ads - matches Node.js getAllAds exactly
    public function getAllAds() {
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 20);
        $platform = $_GET['platform'] ?? '';
        $category = $_GET['category'] ?? '';
        $minPrice = $_GET['minPrice'] ?? '';
        $maxPrice = $_GET['maxPrice'] ?? '';
        $search = $_GET['search'] ?? '';
        
        $offset = ($page - 1) * $limit;
        
        $filters = [];
        if ($platform) $filters['platform'] = $platform;
        if ($category) $filters['category'] = $category;
        if ($minPrice) $filters['minPrice'] = floatval($minPrice);
        if ($maxPrice) $filters['maxPrice'] = floatval($maxPrice);
        if ($search) $filters['search'] = $search;
        
        try {
            $ads = Ad::getAll($limit, $offset, $filters);
            $total = Ad::count($filters);
            
            Response::json([
                'ads' => $ads,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'totalPages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('Get ads error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Create new ad - exact match to Node.js implementation
    public function createAd() {
        $user = AuthMiddleware::protect();
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        error_log('Create ad attempt by user: ' . $user['id']);
        error_log('Create ad data: ' . json_encode($input));
        
        // Extract required fields - exact match to Node.js
        $title = $input['title'] ?? '';
        $description = $input['description'] ?? '';
        $channelUrl = $input['channelUrl'] ?? '';
        $platform = $input['platform'] ?? '';
        $category = $input['category'] ?? '';
        $contentType = $input['contentType'] ?? null;
        $contentCategory = $input['contentCategory'] ?? null;
        $price = isset($input['price']) && $input['price'] !== '' ? floatval($input['price']) : 0;
        $subscribers = isset($input['subscribers']) && $input['subscribers'] !== '' ? intval($input['subscribers']) : 0;
        $monthlyIncome = isset($input['monthlyIncome']) && $input['monthlyIncome'] !== '' ? floatval($input['monthlyIncome']) : 0;
        $isMonetized = isset($input['isMonetized']) ? (bool)$input['isMonetized'] : false;
        $incomeDetails = $input['incomeDetails'] ?? '';
        $promotionDetails = $input['promotionDetails'] ?? '';
        $thumbnail = $input['thumbnail'] ?? null;
        $screenshots = $input['screenshots'] ?? [];
        $tags = $input['tags'] ?? [];
        
        // Validation - exact match to Node.js
        if (!$title || !$channelUrl || !$platform || !$category || !$price) {
            Response::error('Title, channel URL, platform, category, and price are required', 400);
            return;
        }
        
        if (floatval($price) <= 0) {
            Response::error('Price must be greater than 0', 400);
            return;
        }
        
        // Auto-detect platform from URL - exact match to Node.js
        $detectedPlatform = strtolower($platform);
        if (strpos($channelUrl, 'youtube.com') !== false || strpos($channelUrl, 'youtu.be') !== false) {
            $detectedPlatform = 'youtube';
        } elseif (strpos($channelUrl, 'facebook.com') !== false || strpos($channelUrl, 'fb.com') !== false) {
            $detectedPlatform = 'facebook';
        } elseif (strpos($channelUrl, 'instagram.com') !== false) {
            $detectedPlatform = 'instagram';
        } elseif (strpos($channelUrl, 'twitter.com') !== false || strpos($channelUrl, 'x.com') !== false) {
            $detectedPlatform = 'twitter';
        } elseif (strpos($channelUrl, 'tiktok.com') !== false) {
            $detectedPlatform = 'tiktok';
        }
        
        try {
            // Prepare data for Ad::create - exact match to Node.js
            $adData = [
                'userId' => $user['id'],
                'title' => $title,
                'description' => $description,
                'channelUrl' => $channelUrl,
                'platform' => $detectedPlatform,
                'category' => $category,
                'contentType' => ($contentType && trim($contentType) !== '') ? $contentType : null,
                'contentCategory' => ($contentCategory && trim($contentCategory) !== '') ? $contentCategory : null,
                'price' => floatval($price),
                'subscribers' => $subscribers ? intval($subscribers) : 0,
                'monthlyIncome' => $monthlyIncome ? floatval($monthlyIncome) : 0,
                'isMonetized' => (bool)$isMonetized,
                'incomeDetails' => $incomeDetails,
                'promotionDetails' => $promotionDetails,
                'thumbnail' => $thumbnail,
                'screenshots' => $screenshots,
                'tags' => $tags,
                'status' => 'active' // All new ads start as active for immediate listing
            ];
            
            error_log('Processed ad data: ' . json_encode($adData));
            
            $adId = Ad::create($adData);
            
            error_log('New ad created: ' . $adId . ' by user ' . $user['id']);
            
            // Return response - exact match to Node.js
            Response::success([
                'message' => 'Ad created successfully and is now live!',
                'ad' => [
                    'id' => (int)$adId,
                    'title' => $title,
                    'platform' => $detectedPlatform,
                    'price' => floatval($price),
                    'status' => 'active',
                    'createdAt' => date('Y-m-d H:i:s')
                ]
            ], 201);
            
        } catch (Exception $e) {
            error_log('Create ad error: ' . $e->getMessage());
            error_log('Request body: ' . json_encode($input));
            error_log('User ID: ' . $user['id']);
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Get ad by ID
    public function getAdById($adId) {
        try {
            $ad = Ad::findByIdWithSeller($adId);
            
            if (!$ad) {
                Response::error('Ad not found', 404);
            }
            
            // Increment view count
            Ad::incrementViews($adId);
            
            Response::json($ad);
            
        } catch (Exception $e) {
            error_log('Get ad error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Update ad
    public function updateAd($adId) {
        $user = AuthMiddleware::protect();
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        try {
            $ad = Ad::findById($adId);
            
            if (!$ad) {
                Response::error('Ad not found', 404);
            }
            
            // Check ownership
            if ($ad['userId'] != $user['id'] && !$user['isAdmin']) {
                Response::error('Access denied', 403);
            }
            
            // Fields that can be updated
            $allowedFields = [
                'title', 'description', 'channelUrl', 'platform', 'category',
                'contentType', 'contentCategory', 'price', 'subscribers', 'monthlyIncome',
                'isMonetized', 'incomeDetails', 'promotionDetails', 'totalViews',
                'thumbnail', 'screenshots', 'tags', 'socialBladeUrl', 'location', 'sellCondition'
            ];
            
            $updateData = [];
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    if (in_array($field, ['title', 'description', 'channelUrl', 'category', 'contentCategory', 'incomeDetails', 'promotionDetails', 'thumbnail', 'socialBladeUrl', 'location', 'sellCondition'])) {
                        $updateData[$field] = trim($input[$field]);
                    } else {
                        $updateData[$field] = $input[$field];
                    }
                }
            }
            
            // Validation for updated fields
            if (isset($updateData['title']) && (strlen($updateData['title']) < 3 || strlen($updateData['title']) > 255)) {
                Response::error('Title must be between 3 and 255 characters', 400);
            }
            
            if (isset($updateData['channelUrl']) && !filter_var($updateData['channelUrl'], FILTER_VALIDATE_URL)) {
                Response::error('Please provide a valid channel URL', 400);
            }
            
            if (isset($updateData['platform']) && !in_array($updateData['platform'], ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube'])) {
                Response::error('Invalid platform', 400);
            }
            
            if (isset($updateData['price']) && floatval($updateData['price']) < 0) {
                Response::error('Price must be a positive number', 400);
            }
            
            if (empty($updateData)) {
                Response::error('No valid fields to update', 400);
            }
            
            Ad::update($adId, $updateData);
            
            $updatedAd = Ad::findByIdWithSeller($adId);
            
            Response::json([
                'message' => 'Ad updated successfully',
                'ad' => $updatedAd
            ]);
            
        } catch (Exception $e) {
            error_log('Update ad error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Delete ad
    public function deleteAd($adId) {
        $user = AuthMiddleware::protect();
        
        try {
            $ad = Ad::findById($adId);
            
            if (!$ad) {
                Response::error('Ad not found', 404);
            }
            
            // Check ownership or admin
            if ($ad['userId'] != $user['id'] && !$user['isAdmin']) {
                Response::error('Access denied', 403);
            }
            
            Ad::delete($adId);
            
            Response::json(['message' => 'Ad deleted successfully']);
            
        } catch (Exception $e) {
            error_log('Delete ad error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Mark ad as sold
    public function markAsSold($adId) {
        $user = AuthMiddleware::protect();
        
        $input = json_decode(file_get_contents('php://input'), true);
        $buyerId = $input['buyerId'] ?? null;
        
        try {
            $ad = Ad::findById($adId);
            
            if (!$ad) {
                Response::error('Ad not found', 404);
            }
            
            // Check ownership
            if ($ad['userId'] != $user['id']) {
                Response::error('Access denied', 403);
            }
            
            if ($ad['status'] === 'sold') {
                Response::error('Ad is already marked as sold', 400);
            }
            
            Ad::markAsSold($adId, $buyerId);
            
            Response::json(['message' => 'Ad marked as sold successfully']);
            
        } catch (Exception $e) {
            error_log('Mark as sold error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Get user's ads
    public function getMyAds() {
        $user = AuthMiddleware::protect();
        
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 10);
        $status = $_GET['status'] ?? null;
        $offset = ($page - 1) * $limit;
        
        try {
            $result = Ad::getUserAdsWithPagination($user['id'], $limit, $offset, $status);
            
            Response::json([
                'ads' => $result['ads'],
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => $result['totalPages'],
                    'totalItems' => $result['totalItems'],
                    'itemsPerPage' => $limit
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('Get my ads error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Search ads
    public function searchAds() {
        $search = $_GET['q'] ?? '';
        $limit = intval($_GET['limit'] ?? 20);
        
        if (empty($search)) {
            Response::error('Search query is required', 400);
        }
        
        try {
            $ads = Ad::search($search, $limit);
            
            Response::json([
                'ads' => $ads,
                'query' => $search
            ]);
            
        } catch (Exception $e) {
            error_log('Search ads error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
}
?>
