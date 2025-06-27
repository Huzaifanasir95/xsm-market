import React, { useState, useEffect } from 'react';
import ChannelCard from '../components/ChannelCard';
import ChannelModal from '../components/ChannelModal';
import { TrendingUp, Zap, Shield, Search, Check, ChevronDown, ChevronUp, Sliders, X } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useToast } from "@/components/ui/use-toast";

interface ChannelData {
  id: string;
  name: string;
  category: string;
  subscribers: number;
  price: number;
  monthlyIncome?: number;
  description: string;
  verified: boolean;
  premium: boolean;
  rating: number;
  views: number;
  thumbnail: string;
  seller: {
    name: string;
    rating: number;
    sales: number;
  };
}

interface HomeProps {
  setCurrentPage?: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<ChannelData[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('YouTube');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [subscriberRange, setSubscriberRange] = useState({ min: '', max: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [incomeRange, setIncomeRange] = useState({ min: '', max: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Add scroll event listener to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Category and type options
  const categories = [
    'Gaming', 'Music', 'Tech', 'Lifestyle', 'Education', 'Entertainment',
    'Sports', 'News', 'Comedy', 'Cooking', 'Travel', 'Fashion', 'Fitness'
  ];
  
  const channelTypes = ['Non Monitied', 'Premium', 'Monetized', 'New'];

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    const mockChannels: ChannelData[] = [
      {
        id: '1',
        name: 'TechReview Pro',
        category: 'Tech',
        subscribers: 150000,
        price: 15000,
        monthlyIncome: 2500,
        description: 'Established tech review channel with consistent upload schedule and high engagement rates. Monetized with multiple revenue streams including sponsorships.',
        verified: true,
        premium: true,
        rating: 4.8,
        views: 5200000,
        thumbnail: 'https://placehold.co/600x400/333/yellow?text=TechReview',
        seller: { name: 'TechSeller99', rating: 4.9, sales: 12 }
      },
      {
        id: '2',
        name: 'Gaming World HD',
        category: 'Gaming',
        subscribers: 89000,
        price: 8500,
        monthlyIncome: 1200,
        description: 'Popular gaming channel focusing on indie games and reviews. Strong community engagement and growing subscriber base.',
        verified: false,
        premium: false,
        rating: 4.5,
        views: 2800000,
        thumbnail: 'https://placehold.co/600x400/333/yellow?text=Gaming',
        seller: { name: 'GamerPro', rating: 4.7, sales: 8 }
      },
      {
        id: '3',
        name: 'Fitness Journey',
        category: 'Fitness',
        subscribers: 234000,
        price: 22000,
        monthlyIncome: 3200,
        description: 'Well-established fitness channel with workout routines, nutrition tips, and lifestyle content. Multiple income streams.',
        verified: true,
        premium: true,
        rating: 4.9,
        views: 8100000,
        thumbnail: 'https://placehold.co/600x400/333/yellow?text=Fitness',
        seller: { name: 'FitnessPro2024', rating: 5.0, sales: 15 }
      },
      {
        id: '4',
        name: 'Cooking Simple',
        category: 'Cooking',
        subscribers: 67000,
        price: 5500,
        monthlyIncome: 800,
        description: 'Easy cooking recipes and kitchen tips. Great for beginners looking to start in the cooking niche.',
        verified: false,
        premium: false,
        rating: 4.3,
        views: 1200000,
        thumbnail: 'https://placehold.co/600x400/333/yellow?text=Cooking',
        seller: { name: 'ChefMaster', rating: 4.6, sales: 5 }
      },
      {
        id: '5',
        name: 'Travel Adventures',
        category: 'Travel',
        subscribers: 412000,
        price: 35000,
        monthlyIncome: 4500,
        description: 'Premium travel channel with high-quality content from around the world. Excellent monetization and brand partnerships.',
        verified: true,
        premium: true,
        rating: 4.8,
        views: 12300000,
        thumbnail: 'https://placehold.co/600x400/333/yellow?text=Travel',
        seller: { name: 'Wanderlust_Official', rating: 4.9, sales: 20 }
      },
      {
        id: '6',
        name: 'Music Beats Studio',
        category: 'Music',
        subscribers: 125000,
        price: 12000,
        monthlyIncome: 1800,
        description: 'Music production and beat-making tutorials. Popular among aspiring producers and musicians.',
        verified: true,
        premium: false,
        rating: 4.6,
        views: 3400000,
        thumbnail: 'https://placehold.co/600x400/333/yellow?text=Music',
        seller: { name: 'BeatMaker_Pro', rating: 4.8, sales: 10 }
      },
      {
        id: '7',
        name: 'Education Plus',
        category: 'Education',
        subscribers: 95000,
        price: 9000,
        monthlyIncome: 1100,
        description: 'Educational content covering a wide range of academic subjects. Popular with students and lifelong learners.',
        verified: true,
        premium: false,
        rating: 4.4,
        views: 2100000,
        thumbnail: 'https://placehold.co/600x400/333/yellow?text=Education',
        seller: { name: 'LearnFast', rating: 4.5, sales: 7 }
      },
      {
        id: '8',
        name: 'Comedy Central',
        category: 'Comedy',
        subscribers: 320000,
        price: 28000,
        monthlyIncome: 3800,
        description: 'Hilarious sketches and stand-up comedy clips. High engagement rates and loyal fan base.',
        verified: true,
        premium: true,
        rating: 4.7,
        views: 9500000,
        thumbnail: 'https://placehold.co/600x400/333/yellow?text=Comedy',
        seller: { name: 'FunnyGuy', rating: 4.8, sales: 14 }
      }
    ];
    
    setChannels(mockChannels);
    setFilteredChannels(mockChannels);
  }, []);

  interface FilterOptions {
    categories: string[];
    subscriberRange: { min: string; max: string };
    priceRange: { min: string; max: string };
    incomeRange: { min: string; max: string };
    types: string[];
  }

  // Toggle a category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // Toggle a type filter selection
  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('All Platforms');
    setMonetizationEnabled(false);
    setSubscriberRange({ min: '', max: '' });
    setPriceRange({ min: '', max: '' });
    setIncomeRange({ min: '', max: '' });
    setSelectedCategories([]);
    setSelectedTypes([]);
    
    // Make sure search is visible and advanced filters are hidden after clearing
    setShowSearchBar(true);
    setShowAdvancedFilters(false);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    const sorted = [...filteredChannels];

    switch (newSortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'subscribers':
        sorted.sort((a, b) => b.subscribers - a.subscribers);
        break;
      case 'income':
        sorted.sort((a, b) => (b.monthlyIncome || 0) - (a.monthlyIncome || 0));
        break;
      default:
        // newest - keep original order
        break;
    }

    setFilteredChannels(sorted);
  };

  const handleShowMore = (channel: ChannelData) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to view channel details",
        className: "bg-amber-500 text-white",
      });
      
