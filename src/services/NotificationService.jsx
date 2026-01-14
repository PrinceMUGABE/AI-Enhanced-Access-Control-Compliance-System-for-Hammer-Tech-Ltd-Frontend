// services/notificationService.js
import axios from 'axios';

export const notificationService = {
  async checkForUnread() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return false;
      
      const response = await axios.get('http://127.0.0.1:8000/assistance/unread-count/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.count > 0) {
        localStorage.setItem('assistance_unread', response.data.count);
        return response.data.count;
      }
    } catch (error) {
      console.error('Failed to check unread:', error);
    }
    return false;
  },

  async markAsRead(sessionId) {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://127.0.0.1:8000/assistance/mark-read/', {
        session_id: sessionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }
};