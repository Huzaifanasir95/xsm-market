import React from 'react';
import { Activity, Users, ShoppingBag, Settings, Bell, Search } from 'lucide-react';

interface AdminDashboardProps {
  setCurrentPage: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setCurrentPage }) => {
  const stats = [
    { title: 'Total Users', value: '1,234', icon: Users, change: '+12%' },
    { title: 'Active Listings', value: '856', icon: ShoppingBag, change: '+23%' },
    { title: 'Daily Activity', value: '92%', icon: Activity, change: '+5%' },
  ];

  const recentActivities = [
    { user: 'John Doe', action: 'Created new listing', time: '2 minutes ago' },
    { user: 'Jane Smith', action: 'Updated profile', time: '5 minutes ago' },
    { user: 'Mike Johnson', action: 'Reported a listing', time: '10 minutes ago' },
    { user: 'Sarah Wilson', action: 'New registration', time: '15 minutes ago' },
  ];

  return (
    <div className="min-h-screen bg-xsm-black text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-xsm-yellow">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-xsm-dark-gray border border-xsm-medium-gray rounded-lg px-4 py-2 pl-10 focus:outline-none focus:border-xsm-yellow"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-xsm-medium-gray" />
          </div>
          <button className="relative p-2 hover:bg-xsm-medium-gray rounded-lg transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-xsm-medium-gray rounded-lg transition-colors">
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-xsm-dark-gray p-6 rounded-xl border border-xsm-medium-gray">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="h-8 w-8 text-xsm-yellow" />
              <span className="text-green-400">{stat.change}</span>
            </div>
            <h3 className="text-lg text-xsm-light-gray mb-2">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-xsm-dark-gray rounded-xl border border-xsm-medium-gray p-6">
        <h2 className="text-xl font-bold mb-6 text-xsm-yellow">Recent Activity</h2>
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
              <span className="text-sm text-xsm-light-gray">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Manage Users', 'Review Listings', 'System Settings', 'View Reports'].map((action, index) => (
          <button
            key={index}
            className="p-4 bg-xsm-dark-gray border border-xsm-medium-gray rounded-lg hover:bg-xsm-medium-gray transition-colors text-left"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
