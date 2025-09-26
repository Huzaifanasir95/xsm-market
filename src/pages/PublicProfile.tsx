import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as UserIcon, Edit, Eye, Calendar } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useNotifications } from '@/context/NotificationContext';
import { getPublicProfile } from '@/services/auth';
import UserAdList from '@/components/UserAdList';
import PublicAdList from '@/components/PublicAdList';

// Get API URL from environment variables - matches the pattern used in auth service

interface PublicUser {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  description?: string;
  createdAt: string;
  adCount?: number;
  isEmailVerified?: boolean;
}

const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser, isLoggedIn } = useAuth();
  const { showError } = useNotifications();
  
  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if viewing own profile
  const isOwnProfile = isLoggedIn && currentUser?.username === username;

  useEffect(() => {
    if (!username) {
      setError('Username not provided');
      setLoading(false);
      return;
    }

    // If user is viewing their own profile, redirect to edit mode
    if (isOwnProfile) {
      navigate('/profile/edit');
      return;
    }

    fetchPublicProfile();
  }, [username, isOwnProfile, navigate]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getPublicProfile(username!);
      
      if (data.success) {
        setProfileUser(data.data);
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching public profile:', error);
      if (error instanceof Error) {
        setError(error.message);
        if (error.message !== 'User not found') {
          showError('Failed to load profile');
        }
      } else {
        setError('Failed to load profile. Please try again.');
        showError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return 'Unknown';
    }
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-xsm-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-xsm-yellow mx-auto mb-4"></div>
          <p className="text-xsm-light-gray">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-xsm-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-xsm-medium-gray rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-xsm-light-gray" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-xsm-light-gray mb-6">
            {error || 'The user you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-xsm-yellow text-black px-6 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-xsm-black text-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-xsm-dark-gray rounded-xl p-6 shadow-lg border border-xsm-medium-gray/30">
              {/* Profile Picture */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-xsm-yellow flex items-center justify-center overflow-hidden ring-4 ring-xsm-yellow/20">
                  {profileUser.profilePicture ? (
                    <img
                      src={profileUser.profilePicture}
                      alt={`${profileUser.username}'s profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<UserIcon className="w-16 h-16 text-black" />`;
                        }
                      }}
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-black" />
                  )}
                </div>
                
                {/* Edit button for own profile */}
                {isOwnProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="absolute bottom-0 right-0 bg-xsm-yellow text-black p-2 rounded-full hover:bg-yellow-500 transition-colors shadow-lg"
                    title="Edit Profile"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {profileUser.fullName || profileUser.username}
                </h1>
                
                {/* Verification Status */}
                {profileUser.isEmailVerified && (
                  <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Verified
                  </div>
                )}
              </div>

              {/* Profile Actions for Own Profile */}
              {isOwnProfile && (
                <div className="mb-6">
                  <button
                    onClick={handleEditProfile}
                    className="w-full bg-xsm-yellow text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              )}

              {/* Profile Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xsm-light-gray">Member since</span>
                  <span className="text-white flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(profileUser.createdAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xsm-light-gray">Active listings</span>
                  <span className="text-xsm-yellow font-bold">
                    {profileUser.adCount || 0}
                  </span>
                </div>
              </div>

              {/* Call to Action for Non-logged in Users */}
              {!isLoggedIn && (
                <div className="text-center">
                  <p className="text-xsm-light-gray text-sm mb-3">
                    Join XSM Market to connect with sellers
                  </p>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-xsm-yellow text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Description */}
            {(profileUser.description || isOwnProfile) && (
              <div className="bg-xsm-dark-gray rounded-xl p-6 shadow-lg border border-xsm-medium-gray/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-xsm-yellow">About</h2>
                  {isOwnProfile && (
                    <button
                      onClick={handleEditProfile}
                      className="text-xsm-light-gray hover:text-white transition-colors"
                      title="Edit Description"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {profileUser.description ? (
                  <p className="text-xsm-light-gray leading-relaxed whitespace-pre-wrap">
                    {profileUser.description}
                  </p>
                ) : isOwnProfile ? (
                  <div className="text-center py-8">
                    <p className="text-xsm-light-gray mb-4">
                      Tell others about yourself...
                    </p>
                    <button
                      onClick={handleEditProfile}
                      className="bg-xsm-yellow text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                      Add Description
                    </button>
                  </div>
                ) : (
                  <p className="text-xsm-light-gray italic">
                    This user hasn't added a description yet.
                  </p>
                )}
              </div>
            )}

            {/* User's Listings */}
            <div className="bg-xsm-dark-gray rounded-xl p-6 shadow-lg border border-xsm-medium-gray/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-xsm-yellow">
                  {isOwnProfile ? 'My Listings' : `${profileUser.username}'s Listings`}
                </h2>
                <span className="text-xsm-light-gray bg-xsm-medium-gray px-3 py-1 rounded-full text-sm">
                  {profileUser.adCount || 0}
                </span>
              </div>
              
              {/* Listings - UserAdList for own profile (edit mode), PublicAdList for others */}
              {isOwnProfile ? (
                <UserAdList />
              ) : (
                <PublicAdList 
                  userId={profileUser.id} 
                  username={profileUser.username}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;