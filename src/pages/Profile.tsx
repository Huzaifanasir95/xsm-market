import React, { useState } from 'react';
import { User, Star, Edit, Trash2, Save, X, Shield, Award, TrendingUp } from 'lucide-react';
import VerificationSection from '@/components/VerificationSection';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profile, setProfile] = useState({
    username: 'ChannelTrader2024',
    email: 'user@example.com',
    fullName: 'John Doe',
    joinDate: '2024-01-15',
    rating: 4.8,
    totalSales: 12,
    totalPurchases: 5,
    verificationStatus: 'unverified' as 'unverified' | 'pending' | 'verified',
  });

  const [editForm, setEditForm] = useState({ ...profile });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [listedChannels] = useState([
    {
      id: '1',
      name: 'TechReview Pro',
      category: 'Tech',
      subscribers: 150000,
      price: 15000,
      status: 'Active',
      views: 245,
      inquiries: 8,
    },
    {
      id: '2',
      name: 'Gaming World HD',
      category: 'Gaming',
      subscribers: 89000,
      price: 8500,
      status: 'Pending Review',
      views: 123,
      inquiries: 3,
    },
  ]);

  const handleSaveProfile = () => {
    setProfile({ ...editForm });
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleDeleteAccount = () => {
    alert('Account deletion requested. You will receive a confirmation email within 24 hours.');
    setShowDeleteConfirm(false);
  };

  const handleVerificationSubmit = async (documentType: string, file: File) => {
    // TODO: Implement actual verification submission logic
    console.log('Submitting verification:', { documentType, file });
    // Mock API call
    setProfile(prev => ({ ...prev, verificationStatus: 'pending' }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-xsm-yellow mb-4">My Profile</h1>
          <p className="text-xl text-white">
            Manage your account settings and view your marketplace activity
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <div className="xsm-card text-center mb-6">
              <div className="w-24 h-24 bg-xsm-yellow rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-12 h-12 text-xsm-black" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{profile.fullName}</h2>
              <p className="text-xsm-light-gray mb-1">@{profile.username}</p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">{profile.verificationStatus}</span>
              </div>
              <div className="flex items-center justify-center space-x-1 mb-4">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-semibold">{profile.rating}</span>
                <span className="text-xsm-light-gray">({profile.totalSales + profile.totalPurchases} transactions)</span>
              </div>
              <div className="text-sm text-xsm-light-gray">
                Member since {new Date(profile.joinDate).toLocaleDateString()}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="xsm-card text-center">
                <TrendingUp className="w-8 h-8 text-xsm-yellow mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{profile.totalSales}</div>
                <div className="text-sm text-xsm-light-gray">Sales</div>
              </div>
              <div className="xsm-card text-center">
                <Award className="w-8 h-8 text-xsm-yellow mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{profile.totalPurchases}</div>
                <div className="text-sm text-xsm-light-gray">Purchases</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Settings */}
            <div className="xsm-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-xsm-yellow">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="xsm-button-secondary flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="xsm-button flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ ...profile });
                      }}
                      className="xsm-button-secondary flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={isEditing ? editForm.fullName : profile.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    disabled={!isEditing}
                    className={`xsm-input w-full ${!isEditing ? 'opacity-60' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Username</label>
                  <input
                    type="text"
                    value={isEditing ? editForm.username : profile.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    disabled={!isEditing}
                    className={`xsm-input w-full ${!isEditing ? 'opacity-60' : ''}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={isEditing ? editForm.email : profile.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    disabled={!isEditing}
                    className={`xsm-input w-full ${!isEditing ? 'opacity-60' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="xsm-card">
              <h3 className="text-xl font-bold text-xsm-yellow mb-6">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="xsm-input w-full"
                    placeholder="Enter current password"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="xsm-input w-full"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="xsm-input w-full"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="xsm-button"
                >
                  Update Password
                </button>
              </div>
            </div>

            {/* Listed Channels */}
            <div className="xsm-card">
              <h3 className="text-xl font-bold text-xsm-yellow mb-6">My Listed Channels</h3>
              <div className="space-y-4">
                {listedChannels.map(channel => (
                  <div key={channel.id} className="bg-xsm-black/50 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg">{channel.name}</h4>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-xsm-light-gray">
                          <span>{channel.category}</span>
                          <span>{formatNumber(channel.subscribers)} subscribers</span>
                          <span className="text-xsm-yellow font-semibold">{formatPrice(channel.price)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-white font-semibold">{channel.views}</div>
                          <div className="text-xs text-xsm-light-gray">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{channel.inquiries}</div>
                          <div className="text-xs text-xsm-light-gray">Inquiries</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          channel.status === 'Active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {channel.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="xsm-card border-red-500/20">
              <h3 className="text-xl font-bold text-red-400 mb-6">Danger Zone</h3>
              <div className="bg-red-500/10 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Delete Account</h4>
                <p className="text-xsm-light-gray mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-xsm-dark-gray rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-400 mb-4">Confirm Account Deletion</h3>
            <p className="text-white mb-6">
              Are you absolutely sure you want to delete your account? This action cannot be undone and you will lose all your data.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 xsm-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
