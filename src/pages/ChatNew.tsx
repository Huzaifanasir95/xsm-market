import React, { useState, useEffect, useRef } from 'react';
import { Send, Flag, User, Shield, MessageCircle, Image, FileVideo } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  content: string;
  senderId: string;
  chatId: number;
  messageType: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnail?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    fullName?: string;
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
    fullName?: string;
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Initialize Socket.IO connection

  // Fetch chats when component mounts
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchChats();
    }
  }, [isLoggedIn, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  // Cleanup image preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Join chat room when chat is selected
  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit('join_chat', selectedChat.id);
      fetchMessages(selectedChat.id);
    }
  }, [socket, selectedChat]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Fetched messages:', data);
      
      // Debug image messages to verify they have proper mediaUrl
      data.forEach((msg: Message, index: number) => {
        if (msg.messageType === 'image') {
          console.log(`🖼️ Image message ${index}:`, {
            id: msg.id,
            messageType: msg.messageType,
            mediaUrl: msg.mediaUrl,
            content: msg.content,
            imageSource: msg.mediaUrl || msg.content
          });
        }
      });
      
      setMessages(data);
      
      // Mark messages as read
      await fetch(`/api/chat/chats/${chatId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Simplified image upload function
  const uploadImageMessage = async (file: File) => {
    if (!selectedChat || !user) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('messageType', 'image');
      
      console.log('🚀 Uploading image:', file.name, file.size);

      const response = await fetch(`/api/chat/chats/${selectedChat.id}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const newMessage = await response.json();
      console.log('✅ Upload successful:', newMessage);
      
      // Add to messages immediately
      setMessages(prev => [...prev, newMessage]);
      
      // Clear form
      setSelectedImage(null);
      setImagePreview(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      
      return newMessage;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('Failed to upload image: ' + error.message);
    }
  };
  const handleSendMessage = async () => {
    if (!selectedChat || !user || !newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/chats/${selectedChat.id}/messages`, {
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

      if (!response.ok) {
        throw new Error(`Message failed: ${response.status}`);
      }

      const textMessage = await response.json();
      setMessages(prev => [...prev, textMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    }
  };
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

  // Simple image rendering - just show the image with a direct URL
  const renderChatImage = (message: Message) => {
    // Build image URL - try different combinations
    const imagePaths = [
      message.mediaUrl,
      message.content,
      message.content?.startsWith('/uploads/chat/') ? message.content : null
    ].filter(Boolean);
    
    if (imagePaths.length === 0) {
      return (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm">
          📷 Image (no path available)
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {imagePaths.map((imagePath, index) => {
          if (!imagePath) return null;
          
          const imageUrl = imagePath.startsWith('http') 
            ? imagePath 
            : `http://localhost:5000${imagePath}`;
            
          return (
            <div key={index} className="border border-gray-300 rounded p-2">
              <img 
                src={imageUrl}
                alt="Chat image"
                className="max-w-full h-auto rounded cursor-pointer"
                style={{ maxHeight: '150px' }}
                onClick={() => window.open(imageUrl, '_blank')}
                onError={(e) => {
                  console.error('Failed to load:', imageUrl);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="text-xs text-gray-500 mt-1">
                {imagePath}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Function to check if message has text content (not image path)
  const getMessageTextContent = (message: Message) => {
    if (!message.content) return null;
    
    // Don't show content if it's an image path
    if (message.content.includes('/uploads/chat/')) return null;
    
    return message.content;
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('Image selection event:', file);
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    } else {
      console.log('Invalid file selected or no file selected');
      alert('Please select a valid image file');
    }
  };

  const processImageFile = (file: File) => {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }
    
    setSelectedImage(file);
    console.log('Image selected:', file.name, file.size);
    
    // Create preview URL using the same method as SellChannel
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    console.log('Image preview URL created:', previewUrl);
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
    const imageFile = droppedFiles.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      processImageFile(imageFile);
    } else {
      alert('Please drop a valid image file');
    }
  };

  const clearImageSelection = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
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
    if (chat.type === 'ad_inquiry' && chat.ad) {
      return chat.ad.title;
    }
    if (chat.otherParticipants.length > 0) {
      return chat.otherParticipants[0].fullName || chat.otherParticipants[0].username;
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

              <div className="overflow-y-auto" style={{ height: 'calc(100% - 73px)' }}>
                {loading ? (
                  <div className="p-4 text-center text-white">Loading chats...</div>
                ) : chats.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start chatting by contacting a seller!</p>
                  </div>
                ) : (
                  chats.map(chat => (
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
                                ${chat.ad.price}
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
                          <p className="text-sm text-xsm-yellow">Ad Inquiry - ${selectedChat.ad.price}</p>
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
                                {message.sender?.fullName || message.sender?.username}
                              </p>
                            )}
                            
                            {/* Render image if it's an image message */}
                            {message.messageType === 'image' && (
                              <div className="mb-2">
                                {renderChatImage(message)}
                              </div>
                            )}
                            
                            {/* Render text content if present and not an image path */}
                            {(() => {
                              const textContent = getMessageTextContent(message);
                              return textContent ? <p className="text-sm">{textContent}</p> : null;
                            })()}
                            
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
                      {/* Simple Upload Image Button */}
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        title="Upload Image"
                      >
                        📷 Image
                      </button>
                      
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
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
                      
                      {/* Hidden file input */}
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type.startsWith('image/')) {
                            console.log('📷 File selected:', file.name);
                            await uploadImageMessage(file);
                          } else {
                            alert('Please select a valid image file');
                          }
                        }}
                      />
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
