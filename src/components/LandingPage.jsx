import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Bot, 
  BarChart3, 
  Shield, 
  Zap,
  Target,
  TrendingUp,
  Award,
  MessageSquare,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// Button Component defined locally
const Button = ({ 
  children, 
  className = '', 
  variant = 'default', 
  size = 'default',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    lg: 'h-12 px-8 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: 'Mentorship Management',
      description: 'Intelligent mentor-mentee matching with automated scheduling and progress tracking'
    },
    {
      icon: BookOpen,
      title: 'Knowledge Repository',
      description: 'Centralized institutional knowledge storage with advanced search and version control'
    },
    {
      icon: Bot,
      title: 'AI-Powered Chatbot',
      description: 'Automated FAQ responses using natural language processing and machine learning'
    },
    {
      icon: BarChart3,
      title: 'Learning Analytics',
      description: 'Comprehensive insights into engagement, progress, and organizational learning metrics'
    },
    {
      icon: Target,
      title: 'Skill Tracking',
      description: 'Monitor competencies, identify gaps, and create personalized development plans'
    },
    {
      icon: TrendingUp,
      title: 'Onboarding Automation',
      description: 'Streamlined workflow for new hires with automated task assignment and tracking'
    }
  ];

  const benefits = [
    { icon: CheckCircle, text: 'Improve staff retention and engagement' },
    { icon: CheckCircle, text: 'Accelerate onboarding process by 60%' },
    { icon: CheckCircle, text: 'Preserve institutional knowledge' },
    { icon: CheckCircle, text: 'Data-driven HR decision making' },
    { icon: CheckCircle, text: 'Enhanced collaboration across departments' },
    { icon: CheckCircle, text: 'Automated routine queries and FAQs' }
  ];

  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Award className="size-6 text-white" />
              </div>
              <span className="text-xl text-blue-900">MentorHub</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
                <Zap className="size-4" />
                <span className="text-sm">AI-Powered Learning Platform</span>
              </div>
              <h1 className="text-5xl lg:text-6xl text-gray-900 mb-6">
                Transform Your Organization's
                <span className="block text-blue-600">Learning Culture</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Centralize mentorship programs, preserve institutional knowledge, and accelerate employee development with our intelligent platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Start Free Trial
                    <ArrowRight className="size-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl p-8 transform rotate-3">
                <div className="bg-white rounded-xl shadow-xl p-6 transform -rotate-3">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Users className="size-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Active Mentorships</div>
                        <div className="text-2xl text-gray-900">1,247</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <BookOpen className="size-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Knowledge Articles</div>
                        <div className="text-2xl text-gray-900">3,456</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="size-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">AI Conversations</div>
                        <div className="text-2xl text-gray-900">12,891</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-gray-900 mb-4">
              Everything You Need for Organizational Learning
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive platform designed to enhance collaboration, preserve knowledge, and drive continuous development
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="size-6 text-blue-600" />
                </div>
                <h3 className="text-xl text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl text-gray-900 mb-6">
                Measurable Impact on Your Organization
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join hundreds of organizations that have transformed their learning culture and improved employee development with MentorHub.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <benefit.icon className="size-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-700">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl text-blue-600 mb-2">95%</div>
                <div className="text-gray-600">User Satisfaction</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl text-blue-600 mb-2">60%</div>
                <div className="text-gray-600">Faster Onboarding</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl text-blue-600 mb-2">3.5x</div>
                <div className="text-gray-600">Knowledge Retention</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl text-blue-600 mb-2">80%</div>
                <div className="text-gray-600">Engagement Increase</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl text-gray-900 mb-6">
            Ready to Transform Your Learning Culture?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start your free trial today. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started Free
                <ArrowRight className="size-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Award className="size-4 text-white" />
              </div>
              <span className="text-lg text-gray-900">MentorHub</span>
            </div>
            <p className="text-gray-600 text-center">
              © {currentYear} MentorHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}