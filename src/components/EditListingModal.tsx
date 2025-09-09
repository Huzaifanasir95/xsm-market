import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, ChevronDown, Search, RefreshCw, Save, Loader2 } from 'lucide-react';
import { updateAd } from '../services/ads';
import { extractProfileData, detectPlatform, formatFollowerCount } from '../services/socialMedia';
import { uploadScreenshots } from '../services/uploadService';
import { useToast } from "@/components/ui/use-toast";

interface UserAd {
  id: number;
  title: string;
  platform: string;
  category: string;
  price: number;
  subscribers: number;
  monthlyIncome: number;
  isMonetized: boolean;
  status: 'active' | 'pending' | 'sold' | 'suspended' | 'rejected';
  views: number;
  createdAt: string;
  updatedAt: string;
  channelUrl: string;
  description: string;
  contentType?: string;
  contentCategory?: string;
  incomeDetails: string;
  promotionDetails: string;
  thumbnail?: string;
  screenshots?: any[];
  tags?: string[];
  seller?: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}

interface EditListingModalProps {
  ad: UserAd;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedAd: UserAd) => void;
}

const EditListingModal: React.FC<EditListingModalProps> = ({ ad, isOpen, onClose, onUpdate }) => {
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
    contentCategory: '',
    subscribers: '',
    monthlyIncome: '',
    thumbnail: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const contentTypeDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize form with ad data
  useEffect(() => {
    if (ad && isOpen) {
      setFormData({
        title: ad.title || '',
        channelUrl: ad.channelUrl || '',
        platform: ad.platform || '',
        price: ad.price?.toString() || '',
        category: ad.category || '',
        contentType: ad.contentType || '',
        description: ad.description || '',
        incomeDetails: ad.incomeDetails || '',
        promotionDetails: ad.promotionDetails || '',
        isMonetized: ad.isMonetized || false,
        contentCategory: ad.contentCategory || '',
        subscribers: ad.subscribers?.toString() || '',
        monthlyIncome: ad.monthlyIncome?.toString() || '',
        thumbnail: ad.thumbnail || '',
      });

      // Set existing image previews if screenshots exist
      if (ad.screenshots && ad.screenshots.length > 0) {
        const previews = ad.screenshots.map((screenshot: any) => 
          typeof screenshot === 'string' ? screenshot : screenshot.data || screenshot.url
        ).filter(Boolean);
        setImagePreviews(previews);
      }
    }
  }, [ad, isOpen]);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== fileArray.length) {
      toast({
        variant: "destructive",
        title: "Invalid files",
        description: "Only image files are allowed.",
      });
    }

    setFiles(imageFiles);
    const previews = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
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
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExtractProfile = async () => {
    if (!formData.channelUrl.trim()) {
      toast({
        variant: "destructive",
        title: "URL Required",
        description: "Please enter a social media URL first.",
      });
      return;
    }

    setIsExtracting(true);
    setExtractedData(null);

    try {
      const platform = detectPlatform(formData.channelUrl);
      
      if (!platform) {
        throw new Error('Unsupported platform. Please use Instagram, YouTube, TikTok, Twitter, or Facebook URLs.');
      }

      const data = await extractProfileData(formData.channelUrl);
      
      if (data) {
        setExtractedData(data);
        
        // Auto-fill form with extracted data
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          platform: platform,
          subscribers: data.followers?.toString() || data.subscribers?.toString() || prev.subscribers,
          thumbnail: data.profilePicture || prev.thumbnail,
        }));

        toast({
          title: "Profile Extracted! ✨",
          description: `Successfully extracted data from ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        });
      }
    } catch (error: any) {
      console.error('Profile extraction failed:', error);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: error.message || "Failed to extract profile data. Please fill manually.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.channelUrl.trim() || !formData.platform || !formData.category || !formData.price) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields (title, URL, platform, category, price).",
      });
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Price",
        description: "Price must be greater than 0.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new screenshots if any
      let screenshotData: any[] = [];
      let primaryImageData = null;
      
      if (files.length > 0) {
        try {
          console.log('📤 Uploading new screenshots...');
          const uploadResult = await uploadScreenshots(files);
          screenshotData = uploadResult.screenshots || [];
          if (screenshotData.length > 0) {
            primaryImageData = screenshotData[0].data;
          }
          console.log('✅ Screenshots uploaded successfully:', screenshotData);
        } catch (uploadError: any) {
          console.error('❌ Error uploading screenshots:', uploadError);
          toast({
            variant: "destructive",
            title: "Upload Warning",
            description: `Failed to upload new screenshots: ${uploadError.message}. Updating listing without new screenshots.`,
          });
          screenshotData = [];
        }
      }

      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        channelUrl: formData.channelUrl.trim(),
        platform: formData.platform,
        category: formData.category,
        contentType: formData.contentType && formData.contentType.trim() !== '' ? formData.contentType : null,
        contentCategory: formData.contentCategory && formData.contentCategory.trim() !== '' ? formData.contentCategory : null,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        subscribers: formData.subscribers ? parseInt(formData.subscribers) : 0,
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : 0,
        isMonetized: Boolean(formData.isMonetized),
        incomeDetails: formData.incomeDetails.trim(),
        promotionDetails: formData.promotionDetails.trim(),
        thumbnail: formData.thumbnail || '',
        ...(screenshotData.length > 0 && {
          screenshots: screenshotData,
          primary_image: primaryImageData,
        }),
      };

      console.log('Updating ad with data:', updateData);

      const result = await updateAd(ad.id, updateData);
      console.log('Ad update result:', result);
      
      toast({
        title: "Listing Updated Successfully! 🎉",
        description: "Your listing has been updated and is live on the marketplace.",
      });

      // Call the onUpdate callback with the updated ad data
      if (result.ad) {
        onUpdate(result.ad);
      }
      
      onClose();
      
    } catch (error: any) {
      console.error('❌ Error updating ad:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update listing. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-xsm-dark-gray rounded-lg border border-xsm-yellow/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-xsm-medium-gray/20">
          <h2 className="text-2xl font-bold text-xsm-yellow">Edit Listing</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-white font-medium mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="xsm-input w-full"
              placeholder="Enter listing title"
              required
            />
          </div>

          {/* URL Input with Auto-Extract */}
          <div>
            <label className="block text-white font-medium mb-2">
              Social Media URL <span className="text-red-400">*</span>
              <span className="text-sm text-xsm-light-gray ml-2">(Instagram, YouTube, TikTok, Twitter, Facebook)</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                name="channelUrl"
                value={formData.channelUrl}
                onChange={handleInputChange}
                className="xsm-input flex-1"
                placeholder="Paste your social media URL here"
                required
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

          {/* Platform */}
          <div>
            <label className="block text-white font-medium mb-2">
              Platform <span className="text-red-400">*</span>
            </label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              className="xsm-input w-full"
              required
            >
              <option value="">Select Platform</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="relative" ref={categoryDropdownRef}>
            <label className="block text-white font-medium mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <div 
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="xsm-input w-full flex items-center justify-between cursor-pointer"
            >
              <span className={`${formData.category ? 'text-white' : 'text-xsm-medium-gray'}`}>
                {formData.category || "-- Select category --"}
              </span>
              <ChevronDown className="w-5 h-5 text-xsm-medium-gray" />
            </div>
            
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

          {/* Content Type Dropdown */}
          <div className="relative" ref={contentTypeDropdownRef}>
            <label className="block text-white font-medium mb-2">Content Type</label>
            <div 
              onClick={() => setShowContentTypeDropdown(!showContentTypeDropdown)}
              className="xsm-input w-full flex items-center justify-between cursor-pointer"
            >
              <span className={`${formData.contentType ? 'text-white' : 'text-xsm-medium-gray'}`}>
                {formData.contentType || "-- Select content type --"}
              </span>
              <ChevronDown className="w-5 h-5 text-xsm-medium-gray" />
            </div>
            
            {showContentTypeDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-xsm-black rounded-md shadow-lg border border-xsm-medium-gray overflow-hidden">
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
            )}
          </div>

          {/* Price and Subscribers Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Price ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="xsm-input w-full"
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Subscribers/Followers</label>
              <input
                type="number"
                name="subscribers"
                value={formData.subscribers}
                onChange={handleInputChange}
                className="xsm-input w-full"
                placeholder="Enter subscriber count"
                min="0"
              />
            </div>
          </div>

          {/* Monthly Income and Monetization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">Monthly Income ($)</label>
              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleInputChange}
                className="xsm-input w-full"
                placeholder="Enter monthly income"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-white font-medium mb-2">Monetization Status</label>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  name="isMonetized"
                  checked={formData.isMonetized}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-xsm-yellow bg-xsm-dark-gray border-xsm-medium-gray rounded focus:ring-xsm-yellow focus:ring-2"
                />
                <span className="text-white">This channel is monetized</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="xsm-input w-full min-h-[120px] resize-y"
              placeholder="Describe your channel, content type, audience, and what makes it valuable..."
              rows={4}
            />
          </div>

          {/* Income Details */}
          <div>
            <label className="block text-white font-medium mb-2">Income Details</label>
            <textarea
              name="incomeDetails"
              value={formData.incomeDetails}
              onChange={handleInputChange}
              className="xsm-input w-full min-h-[80px] resize-y"
              placeholder="Detail your revenue sources (AdSense, sponsorships, affiliate marketing, etc.)"
              rows={3}
            />
          </div>

          {/* Promotion Details */}
          <div>
            <label className="block text-white font-medium mb-2">Promotion Details</label>
            <textarea
              name="promotionDetails"
              value={formData.promotionDetails}
              onChange={handleInputChange}
              className="xsm-input w-full min-h-[80px] resize-y"
              placeholder="How do you promote your content? (social media, SEO, collaborations, etc.)"
              rows={3}
            />
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="block text-white font-medium mb-2">Screenshots (Optional)</label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver 
                  ? 'border-xsm-yellow bg-xsm-yellow/10' 
                  : 'border-xsm-medium-gray/50 hover:border-xsm-medium-gray'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-xsm-medium-gray mx-auto mb-3" />
              <p className="text-xsm-medium-gray mb-2">
                Drag and drop images here, or click to select
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="bg-xsm-yellow text-black px-4 py-2 rounded-lg font-medium cursor-pointer hover:bg-yellow-400 transition-colors inline-block"
              >
                Choose Files
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-white mb-3">Preview:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-xsm-medium-gray/30"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-xsm-medium-gray/20">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`xsm-button flex items-center gap-2 flex-1 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Listing
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="xsm-button-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListingModal;
