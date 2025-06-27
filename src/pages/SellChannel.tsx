
import React, { useState } from 'react';
import { Upload, Check, ChevronDown } from 'lucide-react';

const SellChannel: React.FC = () => {
  const [formData, setFormData] = useState({
    channelUrl: '',
    price: '',
    category: '',
    description: '',
    income: '',
    expense: '',
    incomeDetails: '',
    expenseDetails: '',
    promotionDetails: '',
    supportDetails: '',
  });

  const [showLinkDisplay, setShowLinkDisplay] = useState(false);
  const [allowComments, setAllowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      setFiles(Array.from(selectedFiles));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Listing created successfully! It will be reviewed by our admin team.');
    
    // Reset form
    setFormData({
      channelUrl: '',
      price: '',
      category: '',
      description: '',
      income: '',
      expense: '',
      incomeDetails: '',
      expenseDetails: '',
      promotionDetails: '',
      supportDetails: '',
    });
    setFiles([]);
    setAllowComments(false);
    setShowLinkDisplay(false);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="xsm-card">
          <h1 className="text-3xl font-bold mb-8">CREATE NEW LISTING</h1>

          <div className="space-y-6">
            {/* URL Input with Display Link Button */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  name="channelUrl"
                  value={formData.channelUrl}
                  onChange={handleInputChange}
                  className="xsm-input w-full"
                  placeholder="Paste link to the account/channel/group/page for sale"
                />
              </div>
              <button 
                onClick={() => setShowLinkDisplay(!showLinkDisplay)}
                className={`px-5 py-2 rounded flex items-center justify-center ${showLinkDisplay ? 'bg-xsm-yellow text-black' : 'bg-xsm-dark-gray text-white border border-xsm-medium-gray'}`}
              >
                {showLinkDisplay && <Check className="w-4 h-4 mr-2" />}
                Display link
              </button>
            </div>

            {/* Category Dropdown */}
            <div>
              <div className="xsm-input w-full flex items-center justify-between">
                <span className="text-xsm-medium-gray">-- Select topic --</span>
                <ChevronDown className="w-5 h-5 text-xsm-medium-gray" />
              </div>
            </div>

            {/* Price Input with Allow Comments Button */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="xsm-input w-full"
                  placeholder="Enter price ($)"
                />
              </div>
              <button
                onClick={() => setAllowComments(!allowComments)}
                className={`px-5 py-2 rounded flex items-center justify-center ${allowComments ? 'bg-xsm-yellow text-black' : 'bg-xsm-dark-gray text-white border border-xsm-medium-gray'}`}
              >
                {allowComments && <Check className="w-4 h-4 mr-2" />}
                Allow comments
              </button>
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
              <div className="mb-6">
                <div className="xsm-input w-full flex items-center justify-between">
                  <span className="text-xsm-medium-gray">-- Specify the primary content published --</span>
                  <ChevronDown className="w-5 h-5 text-xsm-medium-gray" />
                </div>
              </div>

              {/* Income & Expense */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  className="xsm-input"
                  placeholder="Income ($/month)"
                />
                <input
                  type="text"
                  name="expense"
                  value={formData.expense}
                  onChange={handleInputChange}
                  className="xsm-input"
                  placeholder="Expense ($/month)"
                />
              </div>

              {/* Income & Expense Details */}
              <div className="mb-6">
                <textarea
                  name="incomeDetails"
                  value={formData.incomeDetails}
                  onChange={handleInputChange}
                  className="xsm-input w-full resize-none mb-4"
                  rows={4}
                  placeholder="Provide details about income sources"
                />
                
                <textarea
                  name="expenseDetails"
                  value={formData.expenseDetails}
                  onChange={handleInputChange}
                  className="xsm-input w-full resize-none"
                  rows={4}
                  placeholder="Provide details about expenses"
                />
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <textarea
                  name="promotionDetails"
                  value={formData.promotionDetails}
                  onChange={handleInputChange}
                  className="xsm-input w-full resize-none"
                  rows={4}
                  placeholder="Tell us how you promoted your account"
                />
                
                <textarea
                  name="supportDetails"
                  value={formData.supportDetails}
                  onChange={handleInputChange}
                  className="xsm-input w-full resize-none"
                  rows={4}
                  placeholder="What is needed to support your account?"
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
            <div className="mt-8">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`bg-xsm-yellow text-black px-6 py-3 rounded-md font-medium hover:bg-yellow-400 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
