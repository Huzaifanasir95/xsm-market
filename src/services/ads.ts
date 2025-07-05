import { API_URL } from './auth';

// Get all ads (public)
export const getAllAds = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(`${API_URL}/ads?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ads: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get all ads error:', error);
    throw error;
  }
};

// Get single ad by ID
export const getAdById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/ads/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ad: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get ad by ID error:', error);
    throw error;
  }
};

// Create new ad (protected)
export const createAd = async (adData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/ads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create ad: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Create ad error:', error);
    throw error;
  }
};

// Get user's ads (protected)
export const getUserAds = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(`${API_URL}/ads/user/my-ads?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user ads: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get user ads error:', error);
    throw error;
  }
};

// Update ad (protected)
export const updateAd = async (id, adData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/ads/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update ad: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Update ad error:', error);
    throw error;
  }
};

// Delete ad (protected)
export const deleteAd = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/ads/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete ad: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Delete ad error:', error);
    throw error;
  }
};

// Get platform statistics
export const getPlatformStats = async () => {
  try {
    const response = await fetch(`${API_URL}/ads/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch platform stats: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get platform stats error:', error);
    throw error;
  }
};
