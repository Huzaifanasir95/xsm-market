import React, { useState, useEffect } from 'react';
import { isAuthenticated } from '../services/auth';
import { AuthContext, User } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [user, setUser] = useState<User | null>(null);

  // Check for authentication on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated());
    };

    window.addEventListener('storage', checkAuth);
    checkAuth();
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        isLoggedIn, 
        setIsLoggedIn, 
        user, 
        setUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
