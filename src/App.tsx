import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthProvider';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MessageCircle } from 'lucide-react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useTokenManager } from '@/hooks/useTokenManager';
import { useAuth } from '@/context/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
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
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';

// Inner component that has access to AuthContext
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const { isLoggedIn, user } = useAuth();
  
  // Initialize token manager for session handling
  useTokenManager();
  
  // Add effect to log page changes
  React.useEffect(() => {
    console.log('Current page changed to:', currentPage);
  }, [currentPage]);

  const renderPage = () => {
    console.log('🎯 Rendering page:', currentPage);
    
    switch (currentPage) {
      case 'home':
        // Wrap Home component with error boundary for debugging
        return (
          <ErrorBoundary>
            <Home setCurrentPage={setCurrentPage} />
          </ErrorBoundary>
        );
      case 'sell':
        return <SellChannel setCurrentPage={setCurrentPage} />;
      case 'chat':
        return <Chat />;
      case 'profile':
        return <Profile setCurrentPage={setCurrentPage} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact setCurrentPage={setCurrentPage} />;
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
      case 'admin-dashboard':
        return <AdminDashboard setCurrentPage={setCurrentPage} />;
      default:
        return <div className="text-white p-8">Default Home</div>;
    }
  };

  return (
    <div className="min-h-screen bg-xsm-black">
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="animate-fade-in">
          {renderPage()}
        </main>
          
        {/* Floating Chat Button */}
        <button
          onClick={() => setCurrentPage('chat')}
          className="fixed bg-xsm-yellow hover:bg-yellow-500 text-black p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-[9999] flex items-center justify-center relative"
          style={{ 
            bottom: '24px', 
            right: '24px',
            position: 'fixed'
          }}
          aria-label="Open Chat"
        >
          <MessageCircle className="w-6 h-6" />
          {/* Unread notification indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        </button>
      </ErrorBoundary>

      {/* Footer - Simplified design */}
      <footer className="bg-xsm-black border-t border-xsm-medium-gray/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo and Button Row */}
          <div className="flex justify-between items-center mb-3">
            {/* Logo with glow effect (left) */}
            <div className="group relative">
              {/* Logo highlight background with yellow fade in middle */}
              <div className="absolute -inset-4 bg-gradient-radial from-xsm-yellow/30 via-xsm-medium-gray/30 to-transparent rounded-full blur-lg opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:from-xsm-yellow/50"></div>
              {/* Extra glow effect on hover */}
              <div className="absolute -inset-2 bg-gradient-radial from-xsm-yellow/15 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
              <div className="absolute -inset-6 bg-gradient-radial from-xsm-yellow/5 via-transparent to-transparent rounded-full animate-pulse opacity-70"></div>
              <img 
                src="/images/logo.png" 
                alt="XSM Market Logo" 
                className="h-10 md:h-[48px] object-contain relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_4px_rgba(255,208,0,0.5)]"
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
          </div>
          
          {/* Copyright */}
          <p className="mt-3 text-center text-xs text-xsm-medium-gray">
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
