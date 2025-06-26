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
      mode: 'cors'
    });

    console.log('Registration response status:', response.status); // Debug log
    
    const data = await handleFetchError(response);
    console.log('Registration response data:', data); // Debug log

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
