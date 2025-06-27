import React, { useState, useEffect } from 'react';
import { User, Star, Edit, Trash2, Save, X, Shield, Award, TrendingUp } from 'lucide-react';
import VerificationSection from '@/components/VerificationSection';
import { useAuth } from '@/context/useAuth';
import { updateProfile, changePassword } from '@/services/auth';

interface ProfileProps {
  setCurrentPage: (page: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ setCurrentPage }) => {
  const { user, isLoggedIn, setUser } = useAuth();
  
  // Debug logging
  console.log('🔍 Profile component state:', { 
    user, 
    isLoggedIn, 
    token: localStorage.getItem('token') ? 'exists' : 'missing',
    userData: localStorage.getItem('userData')
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Initialize profile with user data or defaults
  const [profile, setProfile] = useState({
    username: user?.username || 'ChannelTrader2024',
    email: user?.email || 'user@example.com',
    fullName: (user as any)?.fullName || '',
    joinDate: '2024-01-15',
    rating: 4.8,
    totalSales: 12,
    totalPurchases: 5,
    verificationStatus: 'unverified' as 'unverified' | 'pending' | 'verified',
    profilePicture: user?.profilePicture || ''
  });

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        username: user.username,
        email: user.email,
        fullName: (user as any).fullName || '',
        profilePicture: user.profilePicture || ''
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
    const { logout } = require('@/services/auth');
    logout();
    setCurrentPage('login');
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
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold text-xsm-yellow">My Profile</h1>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
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
                      <User className="w-12 h-12 text-xsm-black" />
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

  const [editForm, setEditForm] = useState({ ...profile });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Handle profile picture upload
  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setEditForm(prev => ({
          ...prev,
          profilePicture: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Prepare the data to send to the API
      const updateData: any = {};
      
      // Only include fields that have changed
      if (editForm.username !== user.username) {
        updateData.username = editForm.username;
      }
      
      if (editForm.fullName !== (user as any).fullName) {
        updateData.fullName = editForm.fullName;
      }
      
      if (editForm.profilePicture !== user.profilePicture) {
        updateData.profilePicture = editForm.profilePicture;
      }
      
      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        console.log('🔄 Updating profile with data:', updateData);
        
        // Call the API to update the profile
        const updatedUser = await updateProfile(updateData);
        
        console.log('✅ Profile updated successfully:', updatedUser);
        
        // Update the user context with the new data
        setUser(updatedUser);
        
        // Update local profile state
        setProfile(prev => ({
          ...prev,
          username: updatedUser.username,
          fullName: updatedUser.fullName || '',
          profilePicture: updatedUser.profilePicture || ''
        }));
        
        // Update the edit form to match the saved data
        setEditForm(prev => ({
          ...prev,
          username: updatedUser.username,
          fullName: updatedUser.fullName || '',
          profilePicture: updatedUser.profilePicture || ''
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
        } else if (error.message.includes('Full name must be less than')) {
          errorMessage = 'Full name must be less than 100 characters.';
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
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      alert('Please fill in all password fields!');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      alert('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      
      let errorMessage = 'Failed to change password. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Current password is incorrect')) {
          errorMessage = 'Current password is incorrect.';
        } else if (error.message.includes('must be at least 6 characters')) {
          errorMessage = 'New password must be at least 6 characters long.';
        } else if (error.message.includes('Cannot change password for social login')) {
          errorMessage = 'Cannot change password for social login accounts.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    alert('Account deletion requested. You will receive a confirmation email within 24 hours.');
    setShowDeleteConfirm(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-xsm-yellow">My Profile</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
          <p className="text-xl text-white">
            Manage your account settings and view your marketplace activity
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="xsm-card text-center mb-6">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden relative">
                {(isEditing ? editForm.profilePicture : profile.profilePicture) ? (
                  <img 
                    src={isEditing ? editForm.profilePicture : profile.profilePicture} 
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-xsm-yellow rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-xsm-black" />
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Edit className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {profile.fullName || profile.username}
              </h2>
              <p className="text-xsm-light-gray mb-1">@{profile.username}</p>
              <p className="text-xsm-light-gray mb-4">{profile.email}</p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">{profile.verificationStatus}</span>
              </div>
              <div className="flex items-center justify-center space-x-1 mb-4">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-semibold">{profile.rating}</span>
                <span className="text-xsm-light-gray">({profile.totalSales + profile.totalPurchases} transactions)</span>
              </div>
              <div className="text-sm text-xsm-light-gray mb-4">
                Member since {new Date(profile.joinDate).toLocaleDateString()}
              </div>
              {user && (
                <div className="text-xs text-green-400 bg-green-500/10 rounded-full px-3 py-1 inline-block">
                  ✓ Showing your real account data
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="xsm-card text-center">
                <TrendingUp className="w-8 h-8 text-xsm-yellow mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{profile.totalSales}</div>
                <div className="text-sm text-xsm-light-gray">Sales</div>
              </div>
              <div className="xsm-card text-center">
                <Award className="w-8 h-8 text-xsm-yellow mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{profile.totalPurchases}</div>
                <div className="text-sm text-xsm-light-gray">Purchases</div>
              </div>
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
                  <label className="block text-white font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={isEditing ? editForm.fullName : profile.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    disabled={!isEditing}
                    className={`xsm-input w-full ${!isEditing ? 'opacity-60' : ''}`}
                  />
                </div>
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
                <div className="md:col-span-2">
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
              <h3 className="text-xl font-bold text-xsm-yellow mb-6">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="xsm-input w-full"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="xsm-input w-full"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="xsm-input w-full"
                      placeholder="Confirm new password"
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
                      Updating Password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </div>

            {/* Listed Channels */}
            <div className="xsm-card">
              <h3 className="text-xl font-bold text-xsm-yellow mb-6">My Listed Channels</h3>
              <div className="space-y-4">
                {listedChannels.map(channel => (
                  <div key={channel.id} className="bg-xsm-black/50 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg">{channel.name}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-xsm-light-gray">
                          <span>{channel.category}</span>
                          <span>{formatNumber(channel.subscribers)} subscribers</span>
                          <span className="text-xsm-yellow font-semibold">{formatPrice(channel.price)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-white font-semibold">{channel.views}</div>
                          <div className="text-xs text-xsm-light-gray">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{channel.inquiries}</div>
                          <div className="text-xs text-xsm-light-gray">Inquiries</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          channel.status === 'Active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {channel.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="xsm-card border-red-500/20">
              <h3 className="text-xl font-bold text-red-400 mb-6">Danger Zone</h3>
              <div className="bg-red-500/10 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Delete Account</h4>
                <p className="text-xsm-light-gray mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-xsm-dark-gray rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-400 mb-4">Confirm Account Deletion</h3>
            <p className="text-white mb-6">
              Are you absolutely sure you want to delete your account? This action cannot be undone and you will lose all your data.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 xsm-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
