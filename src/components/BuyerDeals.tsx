import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle, User, DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';
import TransactionFeePayment from './TransactionFeePayment';

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
  seller_username: string;
  payment_methods?: PaymentMethod[];
  transaction_fee_paid?: boolean;
  transaction_fee_paid_at?: string | null;
  transaction_fee_paid_by?: string;
  transaction_fee_payment_method?: string;
  agent_email_sent?: boolean;
  agent_email_sent_at?: string | null;
  seller_gave_rights?: boolean;
  seller_gave_rights_at?: string | null;
}

const BuyerDeals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showFeePayment, setShowFeePayment] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'seller_reviewing':
        return 'text-blue-400';
      case 'terms_agreed':
        return 'text-green-400';
      case 'fee_paid':
        return 'text-purple-400';
      case 'escrow_paid':
        return 'text-cyan-400';
      case 'completed':
        return 'text-green-500';
      case 'cancelled':
      case 'disputed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Waiting for Seller';
      case 'seller_reviewing':
        return 'Under Review';
      case 'terms_agreed':
        return 'Terms Agreed';
      case 'fee_paid':
        return 'Fee Paid';
      case 'escrow_paid':
        return 'In Escrow';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'disputed':
        return 'Disputed';
      default:
        return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching buyer deals...');
      
      const response = await fetch(`${API_URL}/api/deals/buyer`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Buyer deals response:', data);
      
      if (data.success) {
        console.log('Buyer deals fetched successfully:', data.deals);
        setDeals(data.deals);
      } else {
        console.error('API error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const canPayTransactionFee = (deal: Deal) => {
    return deal.seller_agreed && !deal.transaction_fee_paid;
  };

  const handlePayTransactionFee = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowFeePayment(true);
  };

  const onPaymentComplete = () => {
    setShowFeePayment(false);
    setSelectedDeal(null);
    fetchDeals(); // Refresh deals
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-xsm-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xsm-yellow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-xsm-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Deals</h1>
          <p className="text-xsm-light-gray">Track and manage your channel purchase deals</p>
        </div>

        {/* Deals List */}
        {deals.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <FileText className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-white mb-2">No Deals Found</h3>
            <p className="text-gray-400">You haven't created any deals yet. Browse channels to start your first deal!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-white">{deal.channel_title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deal.deal_status)} bg-gray-700`}>
                      {getStatusText(deal.deal_status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Transaction ID</p>
                    <p className="font-mono text-sm text-white">{deal.transaction_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-400 mb-1">Seller</p>
                    <p className="font-medium text-white flex items-center">
                      <User size={16} className="mr-1" />
                      {deal.seller_username}
                    </p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-400 mb-1">Channel Price</p>
                    <p className="font-semibold text-green-400">{formatCurrency(deal.channel_price)}</p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-400 mb-1">Transaction Fee</p>
                    <p className="font-medium text-xsm-yellow">{formatCurrency(deal.escrow_fee)}</p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-400 mb-1">Created</p>
                    <p className="font-medium text-white flex items-center">
                      <Calendar size={16} className="mr-1" />
                      {formatDate(deal.created_at)}
                    </p>
                  </div>
                </div>

                {/* Deal Progress */}
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-white mb-3">Deal Progress</h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={16} />
                      <span className="text-white">Deal Created</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {deal.seller_agreed ? (
                        <CheckCircle className="text-green-400" size={16} />
                      ) : (
                        <Clock className="text-yellow-400" size={16} />
                      )}
                      <span className="text-white">Seller Agreement</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {deal.transaction_fee_paid ? (
                        <CheckCircle className="text-green-400" size={16} />
                      ) : (
                        <Clock className="text-gray-400" size={16} />
                      )}
                      <span className="text-white">Transaction Fee</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {deal.seller_gave_rights ? (
                        <CheckCircle className="text-green-400" size={16} />
                      ) : deal.agent_email_sent ? (
                        <Clock className="text-blue-400" size={16} />
                      ) : (
                        <Clock className="text-gray-400" size={16} />
                      )}
                      <span className="text-white">Agent Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="text-gray-400" size={16} />
                      <span className="text-white">Channel Transfer</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Preview */}
                {deal.payment_methods && deal.payment_methods.length > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-white mb-2">Selected Payment Methods</h4>
                    <div className="flex flex-wrap gap-2">
                      {deal.payment_methods.map((method) => (
                        <span
                          key={method.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-600 text-blue-100"
                        >
                          <CreditCard size={12} className="mr-1" />
                          {method.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transaction Fee Payment Status */}
                {deal.transaction_fee_paid && (
                  <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 text-green-300">
                      <CheckCircle size={16} />
                      <span className="font-medium">Transaction Fee Paid</span>
                    </div>
                    <p className="text-green-200 text-sm mt-1">
                      Paid by {deal.transaction_fee_paid_by === 'buyer' ? 'you' : 'the seller'} 
                      via {deal.transaction_fee_payment_method}
                    </p>
                  </div>
                )}

                {/* Agent Access Status */}
                {deal.agent_email_sent && !deal.seller_gave_rights && (
                  <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 text-blue-300">
                      <Clock size={16} />
                      <span className="font-medium">Waiting for Seller to Give Agent Access</span>
                    </div>
                    <p className="text-blue-200 text-sm mt-1">
                      Our agent's email has been provided to the seller. They need to give account access so we can verify and facilitate the secure transfer.
                    </p>
                  </div>
                )}

                {deal.seller_gave_rights && (
                  <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 text-green-300">
                      <CheckCircle size={16} />
                      <span className="font-medium">Agent Access Confirmed</span>
                    </div>
                    <p className="text-green-200 text-sm mt-1">
                      The seller has given our agent access to the account. Our team is now verifying the account details and preparing for secure transfer.
                    </p>
                  </div>
                )}

                {/* Next Steps */}
                {deal.seller_agreed && !deal.transaction_fee_paid && (
                  <div className="bg-xsm-yellow bg-opacity-10 border border-xsm-yellow rounded-lg p-4 mb-4">
                    <h4 className="text-xsm-yellow font-medium mb-2">Next Step Required</h4>
                    <p className="text-yellow-200 text-sm">
                      The seller has agreed to your payment methods. Now you or the seller need to pay the transaction fee to proceed.
                    </p>
                  </div>
                )}

                {!deal.seller_agreed && (
                  <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-4">
                    <h4 className="text-blue-300 font-medium mb-2">Waiting for Seller</h4>
                    <p className="text-blue-200 text-sm">
                      The seller is reviewing your payment methods. They will either accept them or contact you to discuss alternatives.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {canPayTransactionFee(deal) && (
                    <button
                      onClick={() => handlePayTransactionFee(deal)}
                      className="bg-xsm-yellow text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium flex items-center space-x-2"
                    >
                      <DollarSign size={16} />
                      <span>Pay Transaction Fee</span>
                    </button>
                  )}
                  
                  <button
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                    onClick={() => {
                      // TODO: Implement chat or contact seller functionality
                      alert('Chat functionality will be implemented soon');
                    }}
                  >
                    Contact Seller
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Fee Payment Modal */}
      <TransactionFeePayment
        isOpen={showFeePayment}
        onClose={() => setShowFeePayment(false)}
        deal={selectedDeal}
        userType="buyer"
        onPaymentComplete={onPaymentComplete}
      />
    </div>
  );
};

export default BuyerDeals;
