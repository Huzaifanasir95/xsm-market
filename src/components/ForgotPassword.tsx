import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
  onClose: () => void;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onClose }) => {
  const [step, setStep] = useState<'email' | 'code' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { toast } = useToast();

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call to send reset code
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset code');
      }
      
      setSuccessMessage('Password reset code sent to your email!');
      setStep('code');
      toast({
        title: "Success!",
        description: "Password reset code sent to your email address.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset code';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!resetCode) {
      setError('Please enter the reset code');
      return;
    }
    
    if (resetCode.length !== 6) {
      setError('Reset code must be 6 digits');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call to verify reset code
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: resetCode }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid reset code');
      }
      
      setStep('newPassword');
      toast({
        title: "Success!",
        description: "Reset code verified! Please enter your new password.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid reset code';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call to reset password
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code: resetCode, 
          newPassword 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
      }
      
      toast({
        title: "Success!",
        description: "Your password has been reset successfully! You can now login with your new password.",
      });
      
      // Close the widget after successful password reset
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendResetCode} className="space-y-4">
      <div className="text-center mb-4">
        <Mail className="w-12 h-12 text-xsm-yellow mx-auto mb-3" />
        <p className="text-sm text-xsm-light-gray">
          Enter your email address and we'll send you a code to reset your password.
        </p>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
          Email address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isLoading}
          className="bg-xsm-black"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-xsm-yellow hover:bg-yellow-500 text-black"
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Reset Code'}
      </Button>
    </form>
  );

  const renderCodeStep = () => (
    <form onSubmit={handleVerifyCode} className="space-y-4">
      <div className="text-center mb-4">
        <Mail className="w-12 h-12 text-xsm-yellow mx-auto mb-3" />
        <p className="text-sm text-xsm-light-gray">
          We've sent a 6-digit code to <span className="text-white font-medium">{email}</span>
        </p>
        <p className="text-xs text-xsm-light-gray mt-1">
          Please check your email and enter the code below.
        </p>
      </div>
      
      <div>
        <label htmlFor="resetCode" className="block text-sm font-medium text-white mb-2">
          Reset Code
        </label>
        <Input
          id="resetCode"
          name="resetCode"
          type="text"
          required
          value={resetCode}
          onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit code"
          disabled={isLoading}
          className="bg-xsm-black text-center text-lg tracking-wider"
          maxLength={6}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-xsm-yellow hover:bg-yellow-500 text-black"
        disabled={isLoading || resetCode.length !== 6}
      >
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </Button>
      
      <div className="text-center">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-sm text-xsm-light-gray hover:text-xsm-yellow transition-colors"
          disabled={isLoading}
        >
          Resend code
        </button>
      </div>
    </form>
  );

  const renderNewPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="text-center mb-4">
        <Lock className="w-12 h-12 text-xsm-yellow mx-auto mb-3" />
        <p className="text-sm text-xsm-light-gray">
          Enter your new password below.
        </p>
      </div>
      
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
          New Password
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password (min 6 characters)"
          disabled={isLoading}
          className="bg-xsm-black"
        />
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
          Confirm New Password
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          disabled={isLoading}
          className="bg-xsm-black"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-xsm-yellow hover:bg-yellow-500 text-black"
        disabled={isLoading}
      >
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="mr-3 text-xsm-light-gray hover:text-white transition-colors"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-xsm-yellow">
          {step === 'email' ? 'Forgot Password' : 
           step === 'code' ? 'Enter Reset Code' : 
           'Set New Password'}
        </h2>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 border-green-500 bg-green-500/10">
          <AlertDescription className="text-green-400">{successMessage}</AlertDescription>
        </Alert>
      )}

      {step === 'email' && renderEmailStep()}
      {step === 'code' && renderCodeStep()}
      {step === 'newPassword' && renderNewPasswordStep()}
    </div>
  );
};

export default ForgotPassword;
