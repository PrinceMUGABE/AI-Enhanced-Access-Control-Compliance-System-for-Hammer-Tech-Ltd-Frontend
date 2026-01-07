import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Bot, Send, ThumbsUp, ThumbsDown, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  helpful?: boolean;
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI assistant. I can help you with questions about mentorship programs, knowledge articles, onboarding processes, and more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const suggestedQuestions = [
    'How do I find a mentor?',
    'What are the onboarding steps?',
    'How to upload a knowledge article?',
    'What mentorship programs are available?',
    'How to schedule a session?'
  ];

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getBotResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('mentor') && q.includes('find')) {
      return 'To find a mentor, go to the Mentorship section in your dashboard. You can browse available mentors by expertise, department, or use our AI-powered matching system. Click on "Find Mentor" and answer a few questions about your goals to get personalized recommendations.';
    }
    
    if (q.includes('onboarding')) {
      return 'Our onboarding process includes: 1) Complete your profile setup, 2) Review company policies and documentation, 3) Complete required training modules, 4) Meet your assigned mentor, 5) Schedule your first team meetings. You can track your progress in the Onboarding module.';
    }
    
    if (q.includes('upload') || q.includes('knowledge')) {
      return 'To upload a knowledge article, navigate to the Knowledge Repository and click the "Upload Document" button. You can upload PDFs, DOCs, or create articles directly. Make sure to add relevant tags and select the appropriate category for better discoverability.';
    }
    
    if (q.includes('program') || q.includes('available')) {
      return 'We offer several mentorship programs: Leadership Development (12 sessions), Technical Skills Enhancement (10 sessions), Career Growth Planning (8 sessions), and Product Management Fundamentals (10 sessions). Each program is tailored to specific career goals and skill development needs.';
    }
    
    if (q.includes('schedule') || q.includes('session')) {
      return 'To schedule a session with your mentor, go to the Mentorship section, select your active mentorship, and click "Schedule Session". Choose from your mentor\'s available time slots. You\'ll receive email and platform notifications with the meeting details.';
    }
    
    return 'Thank you for your question. I\'d be happy to help! Could you please provide more details or try rephrasing your question? You can also browse our Knowledge Repository for detailed guides and documentation.';
  };

  const handleFeedback = (messageId: string, helpful: boolean) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, helpful } : msg
    ));
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl text-gray-900 mb-2">AI Assistant</h1>
        <p className="text-gray-600">Get instant answers to your questions about the platform</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="size-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>MentorHub AI Assistant</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Online</span>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' ? 'bg-blue-600' : 'bg-blue-100'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="size-4 text-white" />
                    ) : (
                      <Bot className="size-4 text-blue-600" />
                    )}
                  </div>
                  
                  <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'flex justify-end' : ''}`}>
                    <div className={`p-4 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      {message.type === 'bot' && (
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-6 px-2 ${message.helpful === true ? 'text-green-600' : ''}`}
                            onClick={() => handleFeedback(message.id, true)}
                          >
                            <ThumbsUp className="size-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-6 px-2 ${message.helpful === false ? 'text-red-600' : ''}`}
                            onClick={() => handleFeedback(message.id, false)}
                          >
                            <ThumbsDown className="size-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Questions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-blue-600" />
                Suggested Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left p-3 text-sm text-gray-700 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Conversations Today</p>
                <p className="text-2xl text-gray-900">127</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Response Time</p>
                <p className="text-2xl text-gray-900">1.2s</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Satisfaction Rate</p>
                <p className="text-2xl text-gray-900">94%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
