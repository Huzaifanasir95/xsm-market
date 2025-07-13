import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, User, CreditCard, DollarSign, Calendar, FileText } from 'lucide-react';
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
  buyer_username: string;
  payment_methods: PaymentMethod[];
  transaction_fee_paid?: boolean;
  transaction_fee_paid_by?: string;
  transaction_fee_payment_method?: string;
  agent_email_sent?: boolean;
  agent_email_sent_at?: string | null;
  seller_gave_rights?: boolean;
  seller_gave_rights_at?: string | null;
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
  const [showFeePayment, setShowFeePayment] = useState(false);
  const [isConfirmingRights, setIsConfirmingRights] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen || !deal) return null;

  const handleConfirmRights = async () => {
    try {
      setIsConfirmingRights(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/deals/${deal.id}/confirm-rights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`✅ Rights Confirmation Successful!

You have confirmed that you've given account access to our agent.

Transaction ID: ${deal.transaction_id}
Channel: ${deal.channel_title}
Status: Agent Access Confirmed

Our agent will now verify the account and prepare for secure transfer. You will be notified once the verification is complete (typically 1-3 business days).

Thank you for your cooperation in ensuring a secure transaction!`);

        onDealUpdate();
        onClose();
      } else {
        throw new Error(result.message || 'Failed to confirm rights');
      }
      
    } catch (error) {
      console.error('Error confirming rights:', error);
      alert('Failed to confirm rights: ' + error.message);
    } finally {
      setIsConfirmingRights(false);
    }
  };

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
            
            {deal.seller_agreed && !deal.transaction_fee_paid && (
              <button
                onClick={() => setShowFeePayment(true)}
                className="flex-1 bg-xsm-yellow text-black py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center space-x-2 font-semibold"
              >
                <DollarSign size={20} />
                <span>Pay Transaction Fee</span>
              </button>
            )}
            
            {deal.seller_agreed && deal.transaction_fee_paid && !deal.seller_gave_rights && (
              <button
                onClick={handleConfirmRights}
                disabled={isConfirmingRights}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold"
              >
                {isConfirmingRights ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    <span>I Have Given The Rights</span>
                  </>
                )}
              </button>
            )}

            {deal.seller_agreed && deal.transaction_fee_paid && deal.seller_gave_rights && (
              <div className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2">
                <CheckCircle size={20} />
                <span>Rights Confirmed - Agent Verifying</span>
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

          {/* Next Steps for Transaction Fee */}
          {deal.seller_agreed && !deal.transaction_fee_paid && (
            <div className="bg-xsm-yellow bg-opacity-10 border border-xsm-yellow rounded-lg p-4">
              <h4 className="text-xsm-yellow font-medium mb-2 flex items-center">
                <FileText size={16} className="mr-2" />
                Next Step: Transaction Fee Payment
              </h4>
              <p className="text-yellow-200 text-sm">
                Both you and the buyer can now pay the transaction fee ({formatCurrency(deal.escrow_fee)}) to proceed with the deal. 
                Usually the buyer pays this fee, but if you've agreed otherwise or the buyer is unable to pay, you can pay it yourself.
              </p>
            </div>
          )}

          {/* Transaction Fee Paid Status */}
          {deal.transaction_fee_paid && (
            <div className="bg-green-900 border border-green-700 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-2 flex items-center">
                <CheckCircle size={16} className="mr-2" />
                Transaction Fee Paid
              </h4>
              <p className="text-green-200 text-sm">
                The transaction fee has been paid by {deal.transaction_fee_paid_by === 'seller' ? 'you' : 'the buyer'} 
                via {deal.transaction_fee_payment_method}. The deal will now proceed to the next stage.
              </p>
            </div>
          )}

          {/* Agent Email and Rights Instructions */}
          {deal.transaction_fee_paid && deal.agent_email_sent && !deal.seller_gave_rights && (
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-3 flex items-center">
                <Shield size={16} className="mr-2" />
                Give Account Rights to Agent
              </h4>
              <div className="space-y-3">
                <div className="bg-blue-800 rounded-lg p-3">
                  <p className="text-blue-200 text-sm font-medium mb-1">📧 Agent Email:</p>
                  <p className="text-blue-100 font-mono text-sm bg-blue-700 p-2 rounded">
                    rebirthcar63@gmail.com
                  </p>
                </div>
                <div className="text-blue-200 text-sm space-y-2">
                  <p className="font-medium">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Add the agent email as a manager/collaborator to your account</li>
                    <li>Give permissions to view and manage the account</li>
                    <li>DO NOT transfer ownership yet - our agent will handle that securely</li>
                    <li>Click "I Have Given The Rights" button below once completed</li>
                  </ol>
                </div>
                <div className="bg-yellow-800 border border-yellow-600 rounded-lg p-3">
                  <p className="text-yellow-200 text-xs">
                    ⚠️ Important: Only give manager/collaborator access, NOT ownership. Our agent will handle the ownership transfer process securely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rights Confirmation Status */}
          {deal.seller_gave_rights && (
            <div className="bg-green-900 border border-green-700 rounded-lg p-4">
              <h4 className="text-green-300 font-medium mb-2 flex items-center">
                <CheckCircle size={16} className="mr-2" />
                Rights Confirmed
              </h4>
              <p className="text-green-200 text-sm">
                You have confirmed giving account access to our agent. The agent is now verifying the account and will proceed with the secure transfer process. You will be updated once verification is complete.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Transaction Fee Payment Modal */}
      <TransactionFeePayment
        isOpen={showFeePayment}
        onClose={() => setShowFeePayment(false)}
        deal={deal}
        userType="seller"
        onPaymentComplete={() => {
          setShowFeePayment(false);
          onDealUpdate();
        }}
      />
    </div>
  );
};

export default SellerDealView;
