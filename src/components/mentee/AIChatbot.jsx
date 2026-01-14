import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

// Icons Component
const Icons = {
    Bot: ({ className }) => <div className={className}>🤖</div>,
    User: ({ className }) => <div className={className}>👤</div>,
    Send: ({ className }) => <div className={className}>📤</div>,
    MessageSquare: ({ className }) => <div className={className}>💬</div>,
    Clock: ({ className }) => <div className={className}>⏱️</div>,
    CheckCircle: ({ className }) => <div className={className}>✅</div>,
    AlertCircle: ({ className }) => <div className={className}>⚠️</div>,
    Search: ({ className }) => <div className={className}>🔍</div>,
    Refresh: ({ className }) => <div className={className}>🔄</div>,
    HelpCircle: ({ className }) => <div className={className}>❓</div>,
    History: ({ className }) => <div className={className}>📜</div>,
    Book: ({ className }) => <div className={className}>📚</div>,
    Mail: ({ className }) => <div className={className}>✉️</div>,
    Star: ({ className }) => <div className={className}>⭐</div>,
    ThumbsUp: ({ className }) => <div className={className}>👍</div>,
    ThumbsDown: ({ className }) => <div className={className}>👎</div>,
    ChevronDown: ({ className }) => <div className={className}>⌄</div>,
    ChevronUp: ({ className }) => <div className={className}>⌃</div>,
    ExternalLink: ({ className }) => <div className={className}>↗️</div>,
};

const StatusBadge = ({ status }) => {
    const statusConfig = {
        'ai_handled': { color: 'purple', label: 'AI Handled', icon: '🤖' },
        'human_requested': { color: 'yellow', label: 'Support Requested', icon: '⏳' },
        'escalated': { color: 'red', label: 'Escalated', icon: '⚠️' },
        'human_responding': { color: 'blue', label: 'Support Responding', icon: '👨‍💼' },
        'resolved': { color: 'green', label: 'Resolved', icon: '✅' },
    };

    const config = statusConfig[status] || { color: 'gray', label: status, icon: '❓' };

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
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
            try {
                if (!dateString) {
                    setTimeAgo('Unknown');
                    return;
                }

                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    setTimeAgo('Invalid date');
                    return;
                }

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
            } catch (error) {
                console.error('Error calculating time ago:', error);
                setTimeAgo('Error');
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);

        return () => clearInterval(interval);
    }, [dateString]);

    return <span className="text-xs text-gray-500">{timeAgo}</span>;
};

