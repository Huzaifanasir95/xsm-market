import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface LoginProps {
  setCurrentPage: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login logic
    console.log('Login attempt with:', { email, password });
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
              />
            </div>

            <div>
              <Button type="submit" className="w-full bg-xsm-yellow hover:bg-yellow-500 text-black">
                Sign in
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-xsm-light-gray">
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentPage('signup')}
              className="font-medium text-xsm-yellow hover:text-yellow-500"
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
