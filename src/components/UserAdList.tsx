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
      'youtube': <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">YT</span></div>,
      'instagram': <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">IG</span></div>,
      'tiktok': <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">TT</span></div>,
      'facebook': <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">FB</span></div>,
      'twitter': <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">TW</span></div>,
    };
    return iconMap[platform.toLowerCase()] || <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">{platform.charAt(0).toUpperCase()}</span></div>;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-xsm-black/50 rounded-lg p-4 border border-xsm-medium-gray/20 shadow-sm flex flex-col items-center hover:border-xsm-yellow/30 transition-colors">
              {/* Large Profile Picture Circle */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-xsm-medium-gray/30">
                  <img
                    src={ad.seller?.profilePicture || user?.profilePicture || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Platform Icon in Corner */}
                <div className="absolute -top-1 -right-1">
                  {getPlatformIconSmall(ad.platform)}
                </div>
              </div>

              {/* Channel Name */}
              <h4 className="text-white font-semibold text-sm text-center mb-2 truncate w-full">
                {ad.title}
              </h4>

              {/* Subscribers */}
              <div className="text-center mb-1">
                <span className="text-blue-400 font-medium text-sm">
                  Subscribers: {formatNumber(ad.subscribers)}
                </span>
              </div>

              {/* Price */}
              <div className="text-center mb-1">
                <span className="text-xsm-yellow font-semibold">
                  Price: {formatPrice(ad.price)}
                </span>
              </div>

              {/* Monetization */}
              <div className="text-center mb-4">
                <span className={`text-sm ${ad.isMonetized ? 'text-green-400' : 'text-red-400'}`}>
                  Monetization: {ad.isMonetized ? 'Yes' : 'No'}
                </span>
              </div>

              {/* Action Buttons - 4 Circles */}
              <div className="flex justify-center space-x-2">
                {/* Edit Button - Yellow */}
                <button
                  onClick={() => handleEdit(ad)}
                  className="w-8 h-8 bg-xsm-yellow hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-xsm-black" />
                </button>

                {/* Delete Button - Red */}
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>

                {/* Pull Up Button - Green */}
                <button
                  onClick={() => handlePullUp(ad.id, ad.createdAt)}
                  className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                  title="Pull Up"
                >
                  <TrendingUp className="w-4 h-4 text-white" />
                </button>

                {/* Pin Button - Orange */}
                <button
                  onClick={() => handlePin(ad.id)}
                  className="w-8 h-8 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors"
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
