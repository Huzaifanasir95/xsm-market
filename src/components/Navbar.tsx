import React, { useState, useEffect } from 'react';
import { Menu, X, User, ShoppingCart, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { logout } from '@/services/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const getNavItems = () => {
    const items = [];
    
    if (isLoggedIn) {
      items.push(
        { id: 'sell', label: 'Begin Selling', icon: PlusCircle },
        
      );
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-gradient-to-r from-xsm-black via-xsm-dark-gray to-xsm-black border-b border-xsm-medium-gray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Begin Selling Button */}
          <div className="flex items-center">
            {isLoggedIn && navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'text-xsm-yellow bg-xsm-medium-gray'
                    : 'text-white hover:text-xsm-yellow'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          
          {/* Center Logo with highlight effect */}
          <div 
            className="flex-shrink-0 cursor-pointer absolute left-1/2 transform -translate-x-1/2 z-10"
            onClick={() => setCurrentPage('home')}
          >
            {/* Logo highlight background */}
            <div className="absolute -inset-2 bg-gradient-radial from-xsm-medium-gray/30 to-transparent rounded-full blur-md"></div>
            <img 
              src="/images/logo.png" 
              alt="XSM Market Logo" 
              className="h-8 object-contain relative z-10"
            />
          </div>

          {/* Desktop Navigation on right */}
          <div className="hidden md:flex items-center space-x-8">

            {/* Profile Dropdown or Login Button */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-9 h-9 rounded-full bg-xsm-medium-gray text-white hover:bg-xsm-yellow hover:text-xsm-black transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-xsm-dark-gray border-xsm-medium-gray">
                  <DropdownMenuItem onClick={() => setCurrentPage('profile')} className="text-white hover:text-xsm-yellow cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-white hover:text-xsm-yellow cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => setCurrentPage('login')}
                className="bg-xsm-yellow hover:bg-yellow-500 text-black px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-xsm-yellow p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu spacing */}
        <div className="md:hidden pb-4"></div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-xsm-dark-gray border-t border-xsm-medium-gray">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isLoggedIn ? (
              <>
                {/* In mobile view, we'll still show the selling button in the dropdown menu */}
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      currentPage === item.id
                        ? 'text-xsm-yellow bg-xsm-medium-gray'
                        : 'text-white hover:text-xsm-yellow hover:bg-xsm-medium-gray'
                    }`}
                  >
                    {item.icon && <item.icon className="w-5 h-5" />}
                    <span>{item.label}</span>
                  </button>
                ))}
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-white hover:text-xsm-yellow hover:bg-xsm-medium-gray"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setCurrentPage('login');
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium bg-xsm-yellow hover:bg-yellow-500 text-black"
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
