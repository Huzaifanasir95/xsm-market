import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface SignupProps {
  setCurrentPage: (page: string) => void;
}

const Signup: React.FC<SignupProps> = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual signup logic
    console.log('Signup attempt with:', { email, password, username });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-xsm-black py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 bg-xsm-dark-gray border-xsm-medium-gray">
        <CardHeader>
          <h2 className="text-center text-3xl font-bold tracking-tight text-xsm-yellow">
            Create your account
          </h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white">
                Username
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                placeholder="Choose a username"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                placeholder="Confirm your password"
              />
            </div>

            <div>
              <Button type="submit" className="w-full bg-xsm-yellow hover:bg-yellow-500 text-black">
                Sign up
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-xsm-light-gray">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentPage('login')}
              className="font-medium text-xsm-yellow hover:text-yellow-500"
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
