import React, { useState, useEffect } from 'react';
import { getAllAds } from '../services/ads';
import { Star, Users, DollarSign } from 'lucide-react';

interface Ad {
  id: number;
  title: string;
  description: string;
  platform: string;
  category: string;
  price: number;
  subscribers: number;
  monthlyIncome: number;
  isMonetized: boolean;
  views: number;
  thumbnail: string;
  verified: boolean;
  premium: boolean;
  rating: number;
  seller: {
    id: number;
    username: string;
    profilePicture: string;
  };
  createdAt: string;
}

interface AdListProps {
  onShowMore: (ad: Ad) => void;
}

const AdList: React.FC<AdListProps> = ({ onShowMore }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    platform: 'all',
    category: 'all',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const response = await getAllAds(filters);
        setAds(response.ads || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch ads');
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [filters]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="xsm-card animate-pulse">
            <div className="h-48 bg-xsm-medium-gray rounded mb-4"></div>
            <div className="h-4 bg-xsm-medium-gray rounded mb-2"></div>
            <div className="h-4 bg-xsm-medium-gray rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">😞</div>
        <h3 className="text-2xl font-bold text-white mb-2">Error loading ads</h3>
        <p className="text-xsm-light-gray">{error}</p>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-2xl font-bold text-white mb-2">No ads found</h3>
        <p className="text-xsm-light-gray">Be the first to create a listing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
            className="xsm-input"
          >
            <option value="all">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter</option>
            <option value="tiktok">TikTok</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="xsm-input"
          >
            <option value="createdAt">Recently Added</option>
            <option value="price">Price</option>
            <option value="subscribers">Subscribers</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        <div className="text-sm text-xsm-light-gray">
          {ads.length} {ads.length === 1 ? 'listing' : 'listings'} found
        </div>
      </div>

      {/* Ad Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="xsm-card group hover:scale-105 transition-all duration-300">
            {/* Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-xsm-medium-gray to-xsm-dark-gray rounded-lg mb-4 overflow-hidden">
              {ad.thumbnail ? (
                <img 
                  src={ad.thumbnail} 
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  📺
                </div>
              )}
              
              {/* Platform Badge */}
              <div className="absolute top-2 left-2">
                {getPlatformIcon(ad.platform)}
              </div>

              {/* Premium/Verified Badges */}
              <div className="absolute top-2 right-2 flex space-x-1">
                {ad.verified && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                    ✓ VERIFIED
                  </span>
                )}
                {ad.premium && (
                  <span className="xsm-badge-premium">PREMIUM</span>
                )}
              </div>

              {/* Price */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-xsm-yellow px-3 py-1 rounded font-bold">
                {formatPrice(ad.price)}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div>
                <h3 className="text-white font-semibold text-lg line-clamp-2 group-hover:text-xsm-yellow transition-colors">
                  {ad.title}
                </h3>
              </div>

              {/* Stats */}
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">Category:</span>
                  <span className="text-xsm-light-gray">{ad.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">Subscribers:</span>
                  <span className="text-white">{formatNumber(ad.subscribers)}</span>
                </div>
                {ad.monthlyIncome > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">{formatPrice(ad.monthlyIncome)}/mo</span>
                  </div>
                )}
              </div>

              {/* Seller Info */}
              <div className="flex items-center justify-between pt-2 border-t border-xsm-medium-gray/30">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-xsm-yellow rounded-full flex items-center justify-center">
                    {ad.seller.profilePicture ? (
                      <img 
                        src={ad.seller.profilePicture} 
                        alt={ad.seller.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xsm-black text-xs font-bold">
                        {ad.seller.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xsm-light-gray text-sm">{ad.seller.username}</span>
                </div>
                
                {ad.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-sm">{ad.rating}</span>
                  </div>
                )}
              </div>

              {/* Show More Button */}
              <button
                onClick={() => onShowMore(ad)}
                className="w-full xsm-button mt-4"
              >
                Show More Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdList;
