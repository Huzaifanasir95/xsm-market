import React, { useState, useEffect } from 'react';
import { Activity, Users, ShoppingBag, Settings, Bell, Search, MessageSquare } from 'lucide-react';
import ManageUsers from '@/components/admin/ManageUsers';
import ReviewListings from '@/components/admin/ReviewListings';
import ReviewChats from '@/components/admin/ReviewChats';
import { getDashboardStats, getRecentActivities } from '@/services/admin';

interface AdminDashboardProps {
  setCurrentPage: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentPage }) => {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '-', icon: Users },
    { title: 'Active Listings', value: '-', icon: ShoppingBag },
    { title: 'Total Chats', value: '-', icon: Activity },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDashboardStats()
      .then((data) => {
        setStats([
          { title: 'Total Users', value: data.totalUsers, icon: Users },
          { title: 'Active Listings', value: data.totalListings, icon: ShoppingBag },
          { title: 'Total Chats', value: data.totalChats, icon: Activity },
        ]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch dashboard stats');
        setLoading(false);
      });
    // Fetch recent activities
    setRecentLoading(true);
    setRecentError(null);
    getRecentActivities()
      .then((data) => {
        setRecentActivities(data);
        setRecentLoading(false);
      })
      .catch((err) => {
        setRecentError(err.message || 'Failed to fetch recent activities');
        setRecentLoading(false);
      });
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'manage-users':
        return <ManageUsers />;
      case 'review-listings':
        return <ReviewListings />;
      case 'review-chats':
        return <ReviewChats />;
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {loading ? (
                <div className="col-span-3 text-center text-xsm-light-gray py-8">Loading statistics...</div>
              ) : error ? (
                <div className="col-span-3 text-center text-red-400 py-8">{error}</div>
              ) : (
                stats.map((stat, index) => (
                  <div key={index} className="bg-xsm-dark-gray p-6 rounded-xl border border-xsm-medium-gray">
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className="h-8 w-8 text-xsm-yellow" />
                    </div>
                    <h3 className="text-lg text-xsm-light-gray mb-2">{stat.title}</h3>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                ))
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-xsm-dark-gray rounded-xl border border-xsm-medium-gray p-6">
              <h2 className="text-xl font-bold mb-6 text-xsm-yellow">Recent Activity</h2>
              {recentLoading ? (
                <div className="text-center text-xsm-light-gray py-8">Loading recent activity...</div>
              ) : recentError ? (
                <div className="text-center text-red-400 py-8">{recentError}</div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 hover:bg-xsm-medium-gray/50 rounded-lg transition-colors"
                    >
                      <div>
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-xsm-light-gray">{activity.action}</p>
                      </div>
                      <span className="text-sm text-xsm-light-gray">{new Date(activity.time).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              { [
                { name: 'Manage Users', view: 'manage-users' },
                { name: 'Review Listings', view: 'review-listings' },
                { name: 'Review Chats', view: 'review-chats', icon: MessageSquare }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => setActiveView(action.view)}
                  className="p-4 bg-xsm-dark-gray border border-xsm-medium-gray rounded-lg hover:bg-xsm-medium-gray transition-colors text-left flex items-center gap-2"
                >
                  {action.icon && <action.icon className="h-5 w-5 text-xsm-yellow" />}
                  <span>{action.name}</span>
                </button>
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-xsm-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-xsm-yellow">
          {activeView === 'dashboard' ? 'Admin Dashboard' : 'Admin Dashboard / ' + activeView.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </h1>
        <div className="flex items-center space-x-4">
          {activeView === 'dashboard' && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-xsm-dark-gray border border-xsm-medium-gray rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-xsm-yellow"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-xsm-medium-gray" />
            </div>
          )}
          <button className="relative p-2 hover:bg-xsm-medium-gray rounded-lg transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          {activeView !== 'dashboard' && (
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2 bg-xsm-medium-gray hover:bg-xsm-medium-gray/80 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default AdminDashboard;
