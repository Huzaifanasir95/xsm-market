<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the requested file path
$requestUri = $_SERVER['REQUEST_URI'];
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'];

// Check if this is an uploads request
if (strpos($path, '/uploads/') === 0) {
    // Remove /uploads/ prefix and get the actual file path
    $relativePath = substr($path, 9); // Remove '/uploads/'
    $filePath = __DIR__ . '/uploads/' . $relativePath;
    
    // Security check - ensure the file is within the uploads directory
    $realPath = realpath($filePath);
    $uploadsDir = realpath(__DIR__ . '/uploads/');
    
    if ($realPath && $uploadsDir && strpos($realPath, $uploadsDir) === 0 && file_exists($realPath)) {
        // Get file info
        $fileInfo = pathinfo($realPath);
        $extension = strtolower($fileInfo['extension'] ?? '');
        
        // Set appropriate content type
        $contentTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'avi' => 'video/x-msvideo',
            'mov' => 'video/quicktime',
            'wmv' => 'video/x-ms-wmv'
        ];
        
        $contentType = $contentTypes[$extension] ?? 'application/octet-stream';
        
        // Set headers for file serving
        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . filesize($realPath));
        header('Accept-Ranges: bytes');
        
        // Handle range requests for video streaming
        if (isset($_SERVER['HTTP_RANGE']) && $contentType !== 'application/octet-stream') {
            $fileSize = filesize($realPath);
            $range = $_SERVER['HTTP_RANGE'];
            
            if (preg_match('/bytes=(\d+)-(\d*)/', $range, $matches)) {
                $start = intval($matches[1]);
                $end = $matches[2] ? intval($matches[2]) : $fileSize - 1;
                
                if ($start <= $end && $start < $fileSize) {
                    header('HTTP/1.1 206 Partial Content');
                    header("Content-Range: bytes $start-$end/$fileSize");
                    header('Content-Length: ' . ($end - $start + 1));
                    
                    $file = fopen($realPath, 'rb');
                    fseek($file, $start);
                    echo fread($file, $end - $start + 1);
                    fclose($file);
                    exit();
                }
            }
        }
        
        // Serve the entire file
        readfile($realPath);
        exit();
    }
}

// File not found
http_response_code(404);
echo json_encode(['error' => 'File not found']);
?>
