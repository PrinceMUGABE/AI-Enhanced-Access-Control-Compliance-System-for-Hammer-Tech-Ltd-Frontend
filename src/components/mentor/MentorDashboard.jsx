import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, CheckCircle, Star, Calendar, 
  TrendingUp, Clock, Award, GraduationCap,
  MessageCircle, AlertTriangle, ChevronRight,
  Loader2, RefreshCw, Activity, Target,
  Building, BookOpen, BarChart2, FileText
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const apiService = {
  async fetchMentorDashboard() {
    const response = await fetch('http://127.0.0.1:8000/report/mentor/dashboard/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch mentor dashboard data');
    }
    
    return await response.json();
  },

  async fetchMenteeProgress() {
    const response = await fetch('http://127.0.0.1:8000/report/mentor/mentees/progress/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch mentee progress data');
    }
    
    return await response.json();
  }
};

const SummaryCard = ({ title, value, icon: Icon, description, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    <span className="ml-2 text-gray-600">Loading dashboard data...</span>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Data</h3>
    <p className="text-red-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Retry
    </button>
  </div>
);

const DataCard = ({ title, children, icon: Icon }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {Icon && <Icon className="w-6 h-6 text-gray-400" />}
    </div>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
    'in_progress': { color: 'bg-indigo-100 text-indigo-800', label: 'In Progress' },
    'not_started': { color: 'bg-gray-100 text-gray-800', label: 'Not Started' }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function MentorDashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [menteeProgress, setMenteeProgress] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dashboard, progress] = await Promise.all([
        apiService.fetchMentorDashboard(),
        apiService.fetchMenteeProgress()
      ]);

      console.log('Actual Mentor Dashboard Data:', dashboard);
      console.log('Actual Mentee Progress Data:', progress);

      // Transform the data to ensure consistent structure
      const transformedDashboard = {
        ...dashboard,
        mentorships: dashboard.mentorships || {},
        sessions: dashboard.sessions || {},
        performance: dashboard.performance || { average_rating: 0, total_reviews: 0 },
        recent_messages_count: dashboard.recent_messages_count || 0,
        generated_at: dashboard.generated_at || new Date()
      };

      const transformedProgress = {
        ...progress,
        mentees: progress.mentees || [],
        total_mentees: progress.total_mentees || 0
      };

      setDashboardData(transformedDashboard);
      setMenteeProgress(transformedProgress);
      setLastUpdated(new Date(dashboard.generated_at || new Date()));
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load dashboard data');
      
      if (err.message.includes('401') || err.message.includes('403')) {
        setError('Authentication failed. Please log in again.');
        setTimeout(() => logout(), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Prepare data from actual backend response
  const prepareMenteeProgressChartData = () => {
    if (!menteeProgress?.mentees || menteeProgress.mentees.length === 0) return [];
    
    return menteeProgress.mentees.map(mentee => ({
      name: mentee.mentee_name?.split(' ')[0] || 'Mentee',
      progress: mentee.sessions?.progress_percentage || 0,
      onboarding: mentee.onboarding?.completion_rate || 0
    }));
  };

  const prepareOnboardingStatusData = () => {
    if (!menteeProgress?.mentees || menteeProgress.mentees.length === 0) return [];
    
    const statusCounts = {
      high: 0,    // 80-100%
      medium: 0,  // 50-79%
      low: 0      // 0-49%
    };
    
    menteeProgress.mentees.forEach(mentee => {
      const rate = mentee.onboarding?.completion_rate || 0;
      if (rate >= 80) statusCounts.high++;
      else if (rate >= 50) statusCounts.medium++;
      else statusCounts.low++;
    });
    
    return [
      { name: 'High (80%+)', value: statusCounts.high, color: '#10B981' },
      { name: 'Medium (50-79%)', value: statusCounts.medium, color: '#F59E0B' },
      { name: 'Low (<50%)', value: statusCounts.low, color: '#EF4444' }
    ].filter(item => item.value > 0);
  };

  const getActiveMentees = () => {
    if (!menteeProgress?.mentees) return [];
    return menteeProgress.mentees.filter(mentee => 
      mentee.mentorship_status === 'active'
    );
  };

  // Calculate completed mentorships
  const calculateCompletedMentorships = () => {
    if (!dashboardData?.mentorships) return 0;
    
    // If backend provides completed count, use it
    if (dashboardData.mentorships.completed !== undefined) {
      return dashboardData.mentorships.completed;
    }
    
    // Otherwise estimate from mentee progress
    if (menteeProgress?.mentees) {
      return menteeProgress.mentees.filter(mentee => 
        mentee.mentorship_status === 'completed'
      ).length;
    }
    
    return 0;
  };

  // Calculate session completion rate
  const calculateSessionCompletionRate = () => {
    if (!dashboardData?.sessions || dashboardData.sessions.total === 0) return 0;
    
    const completed = dashboardData.sessions.completed || 0;
    const total = dashboardData.sessions.total || 0;
    
    return Math.round((completed / total) * 100);
  };

  // Calculate mentorship completion rate
  const calculateMentorshipCompletionRate = () => {
    if (!dashboardData?.mentorships || dashboardData.mentorships.total === 0) return 0;
    
    const completed = calculateCompletedMentorships();
    const total = dashboardData.mentorships.total || 0;
    
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchAllData} />;
  }

  if (!dashboardData) {
    return <ErrorMessage message="No data available" onRetry={fetchAllData} />;
  }

  const menteeProgressChartData = prepareMenteeProgressChartData();
  const onboardingStatusData = prepareOnboardingStatusData();
  const activeMentees = getActiveMentees();
  const completedMentorships = calculateCompletedMentorships();
  const sessionCompletionRate = calculateSessionCompletionRate();
  const mentorshipCompletionRate = calculateMentorshipCompletionRate();
  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {dashboardData.mentor_name || user?.full_name || 'Mentor'}
              {menteeProgress?.total_mentees > 0 && (
                <span className="ml-2">• {menteeProgress.total_mentees} mentee{menteeProgress.total_mentees !== 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchAllData}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Active Mentorships"
            value={formatNumber(dashboardData.mentorships?.active)}
            icon={Users}
            description="Currently active mentees"
            color="blue"
          />
          <SummaryCard
            title="Total Mentorships"
            value={formatNumber(dashboardData.mentorships?.total)}
            icon={GraduationCap}
            description="All time mentorships"
            color="purple"
          />
          <SummaryCard
            title="Average Rating"
            value={dashboardData.average_rating ? dashboardData.average_rating.toFixed(1) : 'N/A'}
            icon={Star}
            description="From mentee reviews"
            color="orange"
          />
          <SummaryCard
            title="Upcoming Sessions"
            value={formatNumber(dashboardData.sessions?.upcoming)}
            icon={Calendar}
            description="Scheduled sessions"
            color="green"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('mentees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'mentees'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Mentees ({activeMentees.length})
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'performance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Performance
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Mentee Progress Chart */}
                  <DataCard title="Mentee Progress Overview" icon={BarChart2}>
                    <div className="h-64">
                      {menteeProgressChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={menteeProgressChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: 'Progress %', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                            <Legend />
                            <Bar dataKey="progress" name="Mentorship Progress" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="onboarding" name="Onboarding" fill="#10B981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No mentee data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </DataCard>

                  {/* Onboarding Status */}
                  <DataCard title="Mentee Onboarding Status" icon={BookOpen}>
                    <div className="h-64">
                      {onboardingStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={onboardingStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {onboardingStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Mentees']} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No onboarding data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {onboardingStatusData.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {onboardingStatusData.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-gray-600">{item.name}: {formatNumber(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </DataCard>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Mentorship Statistics */}
                  <DataCard title="Mentorship Statistics" icon={GraduationCap}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Mentorships</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(dashboardData.mentorships?.total)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active</span>
                        <span className="font-semibold text-green-600">
                          {formatNumber(dashboardData.mentorships?.active)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="font-semibold text-blue-600">
                          {formatNumber(completedMentorships)}
                        </span>
                      </div>
                      {dashboardData.mentorships?.total > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Completion Rate</span>
                            <span className="text-xs font-semibold text-gray-900">
                              {mentorshipCompletionRate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, mentorshipCompletionRate)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </DataCard>

                  {/* Session Statistics */}
                  <DataCard title="Session Statistics" icon={Clock}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Sessions</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(dashboardData.sessions?.total)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="font-semibold text-green-600">
                          {formatNumber(dashboardData.sessions?.completed)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Upcoming</span>
                        <span className="font-semibold text-blue-600">
                          {formatNumber(dashboardData.sessions?.upcoming)}
                        </span>
                      </div>
                      {dashboardData.sessions?.total > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Completion Rate</span>
                            <span className="text-xs font-semibold text-gray-900">
                              {sessionCompletionRate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(100, sessionCompletionRate)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </DataCard>

                  {/* Performance Metrics */}
                  <DataCard title="Performance Metrics" icon={Award}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Rating</span>
                        <div className="flex items-center">
                          {dashboardData.average_rating ? (
                            <>
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="font-semibold text-gray-900">
                                {dashboardData.average_rating.toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">/5</span>
                            </>
                          ) : (
                            <span className="font-semibold text-gray-500">N/A</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Mentees</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(activeMentees.length)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Session Completion</span>
                        <span className="font-semibold text-blue-600">
                          {sessionCompletionRate}%
                        </span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Overall Performance</span>
                          <span className="font-semibold text-orange-600">
                            {dashboardData.average_rating >= 4 ? 'Excellent' : 
                             dashboardData.average_rating >= 3 ? 'Good' : 
                             dashboardData.average_rating > 0 ? 'Needs Improvement' : 'No ratings yet'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Based on {formatNumber(dashboardData.performance?.total_reviews || 0)} review{dashboardData.performance?.total_reviews !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </DataCard>
                </div>
              </div>
            )}

            {activeTab === 'mentees' && (
              <div className="space-y-6">
                {/* Active Mentees Grid */}
                {activeMentees.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeMentees.map((mentee, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="font-semibold text-blue-600">
                                  {mentee.mentee_name?.charAt(0) || 'M'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{mentee.mentee_name || 'Unknown Mentee'}</h4>
                                <p className="text-sm text-gray-500">{mentee.department || 'No department'}</p>
                              </div>
                            </div>
                            <StatusBadge status={mentee.mentorship_status || 'active'} />
                          </div>
                          
                          <div className="space-y-3 mb-4">
                            {mentee.onboarding?.completion_rate !== undefined && (
                              <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                  <span>Onboarding</span>
                                  <span>{mentee.onboarding.completion_rate?.toFixed(1) || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${mentee.onboarding.completion_rate || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {mentee.sessions?.progress_percentage !== undefined && (
                              <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                  <span>Mentorship</span>
                                  <span>{mentee.sessions.progress_percentage?.toFixed(1) || 0}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${mentee.sessions.progress_percentage || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="border-t border-gray-200 pt-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-center">
                                <div className="font-semibold text-gray-900">
                                  {mentee.onboarding?.completed || 0}/{mentee.onboarding?.total || 0}
                                </div>
                                <div className="text-xs text-gray-500">Modules Done</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-gray-900">
                                  {mentee.sessions?.completed || 0}/{mentee.sessions?.total || 0}
                                </div>
                                <div className="text-xs text-gray-500">Sessions</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* All Mentees Table */}
                    <DataCard title="All Mentees Overview">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mentee
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Onboarding
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mentorship
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sessions
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {menteeProgress?.mentees?.map((mentee, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="font-semibold text-blue-600 text-sm">
                                        {mentee.mentee_name?.charAt(0) || 'M'}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{mentee.mentee_name || 'Unknown Mentee'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{mentee.department || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {mentee.onboarding?.completion_rate !== undefined ? (
                                    <div className="flex items-center">
                                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-blue-500 h-2 rounded-full" 
                                          style={{ width: `${mentee.onboarding.completion_rate || 0}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm text-gray-900">{mentee.onboarding.completion_rate?.toFixed(1) || 0}%</span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">N/A</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {mentee.sessions?.progress_percentage !== undefined ? (
                                    <div className="flex items-center">
                                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full" 
                                          style={{ width: `${mentee.sessions.progress_percentage || 0}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-sm text-gray-900">{mentee.sessions.progress_percentage?.toFixed(1) || 0}%</span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">N/A</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {mentee.sessions?.completed || 0}/{mentee.sessions?.total || 0}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <StatusBadge status={mentee.mentorship_status || 'unknown'} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </DataCard>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Mentees</h3>
                    <p className="text-gray-600">You don't have any active mentees assigned to you.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                {/* Performance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DataCard title="Rating Summary">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Rating</span>
                        <div className="flex items-center">
                          {dashboardData.average_rating ? (
                            <>
                              <Star className="w-8 h-8 text-yellow-500 mr-2" />
                              <div className="text-right">
                                <div className="text-3xl font-bold text-gray-900">
                                  {dashboardData.average_rating.toFixed(1)}
                                </div>
                                <div className="text-sm text-gray-500">out of 5</div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-4">
                              <Star className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                              <div className="text-lg font-medium text-gray-500">No ratings yet</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {dashboardData.average_rating && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {formatNumber(dashboardData.performance?.total_reviews || 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Reviews</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </DataCard>

                  <DataCard title="Mentorship Summary">
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          {formatNumber(completedMentorships)}
                        </div>
                        <div className="text-sm text-gray-600">Completed Mentorships</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-xl font-semibold text-blue-600">
                            {formatNumber(dashboardData.mentorships?.active || 0)}
                          </div>
                          <div className="text-xs text-gray-500">Active</div>
                        </div>
                        <div>
                          <div className="text-xl font-semibold text-purple-600">
                            {formatNumber(dashboardData.mentorships?.total || 0)}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                      
                      {dashboardData.mentorships?.total > 0 && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
                          <div className="text-xl font-bold text-green-600">{mentorshipCompletionRate}%</div>
                        </div>
                      )}
                    </div>
                  </DataCard>
                </div>

                {/* Recent Activity / Performance Insights */}
                <DataCard title="Performance Insights">
                  <div className="space-y-4">
                    {/* Rating Status */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {dashboardData.average_rating ? `Rating: ${dashboardData.average_rating.toFixed(1)}/5` : 'No ratings yet'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {dashboardData.performance?.total_reviews 
                              ? `${dashboardData.performance.total_reviews} review${dashboardData.performance.total_reviews !== 1 ? 's' : ''} received`
                              : 'Be the first to get rated!'}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        dashboardData.average_rating >= 4 ? 'bg-green-100 text-green-800' :
                        dashboardData.average_rating >= 3 ? 'bg-yellow-100 text-yellow-800' :
                        dashboardData.average_rating > 0 ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {dashboardData.average_rating >= 4 ? 'Excellent' : 
                         dashboardData.average_rating >= 3 ? 'Good' : 
                         dashboardData.average_rating > 0 ? 'Needs Improvement' : 'Not Rated'}
                      </div>
                    </div>
                    
                    {/* Session Performance */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium text-gray-900">Session Performance</div>
                          <div className="text-sm text-gray-500">
                            {dashboardData.sessions?.completed || 0} of {dashboardData.sessions?.total || 0} sessions completed
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">{sessionCompletionRate}%</div>
                        <div className="text-xs text-gray-500">Completion Rate</div>
                      </div>
                    </div>
                    
                    {/* Mentee Engagement */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-gray-900">Mentee Engagement</div>
                          <div className="text-sm text-gray-500">
                            {activeMentees.length} active mentee{activeMentees.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        activeMentees.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {activeMentees.length > 0 ? 'Active' : 'No Active Mentees'}
                      </div>
                    </div>
                    
                    {/* Onboarding Support */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-5 h-5 text-indigo-500" />
                        <div>
                          <div className="font-medium text-gray-900">Onboarding Support</div>
                          <div className="text-sm text-gray-500">
                            {menteeProgress?.mentees?.filter(m => m.onboarding?.completion_rate >= 80).length || 0} of {menteeProgress?.total_mentees || 0} mentees with high onboarding
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {menteeProgress?.total_mentees > 0 && (
                          <>
                            <div className="text-lg font-semibold text-gray-900">
                              {Math.round((menteeProgress.mentees.filter(m => m.onboarding?.completion_rate >= 80).length / menteeProgress.total_mentees) * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">High Onboarding</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </DataCard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}