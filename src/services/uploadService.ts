import { API_URL } from './auth';

export interface UploadResponse {
  screenshots?: Array<{
    data: string;
    thumbnail: string;
    originalName: string;
    size: number;
    type: string;
  }>;
  thumbnail?: string;
  smallThumbnail?: string;
  originalName?: string;
  size?: number;
  count?: number;
}

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const uploadScreenshots = async (files: File[]): Promise<UploadResponse> => {
  const formData = new FormData();
  
  // Add all files as 'screenshots[]' to match backend expectation
  files.forEach((file, index) => {
    formData.append('screenshots[]', file);
  });

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('🔄 Uploading screenshots...', {
    fileCount: files.length,
    files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
    hasToken: !!token
  });

  try {
    // Try the proxy route first
    let response = await fetch(`/api/ads/upload/screenshots`, {
      method: 'POST',
      headers,
      body: formData,
    });

    // If proxy fails, try direct backend
    if (!response.ok && response.status === 404) {
      console.log('📡 Proxy failed, trying direct backend...');
      response = await fetch(`${API_URL}/ads/upload/screenshots`, {
        method: 'POST',
        headers,
        body: formData,
      });
    }

    console.log('📡 Upload response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', errorText);
      throw new Error(`Failed to upload screenshots: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Upload successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

export const uploadThumbnail = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('thumbnail', file);

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Try the proxy route first
    let response = await fetch(`/api/ads/upload/thumbnail`, {
      method: 'POST',
      headers,
      body: formData,
    });

    // If proxy fails, try direct backend
    if (!response.ok && response.status === 404) {
      console.log('📡 Proxy failed, trying direct backend...');
      response = await fetch(`${API_URL}/ads/upload/thumbnail`, {
        method: 'POST',
        headers,
        body: formData,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload thumbnail: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('❌ Thumbnail upload error:', error);
    throw error;
  }
};
