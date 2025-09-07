import React, { useState, useEffect } from 'react';
import { getUserAds, getUserAdsAlternative, deleteAd } from '../services/ads';
import { useAuth } from '../context/useAuth';
import { Star, Eye, Trash2, Edit, AlertCircle, TrendingUp, Pin, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import EditListingModal from './EditListingModal';

interface UserAd {
  id: number;
  title: string;
  platform: string;
  category: string;
  price: number;
  subscribers: number;
  monthlyIncome: number;
  isMonetized: boolean;
  status: 'active' | 'pending' | 'sold' | 'suspended' | 'rejected';
  views: number;
  createdAt: string;
  updatedAt: string;
  channelUrl: string;
  description: string;
  contentType?: string;
  contentCategory?: string;
  incomeDetails: string;
  promotionDetails: string;
  thumbnail?: string;
  screenshots?: any[];
  tags?: string[];
  seller?: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}

interface UserAdListProps {
  onEditAd?: (ad: UserAd) => void;
}

const UserAdList: React.FC<UserAdListProps> = ({ onEditAd }) => {
  const [ads, setAds] = useState<UserAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAd, setEditingAd] = useState<UserAd | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserAds();
  }, [user]);

  const fetchUserAds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is logged in
      if (!user?.id) {
        throw new Error('User not logged in');
      }
      
      console.log('🔍 Fetching ads for user:', user.id, user.username);
      
      // Use the alternative method which is more reliable (no filters)
      const response = await getUserAdsAlternative({});
      
      console.log('📊 User ads response:', response);
      console.log('📊 Ads array:', response.ads);
      console.log('📊 Ads count:', response.ads?.length || 0);
      
      setAds(response.ads || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch user ads:', err);
      setError(err.message || 'Failed to fetch your ads');
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ad: UserAd) => {
    setEditingAd(ad);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingAd(null);
  };

  const handleAdUpdate = (updatedAd: UserAd) => {
    // Update the ad in the local state
    setAds(prevAds => 
      prevAds.map(ad => 
        ad.id === updatedAd.id ? { ...ad, ...updatedAd } : ad
      )
    );
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await deleteAd(id);
      await fetchUserAds(); // Refresh the list
    } catch (err: any) {
      alert(err.message || 'Failed to delete ad');
    }
  };

  const handlePullUp = async (id: number, createdAt: string) => {
    // Check if 4 days have passed since creation or last pull
    const lastPull = new Date(createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastPull.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 4) {
      alert(`You can pull up this listing in ${4 - daysDiff} more day(s). Listings can only be pulled up every 4 days.`);
      return;
    }

    if (!window.confirm('Pull up this listing to show at the top of market listings?')) {
      return;
    }

    try {
      // TODO: Implement pull up API call
      alert('Pull up functionality will be implemented soon!');
    } catch (err: any) {
      alert(err.message || 'Failed to pull up listing');
    }
  };

  const handlePin = async (id: number) => {
    alert('Pin listing feature coming soon!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'sold':
        return 'bg-blue-500/20 text-blue-400';
      case 'suspended':
        return 'bg-red-500/20 text-red-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformColors = {
      youtube: 'text-red-500',
      facebook: 'text-blue-500',
      instagram: 'text-pink-500',
      twitter: 'text-blue-400',
      tiktok: 'text-black'
    };
    
    return (
      <span className={`text-sm font-semibold ${platformColors[platform] || 'text-white'}`}>
        {platform.toUpperCase()}
      </span>
    );
  };

  const getPlatformIconSmall = (platform: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'youtube': (
        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
      ),
      'instagram': (
        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
      ),
      'tiktok': (
        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
        </div>
      ),
      'facebook': (
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </div>
      ),
      'twitter': (
        <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </div>
      ),
    };
    return iconMap[platform.toLowerCase()] || (
      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-xsm-black/50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-xsm-medium-gray rounded mb-2"></div>
            <div className="h-4 bg-xsm-medium-gray rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-white font-semibold mb-2">Error loading your ads</h3>
        <p className="text-xsm-light-gray">{error}</p>
        <button 
          onClick={fetchUserAds}
          className="mt-4 xsm-button-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-xsm-yellow">My Listings</h3>
        <span className="text-2xl font-bold text-xsm-yellow">
          {ads.length}
        </span>
      </div>

      {/* Ad List */}
      {ads.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-white mb-2">No ads found</h3>
          <p className="text-xsm-light-gray mb-4">
            You haven't created any listings yet.
          </p>
          <div className="text-sm text-blue-400 mt-4">
            <p>Debug: User ID = {user?.id}</p>
            <p>Debug: User logged in = {user ? 'Yes' : 'No'}</p>
            <p>Debug: Ads count = {ads.length}</p>
            <p>Debug: Error = {error || 'None'}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-xsm-black/50 rounded-lg p-4 border border-xsm-medium-gray/20 shadow-sm flex flex-col items-center hover:border-xsm-yellow/30 transition-colors w-full max-w-[280px] mx-auto">
              {/* Large Profile Picture Circle with Platform Icon */}
              <div className="relative mb-3 flex items-center">
                {/* Platform Icon on Left Side */}
                <div className="absolute -left-8 -top-0">
                  {getPlatformIconSmall(ad.platform)}
                </div>
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-xsm-medium-gray/30">
                  <img
                    src={ad.seller?.profilePicture || user?.profilePicture || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Channel Name */}
              <h4 className="text-white font-semibold text-sm text-center mb-2 truncate w-full">
                {ad.title}
              </h4>

              {/* Subscribers */}
              <div className="text-center mb-1">
                <span className="text-blue-400 font-medium text-xs">
                  Subscribers: {formatNumber(ad.subscribers)}
                </span>
              </div>

              {/* Price */}
              <div className="text-center mb-1">
                <span className="text-xsm-yellow font-semibold text-sm">
                  Price: {formatPrice(ad.price)}
                </span>
              </div>

              {/* Monetization */}
              <div className="text-center mb-3">
                <span className={`text-xs ${ad.isMonetized ? 'text-green-400' : 'text-red-400'}`}>
                  Monetization: {ad.isMonetized ? 'Yes' : 'No'}
                </span>
              </div>

              {/* Action Buttons - 4 Circles */}
              <div className="flex justify-center space-x-2 w-full">
                {/* Edit Button - Yellow */}
                <button
                  onClick={() => handleEdit(ad)}
                  className="w-8 h-8 bg-xsm-yellow hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-xsm-black" />
                </button>

                {/* Delete Button - Red */}
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>

                {/* Pull Up Button - Green */}
                <button
                  onClick={() => handlePullUp(ad.id, ad.createdAt)}
                  className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                  title="Pull Up"
                >
                  <TrendingUp className="w-4 h-4 text-white" />
                </button>

                {/* Pin Button - Orange */}
                <button
                  onClick={() => handlePin(ad.id)}
                  className="w-8 h-8 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                  title="Pin"
                >
                  <Pin className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Listing Modal */}
      {editingAd && (
        <EditListingModal
          ad={editingAd}
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          onUpdate={handleAdUpdate}
        />
      )}
    </div>
  );
};

export default UserAdList;
