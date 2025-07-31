// API Configuration
export const API_CONFIG = {
  // Backend API URL for REST calls
  BASE_URL: 'http://localhost:5000',
  
  // WebSocket URL for real-time features
  WS_URL: 'http://localhost:3001',
  
  // Chat upload endpoint
  CHAT_UPLOAD_URL: 'http://localhost:5000/api/chat',
  
  // File server URL for serving uploaded files
  FILE_SERVER_URL: 'http://localhost:5000',
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
  
  // For relative paths starting with /uploads/, use the new file serving endpoint
  if (imagePath.startsWith('/uploads/')) {
    return `${API_CONFIG.FILE_SERVER_URL}/files${imagePath}`;
  }
  
  // Fallback to the original logic
  return getFileUrl(imagePath);
};
