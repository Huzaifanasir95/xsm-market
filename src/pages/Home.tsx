import React, { useState, useEffect } from 'react';
import ChannelCard from '../components/ChannelCard';
import FilterSidebar from '../components/FilterSidebar';
import ChannelModal from '../components/ChannelModal';
import { TrendingUp, Zap, Shield } from 'lucide-react';

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
        thumbnail: '',
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
        thumbnail: '',
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
        thumbnail: '',
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
        thumbnail: '',
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
        thumbnail: '',
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
        thumbnail: '',
        seller: { name: 'BeatMaker_Pro', rating: 4.8, sales: 10 }
      }
    ];
    
    setChannels(mockChannels);
    setFilteredChannels(mockChannels);
  }, []);

  const handleFiltersChange = (filters: any) => {
    let filtered = [...channels];

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(channel => 
        filters.categories.includes(channel.category)
      );
    }

    // Subscriber range filter
    if (filters.subscriberRange.min || filters.subscriberRange.max) {
      filtered = filtered.filter(channel => {
        const min = filters.subscriberRange.min ? parseInt(filters.subscriberRange.min) : 0;
        const max = filters.subscriberRange.max ? parseInt(filters.subscriberRange.max) : Infinity;
        return channel.subscribers >= min && channel.subscribers <= max;
      });
    }

    // Price range filter
    if (filters.priceRange.min || filters.priceRange.max) {
      filtered = filtered.filter(channel => {
        const min = filters.priceRange.min ? parseInt(filters.priceRange.min) : 0;
        const max = filters.priceRange.max ? parseInt(filters.priceRange.max) : Infinity;
        return channel.price >= min && channel.price <= max;
      });
    }

    // Type filters
    if (filters.types.length > 0) {
      filtered = filtered.filter(channel => {
        return filters.types.some((type: string) => {
          if (type === 'Verified') return channel.verified;
          if (type === 'Premium') return channel.premium;
          if (type === 'Monetized') return channel.monthlyIncome && channel.monthlyIncome > 0;
          return false;
        });
      });
    }

    setFilteredChannels(filtered);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    let sorted = [...filteredChannels];

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-xsm-black via-xsm-dark-gray to-xsm-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-xsm-yellow mb-6">
            XSM Market
          </h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <FilterSidebar onFiltersChange={handleFiltersChange} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
