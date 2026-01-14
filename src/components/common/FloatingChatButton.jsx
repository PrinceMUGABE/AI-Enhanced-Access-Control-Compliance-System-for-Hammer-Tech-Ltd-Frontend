// components/common/FloatingChatButton.jsx
import React, { useState, useEffect, useCallback } from 'react';
import ChatbotModal from './ChatbotModal';

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Check for unread messages
  const checkForUnreadMessages = useCallback(() => {
    try {
      const unread = localStorage.getItem('assistance_unread');
      const count = parseInt(unread) || 0;
      
      if (count > 0) {
        setUnreadCount(count);
        setHasUnreadMessages(true);
        setIsPulsing(true);
      }
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  }, []);

  // Poll for unread messages
  useEffect(() => {
    checkForUnreadMessages();
    
    // Check every 30 seconds
    const interval = setInterval(checkForUnreadMessages, 30000);
    
    // Listen for storage events (from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'assistance_unread') {
        checkForUnreadMessages();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkForUnreadMessages]);

  // Toggle function - opens or closes the modal
  const handleToggle = () => {
    if (!isOpen) {
      // Opening the modal
      setIsOpen(true);
      setIsPulsing(false);
      setUnreadCount(0);
      setHasUnreadMessages(false);
      localStorage.removeItem('assistance_unread');
    } else {
      // Closing the modal
      setIsOpen(false);
      // Check if we have new unread messages after closing
      setTimeout(checkForUnreadMessages, 1000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Check if we have new unread messages after closing
    setTimeout(checkForUnreadMessages, 1000);
  };

  // Listen for new assistance notifications
  useEffect(() => {
    const handleAssistanceNotification = (event) => {
      if (event.detail && event.detail.type === 'new_assistance') {
        const newCount = (unreadCount || 0) + 1;
        setUnreadCount(newCount);
        setHasUnreadMessages(true);
        setIsPulsing(true);
        localStorage.setItem('assistance_unread', newCount.toString());
      }
    };

    window.addEventListener('assistance-notification', handleAssistanceNotification);
    
    return () => {
      window.removeEventListener('assistance-notification', handleAssistanceNotification);
    };
  }, [unreadCount]);

  return (
    <>
      <button
        onClick={handleToggle}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl z-40 transition-all duration-300 hover:scale-110 ${
          isPulsing ? 'animate-pulse shadow-2xl shadow-blue-500/50' : ''
        } ${isOpen ? 'rotate-45' : 'rotate-0'}`}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        title={isOpen ? "Close Chat" : "AI Assistant"}
      >
        <span className={`text-2xl transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
          {isOpen ? '✕' : '💬'}
        </span>
        {hasUnreadMessages && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      <ChatbotModal isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default FloatingChatButton;