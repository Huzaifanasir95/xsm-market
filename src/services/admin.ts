import { API_URL } from './auth';

// Fetch all users (admin only)
export const getAllUsers = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/admin/users`, {
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

  const response = await fetch(`${API_URL}/admin/chats`, {
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

  const response = await fetch(`${API_URL}/admin/dashboard-stats`, {
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

  const response = await fetch(`${API_URL}/admin/recent-activities`, {
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

// Change user role (admin only)
export const changeUserRole = async (userId: string, newRole: 'user' | 'admin') => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Authentication required');

  // For this demo, we use the updateUserStatus endpoint to simulate role change
  // In a real app, you would have a dedicated endpoint for role
  const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ role: newRole })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to change user role: ${response.statusText}`);
  }

  return await response.json();
};

// Delete user (admin only)
export const deleteUser = async (userId: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete user: ${response.statusText}`);
  }

  return await response.json();
};

// Delete chat (admin only)
export const deleteChat = async (chatId: string) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Authentication required');

  const response = await fetch(`${API_URL}/admin/chats/${chatId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete chat: ${response.statusText}`);
  }

  return await response.json();
}; 