import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, Send, X, Users, Phone, Video, MoreVertical } from 'lucide-react';

interface User {
  id: string;
  username: string;
  fullName?: string;
  email: string;
}

interface Message {
  id: number;
  content: string;
  senderId: string;
  chatId: number;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  sender: User;
  replyTo?: Message;
}

interface Chat {
  id: number;
  type: string;
  name?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  otherParticipants: User[];
  ad?: {
    id: number;
    title: string;
    price: number;
  };
}

interface ChatSystemProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ currentUser, isOpen, onClose }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      initializeSocket();
      fetchChats();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    
    newSocket.on('connect', () => {
      newSocket.emit('user_connected', { userId: currentUser.id });
    });

    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      updateChatLastMessage(message);
    });

    newSocket.on('user_typing', (data: { userId: string; username: string; chatId: number }) => {
      if (selectedChat && data.chatId === selectedChat.id) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
      }
    });

    newSocket.on('user_stop_typing', (data: { userId: string; chatId: number }) => {
      if (selectedChat && data.chatId === selectedChat.id) {
        setTypingUsers(prev => prev.filter((_, index) => index !== prev.length - 1));
      }
    });

    newSocket.on('messages_read', (data: { chatId: number; userId: string }) => {
      if (selectedChat && data.chatId === selectedChat.id) {
        setMessages(prev => prev.map(msg => 
          msg.senderId === currentUser.id ? { ...msg, isRead: true } : msg
        ));
      }
    });

    setSocket(newSocket);
  };

  const fetchChats = async () => {
    try {
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
    }
  };

  const fetchMessages = async (chatId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
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
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !socket) return;

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

      const message = await response.json();
      
      // Add to local messages
      setMessages(prev => [...prev, message]);
      
      // Emit to socket for real-time delivery
      socket.emit('send_message', {
        ...message,
        chatId: selectedChat.id
      });

      // Update chat list
      updateChatLastMessage(message);
      
      setNewMessage('');
      stopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    if (selectedChat?.id !== chat.id) {
      setSelectedChat(chat);
      fetchMessages(chat.id);
      
      if (socket) {
        if (selectedChat) {
          socket.emit('leave_chat', selectedChat.id);
        }
        socket.emit('join_chat', chat.id);
      }
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket && selectedChat) {
      setIsTyping(true);
      socket.emit('typing', {
        chatId: selectedChat.id,
        username: currentUser.username
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping && socket && selectedChat) {
      setIsTyping(false);
      socket.emit('stop_typing', {
        chatId: selectedChat.id
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.type === 'ad_inquiry' && chat.ad) {
      return chat.ad.title;
    }
    if (chat.otherParticipants.length > 0) {
      return chat.otherParticipants[0].fullName || chat.otherParticipants[0].username;
    }
    return 'Unknown';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[600px] flex">
        {/* Chat List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Messages
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm truncate">
                        {getChatDisplayName(chat)}
                      </h3>
                      {chat.ad && (
                        <p className="text-xs text-blue-600 truncate">
                          ${chat.ad.price}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {chat.lastMessageTime && (
                      <span className="text-xs text-gray-400">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    )}
                  </div>
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
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm mr-3">
                    {getChatDisplayName(selectedChat).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium">{getChatDisplayName(selectedChat)}</h3>
                    {selectedChat.ad && (
                      <p className="text-sm text-gray-600">Ad Inquiry</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="text-center text-gray-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === currentUser.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {message.senderId !== currentUser.id && (
                          <p className="text-xs font-medium mb-1 opacity-75">
                            {message.sender?.fullName || message.sender?.username}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                {typingUsers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                      <p className="text-sm italic">
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
