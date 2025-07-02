import React, { useState, useEffect } from 'react';

interface Participant {
  id: string;
  username: string;
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

interface Chat {
  id: string;
  participants: Participant[];
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
}

// Dummy data for demonstration
const dummyChats: Chat[] = [
  {
    id: '1',
    participants: [
      { id: '1', username: 'John Doe' },
      { id: '2', username: 'Jane Smith' }
    ],
    messages: [
      {
        id: '1',
        content: 'Hey, I\'m interested in your listing',
        sender: 'John Doe',
        timestamp: '2025-07-02T10:00:00'
      },
      {
        id: '2',
        content: 'Sure! What would you like to know?',
        sender: 'Jane Smith',
        timestamp: '2025-07-02T10:05:00'
      },
      {
        id: '3',
        content: 'Is it still available?',
        sender: 'John Doe',
        timestamp: '2025-07-02T10:07:00'
      }
    ],
    lastMessage: 'Is it still available?',
    lastMessageTime: '2025-07-02T10:07:00'
  },
  {
    id: '2',
    participants: [
      { id: '3', username: 'Mike Johnson' },
      { id: '4', username: 'Sarah Wilson' }
    ],
    messages: [
      {
        id: '4',
        content: 'What\'s the best price you can offer?',
        sender: 'Mike Johnson',
        timestamp: '2025-07-02T09:30:00'
      },
      {
        id: '5',
        content: 'I can do 15% off the listed price',
        sender: 'Sarah Wilson',
        timestamp: '2025-07-02T09:35:00'
      }
    ],
    lastMessage: 'I can do 15% off the listed price',
    lastMessageTime: '2025-07-02T09:35:00'
  }
];

const ReviewChats: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>(dummyChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-xsm-yellow"></div>
      </div>
    );
  }

  const filteredChats = chats.filter(chat => {
    const participantsMatch = chat.participants.some(p => 
      p.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const messagesMatch = chat.messages.some(m => 
      m.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return participantsMatch || messagesMatch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Control Panel */}
      <div className="bg-xsm-dark-gray rounded-xl border border-xsm-medium-gray p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-xsm-black border border-xsm-medium-gray rounded-lg px-4 py-2 focus:outline-none focus:border-xsm-yellow w-64"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-xsm-black border border-xsm-medium-gray rounded-lg px-4 py-2 focus:outline-none focus:border-xsm-yellow"
            >
              <option value="all">All Chats</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xsm-light-gray">Total Chats: {filteredChats.length}</span>
          </div>
        </div>
      </div>

      {/* Chat Table */}
      <div className="bg-xsm-dark-gray rounded-xl border border-xsm-medium-gray overflow-hidden flex-grow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-xsm-black">
                <th className="px-4 py-3 text-left text-sm font-medium text-xsm-yellow">Participants</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-xsm-yellow">Last Message</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-xsm-yellow">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-xsm-yellow">Messages</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-xsm-yellow">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-xsm-medium-gray">
              {filteredChats.map((chat) => (
                <tr 
                  key={chat.id}
                  className={`hover:bg-xsm-medium-gray/30 transition-colors cursor-pointer ${
                    selectedChat?.id === chat.id ? 'bg-xsm-medium-gray/50' : ''
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      {chat.participants.map((p) => (
                        <span key={p.id} className="text-sm">{p.username}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-xsm-light-gray max-w-xs truncate">
                      {chat.lastMessage}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-xsm-light-gray">
                      {formatDate(chat.lastMessageTime)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{chat.messages.length}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm bg-xsm-yellow text-black rounded hover:bg-xsm-yellow/90">
                        Review
                      </button>
                      <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                        Flag
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chat Detail Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-xsm-dark-gray rounded-xl border border-xsm-medium-gray p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-xsm-yellow">Chat Review</h2>
                <p className="text-sm text-xsm-light-gray mt-1">
                  Between: {selectedChat.participants.map((p) => p.username).join(', ')}
                </p>
              </div>
              <button 
                onClick={() => setSelectedChat(null)}
                className="text-xsm-light-gray hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-4">
              {selectedChat.messages.map((message) => (
                <div
                  key={message.id}
                  className="flex flex-col space-y-1 bg-xsm-black rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xsm-yellow">{message.sender}</span>
                    <span className="text-xs text-xsm-light-gray">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm mt-2">{message.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-xsm-medium-gray">
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Flag Chat
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Mark as Reviewed
              </button>
              <button 
                onClick={() => setSelectedChat(null)}
                className="px-4 py-2 bg-xsm-medium-gray text-white rounded hover:bg-xsm-medium-gray/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewChats;
