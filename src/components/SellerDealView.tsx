import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, User, CreditCard, DollarSign, Calendar } from 'lucide-react';

const API_URL = 'http://localhost:5000';

interface PaymentMethod {
  id: string;
  name: string;
  category: string;
}

interface Deal {
  id: number;
  transaction_id: string;
  buyer_id: number;
  seller_id: number;
  channel_id: string;
  channel_title: string;
  channel_price: number;
  escrow_fee: number;
  transaction_type: string;
  buyer_payment_methods: string;
  seller_agreed: boolean;
  seller_agreed_at: string | null;
  buyer_agreed: boolean;
  buyer_agreed_at: string;
  deal_status: string;
  created_at: string;
  updated_at: string;
  buyer_username: string;
  payment_methods: PaymentMethod[];
}

interface SellerDealViewProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  onDealUpdate: () => void;
}

const SellerDealView: React.FC<SellerDealViewProps> = ({
  isOpen,
  onClose,
  deal,
  onDealUpdate
}) => {
  const [isAgreeing, setIsAgreeing] = useState(false);

  if (!isOpen || !deal) return null;

  const handleAgreeToTerms = async () => {
    try {
      setIsAgreeing(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/deals/${deal.id}/seller-agree`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ Deal Agreement Successful!

You have successfully agreed to the terms for transaction ${deal.transaction_id}.

Channel: ${deal.channel_title}
Amount: $${deal.channel_price}
Buyer: ${deal.buyer_username}

The buyer will now be notified that you have accepted their payment methods. The transaction will proceed to the next step.

Deal Status: Terms Agreed - Awaiting Escrow Payment`);

        onDealUpdate();
        onClose();
      } else {
        throw new Error(result.message || 'Failed to agree to deal');
      }
      
    } catch (error) {
      console.error('Error agreeing to deal:', error);
      alert('Failed to agree to deal. Please try again.');
    } finally {
      setIsAgreeing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'terms_agreed': return 'text-green-500';
      case 'completed': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting for Your Review';
      case 'terms_agreed': return 'Terms Agreed - Awaiting Payment';
      case 'completed': return 'Deal Completed';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-xsm-dark-gray rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Deal Review</h2>
            <p className="text-xsm-light-gray">Transaction ID: {deal.transaction_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-xsm-light-gray hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Deal Status */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="text-xsm-yellow" size={20} />
                <span className="text-white font-medium">Deal Status</span>
              </div>
              <span className={`font-semibold ${getStatusColor(deal.deal_status)}`}>
                {getStatusText(deal.deal_status)}
              </span>
            </div>
          </div>

          {/* Channel Information */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-xsm-yellow mb-3">Channel Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-white">
                <span>Channel:</span>
                <span className="font-medium">{deal.channel_title}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Channel ID:</span>
                <span className="font-mono text-sm">{deal.channel_id}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Sale Price:</span>
                <span className="font-semibold text-green-400">${deal.channel_price}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Escrow Fee:</span>
                <span>${deal.escrow_fee}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Transaction Type:</span>
                <span className="capitalize">{deal.transaction_type}</span>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-xsm-yellow mb-3">Buyer Information</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <User className="text-xsm-light-gray" size={20} />
                <span className="text-white font-medium">{deal.buyer_username}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="text-xsm-light-gray" size={20} />
                <span className="text-xsm-light-gray">Deal created: {formatDate(deal.created_at)}</span>
              </div>
              {/* Note: Transfer email is hidden for seller privacy as requested */}
            </div>
          </div>

          {/* Payment Methods Selected by Buyer */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-xsm-yellow mb-3">
              <CreditCard className="inline mr-2" size={20} />
              Payment Methods Available
            </h3>
            <p className="text-xsm-light-gray mb-4">
              The buyer has selected these payment methods. If you're comfortable with any of these options, click "I Agree to Terms" below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deal.payment_methods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg"
                >
                  <div className="w-8 h-8 bg-xsm-yellow rounded-full flex items-center justify-center">
                    <DollarSign size={16} className="text-black" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{method.name}</div>
                    <div className="text-xsm-light-gray text-sm capitalize">{method.category}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {deal.payment_methods.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xsm-light-gray">No payment methods selected</p>
              </div>
            )}
          </div>

          {/* Transaction Process */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-xsm-yellow mb-3">Transaction Process</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={12} className="text-white" />
                </div>
                <span className="text-white">Buyer created deal and selected payment methods</span>
              </div>
              
              <div className={`flex items-center space-x-3 ${deal.seller_agreed ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  deal.seller_agreed ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  {deal.seller_agreed ? <CheckCircle size={12} className="text-white" /> : <span className="text-white text-xs">2</span>}
                </div>
                <span className="text-white">Seller agrees to payment methods</span>
                {deal.seller_agreed_at && (
                  <span className="text-xsm-light-gray text-sm">
                    (Agreed: {formatDate(deal.seller_agreed_at)})
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-3 opacity-60">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">3</span>
                </div>
                <span className="text-white">Buyer pays escrow fee</span>
              </div>
              
              <div className="flex items-center space-x-3 opacity-60">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">4</span>
                </div>
                <span className="text-white">You transfer channel to escrow agent</span>
              </div>
              
              <div className="flex items-center space-x-3 opacity-60">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">5</span>
                </div>
                <span className="text-white">Buyer pays you via selected method</span>
              </div>
              
              <div className="flex items-center space-x-3 opacity-60">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">6</span>
                </div>
                <span className="text-white">Channel transferred to buyer</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            
            {!deal.seller_agreed && (
              <button
                onClick={handleAgreeToTerms}
                disabled={isAgreeing}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isAgreeing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Agreeing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>I Agree to Terms</span>
                  </>
                )}
              </button>
            )}
            
            {deal.seller_agreed && (
              <div className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2">
                <CheckCircle size={20} />
                <span>Terms Agreed</span>
              </div>
            )}
          </div>

          {/* Payment Method Negotiation Note */}
          {!deal.seller_agreed && (
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Payment Method Negotiation</h4>
              <p className="text-blue-200 text-sm">
                If none of the buyer's selected payment methods work for you, you can contact them through the chat system to discuss alternative payment methods. Once you both agree on a method, come back here and click "I Agree to Terms".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDealView;
