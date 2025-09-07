// API Configuration
// Get API URL from environment variables with fallback
const getApiUrl = () => {
  // In development, use the proxy setup
  if (import.meta.env.DEV) {
    return '/api';
  }
  // In production, use the full URL
  return 'https://xsmmarket.com/api';
};

const getBaseUrl = () => {
  // In development, use the proxy setup
  if (import.meta.env.DEV) {
    return '/'; // Use relative path for development proxy
  }
  // In production, use the production domain
  return 'https://xsmmarket.com';
};

export const API_CONFIG = {
  // Backend API URL for REST calls
  BASE_URL: getBaseUrl(),
  
  // WebSocket URL for real-time features
  WS_URL: import.meta.env.DEV ? 'http://localhost:3001' : 'https://xsmmarket.com',
  
  // Chat upload endpoint
  CHAT_UPLOAD_URL: `${getApiUrl()}/chat`,
  
  // File server URL for serving uploaded files
  FILE_SERVER_URL: import.meta.env.DEV ? 'http://localhost:5000' : 'https://xsmmarket.com',
};

// Helper function to get full file URL
export const getFileUrl = (relativePath: string): string => {
  if (relativePath.startsWith('http')) {
    return relativePath; // Already a full URL
  }
  return `${API_CONFIG.FILE_SERVER_URL}${relativePath}`;
};

// Helper function to get image URL with fallback
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // For relative paths starting with /uploads/, serve through the appropriate endpoint
  if (imagePath.startsWith('/uploads/')) {
    // In development, use the proxy to maintain consistency
    if (import.meta.env.DEV) {
      return `/api${imagePath}`;
    }
    // In production, use the /api/uploads/ path for consistency
    return `${API_CONFIG.FILE_SERVER_URL}/api${imagePath}`;
  }
  
  // Fallback to the original logic
  return getFileUrl(imagePath);
};