export default function UserAssistancePage() {
    // State management
    const [activeTab, setActiveTab] = useState('new'); // 'new', 'history', 'faqs'
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [waitingForHuman, setWaitingForHuman] = useState(false);

    // History states
    const [myChats, setMyChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loadingChats, setLoadingChats] = useState(false);
    const [chatStats, setChatStats] = useState({
        total: 0,
        resolved: 0,
        active: 0,
        escalated: 0
    });

    // FAQ states
    const [faqs, setFaqs] = useState([]);
    const [faqSearch, setFaqSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedFaqs, setExpandedFaqs] = useState({});

    // Refs
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const API_BASE = 'http://127.0.0.1:8000/assistance';

    // Auth helper
    const getAuthToken = () => localStorage.getItem('access_token');
    const getUserData = () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    };

    // Initialize
    useEffect(() => {
        const user = getUserData();
        if (user && user.email) {
            setUserEmail(user.email);
        }

        if (activeTab === 'history') {
            loadMyChats();
        } else if (activeTab === 'faqs') {
            loadFAQs();
        }
    }, [activeTab]);

    // Start new assistance session
    // Start new assistance session
    const startNewSession = async (initialQuestion = '') => {
        try {
            const token = getAuthToken();
            const user = getUserData();

            const response = await axios.post(
                `${API_BASE}/start/`,
                {
                    email: user?.email,
                    question: initialQuestion
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                const newSessionId = response.data.session_id;
                setSessionId(newSessionId);
                setIsChatOpen(true);
                setActiveTab('new');

                // Initialize messages with proper timestamps
                const initialMessages = [];
                const now = new Date();

                if (response.data.ai_response) {
                    initialMessages.push({
                        id: 'welcome',
                        type: 'bot',
                        content: `👋 Hello! I'm your AI assistant. How can I help you today?`,
                        timestamp: now.toISOString() // Use ISO string for consistency
                    });

                    initialMessages.push({
                        id: 'ai-response',
                        type: 'bot',
                        content: response.data.ai_response,
                        timestamp: now.toISOString(),
                        confidence: response.data.confidence
                    });

                    if (response.data.requires_email) {
                        setShowEmailInput(true);
                    }

                    if (response.data.escalated) {
                        setWaitingForHuman(true);
                    }
                }

                setMessages(initialMessages);

                // Add FAQ suggestions if available
                if (response.data.faq_suggestions && response.data.faq_suggestions.length > 0) {
                    setTimeout(() => {
                        const suggestionTime = new Date().toISOString();
                        setMessages(prev => [...prev, {
                            id: 'faq-suggestions',
                            type: 'bot',
                            content: 'Here are some FAQs that might help:',
                            timestamp: suggestionTime,
                            faqSuggestions: response.data.faq_suggestions
                        }]);
                    }, 1000);
                }

                return newSessionId;
            }
        } catch (error) {
            console.error('Failed to start session:', error);
            toast.error('Failed to start assistance session');
        }
    };

    // Ask a question
    // Ask a question
    const askQuestion = async (question) => {
        if (!question.trim() || !sessionId) return;

        try {
            setIsThinking(true);

            // Add user message with proper timestamp
            const userMessage = {
                id: `user-${Date.now()}`,
                type: 'user',
                content: question,
                timestamp: new Date().toISOString() // Use ISO string
            };

            setMessages(prev => [...prev, userMessage]);
            setInputMessage('');

            // Send to backend
            const token = getAuthToken();
            const response = await axios.post(
                `${API_BASE}/ask/`,
                {
                    session_id: sessionId,
                    question: question
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // Add AI response with proper timestamp
                const aiMessage = {
                    id: `ai-${Date.now()}`,
                    type: 'bot',
                    content: response.data.response,
                    timestamp: new Date().toISOString(), // Use ISO string
                    confidence: response.data.confidence
                };

                setMessages(prev => [...prev, aiMessage]);

                // Handle special cases
                if (response.data.requires_email) {
                    setShowEmailInput(true);
                }

                if (response.data.escalated) {
                    setWaitingForHuman(true);
                    setShowEmailInput(false);

                    // Add escalation message with proper timestamp
                    setTimeout(() => {
                        const escalationTime = new Date().toISOString();
                        setMessages(prev => [...prev, {
                            id: `escalated-${Date.now()}`,
                            type: 'bot',
                            content: 'Your question has been escalated to our support team. They will contact you via email.',
                            timestamp: escalationTime
                        }]);
                    }, 500);
                }

                // Scroll to bottom
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to ask question:', error);
            toast.error('Failed to get response');

            // Add error message with proper timestamp
            const errorTime = new Date().toISOString();
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                type: 'bot',
                content: 'Sorry, I encountered an error. Please try again or contact support.',
                timestamp: errorTime
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    // Submit email
    const submitEmail = async () => {
        if (!userEmail.trim()) {
            toast.error('Please enter your email');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE}/ask/`, {
                session_id: sessionId,
                question: 'User provided email for assistance',
                email: userEmail
            });

            if (response.data.success) {
                setEmailSent(true);
                setWaitingForHuman(true);
                setShowEmailInput(false);

                toast.success('Email submitted successfully');

                // Add confirmation message
                setMessages(prev => [...prev, {
                    id: `email-confirm-${Date.now()}`,
                    type: 'bot',
                    content: `Thank you! We've received your email (${userEmail}). Our support team will contact you within 24 hours.`,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error('Failed to submit email:', error);
            toast.error('Failed to submit email');
        }
    };

    // Load user's chat history
    const loadMyChats = async () => {
        try {
            setLoadingChats(true);
            const token = getAuthToken();

            const response = await axios.get(`${API_BASE}/my/chats/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMyChats(response.data.chats);
                setChatStats(response.data.stats);
            }
        } catch (error) {
            console.error('Failed to load chats:', error);
            toast.error('Failed to load chat history');
        } finally {
            setLoadingChats(false);
        }
    };

    // Load chat details
    // Load chat details
    const loadChatDetails = async (chat) => {
        try {
            const response = await axios.get(`${API_BASE}/chat/${chat.session_id}/`);

            if (response.data.success) {
                setSelectedChat(response.data.chat);

                // Ensure messages have proper timestamps
                const messagesWithValidTimestamps = (response.data.chat.messages || []).map(msg => ({
                    ...msg,
                    timestamp: msg.created_at || msg.timestamp || new Date().toISOString()
                }));

                setMessages(messagesWithValidTimestamps);
                setSessionId(chat.session_id);
                setIsChatOpen(true);
                setActiveTab('new');
            }
        } catch (error) {
            console.error('Failed to load chat details:', error);
            toast.error('Failed to load chat details');
        }
    };

    // Continue existing chat
    // Continue existing chat
    const continueChat = async (question) => {
        if (!sessionId || !question.trim()) return;

        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${API_BASE}/chat/${sessionId}/continue/`,
                { question },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const now = new Date().toISOString();
                // Add messages with proper timestamps
                setMessages(prev => [...prev,
                {
                    id: `user-${Date.now()}`,
                    type: 'user',
                    content: question,
                    timestamp: now
                },
                {
                    id: `ai-${Date.now()}`,
                    type: 'bot',
                    content: response.data.response,
                    timestamp: now,
                    confidence: response.data.confidence
                }
                ]);

                // Update chat status
                if (selectedChat) {
                    setSelectedChat({
                        ...selectedChat,
                        status: response.data.current_status
                    });
                }

                // Refresh chat list
                loadMyChats();

                // Handle special cases
                if (response.data.requires_email) {
                    setShowEmailInput(true);
                }

                if (response.data.escalated) {
                    setWaitingForHuman(true);
                }

                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to continue chat:', error);
            toast.error('Failed to send message');
        }
    };

    // Mark chat as resolved
    // Generic function to mark chat as resolved
    const markAsResolved = async (sessionId) => {
        const token = getAuthToken();
        const user = getUserData();

        // Try different endpoint patterns
        const endpointsToTry = [
            // Pattern 1: Using session_id directly
            {
                url: `${API_BASE}/my/chats/${sessionId}/resolve/`,
                method: 'post',
                data: {}
            },
            // Pattern 2: Using session_id in body
            {
                url: `${API_BASE}/my/chats/resolve/`,
                method: 'post',
                data: { session_id: sessionId }
            },
            // Pattern 3: Find chat_id first, then use it
            {
                url: null, // Will be determined dynamically
                method: 'post',
                data: {},
                requiresChatId: true
            },
            // Pattern 4: Update status endpoint
            {
                url: null, // Will be determined dynamically
                method: 'patch',
                data: { status: 'resolved' },
                requiresChatId: true
            }
        ];

        for (const endpoint of endpointsToTry) {
            try {
                let finalUrl = endpoint.url;
                let finalData = endpoint.data;

                // If endpoint requires chat_id, find it first
                if (endpoint.requiresChatId) {
                    const chat = myChats.find(c => c.session_id === sessionId);
                    if (!chat || !chat.id) {
                        continue; // Try next endpoint
                    }

                    if (endpoint.method === 'post') {
                        finalUrl = `${API_BASE}/chats/${chat.id}/resolve/`;
                    } else if (endpoint.method === 'patch') {
                        finalUrl = `${API_BASE}/chats/${chat.id}/status/`;
                    }
                }

                if (!finalUrl) continue;

                const config = {
                    method: endpoint.method,
                    url: finalUrl,
                    headers: { Authorization: `Bearer ${token}` },
                    data: finalData
                };

                const response = await axios(config);

                if (response.data.success) {
                    toast.success('Chat marked as resolved');
                    loadMyChats();

                    if (selectedChat && selectedChat.session_id === sessionId) {
                        setSelectedChat({
                            ...selectedChat,
                            status: 'resolved'
                        });
                    }

                    return true; // Success
                }
            } catch (error) {
                console.log(`Endpoint ${endpoint.url || endpoint.method} failed:`, error.message);
                // Continue to next endpoint
            }
        }

        // If all endpoints failed
        toast.error('Unable to mark chat as resolved. Please contact support.');
        return false;
    };

    // Load FAQs
    const loadFAQs = async () => {
        try {
            const response = await axios.get(`${API_BASE}/faqs/`);
            if (response.data.success) {
                setFaqs(response.data.faqs);
            }
        } catch (error) {
            console.error('Failed to load FAQs:', error);
            toast.error('Failed to load FAQs');
        }
    };

    // Toggle FAQ expansion
    const toggleFaq = (faqId) => {
        setExpandedFaqs(prev => ({
            ...prev,
            [faqId]: !prev[faqId]
        }));
    };

    // Filter FAQs
    const filteredFAQs = React.useMemo(() => {
        let filtered = [...faqs];

        // Apply search filter
        if (faqSearch) {
            const searchLower = faqSearch.toLowerCase();
            filtered = filtered.filter(faq =>
                faq.question.toLowerCase().includes(searchLower) ||
                faq.answer.toLowerCase().includes(searchLower) ||
                faq.keywords.toLowerCase().includes(searchLower)
            );
        }

        // Apply category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(faq => faq.category === selectedCategory);
        }

        // Sort by popularity
        filtered.sort((a, b) => b.times_asked - a.times_asked);

        return filtered;
    }, [faqs, faqSearch, selectedCategory]);

    // Scroll to bottom
    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Handle FAQ click
    const handleFaqClick = (faq) => {
        if (!isChatOpen || !sessionId) {
            // Start new session with FAQ question
            startNewSession(faq.question);
        } else {
            // Ask about this FAQ in existing chat
            askQuestion(faq.question);
        }
    };

    // Quick questions
    const quickQuestions = [
        'How do I reset my password?',
        'How can I find a mentor?',
        'How do I update my profile?',
        'What are the platform fees?',
        'How do I schedule a session?',
        'How can I contact support?'
    ];

    // FAQ categories
    const faqCategories = [
        { value: 'all', label: 'All Categories' },
        { value: 'general', label: 'General' },
        { value: 'technical', label: 'Technical' },
        { value: 'account', label: 'Account' },
        { value: 'mentorship', label: 'Mentorship' },
        { value: 'billing', label: 'Billing' }
    ];

    // Render message
    // Render message
    const renderMessage = (message) => {
        const isUser = message.type === 'user';
        const isBot = message.type === 'bot';

        // Safely parse timestamp
        let formattedTime = '';
        try {
            if (message.timestamp) {
                const date = new Date(message.timestamp);
                if (!isNaN(date.getTime())) {
                    formattedTime = format(date, 'h:mm a');
                }
            }
        } catch (error) {
            console.warn('Failed to format timestamp:', error);
        }

        return (
            <div key={message.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-600' : 'bg-purple-100'
                    }`}>
                    {isUser ? <Icons.User /> : <Icons.Bot />}
                </div>

                <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                    <div className={`p-3 rounded-xl ${isUser ? 'bg-blue-600 text-white rounded-br-none' :
                        'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}>
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                        {message.confidence && (
                            <div className="mt-2 pt-2 border-t border-white/30">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-600">Confidence:</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full ${message.confidence > 0.7 ? 'bg-green-500' :
                                                message.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${message.confidence * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-gray-600">{Math.round(message.confidence * 100)}%</span>
                                </div>
                            </div>
                        )}

                        {message.faqSuggestions && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="space-y-2">
                                    {message.faqSuggestions.map((faq, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleFaqClick(faq)}
                                            className="block w-full text-left p-2 bg-white hover:bg-blue-50 rounded border border-gray-200 hover:border-blue-300 text-sm"
                                        >
                                            <div className="font-medium text-gray-900">{faq.question}</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                Asked {faq.times_asked} times
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {formattedTime && (
                        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : ''}`}>
                            {formattedTime}
                        </div>
                    )}
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
                            <h1 className="text-3xl font-bold text-gray-900">AI Assistance</h1>
                            <p className="text-gray-600 mt-1">Get help with your questions and issues</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (isChatOpen) {
                                        setIsChatOpen(false);
                                        setMessages([]);
                                        setSessionId(null);
                                        setSelectedChat(null);
                                    } else {
                                        startNewSession();
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Icons.MessageSquare />
                                {isChatOpen ? 'Close Chat' : 'New Chat'}
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-6 flex space-x-1">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'new'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Icons.MessageSquare />
                                New Assistance
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'history'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Icons.History />
                                Chat History ({chatStats.total})
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('faqs')}
                            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'faqs'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Icons.Book />
                                FAQs
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Icons.MessageSquare className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Chats</p>
                                <p className="text-xl font-bold text-gray-900">{chatStats.total}</p>
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
                                <p className="text-xl font-bold text-gray-900">{chatStats.resolved}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Icons.AlertCircle className="text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-xl font-bold text-gray-900">{chatStats.active}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <Icons.AlertCircle className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Escalated</p>
                                <p className="text-xl font-bold text-gray-900">{chatStats.escalated}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {activeTab === 'new' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Quick Actions */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions</h2>
                                <div className="space-y-3">
                                    {quickQuestions.map((question, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (!isChatOpen || !sessionId) {
                                                    startNewSession(question);
                                                } else {
                                                    askQuestion(question);
                                                }
                                            }}
                                            className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                        >
                                            <div className="text-sm text-gray-900">{question}</div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <Icons.ExternalLink className="text-xs" />
                                                Click to ask
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Need Help?</h3>
                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-600">
                                            • AI assistant available 24/7
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            • Human support for complex issues
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            • Typically respond within 24 hours
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Session Info */}
                            {isChatOpen && sessionId && (
                                <div className="bg-white rounded-xl shadow p-6 mt-6">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Current Session</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Session ID:</span>
                                            <span className="font-mono text-gray-900">{sessionId.slice(0, 8)}...</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Messages:</span>
                                            <span className="font-medium text-gray-900">{messages.length}</span>
                                        </div>
                                        {selectedChat && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Status:</span>
                                                <StatusBadge status={selectedChat.status} />
                                            </div>
                                        )}
                                        <div className="pt-3 border-t">
                                            <button
                                                onClick={() => {
                                                    setIsChatOpen(false);
                                                    setMessages([]);
                                                    setSessionId(null);
                                                    setSelectedChat(null);
                                                    setShowEmailInput(false);
                                                    setWaitingForHuman(false);
                                                }}
                                                className="w-full text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                                            >
                                                End Session
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Chat Interface */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow h-full flex flex-col">
                                {isChatOpen ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="p-4 border-b">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        AI Assistance Chat
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Session: {sessionId?.slice(0, 8)}...
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {selectedChat && (
                                                        <StatusBadge status={selectedChat.status} />
                                                    )}
                                                    <button
                                                        onClick={loadMyChats}
                                                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
                                                    >
                                                        View History
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div
                                            ref={chatContainerRef}
                                            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]"
                                        >
                                            {messages.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full p-8">
                                                    <Icons.MessageSquare className="text-6xl text-gray-300 mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-700 mb-2">Start a Conversation</h3>
                                                    <p className="text-gray-600 text-center">
                                                        Ask a question or choose from the quick questions on the left
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {messages.map(renderMessage)}
                                                    {isThinking && (
                                                        <div className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                                <Icons.Bot />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="p-3 bg-gray-100 rounded-xl rounded-bl-none">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="flex space-x-1">
                                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                                        </div>
                                                                        <span className="text-sm text-gray-600">Thinking...</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div ref={messagesEndRef} />
                                                </>
                                            )}
                                        </div>

                                        {/* Email Input */}
                                        {showEmailInput && !emailSent && (
                                            <div className="p-4 border-t bg-yellow-50">
                                                <div className="flex items-center gap-3">
                                                    <Icons.Mail className="text-yellow-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-yellow-800 mb-2">
                                                            Please provide your email for assistance:
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="email"
                                                                value={userEmail}
                                                                onChange={(e) => setUserEmail(e.target.value)}
                                                                placeholder="your@email.com"
                                                                className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
                                                            />
                                                            <button
                                                                onClick={submitEmail}
                                                                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                                                            >
                                                                Submit
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Waiting for human */}
                                        {waitingForHuman && (
                                            <div className="p-4 border-t bg-blue-50">
                                                <div className="flex items-center gap-3">
                                                    <Icons.AlertCircle className="text-blue-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-800">
                                                            Your question has been escalated to support
                                                        </p>
                                                        <p className="text-sm text-blue-700 mt-1">
                                                            Our team will review your question and respond via email
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Input Area */}
                                        {!showEmailInput && !waitingForHuman && (
                                            <div className="p-4 border-t">
                                                <div className="flex gap-3">
                                                    <textarea
                                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                                        placeholder="Type your question here..."
                                                        rows="2"
                                                        value={inputMessage}
                                                        onChange={(e) => setInputMessage(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                if (selectedChat) {
                                                                    continueChat(inputMessage);
                                                                } else {
                                                                    askQuestion(inputMessage);
                                                                }
                                                            }
                                                        }}
                                                        disabled={isThinking}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (selectedChat) {
                                                                continueChat(inputMessage);
                                                            } else {
                                                                askQuestion(inputMessage);
                                                            }
                                                        }}
                                                        disabled={!inputMessage.trim() || isThinking}
                                                        className={`self-end px-4 py-3 rounded-lg font-medium ${inputMessage.trim() && !isThinking
                                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        <Icons.Send />
                                                    </button>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2 text-center">
                                                    Press Enter to send • Shift+Enter for new line
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                                        <Icons.HelpCircle className="text-6xl text-gray-300 mb-4" />
                                        <h3 className="text-xl font-medium text-gray-700 mb-2">Start a New Chat</h3>
                                        <p className="text-gray-600 text-center mb-6 max-w-md">
                                            Get instant help from our AI assistant. Ask questions about the platform,
                                            technical issues, or anything else you need help with.
                                        </p>
                                        <button
                                            onClick={() => startNewSession()}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                        >
                                            Start New Chat
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-white rounded-xl shadow">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Chat History</h2>
                                    <p className="text-gray-600 mt-1">View and continue your previous conversations</p>
                                </div>
                                <button
                                    onClick={loadMyChats}
                                    disabled={loadingChats}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Icons.Refresh className={loadingChats ? 'animate-spin' : ''} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Messages</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loadingChats ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center">
                                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <p className="mt-2 text-gray-600">Loading chat history...</p>
                                            </td>
                                        </tr>
                                    ) : myChats.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center">
                                                <Icons.History className="text-4xl mx-auto mb-4 text-gray-300" />
                                                <h3 className="text-lg font-medium text-gray-700 mb-2">No Chat History</h3>
                                                <p className="text-gray-600">Start a new chat to get assistance</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        myChats.map((chat) => (
                                            <tr key={chat.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs">
                                                        <div className="font-medium text-gray-900">
                                                            {chat.session_id.slice(0, 8)}...
                                                        </div>
                                                        {chat.user_info && (
                                                            <div className="text-sm text-gray-600">
                                                                {chat.user_info.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={chat.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold text-gray-900">{chat.message_count}</div>
                                                        <div className="text-xs text-gray-500">messages</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {format(new Date(chat.created_at), 'MMM d, yyyy')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {format(new Date(chat.created_at), 'h:mm a')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <TimeAgo dateString={chat.updated_at} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => loadChatDetails(chat)}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm"
                                                        >
                                                            View
                                                        </button>
                                                        {chat.status !== 'resolved' && (
                                                            <button
                                                                onClick={() => markAsResolved(chat.session_id)}
                                                                className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm"
                                                            >
                                                                Mark Resolved
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'faqs' && (
                    <div className="bg-white rounded-xl shadow">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                                    <p className="text-gray-600 mt-1">Find answers to common questions</p>
                                </div>
                                <button
                                    onClick={() => startNewSession()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Icons.MessageSquare />
                                    Ask New Question
                                </button>
                            </div>

                            {/* FAQ Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search FAQs..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={faqSearch}
                                        onChange={(e) => setFaqSearch(e.target.value)}
                                    />
                                    <Icons.Search className="absolute left-3 top-2.5 text-gray-400" />
                                </div>

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {faqCategories.map((category) => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>

                                <div className="text-sm text-gray-600 flex items-center">
                                    Showing {filteredFAQs.length} of {faqs.length} FAQs
                                </div>
                            </div>
                        </div>

                        {/* FAQs List */}
                        <div className="divide-y divide-gray-200">
                            {filteredFAQs.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Icons.HelpCircle className="text-4xl mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">No FAQs Found</h3>
                                    <p className="text-gray-600">
                                        {faqSearch ? 'Try a different search term' : 'No FAQs available'}
                                    </p>
                                </div>
                            ) : (
                                filteredFAQs.map((faq) => (
                                    <div key={faq.id} className="p-6 hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        onClick={() => toggleFaq(faq.id)}
                                                        className="mt-1 p-1 hover:bg-gray-200 rounded"
                                                    >
                                                        {expandedFaqs[faq.id] ? (
                                                            <Icons.ChevronUp className="text-gray-500" />
                                                        ) : (
                                                            <Icons.ChevronDown className="text-gray-500" />
                                                        )}
                                                    </button>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            {faq.question}
                                                        </h3>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className={`px-2 py-1 rounded text-xs ${faq.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                                                                faq.category === 'account' ? 'bg-green-100 text-green-800' :
                                                                    faq.category === 'mentorship' ? 'bg-purple-100 text-purple-800' :
                                                                        faq.category === 'billing' ? 'bg-red-100 text-red-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {faq.category}
                                                            </span>
                                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Icons.Star />
                                                                Asked {faq.times_asked} times
                                                            </span>
                                                            {faq.helpful_count > 0 && (
                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Icons.ThumbsUp />
                                                                    {faq.helpful_count} found helpful
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {expandedFaqs[faq.id] && (
                                                    <div className="mt-4 ml-10">
                                                        <div className="prose prose-sm max-w-none">
                                                            <div className="whitespace-pre-wrap text-gray-700 bg-gray-50 p-4 rounded-lg">
                                                                {faq.answer}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-4">
                                                            <div className="flex gap-2">
                                                                {faq.keywords && faq.keywords.split(',').map((keyword, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                                                    >
                                                                        {keyword.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            {/* <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => handleFaqClick(faq)}
                                                                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm flex items-center gap-1"
                                                                >
                                                                    <Icons.MessageSquare />
                                                                    Ask about this
                                                                </button>
                                                            </div> */}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}