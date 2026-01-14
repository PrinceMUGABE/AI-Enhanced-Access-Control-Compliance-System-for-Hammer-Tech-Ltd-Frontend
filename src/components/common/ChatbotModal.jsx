// components/common/ChatbotModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useWebSocket from '../../hooks/useWebSocket';

const ChatbotModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [faqCategories, setFaqCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryFaqs, setCategoryFaqs] = useState([]);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [waitingForHuman, setWaitingForHuman] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [escalationTimer, setEscalationTimer] = useState(null);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [userIsTyping, setUserIsTyping] = useState(false);
  const [lastUserInteraction, setLastUserInteraction] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const questionTimerRef = useRef(null);
  
  const API_BASE = 'http://127.0.0.1:8000/assistance';

  // Initialize WebSocket
  const { isConnected: wsConnected, sendMessage: sendWsMessage } = useWebSocket(
    sessionId,
    useCallback((data) => {
      console.log('WebSocket message received in modal:', data);
      
      switch (data.type) {
        case 'human_response':
          const humanMessage = {
            id: `human-${Date.now()}`,
            type: 'bot',
            content: `👨‍💼 Support Agent: ${data.content}`,
            timestamp: new Date(),
            isHuman: true
          };
          setMessages(prev => [...prev, humanMessage]);
          clearQuestionTimer();
          break;
          
        case 'human_joined':
          const joinedMessage = {
            id: `joined-${Date.now()}`,
            type: 'system',
            content: `👤 ${data.full_name} (${data.role}) has joined the chat`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, joinedMessage]);
          clearQuestionTimer();
          break;
          
        case 'ai_typing':
          setIsAITyping(data.is_typing);
          break;
          
        case 'ai_response':
          setIsThinking(false);
          setIsAITyping(false);
          clearQuestionTimer();
          
          const aiResponseMessage = {
            id: `ai-${Date.now()}`,
            type: 'bot',
            content: data.content,
            timestamp: new Date(data.timestamp),
            confidence: data.confidence,
            requiresEmail: data.requires_email
          };
          setMessages(prev => [...prev, aiResponseMessage]);
          
          // Only show email input if explicitly required and user is not authenticated
          if (data.requires_email && !userAuthenticated) {
            setTimeout(() => setShowEmailInput(true), 1000);
          }
          break;
          
        case 'user_message':
          break;
          
        default:
          console.log('Unhandled WebSocket message type:', data.type);
      }
    }, [userAuthenticated])
  );

  // Clear question timer
  const clearQuestionTimer = () => {
    if (questionTimerRef.current) {
      clearTimeout(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    setQuestionStartTime(null);
  };

  // Start question timer - triggers email request if AI takes too long
  const startQuestionTimer = () => {
    clearQuestionTimer();
    setQuestionStartTime(Date.now());
    
    // Set timer for 60 seconds (1 minute)
    questionTimerRef.current = setTimeout(() => {
      // Only show email input if:
      // 1. User is not authenticated
      // 2. User is not currently typing
      // 3. Email hasn't been sent yet
      // 4. Not already waiting for human
      // 5. AI is still thinking (hasn't responded)
      if (!userAuthenticated && !userIsTyping && !emailSent && !waitingForHuman && (isThinking || isAITyping)) {
        console.log('AI taking too long - requesting email');
        
        const timeoutMessage = {
          id: `timeout-${Date.now()}`,
          type: 'bot',
          content: 'I\'m having trouble finding the right answer. Please provide your email so our support team can assist you directly:',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, timeoutMessage]);
        setShowEmailInput(true);
        setIsThinking(false);
        setIsAITyping(false);
      }
    }, 60000); // 60 seconds
  };

  // Track user typing
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setUserIsTyping(true);
    setLastUserInteraction(Date.now());
    
    // Clear existing typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set user as not typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setUserIsTyping(false);
    }, 2000);
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setUserAuthenticated(!!token);
    
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.email) {
          setUserEmail(userData.email);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Initialize chat session
  const initializeChat = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const currentEmail = token ? (JSON.parse(localStorage.getItem('user') || '{}').email || '') : '';
      
      console.log('Initializing chat with email:', currentEmail || 'none (guest)');
      
      const response = await axios.post(`${API_BASE}/start/`, {
        email: currentEmail
      });

      if (response.data.success) {
        const newSessionId = response.data.session_id;
        setSessionId(newSessionId);
        
        const greeting = `${getGreeting()}! 👋 I'm your AI assistant. I can help you with questions about our platform.`;
        
        const welcomeMessage = {
          id: 'welcome',
          type: 'bot',
          content: greeting,
          timestamp: new Date(),
          isWelcome: true
        };

        setMessages([welcomeMessage]);
        await loadFAQCategories();
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      toast.error('Failed to initialize chat. Please refresh the page.');
    }
  };

  // Start escalation timer - removed as we now use question-specific timer
  const startEscalationTimer = () => {
    // Removed - we now handle this per question with startQuestionTimer
  };

  // Load FAQ categories from backend
  const loadFAQCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/faqs/`);
      if (response.data.success) {
        // Extract unique categories from FAQs
        const categories = [...new Set(response.data.faqs.map(faq => faq.category))];
        
        // Format categories for display
        const formattedCategories = categories.map(cat => ({
          value: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1)
        }));
        
        // Add "All FAQs" and "Other Questions" options
        setFaqCategories([
          { value: 'all', label: 'All FAQs' },
          ...formattedCategories,
          { value: 'other', label: 'Other Questions' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Set default categories if backend fails
      setFaqCategories([
        { value: 'all', label: 'All FAQs' },
        { value: 'other', label: 'Other Questions' }
      ]);
    }
  };

  // Load FAQs by category
  const loadFAQsByCategory = async (category) => {
    try {
      const categoryParam = category === 'all' ? '' : category;
      const response = await axios.get(`${API_BASE}/faqs/${categoryParam ? `?category=${categoryParam}` : ''}`);
      
      if (response.data.success) {
        const faqs = response.data.faqs || [];
        setCategoryFaqs(faqs);
        
        if (faqs.length > 0) {
          const categoryMessage = {
            id: `category-${Date.now()}`,
            type: 'bot',
            content: `Here are questions from the ${category === 'all' ? 'all' : category} category. Click on any question to see the answer:`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, categoryMessage]);
        } else {
          const noResultsMessage = {
            id: `no-results-${Date.now()}`,
            type: 'bot',
            content: `No FAQs found in ${category} category. You can type your question below.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, noResultsMessage]);
        }
      }
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryValue) => {
    setSelectedCategory(categoryValue);
    setShowWelcome(false);
    setLastUserInteraction(Date.now());
    
    if (categoryValue === 'other') {
      const otherMessage = {
        id: `other-${Date.now()}`,
        type: 'bot',
        content: 'Please type your question below and I\'ll help you find the answer.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, otherMessage]);
      setCategoryFaqs([]);
    } else {
      loadFAQsByCategory(categoryValue);
    }
  };

  // Handle FAQ question click
  const handleFAQClick = (faq) => {
    setLastUserInteraction(Date.now());
    
    const answerMessage = {
      id: `faq-answer-${Date.now()}`,
      type: 'bot',
      content: `**${faq.question}**\n\n${faq.answer}`,
      timestamp: new Date(),
      isFAQAnswer: true
    };
    
    setMessages(prev => [...prev, answerMessage]);
    
    const followupMessage = {
      id: `followup-${Date.now()}`,
      type: 'bot',
      content: 'Was this helpful? If you have more questions, please type below or choose another category.',
      timestamp: new Date()
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, followupMessage]);
    }, 500);
  };

  // Send message via HTTP
  const sendViaHTTP = async (question) => {
    try {
      const response = await axios.post(`${API_BASE}/ask/`, {
        session_id: sessionId,
        question: question,
        email: userEmail || undefined
      });

      if (response.data.success) {
        clearQuestionTimer();
        
        const botMessage = {
          id: `bot-${Date.now()}`,
          type: 'bot',
          content: response.data.response,
          timestamp: new Date(),
          confidence: response.data.confidence
        };

        setMessages(prev => [...prev, botMessage]);

        if (response.data.requires_email && !userAuthenticated) {
          setTimeout(() => {
            setShowEmailInput(true);
            setWaitingForHuman(false);
          }, 1000);
        } else if (response.data.escalated) {
          setWaitingForHuman(true);
          const escalatedMessage = {
            id: `escalated-${Date.now()}`,
            type: 'bot',
            content: 'Your question has been escalated to our support team. They will contact you soon.',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, escalatedMessage]);
          
          if (!userAuthenticated) {
            setTimeout(() => setShowEmailInput(true), 1000);
          }
        }
        
        return true;
      }
    } catch (error) {
      console.error('Failed to send message via HTTP:', error);
      clearQuestionTimer();
      throw error;
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isThinking) return;

    const question = inputValue.trim();
    
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);
    setIsAITyping(true);
    setUserIsTyping(false);
    setLastUserInteraction(Date.now());
    
    // Start the question timer
    startQuestionTimer();

    try {
      const wsSent = sendWsMessage({
        type: 'question',
        question: question
      });

      if (!wsSent) {
        console.log('WebSocket not available, falling back to HTTP');
        await sendViaHTTP(question);
        setIsAITyping(false);
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      clearQuestionTimer();
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again or provide your email for assistance.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      if (!userAuthenticated) {
        setShowEmailInput(true);
      }
    } finally {
      setIsThinking(false);
    }
  };

  // Handle email submission
  const handleEmailSubmit = async () => {
    if (!userEmail.trim() || !validateEmail(userEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await axios.post(`${API_BASE}/ask/`, {
        session_id: sessionId,
        question: 'User provided email for assistance',
        email: userEmail
      });

      setEmailSent(true);
      setWaitingForHuman(true);
      clearQuestionTimer();
      
      const confirmationMessage = {
        id: `email-confirm-${Date.now()}`,
        type: 'bot',
        content: `Thank you! We've received your email (${userEmail}). Our support team will contact you within 24 hours.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      setShowEmailInput(false);
      toast.success('Email submitted successfully');
      
      if (escalationTimer) {
        clearTimeout(escalationTimer);
      }
      
    } catch (error) {
      console.error('Failed to submit email:', error);
      toast.error('Failed to submit email. Please try again.');
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isAITyping]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  // Initialize chat when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeChat();
    } else {
      setMessages([]);
      setSelectedCategory(null);
      setCategoryFaqs([]);
      setShowEmailInput(false);
      setWaitingForHuman(false);
      setShowWelcome(true);
      setEmailSent(false);
      setUserEmail('');
      setIsThinking(false);
      setIsAITyping(false);
      setIsMinimized(false);
      setUserIsTyping(false);
      clearQuestionTimer();
      
      if (escalationTimer) {
        clearTimeout(escalationTimer);
        setEscalationTimer(null);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
    
    return () => {
      clearQuestionTimer();
      if (escalationTimer) {
        clearTimeout(escalationTimer);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showEmailInput && !emailSent) {
        handleEmailSubmit();
      } else if (!showEmailInput && !waitingForHuman) {
        handleSendMessage();
      }
    }
  };

  // Render message content
  const renderMessageContent = (message) => {
    if (message.isWelcome) {
      return (
        <div className="space-y-4">
          <div className="font-semibold text-gray-900 text-sm">{message.content}</div>
          
          {faqCategories.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-3 font-medium">Select a category to browse FAQs:</p>
              <div className="flex flex-wrap gap-2">
                {faqCategories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => handleCategorySelect(category.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedCategory === category.value
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } else if (message.isFAQAnswer) {
      return (
        <div className="space-y-2">
          {message.content.split('\n\n').map((paragraph, idx) => (
            <p 
              key={idx} 
              className={idx === 0 ? 'font-bold text-gray-900 text-sm' : 'text-gray-700 text-sm'}
            >
              {paragraph.replace(/\*\*(.*?)\*\*/g, '$1')}
            </p>
          ))}
        </div>
      );
    } else if (message.isHuman) {
      return (
        <div className="space-y-2">
          <div className="text-xs text-purple-600 font-semibold">Support Agent</div>
          <div className="text-gray-800 text-sm">{message.content}</div>
        </div>
      );
    } else {
      return (
        <div className="whitespace-pre-wrap text-gray-800 text-sm">{message.content}</div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Chat Widget Container - Bottom Right */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
        {/* Chat Window */}
        <div 
          className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ease-in-out ${
            isMinimized ? 'h-16 w-80' : 'h-[600px] w-[400px]'
          } flex flex-col overflow-hidden border border-gray-200`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Assistant</h3>
                  <div className="flex items-center gap-2 text-xs opacity-90">
                    <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <span>{wsConnected ? 'Connected' : 'Connecting...'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  <span className="text-white text-sm">{isMinimized ? '▲' : '▼'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                  title="Close"
                >
                  <span className="text-white text-sm">✕</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chat Content - Only show when not minimized */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                          : message.isHuman
                          ? 'bg-purple-50 border border-purple-100 rounded-bl-sm'
                          : 'bg-white border border-gray-200 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {renderMessageContent(message)}
                      <div className={`text-xs mt-1.5 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* FAQ Questions List */}
                {selectedCategory && categoryFaqs.length > 0 && !showWelcome && (
                  <div className="mt-3 mb-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Questions in {selectedCategory === 'all' ? 'All Categories' : selectedCategory}:
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {categoryFaqs.map((faq) => (
                        <button
                          key={faq.id}
                          onClick={() => handleFAQClick(faq)}
                          className="w-full text-left p-2 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-gray-700 group-hover:text-blue-700 font-medium">
                              {faq.question.length > 60 ? `${faq.question.substring(0, 60)}...` : faq.question}
                            </span>
                            <span className="text-blue-500 group-hover:text-blue-700 text-xs">→</span>
                          </div>
                          {faq.category && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {faq.category}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Typing Indicator */}
                {(isThinking || isAITyping) && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-xl rounded-bl-sm p-3 max-w-[85%] border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email Input */}
                {showEmailInput && !emailSent && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">📧</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-yellow-800 mb-2">
                          Please provide your email address:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="your.email@example.com"
                            className="flex-1 px-3 py-2 text-xs border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            onClick={handleEmailSubmit}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md"
                          >
                            Submit
                          </button>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          We'll use this to contact you with a personalized response.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Waiting for human response */}
                {waitingForHuman && emailSent && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⏳</span>
                      <div>
                        <p className="text-xs font-semibold text-green-800">Waiting for human support...</p>
                        <p className="text-xs text-green-700 mt-0.5">
                          Our team will review your question and respond via email within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>



              {/* Input Area */}
              {!showEmailInput && !waitingForHuman && (
                <div className="border-t border-gray-200 p-3 bg-white flex-shrink-0">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        rows="2"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={isThinking}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isThinking}
                      className={`self-end px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                        inputValue.trim() && !isThinking
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-base">📤</span>
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1.5 text-center">
                    Press Enter to send
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <ToastContainer 
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default ChatbotModal;