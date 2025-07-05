// Admin configuration
export const ADMIN_CONFIG = {
  ADMIN_EMAIL: 'Tiktokwaalii2@gmail.com', // This should match the admin_user in .env
} as const;

/**
 * Check if a user is an admin based on their email
 * @param email The user's email address
 * @returns true if the user is an admin, false otherwise
 */
export const isAdminUser = (email: string | undefined): boolean => {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_CONFIG.ADMIN_EMAIL.toLowerCase();
};

/**
 * Check if the current user has admin privileges
 * @param user The user object
 * @returns true if the user is an admin, false otherwise
 */
export const isCurrentUserAdmin = (user: { email?: string } | null): boolean => {
  return isAdminUser(user?.email);
};
