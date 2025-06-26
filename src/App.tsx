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
        return <SellChannel />;
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

      {/* Footer */}
      <footer className="bg-xsm-black border-t border-xsm-medium-gray py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-xsm-yellow mb-4">XSM Market</h3>
              <p className="text-xsm-light-gray text-sm">
                The premier marketplace for buying and selling YouTube channels. 
                Secure, trusted, and efficient.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentPage('home')}
                  className="block text-xsm-light-gray hover:text-xsm-yellow transition-colors text-sm"
                >
                  Browse Channels
                </button>
                <button
                  onClick={() => setCurrentPage('sell')}
                  className="block text-xsm-light-gray hover:text-xsm-yellow transition-colors text-sm"
                >
                  Sell Your Channel
                </button>
                <button
                  onClick={() => setCurrentPage('about')}
                  className="block text-xsm-light-gray hover:text-xsm-yellow transition-colors text-sm"
                >
                  How It Works
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="block text-xsm-light-gray hover:text-xsm-yellow transition-colors text-sm"
                >
                  Contact Us
                </button>
                <button
                  onClick={() => setCurrentPage('chat')}
                  className="block text-xsm-light-gray hover:text-xsm-yellow transition-colors text-sm"
                >
                  Live Chat
                </button>
                <a
                  href="#"
                  className="block text-xsm-light-gray hover:text-xsm-yellow transition-colors text-sm"
                >
                  Help Center
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentPage('terms')}
                  className="block text-xsm-light-gray hover:text-xsm-yellow transition-colors text-sm"
                >
                  Terms & Conditions
                </button>
                <button
                  onClick={() => setCurrentPage('privacy')}
                  className="block text-xsm-light-gray hover:text-xsm-yellow transition-colors text-sm"
                >
                  Privacy Policy
                </button>
                <a
                  href="#"
                  className="block text-xsm-light-gray hover:text-xsm-yellow transition-colors text-sm"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-xsm-medium-gray mt-8 pt-8 text-center">
            <p className="text-xsm-light-gray text-sm">
              © 2025 XSM Market. All rights reserved. | Secure YouTube Channel Trading Platform
            </p>
          </div>
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
