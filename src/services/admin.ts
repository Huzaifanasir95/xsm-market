// Use PHP backend directly without /api prefix
const ADMIN_API_URL = 'http://localhost:5000';

// Fetch all users (admin only)
export const getAllUsers = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${ADMIN_API_URL}/admin/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch users: ${response.statusText}`);
  }

  return await response.json();
};

// Fetch all chats (admin only)
export const getAllChats = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${ADMIN_API_URL}/admin/chats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch chats: ${response.statusText}`);
  }

  return await response.json();
};

// Fetch dashboard statistics (admin only)
export const getDashboardStats = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${ADMIN_API_URL}/admin/dashboard-stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch dashboard stats: ${response.statusText}`);
  }

  return await response.json();
};

// Fetch recent activities (admin only)
export const getRecentActivities = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${ADMIN_API_URL}/admin/recent-activities`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch recent activities: ${response.statusText}`);
  }

  return await response.json();
}; 