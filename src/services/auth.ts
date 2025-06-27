// API URL - automatically switches between development and production
const API_URL = typeof __API_URL__ !== 'undefined' 
  ? __API_URL__ 
  : 'http://localhost:5000/api';

// Token management constants
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const USER_KEY = 'userData';

// Import User interface
interface User {
  id: string;
  username: string;
  fullName?: string;
  email: string;
  profilePicture?: string;
  authProvider?: string;
}

// Token management interface
interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // seconds from now
  tokenType?: string;
}

// Auth response interface
export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    id: string;
    username: string;
    fullName?: string;
    email: string;
    profilePicture?: string;
    authProvider?: string;
  };
  message?: string;
  requiresVerification?: boolean;
  email?: string;
}

// Token expiry check
const isTokenExpired = (): boolean => {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  
  const expiryTime = parseInt(expiry);
  const currentTime = Date.now();
  
  // Consider token expired if it expires in less than 5 minutes
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return currentTime >= (expiryTime - bufferTime);
};

// Set token with expiry
const setTokenData = (tokenData: TokenData) => {
  localStorage.setItem(TOKEN_KEY, tokenData.accessToken);
  
  if (tokenData.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refreshToken);
  }
  
  // Calculate expiry time (default to 24 hours if not provided)
  const expiresInMs = (tokenData.expiresIn || 24 * 60 * 60) * 1000;
  const expiryTime = Date.now() + expiresInMs;
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
};

// Clear all token data
const clearTokenData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(USER_KEY);
};

// Refresh token function
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.log('Failed to refresh token');
      return false;
    }

    const data = await response.json();
    
    setTokenData({
      accessToken: data.token || data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn || 24 * 60 * 60,
    });

    console.log('Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Helper function to handle fetch errors
const handleFetchError = async (response: Response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    console.error('Error parsing response:', e);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.ok) {
    console.error('Server error response:', data);
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

// Enhanced fetch with automatic token refresh
const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Check if token is expired and try to refresh
  if (isTokenExpired()) {
    console.log('Token expired, attempting refresh...');
    const refreshed = await refreshAccessToken();
    
    if (!refreshed) {
      console.log('Could not refresh token, user needs to login again');
      // Clear all auth data and redirect to login
      clearTokenData();
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw new Error('Session expired. Please login again.');
    }
  }

  // Get current token
  const token = localStorage.getItem(TOKEN_KEY);
  
  // Add authorization header
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get 401, try to refresh token once
  if (response.status === 401 && token) {
    console.log('Received 401, attempting token refresh...');
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      // Retry the original request with new token
      const newToken = localStorage.getItem(TOKEN_KEY);
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
      
      if (retryResponse.status === 401) {
        // Still unauthorized after refresh, logout
        clearTokenData();
        window.dispatchEvent(new CustomEvent('auth:logout'));
        throw new Error('Session expired. Please login again.');
      }
      
      return retryResponse;
    } else {
      // Could not refresh, logout
      clearTokenData();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to login');
    }

    // Store tokens with proper expiry management
    if (data.token) {
      setTokenData({
        accessToken: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || 24 * 60 * 60, // Default 24 hours
      });
    }
    
    // Store user data
    if (data.user) {
      setCurrentUser(data.user);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred during login');
    }
  }
};

export const register = async (username: string, email: string, password: string, fullName?: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting to register with:', { 
      username, 
      email,
      fullName,
      password: password ? '[FILTERED]' : undefined 
    });
    
    // Comment out the mock response to use the real backend
    // We'll keep it in the code but disabled to ensure connection goes to real backend
    /*
    if (!navigator.onLine || window.location.hostname === 'localhost') {
      console.log('Using mock registration response for development');
      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 15),
        user: {
          id: 'user-' + Math.random().toString(36).substring(2, 10),
          username: username,
          email: email,
          profilePicture: undefined
        }
      };
      
      localStorage.setItem('token', mockResponse.token);
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockResponse;
    }
    */
    
    // Actual API call to backend server
    console.log(`Sending POST request to ${API_URL}/auth/register`);
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName?.trim() || ''
      }),
      mode: 'cors',
      credentials: 'include'
    }).catch(err => {
      console.error('Network error during registration fetch:', err);
      throw new Error(`Network error: Unable to connect to server at ${API_URL}. Please check your backend server is running.`);
    });

    console.log('Registration response status:', response.status); // Debug log
    
    const data = await handleFetchError(response);
    console.log('%c Registration response data:', 'background: #4CAF50; color: white; padding: 4px; border-radius: 2px;', data);

    // Handle different response types
    if (data.requiresVerification) {
      // Registration successful, but email verification required
      return {
        requiresVerification: true,
        email: data.email,
        message: data.message
      };
    }

    // Store the token in localStorage (for direct login)
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    // Store user data (for direct login)
    if (data.user) {
      setCurrentUser(data.user);
    }
    
    return data;
  } catch (error) {
    console.error('Registration error:', error); // Debug log
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred during registration');
    }
  }
};

export const logout = (): void => {
  clearTokenData();
  console.log('User logged out successfully');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  
  // Check if token is expired
  if (isTokenExpired()) {
    console.log('Token is expired');
    return false;
  }
  
  return true;
};

export const getToken = (): string | null => {
  if (!isAuthenticated()) return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getCurrentUser = (): User | null => {
  const userDataString = localStorage.getItem(USER_KEY);
  if (userDataString) {
    try {
      return JSON.parse(userDataString);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
  return null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const googleSignIn = async (tokenId: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/google-signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: tokenId }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to sign in with Google');
    }

    console.log('🔍 Google sign-in response:', data);

    // Store tokens with proper expiry management
    if (data.token) {
      setTokenData({
        accessToken: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || 24 * 60 * 60,
      });
    }
    
    // Store user data
    if (data.user) {
      console.log('🔍 Storing Google user data:', data.user);
      setCurrentUser(data.user);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred during Google sign-in');
    }
  }
};

// Verify OTP for email verification
export const verifyOTP = async (email: string, otp: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
      credentials: 'include'
    });

    const data = await handleFetchError(response);

    // Store tokens with proper expiry management
    if (data.token) {
      setTokenData({
        accessToken: data.token,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || 24 * 60 * 60,
      });
    }
    
    // Store user data
    if (data.user) {
      setCurrentUser(data.user);
    }
    
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred during OTP verification');
    }
  }
};

// Resend OTP for email verification
export const resendOTP = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include'
    });

    const data = await handleFetchError(response);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred while resending OTP');
    }
  }
};

// Example of using authenticatedFetch for protected API calls
export const getProfile = async (): Promise<User> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/user/profile`);
    const data = await handleFetchError(response);
    return data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to fetch user profile');
    }
  }
};

// Example of updating user profile
export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    const data = await handleFetchError(response);
    
    // Update the user data in localStorage
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    
    return data.user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to update user profile');
    }
  }
};

// Change user password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/user/password`, {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newPassword
      }),
    });
    await handleFetchError(response);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to change password');
    }
  }
};

// Example of creating a channel listing (protected endpoint)
export const createChannelListing = async (channelData: any): Promise<any> => {
  try {
    const response = await authenticatedFetch(`${API_URL}/channels`, {
      method: 'POST',
      body: JSON.stringify(channelData),
    });
    const data = await handleFetchError(response);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to create channel listing');
    }
  }
};
