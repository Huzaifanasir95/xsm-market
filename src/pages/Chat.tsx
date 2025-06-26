
import React, { useState, useEffect, useRef } from 'react';
import { Send, Flag, User, Shield, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: Date;
}

const Chat: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatUsers] = useState<ChatUser[]>([
    { id: '1', name: 'TechSeller99', isOnline: true },
    { id: '2', name: 'GamerPro', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 30) },
    { id: '3', name: 'FitnessPro2024', isOnline: true },
    { id: '4', name: 'ChefMaster', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  ]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock messages for demonstration
  useEffect(() => {
    if (selectedUser) {
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: selectedUser,
          senderName: chatUsers.find(u => u.id === selectedUser)?.name || 'User',
          content: 'Hi! I\'m interested in your YouTube channel. Can you provide more details about the monthly revenue?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isCurrentUser: false,
        },
        {
          id: '2',
          senderId: 'current',
          senderName: 'You',
          content: 'Hello! The channel generates around $2,500 per month through AdSense, sponsorships, and affiliate marketing. It has consistent growth and high engagement.',
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          isCurrentUser: true,
        },
        {
          id: '3',
          senderId: selectedUser,
          senderName: chatUsers.find(u => u.id === selectedUser)?.name || 'User',
          content: 'That sounds great! What\'s included in the transfer? Do you provide any support during the transition?',
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          isCurrentUser: false,
        },
        {
          id: '4',
          senderId: 'current',
          senderName: 'You',
          content: 'Yes, the transfer includes full ownership, all associated social media accounts, and I provide 30 days of support to help with the transition.',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          isCurrentUser: true,
        },
      ];
      setMessages(mockMessages);
    }
  }, [selectedUser, chatUsers]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: 'current',
        senderName: 'You',
        content: newMessage.trim(),
        timestamp: new Date(),
        isCurrentUser: true,
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate response (in real app, this would come from WebSocket)
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: selectedUser,
          senderName: chatUsers.find(u => u.id === selectedUser)?.name || 'User',
          content: 'Thanks for the information! I\'ll review it and get back to you soon.',
          timestamp: new Date(),
          isCurrentUser: false,
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  };

  const handleReport = () => {
    if (reportReason.trim()) {
      alert(`User reported successfully. Reason: ${reportReason}\n\nOur admin team will review this report within 24 hours.`);
      setReportModalOpen(false);
      setReportReason('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-xsm-yellow mb-4">Secure Chat</h1>
          <p className="text-xl text-white">
            Communicate safely with buyers and sellers through our secure messaging system
          </p>
        </div>

        <div className="bg-xsm-dark-gray rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* User List */}
            <div className="w-80 bg-xsm-black border-r border-xsm-medium-gray">
              <div className="p-4 border-b border-xsm-medium-gray">
                <h3 className="text-lg font-semibold text-xsm-yellow flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Conversations
                </h3>
              </div>
              <div className="overflow-y-auto h-full">
                {chatUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    className={`p-4 border-b border-xsm-medium-gray cursor-pointer transition-colors ${
                      selectedUser === user.id ? 'bg-xsm-medium-gray' : 'hover:bg-xsm-medium-gray/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-xsm-yellow rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-xsm-black" />
                        </div>
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-xsm-black"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{user.name}</div>
                        <div className="text-sm text-xsm-light-gray">
                          {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen!)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-xsm-medium-gray bg-xsm-black">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-xsm-yellow rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-xsm-black" />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {chatUsers.find(u => u.id === selectedUser)?.name}
                          </div>
                          <div className="text-sm text-xsm-light-gray">
                            {chatUsers.find(u => u.id === selectedUser)?.isOnline ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setReportModalOpen(true)}
                        className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                        <span className="text-sm">Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isCurrentUser
                              ? 'bg-xsm-yellow text-xsm-black'
                              : 'bg-xsm-medium-gray text-white'
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.isCurrentUser ? 'text-xsm-black/70' : 'text-xsm-light-gray'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-xsm-medium-gray bg-xsm-black">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 xsm-input"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="xsm-button px-4 py-2 flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-xsm-yellow mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                    <p className="text-xsm-light-gray">
                      Choose a user from the list to start chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-xsm-black/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-xsm-yellow mt-0.5 flex-shrink-0" />
            <div className="text-sm text-white">
              <p className="font-semibold mb-1">Security Notice:</p>
              <ul className="text-xsm-light-gray space-y-1">
                <li>• Never share personal information like passwords or banking details</li>
                <li>• All transactions should go through XSM Market's secure system</li>
                <li>• Report any suspicious behavior immediately</li>
                <li>• Use our escrow service for all purchases</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-xsm-dark-gray rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-xsm-yellow mb-4">Report User</h3>
            <p className="text-white mb-4">
              Please describe the issue you're experiencing with this user:
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the problem..."
              className="xsm-input w-full h-32 resize-none mb-4"
            />
            <div className="flex space-x-4">
              <button
                onClick={() => setReportModalOpen(false)}
                className="flex-1 xsm-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
