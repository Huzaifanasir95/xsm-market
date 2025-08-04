import React, { useState, useEffect } from 'react';
import { User as UserIcon, Edit, LogOut, Save, X, Camera } from 'lucide-react';
import VerificationSection from '@/components/VerificationSection';
import UserAdList from '@/components/UserAdList';
import { useAuth } from '@/context/useAuth';
import { User } from '@/context/AuthContext';
import { updateProfile, changePassword, logout } from '@/services/auth';

// Get API URL from environment variables
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://xsmmarket.com/api');
};

const getBaseUrl = () => {
  const apiUrl = getApiUrl();
  return apiUrl.replace('/api', '');
};

const API_URL = getBaseUrl();

interface ProfileProps {
  setCurrentPage: (page: string) => void;
}

interface UpdateData {
  username?: string;
  profilePicture?: string;
}

interface ExtendedUser extends User {
  joinDate?: string;
  authProvider?: 'google' | 'email';
}

const Profile: React.FC<ProfileProps> = ({ setCurrentPage }) => {
  const { user, isLoggedIn, setUser, setIsLoggedIn } = useAuth();
  const typedUser = user as ExtendedUser;

  // Debug logging
  console.log('🔍 Profile component state:', { 
    user: typedUser, 
    isLoggedIn, 
    token: localStorage.getItem('token') ? 'exists' : 'missing',
    userData: localStorage.getItem('userData')
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    profilePicture: ''
  });
  // Initialize password form with empty values and ensure it stays empty
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Ensure password form stays empty (prevent auto-fill)
  useEffect(() => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, [user]); // Reset when user changes
  const [listedChannels] = useState([
    {
      id: '1',
      name: 'TechReview Pro',
      category: 'Tech',
      subscribers: 150000,
      price: 15000,
      status: 'Active',
      views: 245,
      inquiries: 8,
    },
    {
      id: '2',
      name: 'Gaming World HD',
      category: 'Gaming',
      subscribers: 89000,
      price: 8500,
      status: 'Pending Review',
      views: 123,
      inquiries: 3,
    },
  ]);
  
  // Initialize profile with user data or defaults
  const [profile, setProfile] = useState({
    username: user?.username || 'ChannelTrader2024',
    email: user?.email || 'user@example.com',
    joinDate: (user as ExtendedUser)?.joinDate || '2025-01-15', // Keep the date format as is
    profilePicture: user?.profilePicture || ''
  });

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      console.log('🔍 User data in Profile component:', {
        user,
        authProvider: (user as any)?.authProvider,
        keys: Object.keys(user)
      });
      
      setProfile(prev => ({
        ...prev,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || '',
        joinDate: (user as any)?.joinDate || prev.joinDate
      }));
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      setCurrentPage('login');
    }
  }, [isLoggedIn, setCurrentPage]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  // Show loading if no user data yet but we are logged in
  if (isLoggedIn && !user) {
    // If we have a token but no user data, create a default user
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔧 Creating default user data since token exists but no user data found');
      const defaultUser = {
        id: 'temp-user-id',
        username: 'User',
        email: 'user@example.com',
        profilePicture: ''
      };
      
      // Store and use default user data
      localStorage.setItem('userData', JSON.stringify(defaultUser));
      
      // Force re-render by setting a temporary loading state
      return (
        <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <h1 className="text-4xl font-bold text-xsm-yellow">My Profile</h1>
              </div>
              <p className="text-xl text-white">
                Profile loaded with default data (please refresh to see your actual data)
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile Overview */}
              <div className="lg:col-span-1">
                <div className="xsm-card text-center mb-6">
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-xsm-yellow rounded-full flex items-center justify-center">
                      <UserIcon className="w-12 h-12 text-xsm-black" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{defaultUser.username}</h2>
                  <p className="text-xsm-light-gray mb-1">@{defaultUser.username}</p>
                  <p className="text-xsm-light-gray mb-4">{defaultUser.email}</p>
                  <div className="text-xs text-yellow-400 bg-yellow-500/10 rounded-full px-3 py-1 inline-block">
                    ⚠️ Default profile data - please login again for actual data
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <div className="xsm-card">
                  <h3 className="text-xl font-bold text-xsm-yellow mb-6">Profile Status</h3>
                  <div className="bg-blue-500/10 rounded-lg p-4">
                    <p className="text-white mb-4">
                      You are logged in, but we couldn't load your profile data. This might happen if:
                    </p>
                    <ul className="text-xsm-light-gray list-disc pl-6 space-y-2">
                      <li>You refreshed the page after logging in</li>
                      <li>Your session data was cleared</li>
                      <li>There was a temporary connection issue</li>
                    </ul>
                    <div className="mt-4 space-x-4">
                      <button
                        onClick={() => setCurrentPage('login')}
                        className="bg-xsm-yellow hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Login Again
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Refresh Page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-xsm-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Log In</h2>
          <p className="text-xsm-light-gray mb-6">You need to be logged in to view your profile.</p>
          <button
            onClick={() => setCurrentPage('login')}
            className="bg-xsm-yellow hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Handle profile picture upload - immediately save to backend
  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        try {
          // Immediately update the backend with new profile picture
          console.log('🔄 Updating profile picture...');
          const updatedUser = await updateProfile({ profilePicture: base64String });
          
          console.log('✅ Profile picture updated successfully:', updatedUser);
          
          // Update the user context with the new data
          setUser({
            ...updatedUser,
            id: String(updatedUser.id),
          });
          
          // Update local profile state
          setProfile(prev => ({
            ...prev,
            profilePicture: updatedUser.profilePicture || ''
          }));
          
          // Update the edit form to match the saved data
          setEditForm(prev => ({
            ...prev,
            profilePicture: updatedUser.profilePicture || ''
          }));
          
          alert('Profile picture updated successfully!');
          
        } catch (error) {
          console.error('❌ Failed to update profile picture:', error);
          alert('Failed to update profile picture. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Prepare the data to send to the API
      const updateData: UpdateData = {};
      
      // Only include username if it has changed (profile picture is handled separately)
      if (editForm.username !== user.username) {
        updateData.username = editForm.username;
      }
      
      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        console.log('🔄 Updating profile with data:', updateData);
        
        // Call the API to update the profile
        const updatedUser = await updateProfile(updateData);
        
        console.log('✅ Profile updated successfully:', updatedUser);
        
        // Update the user context with the new data
        setUser({
          ...updatedUser,
          id: String(updatedUser.id),
        });
        
        // Update local profile state
        setProfile(prev => ({
          ...prev,
          username: updatedUser.username,
        }));
        
        // Update the edit form to match the saved data
        setEditForm(prev => ({
          ...prev,
          username: updatedUser.username,
        }));
        
        alert('Profile updated successfully!');
      } else {
        alert('No changes to save!');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      
      // Handle specific error messages
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Username is already taken')) {
          errorMessage = 'Username is already taken. Please choose a different one.';
        } else if (error.message.includes('Username must be between')) {
          errorMessage = 'Username must be between 3 and 50 characters.';
        } else if (error.message.includes('Username can only contain')) {
          errorMessage = 'Username can only contain letters, numbers, and underscores.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async () => {
    // Debug logging for Google user detection
    console.log('🔍 Password change attempt:', {
      user,
      authProvider: (user as any)?.authProvider,
      isGoogleUser: (user as any)?.authProvider === 'google',
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword ? '***' : ''
    });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (!passwordForm.newPassword) {
      alert('Please enter a new password!');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // First, fetch the latest user profile from backend to get authProvider
      const token = localStorage.getItem('token');
      const profileResponse = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const backendUser = profileData.user;
        console.log('🔍 Backend user data:', backendUser);
        
        const isGoogleUser = backendUser?.authProvider === 'google';
        console.log('🔍 User type - Google:', isGoogleUser);
        
        // For Google users, they don't need to enter current password (first time setting password)
        // For email users, they need current password
        if (!isGoogleUser && !passwordForm.currentPassword) {
          alert('Please enter your current password!');
          setIsChangingPassword(false);
          return;
        }
        
        // For Google users, send empty current password; for email users, send the current password
        await changePassword(
          isGoogleUser ? '' : passwordForm.currentPassword, 
          passwordForm.newPassword
        );
        
        if (isGoogleUser) {
          alert('Password set successfully! You can now login with email/password in addition to Google.');
        } else {
          alert('Password changed successfully!');
        }
        
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        throw new Error('Failed to fetch user profile');
      }
      
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      
      let errorMessage = 'Failed to change password. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Current password is incorrect')) {
          errorMessage = 'Current password is incorrect.';
        } else if (error.message.includes('must be at least 6 characters')) {
          errorMessage = 'New password must be at least 6 characters long.';
        } else if (error.message.includes('Google OAuth. Please use "Sign in with Google"')) {
          errorMessage = 'This account was created with Google OAuth. Please use "Sign in with Google" instead. To set a password for email login, leave the current password field empty.';
        } else if (error.message.includes('Google account users don\'t have a current password')) {
          errorMessage = 'For Google accounts, leave current password empty to set a new password.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleVerificationSubmit = async (documentType: string, file: File) => {
    // TODO: Implement actual verification submission logic
    console.log('Submitting verification:', { documentType, file });
    // Mock API call
    setProfile(prev => ({ ...prev, verificationStatus: 'pending' }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRelativeTimeString = (dateString: string) => {
    const joinDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Joined today';
    if (diffDays === 1) return 'Joined yesterday';
    if (diffDays < 30) return `Joined ${diffDays} days ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return 'Joined 1 month ago';
    if (diffMonths < 12) return `Joined ${diffMonths} months ago`;
    
    const diffYears = Math.floor(diffDays / 365);
    if (diffYears === 1) return 'Joined 1 year ago';
    return `Joined ${diffYears} years ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <h1 className="text-4xl font-bold text-xsm-yellow">My Profile</h1>
          </div>
          <p className="text-xl text-white">
            Manage your account settings and view your marketplace activity
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="xsm-card text-center mb-6">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center relative">
                {/* Green ring for active status */}
                <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse"></div>
                <div className="w-[90px] h-[90px] rounded-full overflow-hidden relative">
                  {(isEditing ? editForm.profilePicture : profile.profilePicture) ? (
                    <img 
                      src={isEditing ? editForm.profilePicture : profile.profilePicture} 
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-xsm-yellow rounded-full flex items-center justify-center">
                      <UserIcon className="w-12 h-12 text-xsm-black" />
                    </div>
                  )}
                </div>
                {/* Always visible edit icon for profile picture */}
                <div className="absolute bottom-0 right-0 bg-xsm-yellow hover:bg-yellow-500 rounded-full p-1.5 cursor-pointer transition-colors group">
                  <Camera className="w-4 h-4 text-xsm-black" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Change profile picture"
                  />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {profile.username}
              </h2>
              <p className="text-xsm-light-gray mb-1">@{profile.username}</p>
              <p className="text-xsm-light-gray mb-4">{profile.email}</p>
              <div className="text-xs text-green-400 flex items-center justify-center gap-1 mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Active now</span>
              </div>
              {user && (
                <div className="text-xs text-green-400 bg-green-500/10 rounded-full px-3 py-1 inline-block">
                  ✓ Showing your real account data
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Settings */}
            <div className="xsm-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-xsm-yellow">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="xsm-button-secondary flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isUpdating}
                      className={`xsm-button flex items-center space-x-2 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isUpdating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ ...profile });
                      }}
                      disabled={isUpdating}
                      className="xsm-button-secondary flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={isEditing ? editForm.username : profile.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    disabled={!isEditing}
                    className={`xsm-input w-full ${!isEditing ? 'opacity-60' : ''}`}
                    placeholder="Enter username (3-50 chars, letters, numbers, underscores only)"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={isEditing ? editForm.email : profile.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    disabled={true}
                    className={`xsm-input w-full opacity-60`}
                    title="Email cannot be changed here. Contact support if you need to update your email."
                  />
                </div>
                {isEditing && (
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">Profile Picture URL (Optional)</label>
                    <input
                      type="url"
                      value={editForm.profilePicture}
                      onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                      className="xsm-input w-full"
                      placeholder="Enter image URL or upload an image above"
                    />
                    <p className="text-xs text-xsm-light-gray mt-1">
                      You can either upload an image above or enter an image URL here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Password Change */}
            <div className="xsm-card">
              <h3 className="text-xl font-bold text-xsm-yellow mb-6">
                {(user as any)?.authProvider === 'google' ? 'Set Password' : 'Change Password'}
              </h3>
              
              {(user as any)?.authProvider === 'google' && (
                <div className="bg-blue-500/10 rounded-lg p-4 mb-6">
                  <h4 className="text-blue-400 font-semibold mb-2">Google Account</h4>
                  <p className="text-white text-sm mb-2">
                    You signed in with Google. You can set a password to enable email/password login as an alternative to Google sign-in.
                  </p>
                  <p className="text-xsm-light-gray text-xs">
                    Setting a password won't affect your Google sign-in - you'll be able to use both methods.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                {(user as any)?.authProvider !== 'google' && (
                  <div>
                    <label className="block text-white font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="xsm-input w-full"
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      autoFocus={false}
                    />
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      {(user as any)?.authProvider === 'google' ? 'New Password' : 'New Password'}
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="xsm-input w-full"
                      placeholder={(user as any)?.authProvider === 'google' ? 'Enter a password (min 6 characters)' : 'Enter new password'}
                      autoComplete="new-password"
                      autoFocus={false}
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="xsm-input w-full"
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      autoFocus={false}
                    />
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className={`xsm-button ${isChangingPassword ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      {(user as any)?.authProvider === 'google' ? 'Setting Password...' : 'Updating Password...'}
                    </>
                  ) : (
                    (user as any)?.authProvider === 'google' ? 'Set Password' : 'Update Password'
                  )}
                </button>
              </div>
            </div>

            {/* My Ads */}
            <div className="xsm-card">
              <h3 className="text-xl font-bold text-xsm-yellow mb-6">My Listings</h3>
              <UserAdList />
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
