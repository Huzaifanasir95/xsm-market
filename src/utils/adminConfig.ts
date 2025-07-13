// Admin configuration
let adminData: { adminEmail: string | null; adminUsername: string | null } | null = null;

// Fetch admin data from backend
const fetchAdminData = async (): Promise<{ adminEmail: string | null; adminUsername: string | null }> => {
  if (adminData !== null) {
    return adminData; // Return cached value
  }
  
  try {
    // Use the PHP backend directly on port 5000
    const response = await fetch('http://localhost:5000/admin/email');
    
    if (response.ok) {
      const data = await response.json();
      adminData = {
        adminEmail: data.adminEmail || null,
        adminUsername: data.adminUsername || null
      };
      return adminData;
    }
  } catch (error) {
    console.error('❌ Failed to fetch admin data:', error);
  }
  
  return { adminEmail: null, adminUsername: null };
};

export const ADMIN_CONFIG = {
  // This is now fetched from backend .env file
  ADMIN_EMAIL: 'rebirthcar63@gmail.com', // Fallback, actual value comes from backend
} as const;

/**
 * Check if a user is an admin based on their email or username compared to backend admin_email/admin_username
 * @param userEmail The user's email address
 * @param username The user's username (optional)
 * @returns Promise<boolean> true if the user is an admin, false otherwise
 */
export const isCurrentUserAdmin = async (userEmail: string | undefined, username?: string | undefined): Promise<boolean> => {
  if (!userEmail && !username) return false;
  
  const { adminEmail, adminUsername } = await fetchAdminData();
  
  // Check email match
  if (userEmail && adminEmail) {
    const emailMatch = userEmail.toLowerCase() === adminEmail.toLowerCase();
    if (emailMatch) {
      return true;
    }
  }
  
  // Check username match
  if (username && adminUsername) {
    const usernameMatch = username.toLowerCase() === adminUsername.toLowerCase();
    if (usernameMatch) {
      return true;
    }
  }
  
  return false;
};

/**
 * @deprecated Use isCurrentUserAdmin instead - this function checks email locally
 * Check if a user is an admin based on their email
 * @param email The user's email address
 * @returns true if the user is an admin, false otherwise
 */
export const isAdminUser = (email: string | undefined): boolean => {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_CONFIG.ADMIN_EMAIL.toLowerCase();
};
