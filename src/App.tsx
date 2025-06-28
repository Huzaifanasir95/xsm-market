import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthProvider';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MessageCircle } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useTokenManager } from '@/hooks/useTokenManager';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SellChannel from './pages/SellChannel';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import EmailVerify from './pages/EmailVerify';
import ForgotPassword from './pages/ForgotPassword';

// Inner component that has access to AuthContext
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  
  // Initialize token manager for session handling
  useTokenManager();
  
  // Add effect to log page changes
  React.useEffect(() => {
    console.log('Current page changed to:', currentPage);
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'sell':
        return <SellChannel setCurrentPage={setCurrentPage} />;
      case 'chat':
        return <Chat />;
      case 'profile':
        return <Profile setCurrentPage={setCurrentPage} />;
      case 'about':
        return <About />;
      case 'terms':
        return <Terms />;
      case 'privacy':
        return <Privacy />;
      case 'login':
        return <Login setCurrentPage={setCurrentPage} />;
      case 'signup':
        return <Signup setCurrentPage={setCurrentPage} />;
      case 'verify':
        return <Verify setCurrentPage={setCurrentPage} />;
      case 'email-verify':
        return <EmailVerify setCurrentPage={setCurrentPage} />;
      case 'forgot-password':
        return <ForgotPassword setCurrentPage={setCurrentPage} />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-xsm-black">
      <Toaster />
      <Sonner />
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="animate-fade-in">
        {renderPage()}
      </main>
        
      {/* Floating Chat Button */}
      <button
        onClick={() => setCurrentPage('chat')}
        className="fixed bottom-6 right-6 bg-xsm-yellow hover:bg-yellow-500 text-black p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
        aria-label="Open Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Footer - Simplified design */}
      <footer className="bg-xsm-black border-t border-xsm-medium-gray/30 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo and Button Row */}
          <div className="flex justify-between items-center mb-4">
            {/* Logo (left) */}
            <div>
              <img 
                src="/images/logo.png" 
                alt="XSM Market Logo" 
                className="h-16 object-contain drop-shadow-[0_0_15px_rgba(255,208,0,0.6)]"
              />
            </div>
            
            {/* Begin Selling Button (right) */}
            <button
              onClick={() => setCurrentPage('sell')}
              className="bg-xsm-yellow text-black px-4 py-2 text-sm font-medium rounded hover:bg-yellow-500 transition-colors"
            >
              Begin Selling
            </button>
          </div>
          
          {/* Simple Navigation */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-xsm-light-gray">
            <button onClick={() => setCurrentPage('about')} className="hover:text-xsm-yellow transition-colors">About Us</button>
            <button onClick={() => setCurrentPage('contact')} className="hover:text-xsm-yellow transition-colors">Contact</button>
            <button onClick={() => setCurrentPage('terms')} className="hover:text-xsm-yellow transition-colors">Terms of Service</button>
            <button onClick={() => setCurrentPage('privacy')} className="hover:text-xsm-yellow transition-colors">Privacy Policy</button>
            <button onClick={() => setCurrentPage('about')} className="hover:text-xsm-yellow transition-colors">FAQ</button>
          </div>
          
          {/* Copyright */}
          <p className="mt-4 text-center text-xs text-xsm-medium-gray">
            © 2025 XSM Market. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  // Debug: Log the Google Client ID to console
  console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
  
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
