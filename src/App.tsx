
import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SellChannel from './pages/SellChannel';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'sell':
        return <SellChannel />;
      case 'chat':
        return <Chat />;
      case 'profile':
        return <Profile />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'terms':
        return <Terms />;
      case 'privacy':
        return <Privacy />;
      default:
        return <Home />;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-xsm-black">
        <Toaster />
        <Sonner />
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <main className="animate-fade-in">
          {renderPage()}
        </main>
        
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
    </TooltipProvider>
  );
};

export default App;
