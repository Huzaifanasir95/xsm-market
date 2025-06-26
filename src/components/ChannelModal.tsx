
import React, { useState } from 'react';
import { X, Star, Users, Eye, DollarSign, Shield, MessageCircle, CreditCard } from 'lucide-react';

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
  views: number;
  thumbnail: string;
  seller: {
    name: string;
    rating: number;
    sales: number;
  };
}

interface ChannelModalProps {
  channel: ChannelData | null;
  isOpen: boolean;
  onClose: () => void;
}

const ChannelModal: React.FC<ChannelModalProps> = ({ channel, isOpen, onClose }) => {
  const [showPayment, setShowPayment] = useState(false);
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

  const handleContact = () => {
    alert('Chat feature coming soon! You can contact the seller through our secure messaging system.');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="xsm-card text-center">
                    <Users className="w-8 h-8 text-xsm-yellow mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{formatNumber(channel.subscribers)}</div>
                    <div className="text-sm text-xsm-light-gray">Subscribers</div>
                  </div>
                  <div className="xsm-card text-center">
                    <Eye className="w-8 h-8 text-xsm-yellow mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{formatNumber(channel.views)}</div>
                    <div className="text-sm text-xsm-light-gray">Total Views</div>
                  </div>
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
                      className="xsm-button-secondary flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contact</span>
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
                    {channel.monthlyIncome && (
                      <div className="text-green-400 flex items-center justify-center space-x-1">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-lg">{formatPrice(channel.monthlyIncome)}/month income</span>
                      </div>
                    )}
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
