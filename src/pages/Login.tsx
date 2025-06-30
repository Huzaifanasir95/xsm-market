import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/useAuth';
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { login, googleSignIn } from '@/services/auth';
import { useToast } from "@/components/ui/use-toast";
import { GoogleLogin } from '@react-oauth/google';

interface LoginProps {
  setCurrentPage: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { setIsLoggedIn, setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('🚀 Starting login process...');

    try {
      const response = await login(email, password);
      console.log('📡 Login response:', response);
      
      if (response.user) {
        console.log('✅ Login successful, setting auth state...');
        setIsLoggedIn(true);
        setUser(response.user);
        toast({
          title: "Success!",
          description: "You have successfully logged in.",
        });
        console.log('🏠 Redirecting to home page...');
        setCurrentPage('home');
      } else {
        throw new Error('Login succeeded but user data is missing');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      
      // Check if it's a Google OAuth account error
      if (errorMessage.includes('Google OAuth')) {
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Account Created with Google",
          description: "This account was created with Google OAuth. Please use 'Sign in with Google' instead.",
        });
      }
      // Check if it's an email verification error
      else if (errorMessage.includes('verify your email')) {
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
        setCurrentPage('home');
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

  const handleGoogleError = () => {
    console.error('Google Sign-In Error: Authentication failed or was cancelled');
    setError('Google sign-in was cancelled or failed');
    toast({
      variant: "destructive",
      title: "Error",
      description: 'Google sign-in was cancelled or failed',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-xsm-black py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 bg-xsm-dark-gray border-xsm-medium-gray">
        <CardHeader>
          <h2 className="text-center text-3xl font-bold tracking-tight text-xsm-yellow">
            Sign in to your account
          </h2>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
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
                className="mt-1"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setCurrentPage('forgot-password')}
                className="text-sm text-xsm-light-gray hover:text-xsm-yellow transition-colors"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full bg-xsm-yellow hover:bg-yellow-500 text-black"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>

            {/* Show verify email button if there's a verification error */}
            {error && error.includes('verify your email') && (
              <div>
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  onClick={() => setCurrentPage('email-verify')}
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
                onError={handleGoogleError}
                useOneTap={false}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="100%"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-xsm-light-gray">
            Don't have an account?{' '}
            <button
              onClick={() => {
                console.log('Signup button clicked, navigating to signup page');
                setCurrentPage('signup');
              }}
              className="font-medium text-xsm-yellow hover:text-yellow-500"
              disabled={isLoading}
            >
              Sign up
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
