<?php
class InputHelper {
    /**
     * Safely read and parse JSON input
     * Returns false if reading fails or times out
     */
    public static function getJsonInput($timeout = 5) {
        try {
            // Method 1: Try php://input first (standard method)
            $input = file_get_contents('php://input');
            
            if (!empty($input)) {
                $decoded = json_decode($input, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    error_log('Successfully read JSON input: ' . strlen($input) . ' bytes');
                    return $decoded;
                }
                error_log('JSON decode error: ' . json_last_error_msg());
            }
            
            // Method 2: Check if data was sent via $_POST (form-encoded JSON)
            if (!empty($_POST)) {
                error_log('Falling back to $_POST data');
                // If $_POST contains a single JSON string
                if (count($_POST) === 1) {
                    $values = array_values($_POST);
                    $jsonString = $values[0];
                    $decoded = json_decode($jsonString, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        return $decoded;
                    }
                }
                // If $_POST contains form fields, return as is
                return $_POST;
            }
            
            // Method 3: Try to read from HTTP_RAW_POST_DATA (if available)
            if (isset($GLOBALS['HTTP_RAW_POST_DATA'])) {
                error_log('Falling back to HTTP_RAW_POST_DATA');
                $input = $GLOBALS['HTTP_RAW_POST_DATA'];
                if (!empty($input)) {
                    $decoded = json_decode($input, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        return $decoded;
                    }
                }
            }
            
            error_log('No input data found');
            return [];
            
        } catch (Exception $e) {
            error_log('InputHelper error: ' . $e->getMessage());
            return false;
        }
    }
    
    private static function tryPhpInput($timeout) {
        try {
            // Set timeout and read
            $oldTimeout = ini_get('default_socket_timeout');
            ini_set('default_socket_timeout', $timeout);
            
            $input = @file_get_contents('php://input');
            
            // Restore timeout
            ini_set('default_socket_timeout', $oldTimeout);
            
            if ($input === false || empty($input)) {
                return [];
            }
            
            $decoded = json_decode($input, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log('JSON decode error: ' . json_last_error_msg());
                return false;
            }
            
            return $decoded;
            
        } catch (Exception $e) {
            error_log('PHP input reading error: ' . $e->getMessage());
            return false;
        }
    }
}
?>
    
    private static function tryPhpInput($timeout) {
        try {
            // Set timeout and read
            $oldTimeout = ini_get('default_socket_timeout');
            ini_set('default_socket_timeout', $timeout);
            
            $input = @file_get_contents('php://input');
            
            // Restore timeout
            ini_set('default_socket_timeout', $oldTimeout);
            
            if ($input === false || empty($input)) {
                return [];
            }
            
            $decoded = json_decode($input, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log('JSON decode error: ' . json_last_error_msg());
                return false;
            }
            
            return $decoded;
            
        } catch (Exception $e) {
            error_log('PHP input reading error: ' . $e->getMessage());
            return false;
        }
    }
}
?>
