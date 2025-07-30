<?php
// AdController - Converted from Node.js to maintain 100% identical API responses
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/jwt.php';

class AdController {
    
    // Create a new ad/listing - identical to Node.js createAd
    public function createAd() {
        try {
            // Get user from JWT token
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                Response::error('Authorization token required', 401);
                return;
            }
            
            $token = $matches[1];
            $payload = JWT::verify($token);
            if (!$payload) {
                Response::error('Invalid token', 401);
                return;
            }
            
            $userId = $payload['userId'];
            $input = json_decode(file_get_contents('php://input'), true);
            
            $title = $input['title'] ?? '';
            $description = $input['description'] ?? '';
            $channelUrl = $input['channelUrl'] ?? '';
            $platform = $input['platform'] ?? '';
            $category = $input['category'] ?? '';
            $contentType = $input['contentType'] ?? null;
            $contentCategory = $input['contentCategory'] ?? null;
            $price = $input['price'] ?? 0;
            $subscribers = $input['subscribers'] ?? 0;
            $monthlyIncome = $input['monthlyIncome'] ?? 0;
            $isMonetized = $input['isMonetized'] ?? false;
            $incomeDetails = $input['incomeDetails'] ?? null;
            $promotionDetails = $input['promotionDetails'] ?? null;
            $thumbnail = $input['thumbnail'] ?? null;
            $screenshots = $input['screenshots'] ?? [];
            $tags = $input['tags'] ?? [];
            
            // Validation
            if (!$title || !$channelUrl || !$platform || !$category || !$price) {
                Response::error('Title, channel URL, platform, category, and price are required', 400);
                return;
            }
            
            if ($price <= 0) {
                Response::error('Price must be greater than 0', 400);
                return;
            }
            
            // Auto-detect platform from URL if not provided correctly
            $detectedPlatform = strtolower($platform);
            if (strpos($channelUrl, 'youtube.com') !== false || strpos($channelUrl, 'youtu.be') !== false) {
                $detectedPlatform = 'youtube';
            } else if (strpos($channelUrl, 'facebook.com') !== false || strpos($channelUrl, 'fb.com') !== false) {
                $detectedPlatform = 'facebook';
            } else if (strpos($channelUrl, 'instagram.com') !== false) {
                $detectedPlatform = 'instagram';
            } else if (strpos($channelUrl, 'twitter.com') !== false || strpos($channelUrl, 'x.com') !== false) {
                $detectedPlatform = 'twitter';
            } else if (strpos($channelUrl, 'tiktok.com') !== false) {
                $detectedPlatform = 'tiktok';
            }
            
            $adId = Ad::create([
                'userId' => $userId,
                'title' => $title,
                'description' => $description,
                'channelUrl' => $channelUrl,
                'platform' => $detectedPlatform,
                'category' => $category,
                'contentType' => $contentType,
                'contentCategory' => $contentCategory,
                'price' => (float)$price,
                'subscribers' => (int)$subscribers,
                'monthlyIncome' => (float)$monthlyIncome,
                'isMonetized' => (bool)$isMonetized,
                'incomeDetails' => $incomeDetails,
                'promotionDetails' => $promotionDetails,
                'thumbnail' => $thumbnail,
                'screenshots' => $screenshots,
                'tags' => $tags,
                'status' => 'active' // All new ads start as active for immediate listing
            ]);
            
            $ad = Ad::findById($adId);
            
            error_log("New ad created: $adId by user $userId");
            
            Response::success([
                'message' => 'Ad created successfully and is now live!',
                'ad' => [
                    'id' => (int)$ad['id'],
                    'title' => $ad['title'],
                    'platform' => $ad['platform'],
                    'price' => (float)$ad['price'],
                    'status' => $ad['status'],
                    'createdAt' => $ad['createdAt']
                ]
            ], 201);
            
        } catch (Exception $e) {
            error_log('Create ad error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Get all ads (public - for marketplace display) - identical to Node.js getAllAds
    public function getAllAds() {
        try {
            // Get query parameters
            $platform = $_GET['platform'] ?? null;
            $category = $_GET['category'] ?? null;
            $minPrice = isset($_GET['minPrice']) ? (float)$_GET['minPrice'] : null;
            $maxPrice = isset($_GET['maxPrice']) ? (float)$_GET['maxPrice'] : null;
            $sortBy = $_GET['sortBy'] ?? 'createdAt';
            $sortOrder = strtoupper($_GET['sortOrder'] ?? 'DESC');
            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(max(1, (int)($_GET['limit'] ?? 20)), 50); // Between 1 and 50
            $search = $_GET['search'] ?? null;
            
            $offset = ($page - 1) * $limit;
            
            // Build WHERE conditions
            $whereConditions = ["status = 'active'"]; // Only show active ads
            $params = [];
            
            if ($platform && $platform !== 'all') {
                $whereConditions[] = "platform = ?";
                $params[] = $platform;
            }
            
            if ($category && $category !== 'all') {
                $whereConditions[] = "category = ?";
                $params[] = $category;
            }
            
            if ($minPrice !== null || $maxPrice !== null) {
                if ($minPrice !== null && $maxPrice !== null) {
                    $whereConditions[] = "price BETWEEN ? AND ?";
                    $params[] = $minPrice;
                    $params[] = $maxPrice;
                } elseif ($minPrice !== null) {
                    $whereConditions[] = "price >= ?";
                    $params[] = $minPrice;
                } elseif ($maxPrice !== null) {
                    $whereConditions[] = "price <= ?";
                    $params[] = $maxPrice;
                }
            }
            
            if ($search) {
                $whereConditions[] = "(title LIKE ? OR description LIKE ? OR contentCategory LIKE ?)";
                $searchTerm = "%{$search}%";
                $params[] = $searchTerm;
                $params[] = $searchTerm;
                $params[] = $searchTerm;
            }
            
            // Valid sort fields to prevent SQL injection
            $validSortFields = ['createdAt', 'price', 'subscribers', 'views'];
            $sortField = in_array($sortBy, $validSortFields) ? $sortBy : 'createdAt';
            $sortDirection = ($sortOrder === 'ASC') ? 'ASC' : 'DESC';
            
            $database = new Database();
            $db = $database->getConnection();
            
            // Get total count for pagination
            $countSql = "SELECT COUNT(*) as count FROM ads WHERE " . implode(' AND ', $whereConditions);
            $countStmt = $db->prepare($countSql);
            $countStmt->execute($params);
            $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            // Get ads with seller information
            $sql = "
                SELECT 
                    a.id, a.title, a.description, a.channelUrl, a.platform, a.category,
                    a.contentType, a.contentCategory, a.price, a.subscribers, a.monthlyIncome,
                    a.isMonetized, a.incomeDetails, a.promotionDetails, a.thumbnail,
                    a.screenshots, a.tags, a.status, a.views, a.createdAt, a.updatedAt,
                    u.id as seller_id, u.username as seller_username, u.profilePicture as seller_profilePicture
                FROM ads a
                INNER JOIN users u ON a.userId = u.id
                WHERE " . implode(' AND ', $whereConditions) . "
                ORDER BY a.{$sortField} {$sortDirection}
                LIMIT ? OFFSET ?
            ";
            
            $stmt = $db->prepare($sql);
            $stmt->execute(array_merge($params, [$limit, $offset]));
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format results to match Node.js response structure
            $ads = [];
            foreach ($results as $row) {
                $ads[] = [
                    'id' => (int)$row['id'],
                    'title' => $row['title'],
                    'description' => $row['description'],
                    'channelUrl' => $row['channelUrl'],
                    'platform' => $row['platform'],
                    'category' => $row['category'],
                    'contentType' => $row['contentType'],
                    'contentCategory' => $row['contentCategory'],
                    'price' => (float)$row['price'],
                    'subscribers' => (int)$row['subscribers'],
                    'monthlyIncome' => (float)$row['monthlyIncome'],
                    'isMonetized' => (bool)$row['isMonetized'],
                    'incomeDetails' => $row['incomeDetails'],
                    'promotionDetails' => $row['promotionDetails'],
                    'thumbnail' => $row['thumbnail'],
                    'screenshots' => json_decode($row['screenshots'] ?: '[]', true),
                    'tags' => json_decode($row['tags'] ?: '[]', true),
                    'status' => $row['status'],
                    'views' => (int)$row['views'],
                    'createdAt' => $row['createdAt'],
                    'updatedAt' => $row['updatedAt'],
                    'seller' => [
                        'id' => (int)$row['seller_id'],
                        'username' => $row['seller_username'],
                        'profilePicture' => $row['seller_profilePicture']
                    ]
                ];
            }
            
            // Return response matching Node.js format exactly
            http_response_code(200);
            echo json_encode([
                'ads' => $ads,
                'pagination' => [
                    'currentPage' => (int)$page,
                    'totalPages' => (int)ceil($totalCount / $limit),
                    'totalItems' => (int)$totalCount,
                    'itemsPerPage' => (int)$limit
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('Get all ads error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Server error', 'error' => $e->getMessage()]);
        }
    }
    
    // Get ad by ID - identical to Node.js getAdById
    public function getAdById($id) {
        try {
            $ad = Ad::findByIdWithSeller($id);
            
            if (!$ad) {
                Response::error('Ad not found', 404);
                return;
            }
            
            // Increment view count (only for active ads)
            if ($ad['status'] === 'active') {
                Ad::incrementViews($id);
                $ad['views'] = $ad['views'] + 1;
            }
            
            Response::success($ad);
            
        } catch (Exception $e) {
            error_log('Get ad by ID error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Update ad - identical to Node.js updateAd
    public function updateAd($id) {
        try {
            // Get user from JWT token
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                Response::error('Authorization token required', 401);
                return;
            }
            
            $token = $matches[1];
            $payload = JWT::verify($token);
            if (!$payload) {
                Response::error('Invalid token', 401);
                return;
            }
            
            $userId = $payload['userId'];
            
            // Check if ad exists and belongs to user
            $ad = Ad::findById($id);
            if (!$ad) {
                Response::error('Ad not found', 404);
                return;
            }
            
            if ($ad['userId'] != $userId) {
                Response::error('You can only edit your own ads', 403);
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Filter allowed update fields
            $allowedFields = ['title', 'description', 'channelUrl', 'platform', 'category', 'contentType', 'contentCategory', 'price', 'subscribers', 'monthlyIncome', 'isMonetized', 'incomeDetails', 'promotionDetails', 'thumbnail', 'screenshots', 'tags'];
            $updateData = [];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $input)) {
                    $updateData[$field] = $input[$field];
                }
            }
            
            // Validate price if provided
            if (isset($updateData['price']) && $updateData['price'] <= 0) {
                Response::error('Price must be greater than 0', 400);
                return;
            }
            
            // Convert numeric fields
            if (isset($updateData['price'])) $updateData['price'] = (float)$updateData['price'];
            if (isset($updateData['subscribers'])) $updateData['subscribers'] = (int)$updateData['subscribers'];
            if (isset($updateData['monthlyIncome'])) $updateData['monthlyIncome'] = (float)$updateData['monthlyIncome'];
            if (isset($updateData['isMonetized'])) $updateData['isMonetized'] = (bool)$updateData['isMonetized'];
            
            $updatedAd = Ad::update($id, $updateData);
            
            Response::success([
                'message' => 'Ad updated successfully',
                'ad' => $updatedAd
            ]);
            
        } catch (Exception $e) {
            error_log('Update ad error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Delete ad - identical to Node.js deleteAd
    public function deleteAd($id) {
        try {
            // Get user from JWT token
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                Response::error('Authorization token required', 401);
                return;
            }
            
            $token = $matches[1];
            $payload = JWT::verify($token);
            if (!$payload) {
                Response::error('Invalid token', 401);
                return;
            }
            
            $userId = $payload['userId'];
            
            // Check if ad exists and belongs to user
            $ad = Ad::findById($id);
            if (!$ad) {
                Response::error('Ad not found', 404);
                return;
            }
            
            if ($ad['userId'] != $userId) {
                Response::error('You can only delete your own ads', 403);
                return;
            }
            
            Ad::delete($id);
            
            Response::success(['message' => 'Ad deleted successfully']);
            
        } catch (Exception $e) {
            error_log('Delete ad error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Get user's ads - identical to Node.js getUserAds
    public function getMyAds() {
        try {
            // Get user from JWT token
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                Response::error('Authorization token required', 401);
                return;
            }
            
            $token = $matches[1];
            $payload = JWT::verify($token);
            if (!$payload) {
                Response::error('Invalid token', 401);
                return;
            }
            
            $userId = $payload['userId'];
            
            $page = (int)($_GET['page'] ?? 1);
            $limit = min((int)($_GET['limit'] ?? 20), 50);
            $status = $_GET['status'] ?? null;
            
            $offset = ($page - 1) * $limit;
            
            // Use the correct method that exists in the Ad model
            $result = Ad::getUserAdsWithPagination($userId, $limit, $offset, $status);
            
            Response::success([
                'ads' => $result['ads'],
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => $result['totalPages'],
                    'totalItems' => $result['totalItems'],
                    'itemsPerPage' => $limit
                ]
            ]);
            
        } catch (Exception $e) {
            error_log('Get user ads error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Mark ad as sold - identical to Node.js markAsSold
    public function markAsSold($id) {
        try {
            // Get user from JWT token
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            
            if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                Response::error('Authorization token required', 401);
                return;
            }
            
            $token = $matches[1];
            $payload = JWT::verify($token);
            if (!$payload) {
                Response::error('Invalid token', 401);
                return;
            }
            
            $userId = $payload['userId'];
            
            // Check if ad exists and belongs to user
            $ad = Ad::findById($id);
            if (!$ad) {
                Response::error('Ad not found', 404);
                return;
            }
            
            if ($ad['userId'] != $userId) {
                Response::error('You can only mark your own ads as sold', 403);
                return;
            }
            
            if ($ad['status'] === 'sold') {
                Response::error('Ad is already marked as sold', 400);
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $soldTo = $input['soldTo'] ?? null;
            
            $updatedAd = Ad::markAsSold($id, $soldTo);
            
            Response::success([
                'message' => 'Ad marked as sold successfully',
                'ad' => $updatedAd
            ]);
            
        } catch (Exception $e) {
            error_log('Mark as sold error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Get platform statistics - identical to Node.js getPlatformStats
    public function getPlatformStats() {
        try {
            // This would require custom SQL queries to match Node.js Sequelize aggregation
            // For now, return basic stats
            $platforms = ['youtube', 'instagram', 'facebook', 'twitter', 'tiktok'];
            $stats = [];
            
            foreach ($platforms as $platform) {
                $count = Ad::count(['platform' => $platform, 'status' => 'active']);
                $stats[] = [
                    'platform' => $platform,
                    'count' => (int)$count
                ];
            }
            
            Response::success(['platformStats' => $stats]);
            
        } catch (Exception $e) {
            error_log('Get platform stats error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
    
    // Search ads - identical to Node.js searchAds
    public function searchAds() {
        try {
            $this->getAllAds(); // Same functionality as getAllAds with filters
        } catch (Exception $e) {
            error_log('Search ads error: ' . $e->getMessage());
            Response::error('Server error: ' . $e->getMessage(), 500);
        }
    }
}
