import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Users, DollarSign, Shield, MessageCircle, CreditCard, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useNotifications } from '@/context/NotificationContext';
import DealCreationModal from '@/components/DealCreationModal';
import { extractIdFromSlug } from '@/utils/idEncoder';

// Get API URL from environment variables
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://xsmmarket.com/api');
};

const API_URL = getApiUrl();

interface ChannelData {
  id: string;
  name: string;
  category: string;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'twitter';
  channelUrl: string;
  subscribers: number;
  price: number;
  monthlyIncome?: number;
  description: string;
  verified: boolean;
  premium: boolean;
  rating: number;
  views: number;
  thumbnail: string;
  screenshots?: string[];
  monetized: boolean;
  earningMethods?: string[];
  promotionStrategies?: string[];
  contentType?: string;
  incomeDetails?: string;
  promotionDetails?: string;
  seller: {
    id: number;
    name: string;
    rating: number;
    sales: number;
  };
}

const PlatformIcon = ({ platform }: { platform: ChannelData['platform'] }) => {
  const getIconColorClass = () => {
    switch (platform) {
      case 'youtube':
        return 'text-red-600';
      case 'tiktok':
        return 'text-black';
      case 'facebook':
        return 'text-blue-600';
      case 'instagram':
        return 'text-pink-600';
      case 'twitter':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  switch (platform) {
    case 'youtube':
      return (
        <svg className={`w-full h-full ${getIconColorClass()}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={`w-full h-full ${getIconColorClass()}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .593.057.87.168V9.43a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.69a6.34 6.34 0 0 0 10.86 4.49 6.47 6.47 0 0 0 1.83-4.49V7.85a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.87.72z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className={`w-full h-full ${getIconColorClass()}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className={`w-full h-full ${getIconColorClass()}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg className={`w-full h-full ${getIconColorClass()}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    default:
      return null;
  }
};

const AdDetails: React.FC = () => {
  const { adId: encodedAdId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { showError, showSuccess } = useNotifications();
  
  const [channel, setChannel] = useState<ChannelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Decode the ID from the URL parameter
  console.log('AdDetails - received encodedAdId:', encodedAdId);
  
  const decodedAdId = encodedAdId ? extractIdFromSlug(encodedAdId) : null;
  console.log('AdDetails - decodedAdId:', decodedAdId);

  useEffect(() => {
    if (encodedAdId) {
      // If we have an encoded ID but can't decode it, show error immediately
      if (!decodedAdId) {
        setError('Invalid ad ID');
        setLoading(false);
        return;
      }
      fetchAdDetails();
    } else {
      setError('No ad ID provided');
      setLoading(false);
    }
  }, [encodedAdId, decodedAdId]);

  const fetchAdDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug logging
      console.log('Raw encodedAdId from URL:', encodedAdId);
      console.log('Decoded ID:', decodedAdId);
      
      if (!decodedAdId) {
        console.error('Failed to decode ad ID from:', encodedAdId);
        throw new Error('Invalid ad ID - could not decode');
      }
      
      const adIdStr = decodedAdId.toString();
      console.log('Making API request to:', `${API_URL}/ads/${adIdStr}`);
      
      // Add timeout to prevent indefinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_URL}/ads/${adIdStr}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 404) {
        throw new Error('Ad not found');
      } else if (!response.ok) {
        throw new Error('Failed to fetch ad details');
      }
      
      const data = await response.json();
      
      // Parse screenshots from JSON string if available
      let screenshots: string[] = [];
      if (data.screenshots) {
        try {
          screenshots = JSON.parse(data.screenshots);
          if (!Array.isArray(screenshots)) {
            screenshots = [];
          }
        } catch (e) {
          console.warn('Failed to parse screenshots JSON:', e);
          screenshots = [];
        }
      }
      
      // Transform the API response to match our ChannelData interface
      const channelData: ChannelData = {
        id: data.id.toString(),
        name: data.title,
        description: data.description,
        platform: data.platform?.toLowerCase() as ChannelData['platform'] || 'youtube',
        category: data.category,
        channelUrl: data.channelUrl || `https://${data.platform?.toLowerCase()}.com`,
        subscribers: data.subscribers,
        price: data.price,
        monthlyIncome: data.monthlyIncome,
        verified: data.verified || false,
        premium: data.premium || false,
        rating: data.rating || 4.5,
        views: data.views || data.totalViews || data.subscribers * 10,
        // Use first screenshot as thumbnail if available, otherwise fallback to thumbnail/primary_image
        thumbnail: screenshots.length > 0 ? screenshots[0] : (data.thumbnail || data.primary_image || '/default-thumbnail.jpg'),
        screenshots: screenshots,
        monetized: data.isMonetized || data.monthlyIncome > 0 || false,
        contentType: data.contentType,
        incomeDetails: data.incomeDetails,
        promotionDetails: data.promotionDetails,
        earningMethods: data.earningMethods || ['Ad Revenue', 'Sponsorships'],
        promotionStrategies: data.promotionStrategies || ['SEO Optimization', 'Social Media'],
        seller: {
          id: data.seller?.id || 0,
          name: data.seller?.username || data.seller?.name || 'Unknown',
          rating: data.seller?.rating || 4.8,
          sales: data.seller?.sales || 0
        }
      };
      
      setChannel(channelData);
    } catch (error) {
      console.error('Error fetching ad details:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again.');
          showError('Request timed out');
        } else {
          setError(error.message);
          showError(error.message);
        }
      } else {
        setError('Failed to load ad details. Please try again.');
        showError('Failed to load ad details');
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handlePurchase = () => {
    if (!isLoggedIn) {
      showError('Please log in to start a deal');
      navigate('/login');
      return;
    }
    setShowDealModal(true);
  };

  const handleCloseDealModal = () => {
    setShowDealModal(false);
  };

  const handleContact = async () => {
    if (!isLoggedIn || !user) {
      showError('Please log in to contact the seller');
      navigate('/login');
      return;
    }

    if (!channel) return;

    if (String(user.id) === String(channel.seller.id)) {
      showError("You can't contact yourself");
      return;
    }

    try {
      setIsCreating(true);
      const token = localStorage.getItem('token');
      
      // First, check if a chat already exists with this seller
      const checkChatResponse = await fetch(`${API_URL}/chat/check-existing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sellerId: channel.seller.id,
          adId: channel.id
        })
      });

      if (!checkChatResponse.ok) {
        throw new Error(`HTTP error! status: ${checkChatResponse.status}`);
      }

      const checkResult = await checkChatResponse.json();
      
      if (checkResult.exists) {
        // Chat exists, just navigate to it
        navigate('/chat');
        return;
      }

      // No existing chat, create a new one with initial message
      const response = await fetch(`${API_URL}/chat/ad-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adId: channel.id,
          sellerId: channel.seller.id,
          message: `Hi, I'm interested in your channel: ${channel.name}`,
          sellerName: channel.seller.name
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat creation failed:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const chat = await response.json();
      
      // Chat created successfully
      navigate('/chat');
      showSuccess('Chat created successfully!');
    } catch (error) {
      console.error('Error creating chat:', error);
      showError('Failed to create chat');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-xsm-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-xsm-yellow mx-auto mb-4"></div>
          <p className="text-xsm-light-gray">Loading channel details...</p>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    const getErrorTitle = () => {
      if (error?.includes('Invalid ad ID') || error?.includes('could not decode')) {
        return 'Invalid Link';
      } else if (error?.includes('Ad not found')) {
        return 'Channel Not Found';
      } else {
        return 'Channel Not Available';
      }
    };

    const getErrorMessage = () => {
      if (error?.includes('Invalid ad ID') || error?.includes('could not decode')) {
        return 'The link you\'re trying to access is invalid or corrupted.';
      } else if (error?.includes('Ad not found')) {
        return 'This channel may have been removed or is no longer available.';
      } else {
        return error || 'The requested channel could not be loaded.';
      }
    };

    return (
      <div className="min-h-screen bg-xsm-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-xsm-yellow rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-xsm-yellow mb-4">{getErrorTitle()}</h2>
          <p className="text-xsm-light-gray mb-6 leading-relaxed">{getErrorMessage()}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-xsm-yellow text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
            >
              Browse All Channels
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-transparent border border-xsm-medium-gray text-xsm-light-gray px-6 py-3 rounded-lg hover:bg-xsm-medium-gray transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const adminFee = channel.price * 0.075;

  return (
    <div className="min-h-screen bg-xsm-black text-white">
      {/* Header with back button */}
      <div className="bg-xsm-dark-gray border-b border-xsm-medium-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-xsm-yellow hover:text-yellow-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-xsm-yellow">Channel Details</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Channel Info */}
          <div className="space-y-6">
            {/* Channel Header */}
            <div className="text-center">
              {/* Display channel thumbnail if available */}
              {channel.thumbnail && channel.thumbnail !== '/default-thumbnail.jpg' ? (
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <img
                    src={channel.thumbnail}
                    alt={`${channel.name} thumbnail`}
                    className="w-full h-full object-cover rounded-full border-4 border-xsm-yellow"
                    onError={(e) => {
                      console.error('Thumbnail failed to load:', channel.thumbnail);
                      // Fallback to platform icon
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center p-6 hidden">
                    <div className="w-full h-full">
                      <PlatformIcon platform={channel.platform} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 flex items-center justify-center p-6">
                  <div className="w-full h-full">
                    <PlatformIcon platform={channel.platform} />
                  </div>
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{channel.name}</h3>
              <a 
                href={channel.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 mb-4 text-xsm-light-gray hover:text-xsm-yellow transition-colors"
              >
                <div className="w-5 h-5">
                  <PlatformIcon platform={channel.platform} />
                </div>
                <span className="underline">{channel.channelUrl}</span>
              </a>
              <div className="flex items-center justify-center space-x-4">
                {channel.premium && (
                  <span className="xsm-badge-premium">PREMIUM</span>
                )}
                {channel.verified && (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    VERIFIED
                  </span>
                )}
                <span className="bg-xsm-yellow text-xsm-black px-3 py-1 rounded-full text-sm font-bold">
                  {channel.category}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="xsm-card text-center">
              <Users className="w-8 h-8 text-xsm-yellow mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{formatNumber(channel.subscribers)}</div>
              <div className="text-sm text-xsm-light-gray">Subscribers</div>
            </div>

            {/* Monetization Status */}
            <div className="xsm-card">
              <h4 className="text-lg font-semibold text-xsm-yellow mb-3">Channel Status</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Monetization Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${channel.monetized ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-200'}`}>
                    {channel.monetized ? 'Monetized' : 'Not Monetized'}
                  </span>
                </div>
              </div>
            </div>

            {/* Screenshots/Images Gallery */}
            {channel.screenshots && channel.screenshots.length > 0 && (
              <div className="xsm-card">
                <h4 className="text-lg font-semibold text-xsm-yellow mb-3">Channel Screenshots</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {channel.screenshots.map((screenshot, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={screenshot}
                        alt={`${channel.name} screenshot ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-xsm-medium-gray/30 hover:border-xsm-yellow transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          // Open image in new tab for full view
                          window.open(screenshot, '_blank');
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', screenshot);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                        <div className="text-white text-sm font-medium">Click to enlarge</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xsm-medium-gray text-sm mt-2">
                  {channel.screenshots.length} screenshot{channel.screenshots.length > 1 ? 's' : ''} uploaded by seller
                </p>
              </div>
            )}



            {/* Description - only show if not empty */}
            {channel.description && channel.description.trim() && (
              <div className="xsm-card">
                <h4 className="text-lg font-semibold text-xsm-yellow mb-3">Description</h4>
                <p className="text-white leading-relaxed">{channel.description}</p>
              </div>
            )}

            {/* Content Type - only show if not empty */}
            {channel.contentType && channel.contentType.trim() && (
              <div className="xsm-card">
                <h4 className="text-lg font-semibold text-xsm-yellow mb-3">Content Type</h4>
                <p className="text-white leading-relaxed">{channel.contentType}</p>
              </div>
            )}

            {/* Income Details - only show if not empty */}
            {channel.incomeDetails && channel.incomeDetails.trim() && (
              <div className="xsm-card">
                <h4 className="text-lg font-semibold text-xsm-yellow mb-3">Income Details</h4>
                <p className="text-white leading-relaxed">{channel.incomeDetails}</p>
              </div>
            )}

            {/* Promotion Details - only show if not empty */}
            {channel.promotionDetails && channel.promotionDetails.trim() && (
              <div className="xsm-card">
                <h4 className="text-lg font-semibold text-xsm-yellow mb-3">Promotion Details</h4>
                <p className="text-white leading-relaxed">{channel.promotionDetails}</p>
              </div>
            )}
          </div>

          {/* Right Column - Purchase Info */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="xsm-card">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-xsm-yellow mb-2">
                  {formatPrice(channel.price)}
                </div>
                <div className="flex justify-center items-center space-x-4 mt-4">
                  {channel.premium && (
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-1 rounded-full text-sm font-bold">
                      Premium Listing
                    </span>
                  )}
                  {channel.verified && (
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Verified Channel
                    </span>
                  )}
                </div>
              </div>

              {/* Purchase Process */}
              <div className="bg-xsm-black/50 rounded-lg p-4 mb-6">
                <h5 className="text-xsm-yellow font-semibold mb-3">Secure Purchase Process:</h5>
                <ol className="text-sm text-white space-y-3">
                  <li className="flex items-start">
                    <span className="bg-xsm-yellow text-black w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">1</span>
                    <span>Pay 7.5% admin fee ({formatPrice(adminFee)})</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-xsm-yellow text-black w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">2</span>
                    <span>Seller transfers channel to admin</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-xsm-yellow text-black w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">3</span>
                    <span>Admin verifies and transfers to you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-xsm-yellow text-black w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">4</span>
                    <span>Complete payment to seller</span>
                  </li>
                </ol>
              </div>

              <button
                onClick={handlePurchase}
                className="w-full xsm-button text-lg py-4 flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Start Purchase Process</span>
              </button>

              <div className="text-center mt-4 text-sm text-xsm-light-gray">
                Secure payment with buyer protection
              </div>
            </div>

            {/* Seller Info */}
            <div className="xsm-card">
              <h4 className="text-lg font-semibold text-xsm-yellow mb-3">Seller Information</h4>
              <div className="flex flex-col space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-white font-semibold text-lg">{channel.seller.name}</div>
                    {channel.seller.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-white font-medium">{channel.seller.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xsm-light-gray">
                    {channel.seller.sales} successful sales
                  </div>
                </div>
                <button 
                  onClick={handleContact}
                  disabled={isCreating}
                  className="w-full xsm-button-secondary flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{isCreating ? 'Connecting...' : 'Contact Seller'}</span>
                </button>
              </div>
            </div>

            {/* Security Features */}
            <div className="xsm-card">
              <h5 className="text-xsm-yellow font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Features
              </h5>
              <ul className="space-y-3">
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-xsm-yellow rounded-full mr-3"></div>
                  Escrow-style transaction protection
                </li>
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-xsm-yellow rounded-full mr-3"></div>
                  Admin-facilitated channel transfer
                </li>
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-xsm-yellow rounded-full mr-3"></div>
                  7-day money-back guarantee
                </li>
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-xsm-yellow rounded-full mr-3"></div>
                  Verified seller ratings
                </li>
                <li className="flex items-center text-white">
                  <div className="w-2 h-2 bg-xsm-yellow rounded-full mr-3"></div>
                  Secure payment processing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Creation Modal - exactly like the ChannelModal */}
      {showDealModal && (
        <DealCreationModal
          isOpen={showDealModal}
          onClose={handleCloseDealModal}
          channelPrice={channel.price}
          channelTitle={channel.name}
          sellerId={channel.seller.id.toString()}
          onNavigateToChat={() => navigate('/chat')}
        />
      )}
    </div>
  );
};

export default AdDetails;