import React from 'react';
import { Play, Users, Star } from 'lucide-react';

interface ChannelData {
  id: string;
  name: string;
  category: string;
  subscribers: number;
  price: number;
  monthlyIncome?: number;
  description: string;
  verified: boolean;
  premium: boolean;
  rating: number;
  thumbnail: string;
  screenshots?: string[];
  seller: {
    name: string;
    rating: number;
    sales: number;
  };
}

interface ChannelCardProps {
  channel: ChannelData;
  onShowMore: (channel: ChannelData) => void;
}

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
const getImageUrl = (url?: string) => {
  if (url && url.startsWith('/uploads')) {
    return BACKEND_URL + url;
  }
  return url || '/placeholder.svg';
};

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onShowMore }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="xsm-card group cursor-pointer transform transition-all duration-300 hover:-translate-y-2">
      <div className="relative mb-4">
        <div className="w-full h-48 bg-xsm-medium-gray rounded-lg flex items-center justify-center overflow-hidden">
          {(Array.isArray(channel.screenshots) && channel.screenshots.length > 0) ? (
            <img
              src={getImageUrl(channel.screenshots[0])}
              alt={channel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = getImageUrl(channel.thumbnail);
              }}
            />
          ) : channel.thumbnail ? (
            <img
              src={getImageUrl(channel.thumbnail)}
              alt={channel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/placeholder.svg';
              }}
            />
          ) : (
            <Play className="w-16 h-16 text-xsm-yellow opacity-70" />
          )}
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex space-x-2">
          {channel.premium && (
            <span className="xsm-badge-premium">PREMIUM</span>
          )}
          {channel.verified && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              VERIFIED
            </span>
          )}
        </div>
      </div>

      {/* Channel Info */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white group-hover:text-xsm-yellow transition-colors duration-200">
          {channel.name}
        </h3>

        <div className="flex flex-col space-y-2">
          {/* Subscribers only */}
          <div className="flex items-center space-x-2 text-xsm-light-gray">
            <Users className="w-4 h-4" />
            <span>{formatNumber(channel.subscribers)} subs</span>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-xsm-yellow">
            {formatPrice(channel.price)}
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between pt-3 border-t border-xsm-medium-gray">
          <div className="text-sm text-xsm-light-gray">
            Seller: <span className="text-white font-medium">{channel.seller.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-white">{channel.seller.rating}</span>
            <span className="text-xs text-xsm-light-gray">({channel.seller.sales} sales)</span>
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-sm text-xsm-light-gray line-clamp-2">
          {channel.description}
        </p>

        {/* Show More Button */}
        <button
          onClick={() => onShowMore(channel)}
          className="w-full xsm-button mt-4"
        >
          Show More Details
        </button>
      </div>
    </div>
  );
};

export default ChannelCard;
