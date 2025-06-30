import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/useAuth';
import { login, register, googleSignIn } from '@/services/auth';
import { User, Mail, Lock, X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import OTPVerification from './OTPVerification';

interface AuthWidgetProps {
  onClose: () => void;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const AuthWidget: React.FC<AuthWidgetProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  
  const { toast } = useToast();
  const { setIsLoggedIn, setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);
      
      if (response.user) {
        setIsLoggedIn(true);
        setUser(response.user);
        toast({
          title: "Success!",
          description: "You have successfully logged in.",
        });
        onClose();
      } else {
        throw new Error('Login succeeded but user data is missing');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      
      // Check if it's an email verification error
      if (errorMessage.includes('verify your email')) {
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Email Verification Required",
          description: errorMessage + " Click the button below to verify your email.",
        });
        
        // Add a verification button to the error display
        setTimeout(() => {
          setError(errorMessage + " Click 'Verify Email' below to verify now.");
        }, 100);
      } else {
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup form submitted");
    setError('');

    // Form validation
    if (!username || !email || !password || !confirmPassword) {
      const errorMsg = "Username, email, password, and confirm password are required";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
      return;
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      const errorMsg = "Please enter a valid email address";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
      return;
    }
    
    // Username validation
    if (username.length < 3) {
      const errorMsg = "Username must be at least 3 characters long";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
      return;
    }

    if (password !== confirmPassword) {
      const errorMsg = "Passwords don't match";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
      return;
    }

    if (password.length < 6) {
      const errorMsg = "Password must be at least 6 characters long";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMsg,
      });
      return;
    }

    setIsLoading(true);
    console.log("Attempting to register user:", { username, email });

    try {
      console.log("Sending registration request to backend...");
      const response = await register(username, email, password, fullName);
      console.log("Registration response:", response);
      
      // Check if response indicates verification is required
      if (response && response.requiresVerification) {
        setRegistrationEmail(email);
        setShowOTPVerification(true);
        toast({
          title: "Registration Successful!",
          description: "Please check your email for verification code.",
        });
      } else if (response && response.user) {
        // Direct login
        setUser(response.user);
        setIsLoggedIn(true);
        toast({
          title: "Account Created!",
          description: `Welcome to XSM Market, ${response.user.username}!`,
        });
        onClose();
      } else {
        toast({
          title: "Success with Warning",
          description: "Account created but user data incomplete. Please try logging in.",
        });
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Registration failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      
      // Check for common registration errors
      if (errorMessage.includes('Email already registered')) {
        setError('This email is already registered. Please use a different email or try logging in.');
      } else if (errorMessage.includes('Username already taken')) {
        setError('This username is already taken. Please choose a different username.');
      } else if (errorMessage.includes('Network error')) {
        setError('Cannot connect to the server. Please check your connection.');
      } else {
        setError(errorMessage);
      }
      
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log('Google Sign-In Success:', credentialResponse);
    setIsLoading(true);
    setError('');
    
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }
      
      const response = await googleSignIn(credentialResponse.credential);
      
      if (response.user) {
        setIsLoggedIn(true);
        setUser(response.user);
        toast({
          title: "Success!",
          description: `Welcome ${response.user.username}! You have successfully signed in with Google.`,
        });
        onClose();
      } else {
        throw new Error('Google sign-in succeeded but user data is missing');
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to sign in with Google',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerificationSuccess = (token: string, user: any) => {
    setUser(user);
    setIsLoggedIn(true);
    toast({
      title: "Welcome to XSM Market!",
      description: "Your email has been verified successfully!",
    });
    onClose();
  };

  if (showOTPVerification) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-xsm-dark-gray rounded-lg p-6 max-w-md w-full mx-4">
          <OTPVerification
            email={registrationEmail}
            onVerificationSuccess={handleOTPVerificationSuccess}
            onBack={() => setShowOTPVerification(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-xsm-dark-gray border-xsm-medium-gray relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-xsm-yellow mb-6 text-center">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4" noValidate>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    disabled={isLoading}
                    className="bg-xsm-black"
                  />
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-white mb-1">
                    Full Name (Optional)
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    className="bg-xsm-black"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                className="bg-xsm-black"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Enter your password" : "Create a password"}
                disabled={isLoading}
                className="bg-xsm-black"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className="bg-xsm-black"
                />
              </div>
            )}

            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    // Handle forgot password navigation
                  }}
                  className="text-sm text-xsm-light-gray hover:text-xsm-yellow transition-colors"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-xsm-yellow hover:bg-yellow-500 text-black"
              disabled={isLoading}
            >
              {isLoading ? (
                isLogin ? 'Signing in...' : 'Creating account...'
              ) : (
                isLogin ? 'Sign in' : 'Sign up'
              )}
            </Button>

            {/* Show verify email button if there's a verification error */}
            {error && error.includes('verify your email') && (
              <div>
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  onClick={() => setShowOTPVerification(true)}
                  disabled={isLoading}
                >
                  Verify Email Now
                </Button>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-xsm-medium-gray" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-xsm-dark-gray px-2 text-xsm-light-gray">Or continue with</span>
              </div>
            </div>

            <div className="w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError('Google sign-in was cancelled or failed');
                  toast({
                    variant: "destructive",
                    title: "Error",
                    description: 'Google sign-in was cancelled or failed',
                  });
                }}
                useOneTap={false}
                theme="filled_black"
                size="large"
                text={isLogin ? "signin_with" : "signup_with"}
                shape="rectangular"
                width="100%"
              />
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-xsm-light-gray">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-xsm-yellow hover:text-yellow-500"
                disabled={isLoading}
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthWidget;
