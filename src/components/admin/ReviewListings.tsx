import React, { useState } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, AlertCircle, Eye, MessageCircle, Flag, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllAds, deleteAd } from '@/services/ads';

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
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showModal, setShowModal] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    getAllAds()
      .then((data) => {
        // Map backend ads to Listing interface
        const mapped = (data.ads || []).map(ad => ({
          id: ad.id,
          title: ad.title,
          seller: ad.seller?.username || 'Unknown',
          price: ad.price ? `$${ad.price}` : '',
          category: ad.category || 'Other',
          status: ad.status || 'active',
          createdAt: ad.createdAt ? ad.createdAt.split('T')[0] : '',
          reportCount: ad.reportCount || 0,
          thumbnail: ad.thumbnail || '/images/placeholder.svg',
        }));
        setListings(mapped);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch listings');
        setLoading(false);
      });
  }, []);

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

  // Handle delete listing
  const handleDeleteListing = async (listingId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await deleteAd(listingId);
      setListings(prev => prev.filter(l => l.id !== listingId));
      setShowModal(false);
      alert('Listing deleted successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing');
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
        {loading ? (
          <div className="text-center text-xsm-light-gray py-8">Loading listings...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-8">{error}</div>
        ) : (
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
                      <DropdownMenuItem className="text-white hover:text-xsm-yellow cursor-pointer" onClick={() => { setSelectedListing(listing); setShowModal(true); }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500 hover:text-red-400 cursor-pointer" onClick={() => handleDeleteListing(listing.id)}>
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
        )}
      </div>

      {/* Listing Details Modal */}
      {showModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-xsm-dark-gray rounded-xl p-8 max-w-lg w-full relative">
            <button className="absolute top-4 right-4 text-xsm-yellow hover:text-white" onClick={() => setShowModal(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-4">
              <img src={selectedListing.thumbnail} alt={selectedListing.title} className="w-full h-48 object-cover rounded-lg" />
            </div>
            <h2 className="text-2xl font-bold text-xsm-yellow mb-2">{selectedListing.title}</h2>
            <div className="mb-2 text-white"><span className="font-semibold">Seller:</span> {selectedListing.seller}</div>
            <div className="mb-2 text-white"><span className="font-semibold">Price:</span> {selectedListing.price}</div>
            <div className="mb-2 text-white"><span className="font-semibold">Category:</span> {selectedListing.category}</div>
            <div className="mb-2 text-white"><span className="font-semibold">Status:</span> {selectedListing.status}</div>
            <div className="mb-2 text-white"><span className="font-semibold">Created At:</span> {selectedListing.createdAt}</div>
            <div className="mb-2 text-white"><span className="font-semibold">Report Count:</span> {selectedListing.reportCount}</div>
            <button className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold" onClick={() => handleDeleteListing(selectedListing.id)}>
              Delete Listing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewListings;
