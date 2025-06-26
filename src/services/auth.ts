// Make sure this matches your backend server address and port
const API_URL = 'http://localhost:5000/api';

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

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    profilePicture?: string;
  };
}

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

    // Store the token in localStorage
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred during login');
    }
  }
};

export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting to register with:', { 
      username, 
      email,
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
        password 
      }),
      mode: 'cors',
      credentials: 'include'
    }).catch(err => {
      console.error('Network error during registration fetch:', err);
      throw new Error(`Network error: Unable to connect to server at ${API_URL}. Please check your backend server is running.`);
    });

    console.log('Registration response status:', response.status); // Debug log
    
    const data = await handleFetchError(response);
    console.log('%c Registration response data:', 'background: #4CAF50; color: white; padding: 4px; border-radius: 2px;', data); // Better debug log

    // Store the token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
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
  localStorage.removeItem('token');
  console.log('User logged out successfully');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};
