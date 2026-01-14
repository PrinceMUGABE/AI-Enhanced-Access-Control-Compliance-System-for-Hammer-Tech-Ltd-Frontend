import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons Component
const Icons = {
  Bot: ({ className }) => <div className={className}>🤖</div>,
  User: ({ className }) => <div className={className}>👤</div>,
  Send: ({ className }) => <div className={className}>📤</div>,
  Users: ({ className }) => <div className={className}>👥</div>,
  MessageSquare: ({ className }) => <div className={className}>💬</div>,
  Clock: ({ className }) => <div className={className}>⏱️</div>,
  CheckCircle: ({ className }) => <div className={className}>✅</div>,
  AlertCircle: ({ className }) => <div className={className}>⚠️</div>,
  Plus: ({ className }) => <div className={className}>➕</div>,
  Edit: ({ className }) => <div className={className}>✏️</div>,
  Trash: ({ className }) => <div className={className}>🗑️</div>,
  Search: ({ className }) => <div className={className}>🔍</div>,
  Filter: ({ className }) => <div className={className}>⚙️</div>,
  Refresh: ({ className }) => <div className={className}>🔄</div>,
  AlertTriangle: ({ className }) => <div className={className}>⚠️</div>,
  UserCheck: ({ className }) => <div className={className}>👨‍💼</div>,
  Hourglass: ({ className }) => <div className={className}>⏳</div>,
  TrendingUp: ({ className }) => <div className={className}>📈</div>,
  BarChart: ({ className }) => <div className={className}>📊</div>,
  HelpCircle: ({ className }) => <div className={className}>❓</div>,
  Mail: ({ className }) => <div className={className}>✉️</div>,
  Download: ({ className }) => <div className={className}>📥</div>,
  Eye: ({ className }) => <div className={className}>👁️</div>,
  Star: ({ className }) => <div className={className}>⭐</div>,
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'ai_handled': { color: 'purple', label: 'AI Handled', icon: '🤖' },
    'human_requested': { color: 'yellow', label: 'Human Requested', icon: '⏳' },
    'escalated': { color: 'red', label: 'Escalated', icon: '⚠️' },
    'human_responding': { color: 'blue', label: 'Responding', icon: '👨‍💼' },
    'resolved': { color: 'green', label: 'Resolved', icon: '✅' },
  };
  
  const config = statusConfig[status] || { color: 'gray', label: status, icon: '❓' };
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
      bg-${config.color}-100 text-${config.color}-800 border border-${config.color}-200`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

const TimeAgo = ({ dateString }) => {
  const [timeAgo, setTimeAgo] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) {
        setTimeAgo('Just now');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins}m ago`);
      } else if (diffMins < 1440) {
        setTimeAgo(`${Math.floor(diffMins / 60)}h ago`);
      } else {
        setTimeAgo(`${Math.floor(diffMins / 1440)}d ago`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [dateString]);
  
  return <span className="text-xs text-gray-500">{timeAgo}</span>;
};

