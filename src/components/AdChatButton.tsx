import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { API_URL } from '@/services/auth';

interface AdChatButtonProps {
  adId: number;
  sellerId: number | string;
  currentUserId: number | string;
  adTitle: string;
  onChatCreated?: (chatId: number) => void;
  onNavigateToChat?: () => void;
}

const AdChatButton: React.FC<AdChatButtonProps> = ({ 
  adId, 
  sellerId, 
  currentUserId, 
  adTitle,
  onChatCreated,
  onNavigateToChat
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const createAdInquiry = async () => {
    if (!message.trim()) return;

    try {
      setIsCreating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/chat/ad-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adId,
          message: message.trim()
        })
      });

      const chat = await response.json();
      
      if (response.ok) {
        setShowModal(false);
        setMessage('');
        if (onChatCreated) {
          onChatCreated(chat.id);
        }
        // Navigate to chat page
        if (onNavigateToChat) {
          onNavigateToChat();
        }
      } else {
        alert(chat.message || 'Failed to create chat');
      }
    } catch (error) {
      console.error('Error creating ad inquiry:', error);
      alert('Failed to create chat');
    } finally {
      setIsCreating(false);
    }
  };

  const handleButtonClick = () => {
    if (currentUserId === sellerId) {
      alert("You can't start a chat with yourself");
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="flex items-center space-x-2 px-4 py-2 bg-xsm-yellow text-xsm-black rounded-lg hover:bg-yellow-400 transition-colors font-medium"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Contact Seller</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-xsm-dark-gray rounded-lg p-6 w-full max-w-md border border-xsm-medium-gray">
            <h3 className="text-lg font-semibold mb-4 text-xsm-yellow">Contact Seller</h3>
            <p className="text-white mb-4">Send a message about: <span className="text-xsm-yellow">{adTitle}</span></p>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in this item..."
              className="w-full p-3 bg-xsm-black text-white border border-xsm-medium-gray rounded-lg resize-none h-24 focus:outline-none focus:border-xsm-yellow"
            />
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-xsm-medium-gray text-white rounded-lg hover:bg-xsm-medium-gray transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createAdInquiry}
                disabled={!message.trim() || isCreating}
                className="flex-1 px-4 py-2 bg-xsm-yellow text-xsm-black rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isCreating ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdChatButton;