      if (setCurrentPage) {
        setCurrentPage('login');
      }
      return;
    }
    
    setSelectedChannel(channel);
    setIsModalOpen(true);
  };

  // Apply filters when any filter criteria changes
  useEffect(() => {
    let filtered = [...channels];

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(channel => 
        channel.name.toLowerCase().includes(query) ||
        channel.category.toLowerCase().includes(query) ||
        channel.description.toLowerCase().includes(query)
      );
    }

    // Apply platform filter (in a real app)
    if (selectedPlatform && selectedPlatform !== 'All Platforms') {
      // This would filter by platform in a real application
      // For now, we're not filtering since all our mock data is YouTube
    }

    // Apply category filters
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(channel => 
        selectedCategories.includes(channel.category)
      );
    }

    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(channel => {
        return selectedTypes.some(type => {
          if (type === 'Non Monitied') return channel.verified;
          if (type === 'Premium') return channel.premium;
          if (type === 'Monetized') return channel.monthlyIncome && channel.monthlyIncome > 0;
          if (type === 'New') return true; // Would filter for new channels in a real app
          return false;
        });
      });
    }

    // Apply monetization filter
    if (monetizationEnabled) {
      filtered = filtered.filter(channel => channel.monthlyIncome && channel.monthlyIncome > 0);
    }

    // Subscriber range filter
    if (subscriberRange.min || subscriberRange.max) {
      filtered = filtered.filter(channel => {
        const min = subscriberRange.min ? parseInt(subscriberRange.min) : 0;
        const max = subscriberRange.max ? parseInt(subscriberRange.max) : Infinity;
        return channel.subscribers >= min && channel.subscribers <= max;
      });
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(channel => {
        const min = priceRange.min ? parseInt(priceRange.min) : 0;
        const max = priceRange.max ? parseInt(priceRange.max) : Infinity;
        return channel.price >= min && channel.price <= max;
      });
    }

    // Income range filter
    if (incomeRange.min || incomeRange.max) {
      filtered = filtered.filter(channel => {
        if (!channel.monthlyIncome) return false;
        const min = incomeRange.min ? parseInt(incomeRange.min) : 0;
        const max = incomeRange.max ? parseInt(incomeRange.max) : Infinity;
        return channel.monthlyIncome >= min && channel.monthlyIncome <= max;
      });
    }

    setFilteredChannels(filtered);
  }, [
    searchQuery, 
    selectedPlatform, 
    monetizationEnabled, 
    subscriberRange, 
    priceRange, 
    incomeRange,
    selectedCategories,
    selectedTypes,
    channels
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray">
      {/* Search & Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-10">
        <div className="bg-xsm-dark-gray rounded-lg p-6 mb-8 shadow-lg border border-xsm-medium-gray/30 relative overflow-hidden">
          {/* Fade gradient effect for search section */}
          <div className="absolute inset-0 bg-gradient-radial from-xsm-yellow/10 via-xsm-dark-gray/80 to-xsm-dark-gray pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <button 
                  className={`xsm-button-secondary h-10 px-3 flex items-center ${showSearchBar ? 'bg-xsm-yellow/10' : ''}`}
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  title="Toggle Search"
                >
                  <Search className="w-5 h-5 mr-2" />
                  <span>Search</span>
                  {showSearchBar ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                </button>
                
                {showSearchBar && (
                  <button 
                    className={`xsm-button-secondary h-10 px-3 flex items-center ${showAdvancedFilters ? 'bg-xsm-yellow/10' : ''}`}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    title="Advanced Filters"
                  >
                    <Sliders className="w-5 h-5 mr-2" />
                    <span>Filters</span>
                    {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                  </button>
                )}
              </div>
              {showSearchBar && (
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-xsm-light-gray hover:text-xsm-yellow transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
            
            {showSearchBar && (
              <div className="grid md:grid-cols-4 gap-4 items-end">
                {/* Main search */}
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">Search by name, category or description</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search channels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="xsm-input w-full"
                    />
                  </div>
                </div>
                
                {/* Platform dropdown */}
                <div>
                  <label className="block text-white font-medium mb-2">Platform</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                      className="xsm-input w-full flex items-center justify-between"
                    >
                      <span>{selectedPlatform}</span>
                      <ChevronDown className="w-4 h-4 text-xsm-light-gray" />
                    </button>
                    
                    {showPlatformDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-xsm-black rounded-md shadow-lg border border-xsm-medium-gray">
                        <div className="py-1">
                          {['All Platforms', 'YouTube', 'TikTok', 'Twitter', 'Instagram', 'Facebook', 'Telegram'].map(platform => (
                            <button
                              key={platform}
                              onClick={() => {
                                setSelectedPlatform(platform);
                                setShowPlatformDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-xsm-medium-gray/20 flex items-center justify-between"
                            >
                              <span className={platform === selectedPlatform ? "text-xsm-yellow" : "text-white"}>
                                {platform}
                              </span>
                              {platform === selectedPlatform && (
                                <Check className="w-4 h-4 text-xsm-yellow" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Space for layout balance */}
                <div></div>
              </div>
            )}
            
            {/* Basic Range Filters - shown when either search bar or advanced filters are visible */}
            {(showSearchBar || showAdvancedFilters) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xsm-light-gray text-sm mb-1">Subscribers</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="xsm-input" 
                      value={subscriberRange.min}
                      onChange={(e) => setSubscriberRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="xsm-input" 
                      value={subscriberRange.max}
                      onChange={(e) => setSubscriberRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xsm-light-gray text-sm mb-1">Price ($)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="xsm-input" 
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="xsm-input" 
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Advanced filters */}
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t border-xsm-medium-gray/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Categories */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">Categories</h3>
                      {selectedCategories.length > 0 && (
                        <button 
                          onClick={() => setSelectedCategories([])}
                          className="text-xs text-xsm-light-gray hover:text-xsm-yellow transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                            selectedCategories.includes(category)
                              ? 'bg-xsm-yellow border-xsm-yellow'
                              : 'border-xsm-light-gray'
                          }`}>
                            {selectedCategories.includes(category) && (
                              <Check className="w-3 h-3 text-xsm-black" />
                            )}
                          </div>
                          <span className="text-white text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Channel Types */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">Channel Type</h3>
                      {selectedTypes.length > 0 && (
                        <button 
                          onClick={() => setSelectedTypes([])}
                          className="text-xs text-xsm-light-gray hover:text-xsm-yellow transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {channelTypes.map((type) => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type)}
                            onChange={() => toggleType(type)}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                            selectedTypes.includes(type)
                              ? 'bg-xsm-yellow border-xsm-yellow'
                              : 'border-xsm-light-gray'
                          }`}>
                            {selectedTypes.includes(type) && (
                              <Check className="w-3 h-3 text-xsm-black" />
                            )}
                          </div>
                          <span className="text-white text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="w-full">
          {/* Sort and Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Available Channels</h2>
              <p className="text-xsm-light-gray">
                {filteredChannels.length} channels found
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-white font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="xsm-input py-2 px-3"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="subscribers">Most Subscribers</option>
                <option value="income">Highest Income</option>
              </select>
            </div>
          </div>

          {/* Channel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChannels.map(channel => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onShowMore={handleShowMore}
              />
            ))}
          </div>

          {filteredChannels.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No channels found</h3>
              <p className="text-xsm-light-gray">
                Try adjusting your filters to see more results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Channel Detail Modal */}
      <ChannelModal
        channel={selectedChannel}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      {/* Fixed back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 left-8 bg-xsm-yellow text-black rounded-full p-3 shadow-lg hover:bg-yellow-500 transition-colors z-50 animate-fade-in"
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-r from-xsm-black via-xsm-dark-gray to-xsm-black py-16 mt-20 border-t border-xsm-medium-gray/30 relative">
        {/* Back to top button */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-xsm-yellow text-black rounded-full p-3 shadow-lg hover:bg-yellow-500 transition-colors"
          aria-label="Back to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/images/logo.png" 
              alt="XSM Market Logo" 
              className="h-16 md:h-24 object-contain"
            />
          </div>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">
            The premier marketplace for buying and selling YouTube channels. 
            Secure transactions, verified sellers, and premium opportunities.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center space-x-2 text-white">
              <Shield className="w-5 h-5 text-xsm-yellow" />
              <span>Secure Escrow</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <TrendingUp className="w-5 h-5 text-xsm-yellow" />
              <span>Verified Growth</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Zap className="w-5 h-5 text-xsm-yellow" />
              <span>Instant Transfers</span>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-xsm-light-gray">
            <a href="#" className="hover:text-xsm-yellow transition-colors">About Us</a>
            <a href="#" className="hover:text-xsm-yellow transition-colors">Contact</a>
            <a href="#" className="hover:text-xsm-yellow transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-xsm-yellow transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-xsm-yellow transition-colors">FAQ</a>
          </div>
          <p className="mt-8 text-sm text-xsm-medium-gray">
            © {new Date().getFullYear()} XSM Market. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
