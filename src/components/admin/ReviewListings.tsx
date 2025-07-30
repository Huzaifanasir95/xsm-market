import React, { useState } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, AlertCircle, Eye, MessageCircle, Flag, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllAds } from '@/services/ads';
import { adminDeleteAd } from '@/services/admin';
import { API_URL } from '@/services/auth';

// Helper function to get proper image URL
const getImageUrl = (thumbnail: string | null, screenshots: any[] = []) => {
  console.log('Processing image URL - thumbnail:', thumbnail, 'screenshots:', screenshots);
  
  // If we have a thumbnail, use it
  if (thumbnail && typeof thumbnail === 'string') {
    // If it's already a full URL, use as-is
    if (thumbnail.startsWith('http')) {
      console.log('Using full URL thumbnail:', thumbnail);
      return thumbnail;
    }
    // If it's a relative path, prefix with backend URL
    const baseUrl = API_URL.includes('/api') ? API_URL.replace('/api', '') : API_URL;
    const imageUrl = `${baseUrl}/${thumbnail.replace(/^\//, '')}`;
    console.log('Constructed thumbnail URL:', imageUrl);
    return imageUrl;
  }
  
  // If no thumbnail but we have screenshots, use the first one
  if (screenshots && Array.isArray(screenshots) && screenshots.length > 0) {
    const firstScreenshot = screenshots[0];
    // Make sure the first screenshot is a string
    if (typeof firstScreenshot === 'string') {
      if (firstScreenshot.startsWith('http')) {
        console.log('Using full URL screenshot:', firstScreenshot);
        return firstScreenshot;
      }
      const baseUrl = API_URL.includes('/api') ? API_URL.replace('/api', '') : API_URL;
      const imageUrl = `${baseUrl}/${firstScreenshot.replace(/^\//, '')}`;
      console.log('Constructed screenshot URL:', imageUrl);
      return imageUrl;
    } else {
      console.log('First screenshot is not a string:', typeof firstScreenshot, firstScreenshot);
    }
  }
  
  console.log('Using fallback placeholder');
  // Fallback to placeholder
  return '/placeholder.svg';
};

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  React.useEffect(() => {
    console.log('API_URL:', API_URL);
    setLoading(true);
    setError(null);
    getAllAds()
      .then((data) => {
        console.log('Raw ad data:', data.ads?.[0]); // Debug log
        // Map backend ads to Listing interface
        const mapped = (data.ads || []).map(ad => {
          console.log('Processing ad:', ad.id, 'thumbnail:', ad.thumbnail, 'screenshots:', ad.screenshots);
          return {
            id: ad.id,
            title: ad.title,
            seller: ad.seller?.username || 'Unknown',
            price: ad.price ? `$${ad.price}` : '',
            category: ad.category || 'Other',
            status: ad.status || 'active',
            createdAt: ad.createdAt ? ad.createdAt.split('T')[0] : '',
            reportCount: ad.reportCount || 0,
            thumbnail: getImageUrl(ad.thumbnail, ad.screenshots),
          };
        });
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

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedListing(null);
  };

  const handleContactSeller = async (listing: Listing) => {
    try {
      setContactLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await fetch(`${API_URL}/chat/ad-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adId: listing.id,
          message: `Hello ${listing.seller}, I am contacting you as an admin regarding your listing: ${listing.title}`
        })
      });

      const chat = await response.json();
      
      if (response.ok) {
        alert(`Chat created successfully with ${listing.seller}. You can now communicate about the listing "${listing.title}".`);
        // Optionally navigate to chat or show success message
      } else {
        alert(chat.message || 'Failed to create chat with seller');
      }
    } catch (error) {
      console.error('Error creating chat with seller:', error);
      alert('Failed to create chat with seller');
    } finally {
      setContactLoading(false);
    }
  };

  const handleDeleteListing = async (listing: Listing) => {
    if (!window.confirm(`Are you sure you want to delete the listing "${listing.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminDeleteAd(listing.id);
      
      // Refresh the listings
      const data = await getAllAds();
      const mapped = (data.ads || []).map(ad => {
        return {
          id: ad.id,
          title: ad.title,
          seller: ad.seller?.username || 'Unknown',
          price: ad.price ? `$${ad.price}` : '',
          category: ad.category || 'Other',
          status: ad.status || 'active',
          createdAt: ad.createdAt ? ad.createdAt.split('T')[0] : '',
          reportCount: ad.reportCount || 0,
          thumbnail: getImageUrl(ad.thumbnail, ad.screenshots),
        };
      });
      setListings(mapped);
      
      // Close modal if it's open for this listing
      if (selectedListing?.id === listing.id) {
        closeDetailsModal();
      }
      
      alert(`Listing "${listing.title}" has been successfully deleted.`);
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert(`Failed to delete listing: ${error.message}`);
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
                  onError={(e) => {
                    console.log('Image load failed for:', listing.thumbnail);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
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
                      <DropdownMenuItem 
                        className="text-white hover:text-xsm-yellow cursor-pointer"
                        onClick={() => handleViewDetails(listing)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-white hover:text-xsm-yellow cursor-pointer"
                        onClick={() => handleContactSeller(listing)}
                        disabled={contactLoading}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {contactLoading ? 'Connecting...' : 'Contact Seller'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-500 hover:text-red-400 cursor-pointer"
                        onClick={() => handleDeleteListing(listing)}
                      >
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

      {/* Details Modal */}
      {showDetailsModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-xsm-dark-gray rounded-xl border border-xsm-medium-gray max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-xsm-medium-gray">
              <h2 className="text-xl font-bold text-white">Listing Details</h2>
              <button
                onClick={closeDetailsModal}
                className="p-2 hover:bg-xsm-medium-gray rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-xsm-light-gray" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Listing Image */}
              <div className="aspect-video relative bg-xsm-medium-gray rounded-lg overflow-hidden">
                <img
                  src={selectedListing.thumbnail}
                  alt={selectedListing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('Modal image load failed for:', selectedListing.thumbnail);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                {selectedListing.reportCount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-sm px-3 py-2 rounded-full">
                    {selectedListing.reportCount} reports
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-xsm-light-gray">Title</label>
                    <p className="text-white text-lg">{selectedListing.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-xsm-light-gray">Seller</label>
                    <p className="text-white">{selectedListing.seller}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-xsm-light-gray">Category</label>
                    <p className="text-white">{selectedListing.category}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-xsm-light-gray">Price</label>
                    <p className="text-xsm-yellow text-lg font-semibold">{selectedListing.price}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-xsm-light-gray">Status</label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getStatusBadgeClass(selectedListing.status)} mt-1`}>
                      {getStatusIcon(selectedListing.status)}
                      <span className="ml-2 capitalize">{selectedListing.status}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-xsm-light-gray">Created Date</label>
                    <p className="text-white">{selectedListing.createdAt}</p>
                  </div>
                </div>
              </div>

              {/* Reports Section */}
              {selectedListing.reportCount > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flag className="w-5 h-5 text-red-400" />
                    <h3 className="font-medium text-red-400">Reports ({selectedListing.reportCount})</h3>
                  </div>
                  <p className="text-red-300 text-sm">This listing has been reported by users. Please review carefully.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-xsm-medium-gray">
                <button 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleContactSeller(selectedListing)}
                  disabled={contactLoading}
                >
                  <MessageCircle className="w-4 h-4" />
                  {contactLoading ? 'Connecting...' : 'Contact Seller'}
                </button>
                <button 
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  onClick={() => handleDeleteListing(selectedListing)}
                >
                  <Trash className="w-4 h-4" />
                  Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewListings;
