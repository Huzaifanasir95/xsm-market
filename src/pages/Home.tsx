import React, { useState, useEffect } from 'react';
import ChannelCard from '../components/ChannelCard';
import ChannelModal from '../components/ChannelModal';
import { TrendingUp, Zap, Shield, Search, Check, ChevronDown, ChevronUp, Sliders, X } from 'lucide-react';

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

const Home: React.FC = () => {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<ChannelData[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('YouTube');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [subscriberRange, setSubscriberRange] = useState({ min: '', max: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [incomeRange, setIncomeRange] = useState({ min: '', max: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Category and type options
  const categories = [
    'Gaming', 'Music', 'Tech', 'Lifestyle', 'Education', 'Entertainment',
    'Sports', 'News', 'Comedy', 'Cooking', 'Travel', 'Fashion', 'Fitness'
  ];
  
  const channelTypes = ['Verified', 'Premium', 'Monetized', 'New'];

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
          if (type === 'Verified') return channel.verified;
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-xsm-black via-xsm-dark-gray to-xsm-black py-16">
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
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-10">
        <div className="bg-xsm-dark-gray rounded-lg p-6 mb-8 shadow-lg border border-xsm-medium-gray/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-xsm-yellow flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search Channels
            </h3>
            <button 
              onClick={clearAllFilters}
              className="text-sm text-xsm-light-gray hover:text-xsm-yellow transition-colors"
            >
              Clear All Filters
            </button>
          </div>
          
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
                  className="xsm-input w-full pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xsm-light-gray w-4 h-4" />
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
            
            {/* Monetization toggle & Advanced filters */}
            <div className="flex items-end space-x-3">
              <label className="flex items-center space-x-3 cursor-pointer flex-grow" onClick={() => setMonetizationEnabled(!monetizationEnabled)}>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${monetizationEnabled ? 'bg-xsm-yellow' : 'bg-xsm-medium-gray/50'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${monetizationEnabled ? 'translate-x-6' : ''}`}></div>
                </div>
                <span className="text-white font-medium">Monetized only</span>
              </label>
              
              <button 
                className={`xsm-button-secondary h-10 px-3 flex items-center ${showAdvancedFilters ? 'bg-xsm-yellow/10' : ''}`}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                title="Advanced Filters"
              >
                <Sliders className="w-5 h-5 mr-2" />
                <span>Filters</span>
                {showAdvancedFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </div>
          
          {/* Basic Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
            <div>
              <label className="block text-xsm-light-gray text-sm mb-1">Monthly Income ($)</label>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="number" 
                  placeholder="Min" 
                  className="xsm-input" 
                  value={incomeRange.min}
                  onChange={(e) => setIncomeRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <input 
                  type="number" 
                  placeholder="Max" 
                  className="xsm-input" 
                  value={incomeRange.max}
                  onChange={(e) => setIncomeRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
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
    </div>
  );
};

export default Home;
