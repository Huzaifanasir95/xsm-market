import React, { useState } from 'react';
import { X, Shield, DollarSign, CreditCard, Smartphone, Check } from 'lucide-react';
import { useAuth } from '@/context/useAuth';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  category: 'bank' | 'digital' | 'crypto' | 'other';
}

interface DealCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelPrice: number;
  channelTitle: string;
  sellerId: string;
  onNavigateToChat?: () => void;
}

const DealCreationModal: React.FC<DealCreationModalProps> = ({
  isOpen,
  onClose,
  channelPrice,
  channelTitle,
  sellerId,
  onNavigateToChat
}) => {
  const { user, isLoggedIn } = useAuth();
  const [selectedTransactionType, setSelectedTransactionType] = useState<'safest' | 'fastest'>('safest');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [step, setStep] = useState<'payment-selection' | 'email-confirmation' | 'terms-conditions'>('payment-selection');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);

  // Payment methods data
  const paymentMethods: PaymentMethod[] = [
    { id: 'bank-transfer', name: 'Bank Transfer', icon: '🏦', category: 'bank' },
    { id: 'paypal', name: 'PayPal', icon: '💳', category: 'digital' },
    { id: 'bitcoin', name: 'Bitcoin', icon: '₿', category: 'crypto' },
    { id: 'venmo', name: 'Venmo', icon: '💸', category: 'digital' },
    { id: 'zelle', name: 'Zelle', icon: '⚡', category: 'digital' },
    { id: 'cashapp', name: 'Cash App', icon: '💰', category: 'digital' },
    { id: 'transferwise', name: 'TransferWise', icon: '🌍', category: 'bank' },
    { id: 'google-pay', name: 'Google Pay', icon: '📱', category: 'digital' },
    { id: 'payoneer', name: 'Payoneer', icon: '💼', category: 'digital' },
    { id: 'western-union', name: 'Western Union', icon: '🌐', category: 'bank' },
    { id: 'moneygram', name: 'MoneyGram', icon: '💱', category: 'bank' },
    { id: 'other', name: 'Other', icon: '📋', category: 'other' }
  ];

  const escrowFeePercent = 4.8;
  const minEscrowFee = 3;
  const escrowFee = Math.max((channelPrice * escrowFeePercent) / 100, minEscrowFee);

  const handlePaymentMethodToggle = (methodId: string) => {
    setSelectedPaymentMethods(prev => 
      prev.includes(methodId) 
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  };

  const handleCreateDeal = () => {
    if (selectedPaymentMethods.length === 0) {
      alert('Please select at least one payment method');
      return;
    }
    setStep('email-confirmation');
  };

  const handleEmailConfirmation = () => {
    if (!buyerEmail.trim()) {
      alert('Please enter your email address');
      return;
    }
    setStep('terms-conditions');
  };

  const handleFinalSubmit = async () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    if (!isLoggedIn || !user) {
      alert('Please log in to create a deal');
      return;
    }

    try {
      setIsCreatingDeal(true);
      
      // Generate a unique transaction ID for display
      const transactionId = `XSM${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Simulate deal creation process
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay to simulate processing
      
      // Show success message instead of making API call
      alert(`✅ Deal Created Successfully!

Transaction ID: ${transactionId}
Channel: ${channelTitle}
Amount: $${channelPrice}
Escrow Fee: $${escrowFee.toFixed(2)}
Email: ${buyerEmail}

Your deal request has been created. The seller will be notified and you'll be contacted once they respond.

Note: This is a frontend demo. Backend integration will be added later.`);

      // Reset and close modal
      resetModal();
      onClose();
      
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal. Please try again.');
    } finally {
      setIsCreatingDeal(false);
    }
  };

  const resetModal = () => {
    setStep('payment-selection');
    setSelectedPaymentMethods([]);
    setBuyerEmail('');
    setSelectedTransactionType('safest');
    setAgreedToTerms(false);
    setIsCreatingDeal(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-xsm-dark-gray rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-xsm-gray">
          <h2 className="text-2xl font-bold text-white">Create a Deal</h2>
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="text-white hover:text-xsm-yellow transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'payment-selection' && (
            <>
              {/* Transaction Type Selection */}
              <div className="mb-8">
                <div className="flex justify-center space-x-4 mb-6">
                  <button
                    onClick={() => setSelectedTransactionType('safest')}
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
                      selectedTransactionType === 'safest'
                        ? 'bg-white text-black'
                        : 'bg-transparent border border-white text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    Safest transaction
                  </button>
                  <button
                    onClick={() => setSelectedTransactionType('fastest')}
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
                      selectedTransactionType === 'fastest'
                        ? 'bg-white text-black'
                        : 'bg-transparent border border-white text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    Fastest transaction
                  </button>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Select payment methods you can use to pay the seller. The more options you choose, the greater the chance that one of them will suit the seller and he will agree to the deal.
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodToggle(method.id)}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${
                        selectedPaymentMethods.includes(method.id)
                          ? 'border-xsm-yellow bg-xsm-yellow/10 text-xsm-yellow'
                          : 'border-gray-600 text-white hover:border-xsm-yellow hover:text-xsm-yellow'
                      }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="text-sm font-medium text-center">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Steps */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Transaction steps when using the escrow service:</h3>
                <div className="bg-xsm-gray rounded-lg p-6">
                  <ol className="space-y-3 text-white">
                    <li className="flex">
                      <span className="font-bold text-xsm-yellow mr-3">1.</span>
                      <span>The buyer pays a {escrowFeePercent}% (${minEscrowFee} minimum) service fee.</span>
                    </li>
                    <li className="flex">
                      <span className="font-bold text-xsm-yellow mr-3">2.</span>
                      <span>The seller designates the escrow agent as manager.</span>
                    </li>
                    <li className="flex">
                      <span className="font-bold text-xsm-yellow mr-3">3.</span>
                      <span>After 7 days, the seller assigns primary ownership rights to the escrow agent (7 days is the minimum amount of time required in order to assign a new primary owner in the control panel.)</span>
                    </li>
                    <li className="flex">
                      <span className="font-bold text-xsm-yellow mr-3">4.</span>
                      <span>The escrow agent verifies everything, removes the other managers, and notifies the buyer to pay the seller.</span>
                    </li>
                    <li className="flex">
                      <span className="font-bold text-xsm-yellow mr-3">5.</span>
                      <span>The buyer pays the seller.</span>
                    </li>
                    <li className="flex">
                      <span className="font-bold text-xsm-yellow mr-3">6.</span>
                      <span>After the seller's confirmation, the escrow agent assigns ownership rights to the buyer.</span>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mb-8">
                <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
                  <p className="text-orange-300 text-sm">
                    In order to guarantee maximum security during the transaction, all messages must be sent through the website using the chat system where the transaction is completed, so that in case of any issues, the arbitration service can verify everything.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDeal}
                  disabled={selectedPaymentMethods.length === 0}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 'email-confirmation' && (
            <>
              {/* Deal Summary */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Deal Summary</h3>
                <div className="bg-xsm-gray rounded-lg p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white">Channel:</span>
                    <span className="text-xsm-yellow font-semibold">{channelTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Price:</span>
                    <span className="text-xsm-yellow font-semibold">${channelPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Escrow Fee ({escrowFeePercent}%):</span>
                    <span className="text-xsm-yellow font-semibold">${escrowFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">Transaction Type:</span>
                    <span className="text-xsm-yellow font-semibold capitalize">{selectedTransactionType} transaction</span>
                  </div>
                  <div>
                    <span className="text-white">Selected Payment Methods:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedPaymentMethods.map(methodId => {
                        const method = paymentMethods.find(p => p.id === methodId);
                        return (
                          <span key={methodId} className="bg-xsm-yellow text-black px-3 py-1 rounded-full text-sm font-medium">
                            {method?.icon} {method?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Input */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Email address associated with the account which should be designated as the owner
                </h3>
                <p className="text-gray-300 mb-4 text-sm">
                  On this website no emails or passwords are traded. The account will be transferred to the email address you provide below. This ensures secure account ownership transfer.
                </p>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full p-4 bg-xsm-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-xsm-yellow focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('payment-selection')}
                  className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleEmailConfirmation}
                  disabled={!buyerEmail.trim()}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 'terms-conditions' && (
            <>
              {/* Terms & Conditions */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Terms & Conditions Agreement</h3>
                <div className="bg-xsm-gray rounded-lg p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-4 text-white text-sm">
                    <div>
                      <h4 className="font-semibold text-xsm-yellow mb-2">1. Escrow Service Agreement</h4>
                      <p>By proceeding with this transaction, you agree to use our secure escrow service. All transactions must follow the established process for buyer and seller protection.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-xsm-yellow mb-2">2. Communication Policy</h4>
                      <p>⚠️ <strong>IMPORTANT:</strong> All communication regarding this transaction MUST occur through our platform's chat system. Communication outside the website and conducting deals without escrow agent is FORBIDDEN for your own safety. Any external communication may void transaction protection.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-xsm-yellow mb-2">3. Transaction Process</h4>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Buyer pays {escrowFeePercent}% escrow fee (${escrowFee.toFixed(2)})</li>
                        <li>Seller designates escrow agent as account manager</li>
                        <li>After 7 days, seller transfers primary ownership to escrow agent</li>
                        <li>Escrow agent verifies account and notifies buyer</li>
                        <li>Buyer pays seller through agreed payment method</li>
                        <li>After seller confirmation, account is transferred to buyer</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-xsm-yellow mb-2">4. Refund Policy</h4>
                      <p>7-day money-back guarantee applies if seller fails to deliver as described. Escrow fee is non-refundable unless transaction is cancelled by seller.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-xsm-yellow mb-2">5. Account Transfer</h4>
                      <p>The account will be transferred to the email address: <strong className="text-xsm-yellow">{buyerEmail}</strong>. Ensure this email is accessible and secure.</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-xsm-yellow mb-2">6. Dispute Resolution</h4>
                      <p>Any disputes will be resolved through our arbitration service. All chat communications will be reviewed for fair resolution.</p>
                    </div>
                    
                    <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 mt-6">
                      <p className="text-orange-300 font-medium">
                        🔒 <strong>Security Notice:</strong> Never share your account credentials outside our platform. Our escrow service handles all transfers securely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="mb-8">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 text-xsm-yellow bg-xsm-gray border-gray-600 rounded focus:ring-xsm-yellow focus:ring-2"
                  />
                  <span className="text-white text-sm">
                    I have read and agree to the terms and conditions above. I understand that all communication must happen through the platform chat for transaction security.
                  </span>
                </label>
              </div>

              {/* Transaction Summary */}
              <div className="mb-8">
                <div className="bg-xsm-black/50 rounded-lg p-4">
                  <h4 className="text-xsm-yellow font-semibold mb-3">Transaction Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Channel:</span>
                      <p className="text-white font-medium">{channelTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Price:</span>
                      <p className="text-white font-medium">${channelPrice}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Escrow Fee:</span>
                      <p className="text-white font-medium">${escrowFee.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Transfer Email:</span>
                      <p className="text-white font-medium break-all">{buyerEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep('email-confirmation')}
                  className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={!agreedToTerms || isCreatingDeal}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
                >
                  {isCreatingDeal ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>I Agree - Create Deal</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealCreationModal;
