import React, { useState, useEffect } from 'react';
import { getUserAds, getUserAdsAlternative, deleteAd } from '../services/ads';
import { useAuth } from '../context/useAuth';
import { Star, Eye, Trash2, Edit, AlertCircle } from 'lucide-react';

interface UserAd {
  id: number;
  title: string;
  platform: string;
  category: string;
  price: number;
  subscribers: number;
  monthlyIncome: number;
  status: 'active' | 'pending' | 'sold' | 'suspended' | 'rejected';
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface UserAdListProps {
  onEditAd?: (ad: UserAd) => void;
}

const UserAdList: React.FC<UserAdListProps> = ({ onEditAd }) => {
  const [ads, setAds] = useState<UserAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  // Debug logging
  console.log('🔍 UserAdList render - User data:', user);
  console.log('🔍 UserAdList render - User ID:', user?.id);
  console.log('🔍 UserAdList render - Is logged in:', !!user);

  useEffect(() => {
    console.log('🔍 UserAdList mounted with user:', user);
    console.log('🔍 Filter changed to:', filter);
    fetchUserAds();
  }, [filter, user]);

  const fetchUserAds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is logged in
      if (!user?.id) {
        throw new Error('User not logged in');
      }

      console.log('🔍 Fetching ads for user ID:', user.id);
      
      // Simple approach: Get all ads and filter by current user ID
      const API_URL = import.meta.env.DEV ? '/api' : 'https://xsmmarket.com/api';
      const allAdsResponse = await fetch(`${API_URL}/ads`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!allAdsResponse.ok) {
        throw new Error('Failed to fetch ads from server');
      }

      const allAdsData = await allAdsResponse.json();
      console.log('📊 All ads received:', allAdsData);
      
      // Log the structure of the first ad to see what fields are available
      if (allAdsData.ads && allAdsData.ads.length > 0) {
        console.log('🔍 First ad structure:', allAdsData.ads[0]);
        console.log('🔍 All field names in first ad:', Object.keys(allAdsData.ads[0]));
      }
      
      // Filter ads by current user ID (check multiple possible field names)
      const userAds = allAdsData.ads.filter((ad: any) => {
        console.log('🔍 Checking ad:', ad.id, 'User fields:', {
          userId: ad.userId,
          user_id: ad.user_id,
          createdBy: ad.createdBy,
          created_by: ad.created_by,
          owner_id: ad.owner_id,
          author_id: ad.author_id,
          currentUserId: user.id,
          allFields: Object.keys(ad)
        });
        return ad.userId == user.id || 
               ad.user_id == user.id || 
               ad.createdBy == user.id ||
               ad.created_by == user.id ||
               ad.owner_id == user.id ||
               ad.author_id == user.id;
      });
      
      console.log('✅ Filtered user ads:', userAds);
      
      // Apply status filter if provided
      let filteredAds = userAds;
      if (filter !== 'all') {
        filteredAds = userAds.filter((ad: any) => ad.status === filter);
      }

      console.log('🎯 Final filtered ads:', filteredAds);

      const response = {
        ads: filteredAds,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredAds.length,
          itemsPerPage: filteredAds.length
        }
      };
      
      setAds(response.ads || []);
      setError(null);
    } catch (err: any) {
      console.error('❌ Failed to fetch user ads:', err);
      setError(err.message || 'Failed to fetch your ads');
      setAds([]);
    } finally {
      setLoading(false);
    }
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
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'active'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-xsm-yellow text-xsm-black'
                : 'bg-xsm-black/50 text-white hover:bg-xsm-medium-gray'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Debug Info */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-sm">
        <div className="text-blue-300 font-semibold mb-2">Debug Info:</div>
        <div className="text-blue-200 space-y-1">
          <div>User ID: {user?.id || 'Not available'}</div>
          <div>Username: {user?.username || 'Not available'}</div>
          <div>Ads Count: {ads.length}</div>
          <div>Filter: {filter}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'None'}</div>
        </div>
      </div>

      {/* Ad List */}
      {ads.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-white mb-2">No ads found</h3>
          <p className="text-xsm-light-gray mb-4">
            {filter === 'all' 
              ? "You haven't created any listings yet." 
              : `No ads with status "${filter}"`
            }
          </p>
          
        </div>
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-xsm-black/50 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold text-lg">{ad.title}</h4>
                    {getPlatformIcon(ad.platform)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ad.status)}`}>
                      {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-xsm-light-gray mb-2">
                    <span>{ad.category}</span>
                    <span>{formatNumber(ad.subscribers)} subscribers</span>
                    <span className="text-xsm-yellow font-semibold">{formatPrice(ad.price)}</span>
                    {ad.monthlyIncome > 0 && (
                      <span className="text-green-400">{formatPrice(ad.monthlyIncome)}/mo</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-xsm-light-gray">
                    <span>Created: {new Date(ad.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {ad.views} views
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onEditAd && (
                    <button
                      onClick={() => onEditAd(ad)}
                      className="xsm-button-secondary flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAdList;
