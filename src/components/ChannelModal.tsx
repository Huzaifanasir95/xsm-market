import React, { useState } from 'react';
import { X, Star, Users, Eye, DollarSign, Shield, MessageCircle, CreditCard } from 'lucide-react';
import { API_URL } from '@/services/auth';
import { useAuth } from '@/context/useAuth';

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
  seller: {
    id: number;
    name: string;
    rating: number;
    sales: number;
  };
}

interface ChannelModalProps {
  channel: ChannelData | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToChat?: () => void;
}

const PlatformIcon = ({ platform }: { platform: ChannelData['platform'] }) => {
  switch (platform) {
    case 'youtube':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298 0 .593.057.87.168V9.43a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.69a6.34 6.34 0 0 0 10.86 4.49 6.47 6.47 0 0 0 1.83-4.49V7.85a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.87.72z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    default:
      return null;
  }
};

const ChannelModal: React.FC<ChannelModalProps> = ({ channel, isOpen, onClose, onNavigateToChat }) => {
  const { user, isLoggedIn } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });

  if (!isOpen || !channel) return null;

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

  const adminFee = channel.price * 0.075;
  const totalAmount = adminFee;

  const handlePurchase = () => {
    setShowPayment(true);
  };

  const handlePayment = () => {
    // Placeholder for payment processing
    alert('Payment processed! Admin will facilitate the channel transfer. You will be contacted within 24 hours.');
    setShowPayment(false);
    onClose();
  };

  const handleContact = async () => {
    if (!isLoggedIn || !user) {
      alert('Please log in to contact the seller');
      return;
    }

    if (String(user.id) === String(channel.seller.id)) {
      alert("You can't contact yourself");
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

      const checkResult = await checkChatResponse.json();
      
      if (checkResult.exists) {
        // Chat exists, just navigate to it
        onClose(); // Close the modal first
        if (onNavigateToChat) {
          onNavigateToChat();
        }
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

      const chat = await response.json();
      
      if (response.ok) {
        onClose(); // Close the modal first
        // Navigate to chat page
        if (onNavigateToChat) {
          onNavigateToChat();
        }
      } else {
        alert(chat.message || 'Failed to create chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-xsm-dark-gray rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-xsm-dark-gray border-b border-xsm-medium-gray p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-xsm-yellow">Channel Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-xsm-yellow transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!showPayment ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Channel Info */}
              <div className="space-y-6">
                {/* Channel Header */}
                <div className="text-center">
                  <div className="w-32 h-32 bg-xsm-medium-gray rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="text-4xl font-bold text-xsm-yellow">
                      {channel.name.charAt(0)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{channel.name}</h3>
                  <a 
                    href={channel.channelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 mb-4 text-xsm-light-gray hover:text-xsm-yellow transition-colors"
                  >
                    <PlatformIcon platform={channel.platform} />
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

                {/* Description */}
                <div className="xsm-card">
                  <h4 className="text-lg font-semibold text-xsm-yellow mb-3">Description</h4>
                  <p className="text-white leading-relaxed">{channel.description}</p>
                </div>

                {/* Seller Info */}
                <div className="xsm-card">
                  <h4 className="text-lg font-semibold text-xsm-yellow mb-3">Seller Information</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold">{channel.seller.name}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white">{channel.seller.rating}</span>
                        <span className="text-xsm-light-gray">({channel.seller.sales} successful sales)</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleContact}
                      disabled={isCreating}
                      className="xsm-button-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{isCreating ? 'Connecting...' : 'Contact'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Purchase Info */}
              <div className="space-y-6">
                {/* Price Card */}
                <div className="xsm-card">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-xsm-yellow mb-2">
                      {formatPrice(channel.price)}
                    </div>
                   
                  </div>

                  {/* Purchase Process */}
                  <div className="bg-xsm-black/50 rounded-lg p-4 mb-6">
                    <h5 className="text-xsm-yellow font-semibold mb-3">Secure Purchase Process:</h5>
                    <ol className="text-sm text-white space-y-2">
                      <li>1. Pay 7.5% admin fee ({formatPrice(adminFee)})</li>
                      <li>2. Seller transfers channel to admin</li>
                      <li>3. Admin verifies and transfers to you</li>
                      <li>4. Complete payment to seller</li>
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

                {/* Security Features */}
                <div className="xsm-card">
                  <h5 className="text-xsm-yellow font-semibold mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Security Features
                  </h5>
                  <ul className="text-sm text-white space-y-2">
                    <li>• Escrow-style transaction protection</li>
                    <li>• Admin-facilitated channel transfer</li>
                    <li>• 7-day money-back guarantee</li>
                    <li>• Verified seller ratings</li>
                    <li>• Secure payment processing</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Payment Form */
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-xsm-yellow mb-2">Complete Payment</h3>
                <p className="text-white">Admin fee: {formatPrice(adminFee)}</p>
                <p className="text-sm text-xsm-light-gray">
                  This fee secures your purchase and initiates the transfer process
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={paymentData.name}
                    onChange={(e) => setPaymentData({...paymentData, name: e.target.value})}
                    className="xsm-input w-full"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Card Number</label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                    className="xsm-input w-full"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                      className="xsm-input w-full"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">CVV</label>
                    <input
                      type="text"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                      className="xsm-input w-full"
                      placeholder="123"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="flex-1 xsm-button-secondary"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePayment}
                    className="flex-1 xsm-button"
                  >
                    Pay {formatPrice(adminFee)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelModal;