export default function AdminAssistanceDashboard() {
  // State management
  const [activeView, setActiveView] = useState('chats'); // 'chats', 'faqs', 'analytics'
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [popularQuestions, setPopularQuestions] = useState([]);
  const [loading, setLoading] = useState({
    chats: false,
    faqs: false,
    analytics: false
  });
  
  // Filter states
  const [chatFilters, setChatFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'recent',
    showResolved: false,
    limit: 50
  });
  
  const [faqFilters, setFaqFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'popular'
  });
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    ai_handled: 0,
    human_requested: 0,
    escalated: 0,
    human_responding: 0,
    resolved: 0,
    avg_response_time: 0,
    resolution_rate: 0
  });
  
  // Modal states
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'general',
    keywords: ''
  });
  
  // Refs
  const messagesEndRef = useRef(null);
  const API_BASE = 'http://127.0.0.1:8000/assistance';
  
  // Auth helper
  const getAuthToken = () => localStorage.getItem('access_token');
  
  // Initialize
  useEffect(() => {
    loadAllData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (activeView === 'chats') loadChats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeView]);
  
  // Load all initial data
  const loadAllData = async () => {
    await Promise.all([
      loadChats(),
      loadFAQs(),
      loadStats(),
      loadPopularQuestions()
    ]);
  };
  
  // Load chats with filters
  const loadChats = async () => {
    try {
      setLoading(prev => ({ ...prev, chats: true }));
      const token = getAuthToken();
      
      const params = new URLSearchParams();
      if (chatFilters.status !== 'all') params.append('status', chatFilters.status);
      if (chatFilters.search) params.append('search', chatFilters.search);
      params.append('limit', chatFilters.limit);
      
      const response = await axios.get(`${API_BASE}/chats/all/?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setChats(response.data.chats);
        setFilteredChats(response.data.chats);
        setStats(prev => ({ ...prev, ...response.data.stats }));
        
        // Update active chat if it exists in new data
        if (activeChat) {
          const updatedChat = response.data.chats.find(c => c.id === activeChat.id);
          if (updatedChat) setActiveChat(updatedChat);
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(prev => ({ ...prev, chats: false }));
    }
  };
  
  // Load FAQs
  const loadFAQs = async () => {
    try {
      setLoading(prev => ({ ...prev, faqs: true }));
      const response = await axios.get(`${API_BASE}/faqs/`);
      if (response.data.success) {
        setFaqs(response.data.faqs);
      }
    } catch (error) {
      console.error('Failed to load FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(prev => ({ ...prev, faqs: false }));
    }
  };
  
  // Load popular questions
  const loadPopularQuestions = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE}/analytics/popular-questions/?days=7&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPopularQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Failed to load popular questions:', error);
    }
  };
  
  // Load stats
  const loadStats = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE}/analytics/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(prev => ({ ...prev, ...response.data.analytics }));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };
  
  // Load chat messages
  const loadChatMessages = async (sessionId) => {
    try {
      const response = await axios.get(`${API_BASE}/session/${sessionId}/`);
      if (response.data.success) {
        setMessages(response.data.chat.messages);
        setActiveChat(response.data.chat);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load chat messages');
    }
  };
  
  // Send human response
  const sendHumanResponse = async () => {
    if (!inputMessage.trim() || !activeChat) return;
    
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE}/human-response/`,
        {
          session_id: activeChat.session_id,
          response: inputMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Add message to local state
        const newMessage = {
          id: Date.now(),
          message_type: 'human_response',
          content: inputMessage,
          created_at: new Date().toISOString(),
          sender_info: { full_name: 'You', role: 'admin/hr' }
        };
        
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        
        // Update chat status if needed
        if (activeChat.status === 'human_requested' || activeChat.status === 'escalated') {
          await updateChatStatus(activeChat.id, 'human_responding');
        }
        
        toast.success('Response sent successfully');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to send response:', error);
      toast.error('Failed to send response');
    }
  };
  
  // Update chat status
  const updateChatStatus = async (chatId, newStatus) => {
    try {
      const token = getAuthToken();
      const response = await axios.patch(
        `${API_BASE}/chats/${chatId}/status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(`Chat status updated to ${newStatus}`);
        await loadChats();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };
  
  // Resolve chat
  const resolveChat = async (chatId) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE}/chats/${chatId}/resolve/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Chat marked as resolved');
        if (activeChat?.id === chatId) {
          setActiveChat(null);
          setMessages([]);
        }
        await loadChats();
      }
    } catch (error) {
      console.error('Failed to resolve chat:', error);
      toast.error('Failed to resolve chat');
    }
  };
  
  // Take over chat
  const takeOverChat = async (chatId) => {
    try {
      const token = getAuthToken();
      await updateChatStatus(chatId, 'human_responding');
      toast.success('You have taken over this chat');
    } catch (error) {
      console.error('Failed to take over chat:', error);
      toast.error('Failed to take over chat');
    }
  };
  
  // Save FAQ
  const saveFAQ = async () => {
    try {
      const token = getAuthToken();
      const faqData = {
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        category: faqForm.category,
        keywords: faqForm.keywords
      };
      
      if (!faqData.question || !faqData.answer) {
        toast.error('Question and answer are required');
        return;
      }
      
      let response;
      if (editingFAQ) {
        response = await axios.put(
          `${API_BASE}/faqs/${editingFAQ.id}/`,
          faqData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          `${API_BASE}/create-faq/`,
          faqData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      if (response.data.success) {
        toast.success(editingFAQ ? 'FAQ updated successfully' : 'FAQ created successfully');
        setShowFAQModal(false);
        resetFAQForm();
        await loadFAQs();
        await loadPopularQuestions();
      }
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      toast.error(error.response?.data?.error || 'Failed to save FAQ');
    }
  };
  
  // Delete FAQ
  const deleteFAQ = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${API_BASE}/faqs/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('FAQ deleted successfully');
        await loadFAQs();
      }
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };
  
  // Reset FAQ form
  const resetFAQForm = () => {
    setFaqForm({
      question: '',
      answer: '',
      category: 'general',
      keywords: ''
    });
    setEditingFAQ(null);
  };
  
  // Open edit FAQ modal
  const openEditFAQ = (faq) => {
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      keywords: faq.keywords
    });
    setEditingFAQ(faq);
    setShowFAQModal(true);
  };
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  // Apply chat filters
  useEffect(() => {
    let filtered = [...chats];
    
    // Apply status filter
    if (chatFilters.status !== 'all') {
      filtered = filtered.filter(chat => chat.status === chatFilters.status);
    }
    
    // Apply search filter
    if (chatFilters.search) {
      const searchLower = chatFilters.search.toLowerCase();
      filtered = filtered.filter(chat =>
        chat.session_id.toLowerCase().includes(searchLower) ||
        (chat.user_info?.full_name?.toLowerCase() || '').includes(searchLower) ||
        (chat.user_info?.work_mail_address?.toLowerCase() || '').includes(searchLower) ||
        (chat.work_mail_address?.toLowerCase() || '').includes(searchLower)
      );
    }
    
    // Hide resolved chats if needed
    if (!chatFilters.showResolved) {
      filtered = filtered.filter(chat => chat.status !== 'resolved');
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (chatFilters.sortBy === 'recent') {
        return new Date(b.updated_at) - new Date(a.updated_at);
      } else if (chatFilters.sortBy === 'oldest') {
        return new Date(a.updated_at) - new Date(b.updated_at);
      } else if (chatFilters.sortBy === 'most_messages') {
        return b.message_count - a.message_count;
      }
      return 0;
    });
    
    setFilteredChats(filtered);
  }, [chats, chatFilters]);
  
  // Apply FAQ filters
  const filteredFAQs = React.useMemo(() => {
    let filtered = [...faqs];
    
    if (faqFilters.search) {
      const searchLower = faqFilters.search.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchLower) ||
        faq.answer.toLowerCase().includes(searchLower) ||
        faq.keywords.toLowerCase().includes(searchLower)
      );
    }
    
    if (faqFilters.category !== 'all') {
      filtered = filtered.filter(faq => faq.category === faqFilters.category);
    }
    
    if (faqFilters.sortBy === 'popular') {
      filtered.sort((a, b) => b.times_asked - a.times_asked);
    } else if (faqFilters.sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    } else if (faqFilters.sortBy === 'helpful') {
      filtered.sort((a, b) => {
        const aRate = a.times_asked > 0 ? a.helpful_count / a.times_asked : 0;
        const bRate = b.times_asked > 0 ? b.helpful_count / b.times_asked : 0;
        return bRate - aRate;
      });
    }
    
    return filtered;
  }, [faqs, faqFilters]);
  
  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Render chat message
  const renderMessage = (message) => {
    const isHuman = message.message_type === 'human_response';
    const isAI = message.message_type === 'ai_response';
    const isSystem = message.message_type === 'system';
    
    return (
      <div key={message.id} className={`flex gap-3 ${isHuman ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isHuman ? 'bg-blue-600' : isAI ? 'bg-purple-100' : 'bg-gray-200'
        }`}>
          {isHuman ? '👤' : isAI ? '🤖' : '⚙️'}
        </div>
        
        <div className={`flex-1 max-w-[80%] ${isHuman ? 'text-right' : ''}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900">
              {message.sender_info?.full_name || 
               (isAI ? 'AI Assistant' : isSystem ? 'System' : 'User')}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(message.created_at)}
            </span>
          </div>
          
          <div className={`p-3 rounded-xl ${
            isHuman ? 'bg-blue-100 text-gray-900 rounded-br-none' :
            isAI ? 'bg-purple-50 text-gray-900 rounded-bl-none' :
            isSystem ? 'bg-gray-100 text-gray-700 rounded-bl-none' :
            'bg-gray-50 text-gray-900 rounded-bl-none'
          }`}>
            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
            
            {isAI && message.confidence && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Confidence:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        message.confidence > 0.7 ? 'bg-green-500' :
                        message.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${message.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600">{Math.round(message.confidence * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assistance Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage chat sessions, FAQs, and analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadAllData}
                disabled={loading.chats || loading.faqs}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Icons.Refresh className={loading.chats ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="mt-6 flex space-x-1">
            <button
              onClick={() => setActiveView('chats')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeView === 'chats'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icons.MessageSquare />
                Chats ({stats.total || 0})
              </span>
            </button>
            <button
              onClick={() => setActiveView('faqs')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeView === 'faqs'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icons.HelpCircle />
                FAQs ({faqs.length})
              </span>
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeView === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icons.BarChart />
                Analytics
              </span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icons.Users className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Chats</p>
                <p className="text-xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Icons.AlertTriangle className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Escalated</p>
                <p className="text-xl font-bold text-gray-900">{stats.escalated || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icons.Hourglass className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Human Requested</p>
                <p className="text-xl font-bold text-gray-900">{stats.human_requested || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icons.CheckCircle className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-xl font-bold text-gray-900">{stats.resolved || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icons.Bot className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">AI Handled</p>
                <p className="text-xl font-bold text-gray-900">{stats.ai_handled || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Icons.Clock className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-xl font-bold text-gray-900">{stats.avg_response_time || 0}s</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        {activeView === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chat List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Chat Sessions</h2>
                    <span className="text-sm text-gray-600">
                      {filteredChats.length} of {chats.length}
                    </span>
                  </div>
                  
                  {/* Filters */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <select
                        value={chatFilters.status}
                        onChange={(e) => setChatFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="human_requested">Human Requested</option>
                        <option value="escalated">Escalated</option>
                        <option value="human_responding">Human Responding</option>
                        <option value="ai_handled">AI Handled</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      
                      <select
                        value={chatFilters.sortBy}
                        onChange={(e) => setChatFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="oldest">Oldest</option>
                        <option value="most_messages">Most Messages</option>
                      </select>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={chatFilters.search}
                        onChange={(e) => setChatFilters(prev => ({ ...prev, search: e.target.value }))}
                      />
                      <Icons.Search className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showResolved"
                        checked={chatFilters.showResolved}
                        onChange={(e) => setChatFilters(prev => ({ ...prev, showResolved: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <label htmlFor="showResolved" className="ml-2 text-sm text-gray-600">
                        Show resolved chats
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Chat List */}
                <div className="overflow-y-auto max-h-[600px]">
                  {loading.chats ? (
                    <div className="p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading chats...</p>
                    </div>
                  ) : filteredChats.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Icons.MessageSquare className="text-4xl mx-auto mb-4 text-gray-300" />
                      <p>No chats found</p>
                      <p className="text-sm mt-1">Try changing your filters</p>
                    </div>
                  ) : (
                    filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                          activeChat?.id === chat.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => loadChatMessages(chat.session_id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900 truncate">
                                {chat.user_info?.full_name || 'Anonymous User'}
                              </h3>
                              <StatusBadge status={chat.status} />
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {chat.user_info?.work_mail_address || chat.work_mail_address || 'No work_mail_address'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span className="truncate">
                            Session: {chat.session_id.slice(0, 8)}...
                          </span>
                          <TimeAgo dateString={chat.updated_at} />
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            {chat.message_count} messages
                          </span>
                          <div className="flex gap-2">
                            {chat.status === 'human_requested' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  takeOverChat(chat.id);
                                }}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                              >
                                Take Over
                              </button>
                            )}
                            {chat.status === 'human_responding' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resolveChat(chat.id);
                                }}
                                className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Chat Interface */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow h-full flex flex-col">
                {activeChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {activeChat.user_info?.full_name || 'Anonymous User'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {activeChat.user_info?.work_mail_address || activeChat.work_mail_address || 'No work_mail_address'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={activeChat.status} />
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              Started: {formatDate(activeChat.created_at)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Last: <TimeAgo dateString={activeChat.updated_at} />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mt-4">
                        {activeChat.status === 'human_requested' && (
                          <button
                            onClick={() => takeOverChat(activeChat.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Take Over Chat
                          </button>
                        )}
                        {activeChat.status === 'human_responding' && (
                          <button
                            onClick={() => resolveChat(activeChat.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            Mark as Resolved
                          </button>
                        )}
                        {activeChat.status === 'ai_handled' && (
                          <button
                            onClick={() => updateChatStatus(activeChat.id, 'escalated')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                          >
                            Escalate to Human
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
                      {messages.map(renderMessage)}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Input Area */}
                    <div className="p-4 border-t">
                      <div className="flex gap-3">
                        <textarea
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Type your response..."
                          rows="3"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendHumanResponse();
                            }
                          }}
                        />
                        <button
                          onClick={sendHumanResponse}
                          disabled={!inputMessage.trim()}
                          className={`self-end px-6 py-3 rounded-lg font-medium ${
                            inputMessage.trim()
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Icons.Send />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <Icons.MessageSquare className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Chat Selected</h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Select a chat from the list to view messages and respond to users
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'faqs' && (
          <div className="space-y-6">
            {/* FAQ Management Header */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">FAQ Knowledge Base</h2>
                  <p className="text-gray-600 mt-1">Manage frequently asked questions</p>
                </div>
                <button
                  onClick={() => {
                    resetFAQForm();
                    setShowFAQModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Icons.Plus />
                  Add FAQ
                </button>
              </div>
              
              {/* FAQ Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={faqFilters.search}
                    onChange={(e) => setFaqFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                  <Icons.Search className="absolute left-3 top-2.5 text-gray-400" />
                </div>
                
                <select
                  value={faqFilters.category}
                  onChange={(e) => setFaqFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="billing">Billing</option>
                </select>
                
                <select
                  value={faqFilters.sortBy}
                  onChange={(e) => setFaqFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="popular">Most Popular</option>
                  <option value="recent">Recently Updated</option>
                  <option value="helpful">Most Helpful</option>
                </select>
              </div>
              
              {/* FAQs Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asked</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Helpful Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFAQs.map((faq) => (
                      <tr key={faq.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <div className="font-medium text-gray-900 mb-1">{faq.question}</div>
                            {faq.keywords && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {faq.keywords.split(',').map((keyword, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                  >
                                    {keyword.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            faq.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                            faq.category === 'account' ? 'bg-green-100 text-green-800' :
                            faq.category === 'mentorship' ? 'bg-purple-100 text-purple-800' :
                            faq.category === 'billing' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {faq.category_display || faq.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{faq.times_asked}</div>
                            <div className="text-xs text-gray-500">times</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ 
                                  width: `${faq.times_asked > 0 ? 
                                    (faq.helpful_count / faq.times_asked * 100) : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {faq.times_asked > 0 ? 
                                Math.round((faq.helpful_count / faq.times_asked) * 100) : 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditFAQ(faq)}
                              className="p-2 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Icons.Edit className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => deleteFAQ(faq.id)}
                              className="p-2 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Icons.Trash className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredFAQs.length === 0 && (
                  <div className="p-12 text-center">
                    <Icons.HelpCircle className="text-4xl mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No FAQs Found</h3>
                    <p className="text-gray-600">
                      {faqFilters.search ? 'Try a different search term' : 'Create your first FAQ'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Popular Questions */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Questions (Last 7 Days)</h3>
              <div className="space-y-3">
                {popularQuestions.map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Asked {item.count} times
                          </span>
                          <span className="text-xs text-gray-500">
                            Last: {formatDate(item.last_asked)}
                          </span>
                        </div>
                        <p className="text-gray-900">{item.question}</p>
                        
                        {item.matching_faqs.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2">Matching FAQs:</p>
                            <div className="space-y-2">
                              {item.matching_faqs.map((faq) => (
                                <div key={faq.id} className="text-sm p-2 bg-gray-50 rounded">
                                  <div className="font-medium text-gray-900">{faq.question}</div>
                                  <div className="text-gray-600 text-xs mt-1">
                                    Asked {faq.times_asked} times • {faq.helpful_count} helpful
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setFaqForm({
                            question: item.question,
                            answer: '',
                            category: 'general',
                            keywords: ''
                          });
                          setShowFAQModal(true);
                        }}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
                      >
                        Create FAQ
                      </button>
                    </div>
                  </div>
                ))}
                
                {popularQuestions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Icons.TrendingUp className="text-4xl mx-auto mb-4 text-gray-300" />
                    <p>No popular questions data yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resolution Rate */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolution Rate</h3>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {stats.resolution_rate ? Math.round(stats.resolution_rate) : 0}%
                  </div>
                  <p className="text-gray-600">of chats are resolved</p>
                </div>
              </div>
            </div>
            
            {/* Response Time */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Response Time</h3>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {stats.avg_response_time || 0}s
                  </div>
                  <p className="text-gray-600">average response time</p>
                </div>
              </div>
            </div>
            
            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Status Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries({
                  'AI Handled': stats.ai_handled || 0,
                  'Human Requested': stats.human_requested || 0,
                  'Escalated': stats.escalated || 0,
                  'Human Responding': stats.human_responding || 0,
                  'Resolved': stats.resolved || 0,
                }).map(([label, count]) => (
                  <div key={label} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                    <div className="text-sm text-gray-600">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* FAQ Modal */}
      {showFAQModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Question *
                </label>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="What question are users asking?"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Answer *
                </label>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="5"
                  placeholder="Provide a clear, helpful answer..."
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Category
                </label>
                <select
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="billing">Billing</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="password, reset, login, account..."
                  value={faqForm.keywords}
                  onChange={(e) => setFaqForm({ ...faqForm, keywords: e.target.value })}
                />
                <p className="mt-2 text-sm text-gray-500">
                  These keywords help users find this FAQ when searching
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowFAQModal(false);
                  resetFAQForm();
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveFAQ}
                disabled={!faqForm.question.trim() || !faqForm.answer.trim()}
                className={`px-6 py-3 rounded-lg font-medium ${
                  faqForm.question.trim() && faqForm.answer.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}