import React, { useState } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, AlertCircle, Eye, MessageCircle, Flag, Ban, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Listing {
  id: string;
  title: string;
  seller: string;
  price: string;
  category: string;
  status: 'active' | 'pending' | 'rejected' | 'reported';
  createdAt: string;
  reportCount: number;
  thumbnail: string;
}

const ReviewListings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data - replace with actual API call later
  const listings: Listing[] = [
    {
      id: '1',
      title: 'Gaming PC Setup',
      seller: 'John Doe',
      price: '$1,200',
      category: 'Electronics',
      status: 'pending',
      createdAt: '2025-06-29',
      reportCount: 0,
      thumbnail: '/images/placeholder.svg'
    },
    {
      id: '2',
      title: 'Vintage Watch Collection',
      seller: 'Jane Smith',
      price: '$850',
      category: 'Collectibles',
      status: 'reported',
      createdAt: '2025-06-28',
      reportCount: 3,
      thumbnail: '/images/placeholder.svg'
    },
    {
      id: '3',
      title: 'Mountain Bike',
      seller: 'Mike Johnson',
      price: '$450',
      category: 'Sports',
      status: 'active',
      createdAt: '2025-06-27',
      reportCount: 0,
      thumbnail: '/images/placeholder.svg'
    },
    {
      id: '4',
      title: 'Designer Handbag',
      seller: 'Sarah Wilson',
      price: '$380',
      category: 'Fashion',
      status: 'rejected',
      createdAt: '2025-06-26',
      reportCount: 1,
      thumbnail: '/images/placeholder.svg'
    }
  ];

  const categories = ['Electronics', 'Collectibles', 'Sports', 'Fashion', 'Home', 'Other'];

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'reported':
        return <Flag className="w-5 h-5 text-yellow-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-400/10 text-green-400 border-green-400/20';
      case 'rejected':
        return 'bg-red-400/10 text-red-400 border-red-400/20';
      case 'reported':
        return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
      default:
        return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
    }
  };

  return (
    <div className="p-6 bg-xsm-black min-h-screen">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-xsm-dark-gray border border-xsm-medium-gray rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-xsm-yellow text-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-xsm-medium-gray" />
          </div>
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-xsm-dark-gray border border-xsm-medium-gray rounded-lg px-4 py-2 focus:outline-none focus:border-xsm-yellow text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="reported">Reported</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-xsm-dark-gray border border-xsm-medium-gray rounded-lg px-4 py-2 focus:outline-none focus:border-xsm-yellow text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-xsm-dark-gray rounded-xl border border-xsm-medium-gray overflow-hidden">
              {/* Listing Image */}
              <div className="aspect-video relative bg-xsm-medium-gray">
                <img
                  src={listing.thumbnail}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {listing.reportCount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {listing.reportCount} reports
                  </div>
                )}
              </div>

              {/* Listing Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-white mb-1">{listing.title}</h3>
                    <p className="text-sm text-xsm-light-gray">by {listing.seller}</p>
                  </div>
                  <span className="text-xsm-yellow font-medium">{listing.price}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-xsm-light-gray">{listing.category}</span>
                  <span className="text-sm text-xsm-light-gray">{listing.createdAt}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getStatusBadgeClass(listing.status)}`}>
                    {getStatusIcon(listing.status)}
                    <span className="ml-2 capitalize">{listing.status}</span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 hover:bg-xsm-medium-gray rounded-lg transition-colors">
                      <MoreVertical className="h-5 w-5 text-xsm-light-gray" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-xsm-dark-gray border-xsm-medium-gray">
                      <DropdownMenuItem className="text-white hover:text-xsm-yellow cursor-pointer">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:text-xsm-yellow cursor-pointer">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:text-xsm-yellow cursor-pointer">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:text-xsm-yellow cursor-pointer">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Seller
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-white hover:text-xsm-yellow cursor-pointer">
                        <Ban className="w-4 h-4 mr-2" />
                        Block Listing
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500 hover:text-red-400 cursor-pointer">
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Listing
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewListings;
