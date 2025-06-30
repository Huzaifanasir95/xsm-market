import React, { useState } from 'react';
import { Menu, X, User, PlusCircle, LogOut, Settings, Heart, Star } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { logout } from '@/services/auth';
import AuthWidget from './AuthWidget';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthWidget, setShowAuthWidget] = useState(false);
  const { isLoggedIn, setIsLoggedIn, user } = useAuth();

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const getNavItems = () => {
    const items = [];
    
    // Always add the 'Begin Selling' button regardless of login status
    items.push(
      { id: 'sell', label: 'Begin Selling', icon: PlusCircle }
    );

    // Add Admin Dashboard button for logged in users
    if (isLoggedIn) {
      items.push(
        { id: 'admin-dashboard', label: 'Admin Dashboard', icon: Settings }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <>
      {showAuthWidget && (
        <AuthWidget onClose={() => setShowAuthWidget(false)} />
      )}
      <nav className="bg-gradient-to-r from-xsm-black via-xsm-dark-gray to-xsm-black border-b border-xsm-medium-gray sticky top-0 z-50 relative">
        {/* Middle fade effect */}
        <div className="absolute inset-0 bg-gradient-radial from-xsm-yellow/10 via-transparent to-transparent opacity-80" style={{left: '50%', transform: 'translateX(-50%)', width: '50%'}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-[60px] md:h-[72px]">
            {/* Left Side - Begin Selling Button */}
            <div className="flex items-center">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isLoggedIn) {
                      setCurrentPage(item.id);
                    } else {
                      setShowAuthWidget(true);
                    }
                  }}
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
            
            {/* Center Logo with enhanced highlight effect */}
            <div 
              className="flex-shrink-0 cursor-pointer absolute left-1/2 transform -translate-x-1/2 z-10 group"
              onClick={() => setCurrentPage('home')}
            >
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

            {/* Desktop Navigation on right */}
            <div className="hidden md:flex items-center space-x-8">

              {/* Profile Dropdown or Login Button */}
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2">
                      <span className="text-xsm-light-gray mr-1">Hi, <span className="text-xsm-yellow">{user?.username || 'User'}</span></span>
                      <Avatar className="w-9 h-9 border-2 border-xsm-medium-gray hover:border-xsm-yellow transition-colors">
                        {user?.profilePicture ? (
                          <AvatarImage src={user.profilePicture} alt={user?.username || 'User'} />
                        ) : null}
                        <AvatarFallback className="bg-xsm-medium-gray text-white hover:bg-xsm-yellow hover:text-xsm-black transition-colors">
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
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
                  onClick={() => setShowAuthWidget(true)}
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

          {/* Mobile menu spacing - ensure we have enough room for the larger logo */}
          <div className="md:hidden pb-4 pt-2"></div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-xsm-dark-gray border-t border-xsm-medium-gray">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {isLoggedIn ? (
                <>
                  {/* User greeting for mobile view */}
                  <div className="flex items-center px-3 py-2 space-x-2">
                    <Avatar className="w-8 h-8 border-2 border-xsm-medium-gray">
                      {user?.profilePicture ? (
                        <AvatarImage src={user.profilePicture} alt={user?.username || 'User'} />
                      ) : null}
                      <AvatarFallback className="bg-xsm-medium-gray text-white">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white">Hi, <span className="text-xsm-yellow font-medium">{user?.username || 'User'}</span></span>
                  </div>
                  {/* Show nav items in mobile menu */}
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isLoggedIn) {
                          setCurrentPage(item.id);
                        } else {
                          setShowAuthWidget(true);
                        }
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
                <>
                  {/* Show nav items for non-logged in users */}
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setShowAuthWidget(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium text-white hover:text-xsm-yellow hover:bg-xsm-medium-gray"
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span>{item.label}</span>
                    </button>
                  ))}
                  
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
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
