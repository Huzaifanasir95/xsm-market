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

    // Check if adding these files would exceed the limit
    const totalFiles = files.length + imageFiles.length;
    if (totalFiles > 5) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: `You can only upload up to 5 images. You currently have ${files.length} images.`,
      });
      return;
    }

    // Add to existing files instead of replacing
    const newFiles = [...files, ...imageFiles];
    setFiles(newFiles);
    
    // Create preview URLs for the new images and add to existing previews
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
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
      let thumbnailData: string = '';
      
      if (files.length > 0) {
        try {
          console.log('🔄 Attempting to upload screenshots...');
          const uploadResult = await uploadScreenshots(files);
          if (uploadResult.screenshots) {
            screenshotData = uploadResult.screenshots;
            
            // Always use the first screenshot as both primary image and thumbnail
            if (screenshotData.length > 0) {
              primaryImageData = screenshotData[0].data;
              thumbnailData = screenshotData[0].data; // First image becomes the thumbnail
            }
            
            console.log('✅ Screenshots uploaded successfully:', screenshotData);
            console.log('📸 Thumbnail set to first screenshot:', !!thumbnailData);
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
        isMonetized: formData.isMonetized ? 1 : 0, // Convert boolean to integer for MySQL
        incomeDetails: formData.incomeDetails || '',
        promotionDetails: formData.promotionDetails || '',
        // Use first screenshot as thumbnail, fallback to profile picture if no screenshots
        thumbnail: thumbnailData || formData.profilePicture || '',
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
                <h3 className="text-base font-medium mb-3 text-white">Screenshots (Optional)</h3>
                <p className="text-sm text-xsm-light-gray mb-4">
                  Add screenshots to showcase your channel (proof of income, analytics, etc.)
                </p>
                
                <div 
                  className={`border-2 border-dashed rounded-lg text-center transition-all duration-300 cursor-pointer ${
                    isDragOver 
                      ? 'border-xsm-yellow bg-xsm-yellow/10 scale-105' 
                      : files.length > 0 
                        ? 'border-xsm-yellow/50 bg-xsm-dark-gray' 
                        : 'border-xsm-medium-gray hover:border-xsm-yellow hover:bg-xsm-dark-gray/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {files.length === 0 ? (
                    // Show upload prompt when no files
                    <div className="p-8">
                      <Upload className={`mx-auto mb-3 transition-colors ${
                        isDragOver ? 'text-xsm-yellow animate-bounce' : 'text-xsm-medium-gray'
                      }`} size={32} />
                      
                      <p className={`mb-3 font-medium transition-colors ${
                        isDragOver ? 'text-xsm-yellow' : 'text-xsm-medium-gray'
                      }`}>
                        {isDragOver ? 'Drop your images here!' : 'Drag and drop images here, or click to select'}
                      </p>
                      
                      <div className="bg-xsm-yellow text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors inline-block">
                        Choose Files
                      </div>
                      
                      <p className="text-xs text-xsm-light-gray mt-3">
                        PNG, JPG, JPEG • Max 5 images • 10MB each
                      </p>
                    </div>
                  ) : (
                    // Show thumbnails inside the box when files are uploaded
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-xsm-yellow rounded-full"></div>
                          <p className="text-sm font-medium text-white">
                            {files.length} image{files.length !== 1 ? 's' : ''} ready to upload
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the file chooser
                            imagePreviews.forEach(url => URL.revokeObjectURL(url));
                            setFiles([]);
                            setImagePreviews([]);
                          }}
                          className="text-sm text-red-400 hover:text-red-300 underline transition-colors"
                          type="button"
                        >
                          Clear all
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            {/* Square Thumbnail Container */}
                            <div className="aspect-square rounded-lg overflow-hidden bg-xsm-dark-gray border border-xsm-medium-gray group-hover:border-xsm-yellow transition-all duration-300 group-hover:shadow-lg group-hover:shadow-xsm-yellow/20">
                              <img
                                src={preview}
                                alt={`Screenshot ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              
                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="text-center text-white">
                                  <div className="text-xs font-medium mb-1">
                                    {(files[index].size / 1024 / 1024).toFixed(1)} MB
                                  </div>
                                  <div className="text-xs text-gray-300 truncate max-w-20">
                                    {files[index].name}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Remove Button - Always visible on mobile, hover on desktop */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering the file chooser
                                removeImage(index);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all duration-200 opacity-100 sm:opacity-0 group-hover:opacity-100 hover:scale-110"
                              type="button"
                              title="Remove image"
                            >
                              <X size={12} />
                            </button>
                            
                            {/* Image Index Badge */}
                            <div className="absolute top-2 left-2 bg-xsm-yellow text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add more button */}
                      <div className="border-2 border-dashed border-xsm-medium-gray rounded-lg p-4 hover:border-xsm-yellow transition-colors">
                        <Upload className="mx-auto mb-2 text-xsm-medium-gray hover:text-xsm-yellow transition-colors" size={24} />
                        <p className="text-sm text-xsm-medium-gray hover:text-white transition-colors">
                          Click to add more images
                        </p>
                      </div>
                      
                      {/* Upload Tips */}
                      <div className="mt-4 p-3 bg-xsm-black/30 rounded-lg border border-xsm-medium-gray">
                        <p className="text-xs text-xsm-light-gray">
                          💡 <strong>Tips:</strong> Include analytics screenshots, income proof, or channel highlights to attract more buyers
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                </div>
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
