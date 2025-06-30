import React, { useState, useEffect, useRef } from 'react';
import { Upload, ChevronDown } from 'lucide-react';
import { createAd } from '../services/ads';

interface SellChannelProps {
  setCurrentPage?: (page: string) => void;
}

const SellChannel: React.FC<SellChannelProps> = ({ setCurrentPage }) => {
  const contentTypes = ["Unique content", "Rewritten", "Not unique content", "Mixed"];
  const contentCategories = [
    "Cars & Bikes", 
    "Luxury & Motivation", 
    "Pets & Animals", 
    "Games",
    "Movies & Music", 
    "Fashion & Style", 
    "Education & Q&A",
    "Food",
    "Nature & Travel", 
    "Fitness & Sports", 
    "Models & Celebs",
    "Reviews & How-To", 
    "YT Shorts & FB Reels",
    "Crypto & NFT"
  ];
  
  const [formData, setFormData] = useState({
    title: '',
    channelUrl: '',
    platform: '',
    price: '',
    category: '',
    contentType: '',
    description: '',
    incomeDetails: '',
    promotionDetails: '',
    isMonetized: false,
    contentCategory: '',
    subscribers: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const contentTypeDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles));
    }
  };

  const toggleMonetization = () => {
    setFormData(prev => ({
      ...prev,
      isMonetized: !prev.isMonetized
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Auto-detect platform from URL
      let platform = 'youtube'; // default
      if (formData.channelUrl.includes('facebook.com') || formData.channelUrl.includes('fb.com')) {
        platform = 'facebook';
      } else if (formData.channelUrl.includes('instagram.com')) {
        platform = 'instagram';
      } else if (formData.channelUrl.includes('twitter.com') || formData.channelUrl.includes('x.com')) {
        platform = 'twitter';
      } else if (formData.channelUrl.includes('tiktok.com')) {
        platform = 'tiktok';
      }

      // Prepare ad data with explicit null handling for ENUM fields
      const adData = {
        title: formData.title || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Channel`,
        channelUrl: formData.channelUrl,
        platform,
        category: formData.category,
        contentType: formData.contentType && formData.contentType.trim() !== '' ? formData.contentType : null,
        contentCategory: formData.contentCategory && formData.contentCategory.trim() !== '' ? formData.contentCategory : null,
        description: formData.description || '',
        price: parseFloat(formData.price) || 0,
        subscribers: formData.subscribers ? parseInt(formData.subscribers) : 0,
        isMonetized: Boolean(formData.isMonetized),
        incomeDetails: formData.incomeDetails || '',
        promotionDetails: formData.promotionDetails || '',
        screenshots: files.map(file => file.name), // This would need proper file upload handling
        tags: [] // Add empty tags array
      };

      console.log('Submitting ad data:', adData);

      const result = await createAd(adData);
      console.log('Ad creation result:', result);
      alert('🎉 Listing created successfully and is now live on the marketplace! Redirecting to homepage...');
      
      // Reset form
      setFormData({
        title: '',
        channelUrl: '',
        platform: '',
        price: '',
        category: '',
        contentType: '',
        description: '',
        incomeDetails: '',
        promotionDetails: '',
        isMonetized: false,
        contentCategory: '',
        subscribers: '',
      });
      setFiles([]);

      // Small delay before redirect to let user see the success message
      setTimeout(() => {
        // Redirect to homepage to see the new listing
        if (setCurrentPage) {
          setCurrentPage('home');
        }
      }, 1500);
    } catch (error: any) {
      alert(error.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentTypeDropdownRef.current && !contentTypeDropdownRef.current.contains(event.target as Node)) {
        setShowContentTypeDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="xsm-card">
          <h1 className="text-3xl font-bold mb-8">CREATE NEW LISTING</h1>

          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="xsm-input w-full"
                placeholder="Listing title (e.g., 'Premium Gaming YouTube Channel')"
              />
            </div>

            {/* URL Input */}
            <div>
              <input
                type="text"
                name="channelUrl"
                value={formData.channelUrl}
                onChange={handleInputChange}
                className="xsm-input w-full"
                placeholder="Paste link to the account/channel/group/page for sale"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <div 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="xsm-input w-full flex items-center justify-between cursor-pointer"
              >
                <span className={`${formData.category ? 'text-white' : 'text-xsm-medium-gray'}`}>
                  {formData.category || "-- Select topic --"}
                </span>
                <ChevronDown className="w-5 h-5 text-xsm-medium-gray" />
              </div>
              
              {/* Dropdown menu */}
              {showCategoryDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-xsm-black rounded-md shadow-lg border border-xsm-medium-gray overflow-hidden">
                  <div className="max-h-60 overflow-y-auto">
                    {contentCategories.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: cat }));
                          setShowCategoryDropdown(false);
                        }}
                        className={`px-4 py-3 cursor-pointer hover:bg-xsm-medium-gray/30 ${
                          formData.category === cat ? 'bg-blue-500 text-white' : 'text-white'
                        }`}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Input */}
            <div>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="xsm-input w-full"
                placeholder="Enter price ($)"
              />
            </div>

            {/* Subscribers Input */}
            <div>
              <input
                type="number"
                name="subscribers"
                value={formData.subscribers}
                onChange={handleInputChange}
                className="xsm-input w-full"
                placeholder="Number of subscribers/followers (optional)"
              />
            </div>

            {/* Monetization Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 text-white">Channel Status:</span>
                <div className="flex items-center space-x-6">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="monetizationStatus"
                      className="sr-only"
                      checked={!formData.isMonetized}
                      onChange={() => setFormData(prev => ({ ...prev, isMonetized: false }))}
                    />
                    <div className={`flex items-center ${!formData.isMonetized ? 'text-xsm-yellow' : 'text-white'}`}>
                      <div className={`w-4 h-4 mr-2 rounded-full border ${!formData.isMonetized ? 'bg-xsm-yellow border-xsm-yellow' : 'border-white'} flex items-center justify-center`}>
                        {!formData.isMonetized && <div className="w-2 h-2 bg-xsm-black rounded-full"></div>}
                      </div>
                      Non Monetized
                    </div>
                  </label>
                  
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="monetizationStatus"
                      className="sr-only"
                      checked={formData.isMonetized}
                      onChange={() => setFormData(prev => ({ ...prev, isMonetized: true }))}
                    />
                    <div className={`flex items-center ${formData.isMonetized ? 'text-xsm-yellow' : 'text-white'}`}>
                      <div className={`w-4 h-4 mr-2 rounded-full border ${formData.isMonetized ? 'bg-xsm-yellow border-xsm-yellow' : 'border-white'} flex items-center justify-center`}>
                        {formData.isMonetized && <div className="w-2 h-2 bg-xsm-black rounded-full"></div>}
                      </div>
                      Monetized
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="pt-6">
              <h2 className="text-xl font-medium mb-4">Optional fields</h2>
              
              {/* Description */}
              <div className="mb-6">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="xsm-input w-full resize-none"
                  rows={4}
                  placeholder="Listing description (posting contacts is prohibited)"
                />
              </div>

              {/* Content Type Dropdown */}
              <div className="mb-6 relative" ref={contentTypeDropdownRef}>
                <div 
                  onClick={() => setShowContentTypeDropdown(!showContentTypeDropdown)}
                  className="xsm-input w-full flex items-center justify-between cursor-pointer"
                >
                  <span className={`${formData.contentType ? 'text-white' : 'text-xsm-medium-gray'}`}>
                    {formData.contentType || "-- Specify the primary content published --"}
                  </span>
                  <ChevronDown className="w-5 h-5 text-xsm-medium-gray" />
                </div>
                
                {/* Dropdown menu */}
                {showContentTypeDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-xsm-black rounded-md shadow-lg border border-xsm-medium-gray overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      {contentTypes.map((type) => (
                        <div
                          key={type}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, contentType: type }));
                            setShowContentTypeDropdown(false);
                          }}
                          className={`px-4 py-3 cursor-pointer hover:bg-xsm-medium-gray/30 ${
                            formData.contentType === type ? 'bg-blue-500 text-white' : 'text-white'
                          }`}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Content Category Input */}
              <div className="mb-6">
                <input
                  type="text"
                  name="contentCategory"
                  value={formData.contentCategory}
                  onChange={handleInputChange}
                  className="xsm-input w-full"
                  placeholder="Content category (e.g., Tech Tutorials, Gaming Reviews)"
                />
              </div>

              {/* Ways of Earning & Promotion */}
              <div className="mb-6">
                <textarea
                  name="incomeDetails"
                  value={formData.incomeDetails}
                  onChange={handleInputChange}
                  className="xsm-input w-full resize-none mb-4"
                  rows={4}
                  placeholder="Ways of Earning"
                />
                
                <textarea
                  name="promotionDetails"
                  value={formData.promotionDetails}
                  onChange={handleInputChange}
                  className="xsm-input w-full resize-none"
                  rows={4}
                  placeholder="Ways of Promotion"
                />
              </div>

              {/* Screenshot Upload */}
              <div className="mt-6">
                <h3 className="text-base font-medium mb-2">Attach screenshots (proof of income, etc.):</h3>
                <div className="border border-dashed border-xsm-medium-gray rounded p-6 text-center">
                  <p className="text-xsm-medium-gray mb-2">Drop files here or click to upload</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <span className="text-xsm-yellow underline">Browse files</span>
                  </label>
                </div>
                {files.length > 0 && (
                  <div className="mt-4">
                    <p>{files.length} file(s) selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`bg-xsm-yellow text-black py-3 rounded-md font-medium hover:bg-yellow-400 transition-colors w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellChannel;
