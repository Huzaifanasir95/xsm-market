
import React, { useState } from 'react';
import { Upload, DollarSign, Users, Eye, Info } from 'lucide-react';

const SellChannel: React.FC = () => {
  const [formData, setFormData] = useState({
    channelName: '',
    category: '',
    subscribers: '',
    totalViews: '',
    price: '',
    monthlyIncome: '',
    description: '',
    verified: false,
    monetized: false,
    niche: '',
    uploadFrequency: '',
    averageViews: '',
    contactEmail: '',
  });

  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Gaming', 'Music', 'Tech', 'Lifestyle', 'Education', 'Entertainment',
    'Sports', 'News', 'Comedy', 'Cooking', 'Travel', 'Fashion', 'Fitness',
    'Beauty', 'DIY', 'Business', 'Kids', 'Pets', 'Science', 'Art'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you would upload these to a server
      const newScreenshots = Array.from(files).map(file => URL.createObjectURL(file));
      setScreenshots(prev => [...prev, ...newScreenshots]);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Channel listing submitted successfully! It will be reviewed by our admin team within 24 hours.');
    
    // Reset form
    setFormData({
      channelName: '',
      category: '',
      subscribers: '',
      totalViews: '',
      price: '',
      monthlyIncome: '',
      description: '',
      verified: false,
      monetized: false,
      niche: '',
      uploadFrequency: '',
      averageViews: '',
      contactEmail: '',
    });
    setScreenshots([]);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-xsm-yellow mb-4">Sell Your YouTube Channel</h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            List your YouTube channel for sale on XSM Market. Our secure platform ensures safe transactions for both buyers and sellers.
          </p>
        </div>

        <div className="xsm-card">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Channel Name *
                </label>
                <input
                  type="text"
                  name="channelName"
                  value={formData.channelName}
                  onChange={handleInputChange}
                  className="xsm-input w-full"
                  placeholder="Enter your channel name"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="xsm-input w-full"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    <Users className="inline w-4 h-4 mr-1" />
                    Subscribers *
                  </label>
                  <input
                    type="number"
                    name="subscribers"
                    value={formData.subscribers}
                    onChange={handleInputChange}
                    className="xsm-input w-full"
                    placeholder="50000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    <Eye className="inline w-4 h-4 mr-1" />
                    Total Views *
                  </label>
                  <input
                    type="number"
                    name="totalViews"
                    value={formData.totalViews}
                    onChange={handleInputChange}
                    className="xsm-input w-full"
                    placeholder="1000000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    <DollarSign className="inline w-4 h-4 mr-1" />
                    Asking Price (USD) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="xsm-input w-full"
                    placeholder="5000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Monthly Income (USD)
                  </label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className="xsm-input w-full"
                    placeholder="500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Niche Description
                </label>
                <input
                  type="text"
                  name="niche"
                  value={formData.niche}
                  onChange={handleInputChange}
                  className="xsm-input w-full"
                  placeholder="e.g., Gaming reviews, Tech tutorials"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Upload Frequency
                  </label>
                  <select
                    name="uploadFrequency"
                    value={formData.uploadFrequency}
                    onChange={handleInputChange}
                    className="xsm-input w-full"
                  >
                    <option value="">Select frequency</option>
                    <option value="Daily">Daily</option>
                    <option value="3-4 times per week">3-4 times per week</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Irregular">Irregular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">
                    Average Views per Video
                  </label>
                  <input
                    type="number"
                    name="averageViews"
                    value={formData.averageViews}
                    onChange={handleInputChange}
                    className="xsm-input w-full"
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Contact Email *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="xsm-input w-full"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  Channel Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="xsm-input w-full resize-none"
                  placeholder="Describe your channel, content type, audience, growth potential, and any other relevant information..."
                  required
                />
              </div>

              <div>
                <h3 className="text-white font-medium mb-3">Channel Status</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="verified"
                      checked={formData.verified}
                      onChange={handleInputChange}
                      className="rounded border-xsm-medium-gray text-xsm-yellow focus:ring-xsm-yellow"
                    />
                    <span className="text-white">Verified Channel</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="monetized"
                      checked={formData.monetized}
                      onChange={handleInputChange}
                      className="rounded border-xsm-medium-gray text-xsm-yellow focus:ring-xsm-yellow"
                    />
                    <span className="text-white">Monetized (AdSense Enabled)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Channel Screenshots
                </label>
                <div className="border-2 border-dashed border-xsm-medium-gray rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-xsm-yellow mx-auto mb-2" />
                  <p className="text-white mb-2">Upload screenshots of your channel analytics</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="xsm-button-secondary cursor-pointer inline-block"
                  >
                    Choose Files
                  </label>
                </div>
                
                {screenshots.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {screenshots.map((screenshot, index) => (
                      <div key={index} className="relative">
                        <img
                          src={screenshot}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          onClick={() => removeScreenshot(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-xsm-black/50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-xsm-yellow mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-white">
                    <p className="font-semibold mb-2">Important Notes:</p>
                    <ul className="space-y-1 text-xsm-light-gray">
                      <li>• All listings are reviewed by our admin team</li>
                      <li>• Provide accurate information to avoid delays</li>
                      <li>• Screenshots help verify your channel's performance</li>
                      <li>• You'll be contacted within 24 hours of submission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`xsm-button text-lg px-12 py-4 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Channel for Review'}
            </button>
            <p className="text-sm text-xsm-light-gray mt-4">
              By submitting, you agree to our Terms of Service and commission structure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellChannel;
