import React, { useState } from 'react';
import { X, Mail, Check } from 'lucide-react';
import { verifyEmailChange } from '@/services/auth';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEmail: string) => void;
  newEmail: string;
  verificationToken: string;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  newEmail,
  verificationToken
}) => {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    try {
      setIsVerifying(true);
      setError('');
      
      const result = await verifyEmailChange(verificationToken, otp);
      
      onSuccess(result.newEmail);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-xsm-dark-gray rounded-lg border border-xsm-yellow/20 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-xsm-yellow">Verify Email Change</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="bg-blue-500/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-white mb-2">
            We've sent a verification code to:
          </p>
          <p className="text-xsm-yellow font-medium text-lg">
            {newEmail}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please check your email and enter the 6-digit code below.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setError('');
              }}
              className="xsm-input w-full text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p className="text-amber-400 text-sm">
              ⏰ This verification code expires in 15 minutes.
            </p>
          </div>

          {/* Development Mode Helper */}
          {import.meta.env.DEV && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-400 text-sm font-semibold mb-1">
                🚀 Development Mode
              </p>
              <p className="text-blue-300 text-xs">
                In development, emails are mocked. Check the browser console or backend logs (php-backend/logs/mock-emails.log) to see the verification code that would be sent to your email.
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={!otp || otp.length !== 6 || isVerifying}
            className="flex-1 px-4 py-2 bg-xsm-yellow text-xsm-black rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-xsm-black border-t-transparent"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Verify Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
