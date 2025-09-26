import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ChevronDown, Search, RefreshCw, X } from 'lucide-react';
import { createAd } from '../services/ads';
import { extractProfileData, detectPlatform, formatFollowerCount } from '../services/socialMedia';
import { uploadScreenshots } from '../services/uploadService';
import { useAuth } from '@/context/useAuth';
import { useToast } from "@/components/ui/use-toast";

interface SellChannelProps {
  // No longer need setCurrentPage
}

const SellChannel: React.FC<SellChannelProps> = () => {
  const navigate = useNavigate();
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
    "Crypto & NFT",
    "Cartoon & Funny",
    "Religious & Spiritual"
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
    subscribers: '',
    profilePicture: '', // Add profile picture field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false); // Add extraction loading state
  const [extractedData, setExtractedData] = useState(null); // Store extracted data
  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
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
      const fileArray = Array.from(selectedFiles);
      processFiles(fileArray);
    }
  };

  const processFiles = (fileArray: File[]) => {
    // Filter for image files only
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== fileArray.length) {
      toast({
        variant: "destructive",
        title: "Invalid files",
        description: "Only image files are allowed.",
      });
    }

    setFiles(imageFiles);
    
    // Create preview URLs for the images
    const previews = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const removeImage = (index: number) => {
    // Clean up the URL object
    URL.revokeObjectURL(imagePreviews[index]);
    
    // Remove the file and preview
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Clean up preview URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const toggleMonetization = () => {
    setFormData(prev => ({
      ...prev,
      isMonetized: !prev.isMonetized
    }));
  };

  // Auto-extract profile data from URL
  const handleExtractProfile = async () => {
    if (!formData.channelUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Missing URL",
        description: "Please enter a social media URL first",
      });
      return;
    }

    setIsExtracting(true);
    try {
      const result = await extractProfileData(formData.channelUrl);
      const profileData = result.data;
      
      setExtractedData(profileData);
      
      // Auto-fill the form with extracted data
      setFormData(prev => ({
        ...prev,
        title: profileData.title || prev.title,
        platform: profileData.platform || detectPlatform(formData.channelUrl) || prev.platform,
        subscribers: profileData.followers || profileData.subscribers || prev.subscribers,
        profilePicture: profileData.profilePicture || prev.profilePicture
      }));

      toast({
        title: "Profile Data Extracted Successfully! ✅",
        description: `Title: ${profileData.title}\nPlatform: ${profileData.platform}\nFollowers: ${formatFollowerCount(profileData.followers || profileData.subscribers || 0)}`,
      });
      
    } catch (error) {
      console.error('Profile extraction error:', error);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: `Failed to extract profile data: ${error.message}. Please fill in the information manually.`,
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validation: Minimum price $5
      const price = parseFloat(formData.price);
      if (price < 5) {
        toast({
          variant: "destructive",
          title: "Invalid Price",
          description: "Minimum price should be $5",
        });
        setIsSubmitting(false);
        return;
      }

      // Validation: Minimum subscribers 100
      const subscribers = parseInt(formData.subscribers);
      if (subscribers < 100) {
        toast({
          variant: "destructive",
          title: "Invalid Subscribers",
          description: "Minimum subscribers should be 100",
        });
        setIsSubmitting(false);
        return;
      }

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

      // Upload screenshots if any files are selected
      let screenshotData: any[] = [];
      let primaryImageData: string = '';
      
      if (files.length > 0) {
        try {
          console.log('🔄 Attempting to upload screenshots...');
          const uploadResult = await uploadScreenshots(files);
          if (uploadResult.screenshots) {
            screenshotData = uploadResult.screenshots;
            // Set the first image as primary image
            if (screenshotData.length > 0) {
              primaryImageData = screenshotData[0].data;
            }
            console.log('✅ Screenshots uploaded successfully:', screenshotData);
          }
        } catch (uploadError) {
          console.error('❌ Error uploading screenshots:', uploadError);
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: `Failed to upload screenshots: ${uploadError.message}. Creating ad without screenshots.`,
          });
          // Continue without screenshots instead of failing
          screenshotData = [];
        }
      }

      // Prepare ad data with explicit null handling for ENUM fields
      const adData = {
        title: formData.title || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Channel`,
        channelUrl: formData.channelUrl,
        platform,
        category: formData.category,
        contentType: formData.contentType && formData.contentType.trim() !== '' ? formData.contentType : null,
        description: formData.description || '',
        price: parseFloat(formData.price) || 0,
        subscribers: formData.subscribers ? parseInt(formData.subscribers) : 0,
        isMonetized: Boolean(formData.isMonetized),
        incomeDetails: formData.incomeDetails || '',
        promotionDetails: formData.promotionDetails || '',
        thumbnail: formData.profilePicture || '', // Add the extracted profile picture as thumbnail
        primary_image: primaryImageData, // Store the first uploaded image as primary
        additional_images: screenshotData.slice(1), // Store remaining images as additional
        screenshots: screenshotData, // Keep for backward compatibility
        tags: [] // Add empty tags array
      };

      console.log('Submitting ad data:', adData);

      const result = await createAd(adData);
      console.log('Ad creation result:', result);
      
      toast({
        title: "Listing Created Successfully! 🎉",
        description: "Your listing is now live on the marketplace! Redirecting to your profile...",
      });
      
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
        subscribers: '',
        profilePicture: '',
      });
      
      // Clean up image previews
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setFiles([]);
      setImagePreviews([]);

      // Small delay before redirect to let user see the success message
      setTimeout(() => {
        // Redirect to profile page to see the new listing
        if (user?.username) {
          navigate(`/u/${user.username}`);
        } else {
          navigate('/profile'); // Fallback to redirect component
        }
        // Ensure we scroll to top of the profile page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Create Listing",
        description: error.message || 'Something went wrong. Please try again.',
      });
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

            {/* Profile Picture Preview */}
            {formData.profilePicture && (
              <div>
                <label className="block text-white font-medium mb-2">Profile Picture (Auto-extracted)</label>
                <div className="flex items-center gap-4">
                  <img 
                    src={formData.profilePicture} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="text-sm text-xsm-light-gray">
                    Profile picture automatically extracted from your social media URL
                  </div>
                </div>
              </div>
            )}

            {/* URL Input with Auto-Extract */}
            <div>
              <label className="block text-white font-medium mb-2">
                Social Media URL
                <span className="text-sm text-xsm-light-gray ml-2">(Instagram, YouTube, TikTok, Twitter, Facebook)</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="channelUrl"
                  value={formData.channelUrl}
                  onChange={handleInputChange}
                  className="xsm-input flex-1"
                  placeholder="Paste your Instagram, YouTube, TikTok, Twitter, or Facebook URL here"
                />
                <button
                  type="button"
                  onClick={handleExtractProfile}
                  disabled={isExtracting || !formData.channelUrl.trim()}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap ${
                    isExtracting || !formData.channelUrl.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-xsm-yellow text-black hover:bg-yellow-400'
                  }`}
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Auto-Fill
                    </>
                  )}
                </button>
              </div>
              {extractedData && (
                <div className="mt-3 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
                  <p className="text-green-400 text-sm">
                    ✅ Extracted: <strong>{extractedData.title}</strong> 
                    {(extractedData.followers || extractedData.subscribers) && (
                      <span> • {formatFollowerCount(extractedData.followers || extractedData.subscribers)} followers</span>
                    )}
                  </p>
                </div>
              )}
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
                <div 
                  className={`border border-dashed rounded p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-xsm-yellow bg-yellow-50' 
                      : 'border-xsm-medium-gray hover:border-xsm-yellow'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`mx-auto mb-2 ${isDragOver ? 'text-xsm-yellow' : 'text-xsm-medium-gray'}`} size={24} />
                  <p className={`mb-2 ${isDragOver ? 'text-xsm-yellow' : 'text-xsm-medium-gray'}`}>
                    {isDragOver ? 'Drop files here' : 'Drop files here or click to upload'}
                  </p>
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
                    <span className="text-xsm-yellow underline hover:text-yellow-600">Browse files</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">Max 5 images, 10MB each</p>
                </div>
                {files.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-medium text-gray-700">
                        {files.length} image{files.length !== 1 ? 's' : ''} selected
                      </p>
                      <button
                        onClick={() => {
                          imagePreviews.forEach(url => URL.revokeObjectURL(url));
                          setFiles([]);
                          setImagePreviews([]);
                        }}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                        type="button"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm"
                            />
                          </div>
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg"
                            type="button"
                            title="Remove image"
                          >
                            <X size={14} />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2 rounded-b-lg">
                            <div className="truncate">
                              {files[index].name}
                            </div>
                            <div className="text-gray-300">
                              {(files[index].size / 1024 / 1024).toFixed(1)} MB
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
