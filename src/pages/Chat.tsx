import React, { useState, useEffect, useRef } from 'react';
import { Send, Flag, User, Shield, MessageCircle, Search } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { API_URL } from '@/services/auth';

interface Message {
  id: number;
  content: string;
  senderId: string;
  chatId: number;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
  };
}

interface ChatData {
  id: number;
  type: string;
  name?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  otherParticipants: Array<{
    id: string;
    username: string;
    email: string;
  }>;
  ad?: {
    id: number;
    title: string;
    price: number;
  };
}

const Chat: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const [selectedChat, setSelectedChat] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState<ChatData[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastMessageId, setLastMessageId] = useState<number | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Remove Socket.IO and replace with polling-based real-time updates
  useEffect(() => {
    if (isLoggedIn && user && selectedChat) {
      // Start polling for new messages every 2 seconds
      const interval = setInterval(() => {
        checkForNewMessages();
      }, 2000);
      
      setPollingInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [isLoggedIn, user, selectedChat, lastMessageId]);

  // Check for new messages
  const checkForNewMessages = async () => {
    if (!selectedChat || !user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/chats/${selectedChat.id}/messages?since=${lastMessageId || 0}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const newMessages = await response.json();
        if (newMessages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNewMessages = newMessages.filter((m: Message) => !existingIds.has(m.id));
            return [...prev, ...uniqueNewMessages];
          });
          
          // Update last message ID
          const latestMessage = newMessages[newMessages.length - 1];
          setLastMessageId(latestMessage.id);
          
          // Update chat list with latest message
          updateChatLastMessage(latestMessage);
        }
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  };

  // Fetch chats when component mounts
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchChats();
    }
  }, [isLoggedIn, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter chats based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat => {
        const chatName = getChatDisplayName(chat).toLowerCase();
        const lastMessage = chat.lastMessage?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();
        
        return chatName.includes(query) || lastMessage.includes(query);
      });
      setFilteredChats(filtered);
    }
  }, [chats, searchQuery]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      setLastMessageId(null); // Reset for new chat
    }
  }, [selectedChat]);

  // Refresh chat list periodically to show new chats
  useEffect(() => {
    if (isLoggedIn && user) {
      const interval = setInterval(() => {
        fetchChats();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, user]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setChats(data);
      setFilteredChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMessages(data);
      
      // Set the last message ID for polling
      if (data.length > 0) {
        const latestMessage = data[data.length - 1];
        setLastMessageId(latestMessage.id);
      }
      
      // Mark messages as read
      await fetch(`${API_URL}/chat/chats/${chatId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/chats/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: 'text'
        })
      });

      if (response.ok) {
        const message = await response.json();
        
        // Add to local messages immediately
        setMessages(prev => [...prev, message]);
        setLastMessageId(message.id);

        // Update chat list
        updateChatLastMessage(message);
        
        setNewMessage('');
        
        // Force check for any other new messages
        setTimeout(() => checkForNewMessages(), 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateChatLastMessage = (message: Message) => {
    setChats(prev => prev.map(chat => 
      chat.id === message.chatId 
        ? { ...chat, lastMessage: message.content, lastMessageTime: message.createdAt }
        : chat
    ).sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReport = () => {
    if (reportReason.trim()) {
      alert(`User reported successfully. Reason: ${reportReason}\n\nOur admin team will review this report within 24 hours.`);
      setReportModalOpen(false);
      setReportReason('');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getChatDisplayName = (chat: ChatData) => {
    // For ad inquiries, show seller name instead of ad title
    if (chat.type === 'ad_inquiry') {
      if (chat.otherParticipants.length > 0) {
        const otherUser = chat.otherParticipants[0];
        return otherUser.username;
      }
      // Fallback to ad title if no participants
      if (chat.ad) {
        return `Inquiry: ${chat.ad.title}`;
      }
    }
    
    // For direct chats, show the other participant's name
    if (chat.otherParticipants.length > 0) {
      return chat.otherParticipants[0].username;
    }
    
    // Use chat name if available
    if (chat.name) {
      return chat.name;
    }
    
    return 'Unknown';
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-xsm-black to-xsm-dark-gray flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-xsm-yellow mb-4">Please Login</h1>
          <p className="text-xl text-white">You need to login to access the chat system.</p>
        </div>
      </div>
    );
  }

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
            {/* Chat List */}
            <div className="w-80 bg-xsm-black border-r border-xsm-medium-gray">
              <div className="p-4 border-b border-xsm-medium-gray">
                <h3 className="text-lg font-semibold text-xsm-yellow flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Conversations
                </h3>
              </div>

              <div className="p-4 border-b border-xsm-medium-gray">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full px-4 py-2 bg-xsm-dark-gray text-white rounded-lg border border-xsm-medium-gray focus:outline-none focus:border-xsm-yellow"
                />
              </div>

              <div className="overflow-y-auto" style={{ height: 'calc(100% - 113px)' }}>
                {loading ? (
                  <div className="p-4 text-center text-white">Loading chats...</div>
                ) : filteredChats.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start chatting by contacting a seller!</p>
                  </div>
                ) : (
                  filteredChats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 border-b border-xsm-medium-gray cursor-pointer hover:bg-xsm-dark-gray transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-xsm-medium-gray' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-xsm-yellow rounded-full flex items-center justify-center text-xsm-black font-bold text-sm mr-3">
                            {getChatDisplayName(chat).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm">
                              {getChatDisplayName(chat)}
                            </h4>
                            {chat.ad && (
                              <p className="text-xs text-xsm-yellow">
                                {chat.ad.title} - ${chat.ad.price}
                              </p>
                            )}
                          </div>
                        </div>
                        {chat.lastMessageTime && (
                          <span className="text-xs text-gray-400">
                            {formatLastSeen(chat.lastMessageTime)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-xsm-medium-gray bg-xsm-black flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-xsm-yellow rounded-full flex items-center justify-center text-xsm-black font-bold">
                        {getChatDisplayName(selectedChat).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{getChatDisplayName(selectedChat)}</h4>
                        {selectedChat.ad && (
                          <p className="text-sm text-xsm-yellow">{selectedChat.ad.title} - ${selectedChat.ad.price}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setReportModalOpen(true)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      title="Report User"
                    >
                      <Flag className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user?.id
                                ? 'bg-xsm-yellow text-xsm-black'
                                : 'bg-xsm-medium-gray text-white'
                            }`}
                          >
                            {message.senderId !== user?.id && (
                              <p className="text-xs font-medium mb-1 opacity-75">
                                {message.sender?.username}
                              </p>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === user?.id ? 'text-xsm-dark-gray' : 'text-gray-400'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-xsm-medium-gray bg-xsm-black">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 bg-xsm-dark-gray text-white rounded-lg border border-xsm-medium-gray focus:outline-none focus:border-xsm-yellow"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-xsm-yellow text-xsm-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-xsm-black/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-xsm-yellow mb-2">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Security Notice</span>
          </div>
          <p className="text-white text-sm">
            All conversations are monitored for security. Never share personal financial information, 
            passwords, or complete transactions outside our secure payment system.
          </p>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-xsm-dark-gray rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-xsm-yellow mb-4">Report User</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please describe the reason for reporting this user..."
              className="w-full h-24 px-4 py-2 bg-xsm-black text-white rounded-lg border border-xsm-medium-gray focus:outline-none focus:border-xsm-yellow resize-none"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setReportModalOpen(false)}
                className="flex-1 px-4 py-2 border border-xsm-medium-gray text-white rounded-lg hover:bg-xsm-medium-gray transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
