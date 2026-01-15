import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, CheckCircle, Calendar, Clock, Star,
  Users, Target, Award, AlertTriangle, TrendingUp,
  BarChart2, FileText, MessageCircle, GraduationCap,
  RefreshCw, Loader2, ChevronRight, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const apiService = {
  async fetchMenteeDashboard() {
    const response = await fetch('http://127.0.0.1:8000/report/mentee/dashboard/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch mentee dashboard data');
    }
    
    return await response.json();
  },

  async fetchOnboardingDetail() {
    const response = await fetch('http://127.0.0.1:8000/report/mentee/onboarding/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch onboarding details');
    }
    
    return await response.json();
  },

  async fetchSessionHistory() {
    const response = await fetch('http://127.0.0.1:8000/report/mentee/sessions/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch session history');
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
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    'in_progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
    'not_started': { color: 'bg-gray-100 text-gray-800', label: 'Not Started' },
    overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
    'needs_attention': { color: 'bg-yellow-100 text-yellow-800', label: 'Needs Attention' },
    'off_track': { color: 'bg-orange-100 text-orange-800', label: 'Off Track' },
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function MenteeDashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [onboardingDetail, setOnboardingDetail] = useState(null);
  const [sessionHistory, setSessionHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dashboard, onboarding, sessions] = await Promise.all([
        apiService.fetchMenteeDashboard(),
        apiService.fetchOnboardingDetail(),
        apiService.fetchSessionHistory()
      ]);

      console.log('Mentee Dashboard Data:', dashboard);
      console.log('Onboarding Detail:', onboarding);
      console.log('Session History:', sessions);

      // Transform the data to ensure consistent structure
      const transformedDashboard = {
        ...dashboard,
        mentorship: dashboard.mentorship || {},
        onboarding: dashboard.onboarding || {},
        sessions: dashboard.sessions || {}
      };

      const transformedOnboarding = {
        ...onboarding,
        modules: onboarding.modules || []
      };

      const transformedSessions = {
        ...sessions,
        sessions: sessions.sessions || [],
        statistics: sessions.statistics || {}
      };

      setDashboardData(transformedDashboard);
      setOnboardingDetail(transformedOnboarding);
      setSessionHistory(transformedSessions);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate completed modules from onboarding detail
  const calculateCompletedModules = () => {
    if (!onboardingDetail?.modules) return 0;
    return onboardingDetail.modules.filter(module => module.status === 'completed').length;
  };

  // Calculate total modules
  const calculateTotalModules = () => {
    if (!onboardingDetail?.modules) return 0;
    return onboardingDetail.modules.length;
  };

  // Calculate completion rate
  const calculateCompletionRate = () => {
    const total = calculateTotalModules();
    const completed = calculateCompletedModules();
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Prepare data for module status distribution
  const prepareModuleStatusData = () => {
    if (!onboardingDetail?.modules || onboardingDetail.modules.length === 0) return [];
    
    const statusCounts = {
      completed: 0,
      in_progress: 0,
      not_started: 0,
      overdue: 0
    };
    
    onboardingDetail.modules.forEach(module => {
      const status = module.status || 'not_started';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ 
        name: status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1), 
        value: count 
      }));
  };

  // Calculate session statistics from session history
  const calculateSessionStatistics = () => {
    if (!sessionHistory?.sessions) {
      return {
        total_sessions: 0,
        completed_sessions: 0,
        upcoming_count: 0,
        total_time_spent_hours: 0,
        average_rating: 0
      };
    }

    const sessions = sessionHistory.sessions;
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    
    // Calculate upcoming sessions (scheduled and not completed)
    const upcomingSessions = sessions.filter(s => 
      s.status === 'scheduled' && new Date(s.scheduled_date) > new Date()
    ).length;

    // Calculate total time spent (assuming 60 minutes per session)
    const totalTimeSpentHours = (completedSessions * 60) / 60;

    return {
      total_sessions: totalSessions,
      completed_sessions: completedSessions,
      upcoming_count: upcomingSessions,
      total_time_spent_hours: totalTimeSpentHours,
      average_rating: 4.5 // Default rating, can be enhanced with actual data
    };
  };

  // Get priority modules (non-completed modules)
  const getPriorityModules = () => {
    if (!onboardingDetail?.modules) return [];
    
    const priorityOrder = {
      'overdue': 0,
      'off_track': 1,
      'needs_attention': 2,
      'in_progress': 3,
      'not_started': 4
    };
    
    return [...onboardingDetail.modules]
      .filter(module => module.status !== 'completed')
      .sort((a, b) => (priorityOrder[a.status] || 5) - (priorityOrder[b.status] || 5))
      .slice(0, 3);
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

  // Calculate derived data
  const completedModules = calculateCompletedModules();
  const totalModules = calculateTotalModules();
  const completionRate = calculateCompletionRate();
  const sessionStats = calculateSessionStatistics();
  const moduleStatusData = prepareModuleStatusData();
  const priorityModules = getPriorityModules();
  const COLORS = ['#10B981', '#3B82F6', '#9CA3AF', '#F59E0B', '#EF4444'];

  // Calculate mentorship progress based on completed sessions vs total sessions
  const calculateMentorshipProgress = () => {
    if (sessionStats.total_sessions === 0) return 0;
    return Math.round((sessionStats.completed_sessions / sessionStats.total_sessions) * 100);
  };

  const mentorshipProgress = calculateMentorshipProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentee Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {dashboardData.mentee_name || user?.full_name || 'Mentee'}
              {dashboardData.department && (
                <span className="ml-2">• {dashboardData.department}</span>
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
            title="Onboarding Progress"
            value={`${completionRate}%`}
            icon={BookOpen}
            description={`${completedModules} of ${totalModules} modules completed`}
            color="blue"
          />
          <SummaryCard
            title="Completed Modules"
            value={formatNumber(completedModules)}
            icon={CheckCircle}
            description="Finished onboarding modules"
            color="green"
          />
          <SummaryCard
            title="Mentorship Status"
            value={dashboardData.mentorship?.status ? 
              dashboardData.mentorship.status.charAt(0).toUpperCase() + dashboardData.mentorship.status.slice(1) : 'None'}
            icon={Target}
            description="Current mentorship status"
            color="purple"
          />
          <SummaryCard
            title="Upcoming Sessions"
            value={formatNumber(sessionStats.upcoming_count)}
            icon={Calendar}
            description="Scheduled sessions"
            color="orange"
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
                onClick={() => setActiveTab('onboarding')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'onboarding'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Onboarding ({totalModules})
              </button>
              <button
                onClick={() => setActiveTab('mentorship')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'mentorship'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Mentorship
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'sessions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sessions ({sessionStats.total_sessions})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Mentor Information */}
                {dashboardData.mentorship?.has_mentor && (
                  <DataCard title="My Mentor" icon={Users}>
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {(dashboardData.mentorship.mentor_name || 'M')[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{dashboardData.mentorship.mentor_name || 'No mentor assigned'}</h4>
                        <div className="flex items-center space-x-4 mt-2">
                          {dashboardData.department && (
                            <div className="text-sm">
                              <span className="text-gray-500">Department:</span>{' '}
                              <span className="font-medium">{dashboardData.department}</span>
                            </div>
                          )}
                          {dashboardData.mentorship.status && (
                            <div className="text-sm">
                              <span className="text-gray-500">Status:</span>{' '}
                              <StatusBadge status={dashboardData.mentorship.status} />
                            </div>
                          )}
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        Send Message
                      </button>
                    </div>
                  </DataCard>
                )}

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Module Status Distribution */}
                  <DataCard title="Module Status Distribution" icon={PieChart}>
                    <div className="h-64">
                      {moduleStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={moduleStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {moduleStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, 'Modules']} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No module data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {moduleStatusData.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {moduleStatusData.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-gray-600">{item.name}: {formatNumber(item.value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </DataCard>

                  {/* Progress Overview */}
                  <DataCard title="Progress Overview" icon={TrendingUp}>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Onboarding Progress</span>
                          <span>{completionRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Mentorship Progress</span>
                          <span>{mentorshipProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${mentorshipProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">
                              {formatNumber(totalModules)}
                            </div>
                            <div className="text-gray-500">Total Modules</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">
                              {formatNumber(sessionStats.total_sessions)}
                            </div>
                            <div className="text-gray-500">Total Sessions</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DataCard>
                </div>

                {/* Priority Modules */}
                <DataCard title="Priority Modules" icon={AlertTriangle}>
                  <div className="space-y-3">
                    {priorityModules.length > 0 ? (
                      priorityModules.map((module, index) => (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                          module.status === 'overdue' ? 'bg-red-50 border-red-100' :
                          module.status === 'off_track' ? 'bg-orange-50 border-orange-100' :
                          'bg-yellow-50 border-yellow-100'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded ${module.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              module.status === 'off_track' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                              {module.status === 'overdue' && <AlertTriangle className="w-4 h-4" />}
                              {module.status === 'in_progress' && <Clock className="w-4 h-4" />}
                              {module.status === 'not_started' && <BookOpen className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{module.module_title}</div>
                              <div className="text-xs text-gray-500">
                                Status: <span className="font-medium capitalize">{module.status.replace('_', ' ')}</span>
                                {module.due_date && ` • Due: ${formatDate(module.due_date)}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-gray-600">{module.progress_percentage || 0}%</div>
                            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                              {module.status === 'not_started' ? 'Start' : 'Continue'}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p>All modules are up to date!</p>
                      </div>
                    )}
                  </div>
                </DataCard>
              </div>
            )}

            {activeTab === 'onboarding' && (
              <div className="space-y-6">
                {/* Onboarding Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {onboardingDetail?.modules?.map((module, index) => (
                    <div key={index} className={`bg-white rounded-lg border p-6 ${
                      module.status === 'completed' ? 'border-green-200' :
                      module.status === 'overdue' ? 'border-red-200' :
                      module.status === 'off_track' ? 'border-orange-200' :
                      'border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{module.module_title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <StatusBadge status={module.status} />
                            <span className="text-xs text-gray-500 capitalize">{module.module_type}</span>
                          </div>
                        </div>
                        {module.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{module.progress_percentage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              module.status === 'completed' ? 'bg-green-500' :
                              module.status === 'overdue' ? 'bg-red-500' :
                              module.status === 'off_track' ? 'bg-orange-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${module.progress_percentage || 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {module.started_at && (
                          <div className="flex justify-between">
                            <span>Started:</span>
                            <span>{formatDate(module.started_at)}</span>
                          </div>
                        )}
                        {module.due_date && (
                          <div className={`flex justify-between ${module.is_overdue ? 'text-red-600' : ''}`}>
                            <span>Due Date:</span>
                            <span>{formatDate(module.due_date)}</span>
                          </div>
                        )}
                        {module.estimated_duration && (
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{module.estimated_duration} minutes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Detailed Progress Table */}
                {onboardingDetail?.modules && onboardingDetail.modules.length > 0 && (
                  <DataCard title="Detailed Progress Report" icon={FileText}>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Module
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Progress
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Started
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Completed
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {onboardingDetail.modules.map((module, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{module.module_title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900 capitalize">{module.module_type}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={module.status} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        module.status === 'completed' ? 'bg-green-500' :
                                        module.status === 'overdue' ? 'bg-red-500' :
                                        'bg-blue-500'
                                      }`}
                                      style={{ width: `${module.progress_percentage || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-900">{module.progress_percentage || 0}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(module.started_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {module.status === 'completed' ? formatDate(module.completed_at) : 'In Progress'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DataCard>
                )}
              </div>
            )}

            {activeTab === 'mentorship' && (
              <div className="space-y-6">
                {/* Mentorship Details */}
                {dashboardData.mentorship?.has_mentor ? (
                  <DataCard title="Mentorship Details" icon={GraduationCap}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Mentor</h4>
                            <p className="text-gray-600">{dashboardData.mentorship.mentor_name}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {dashboardData.department && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Department:</span>
                              <span className="font-medium">{dashboardData.department}</span>
                            </div>
                          )}
                          {dashboardData.mentorship.status && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <StatusBadge status={dashboardData.mentorship.status} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Overall Progress</span>
                            <span>{mentorshipProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-green-500 h-3 rounded-full" 
                              style={{ width: `${mentorshipProgress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {sessionStats.completed_sessions}
                            </div>
                            <div className="text-sm text-gray-600">Sessions Completed</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {sessionStats.total_sessions}
                            </div>
                            <div className="text-sm text-gray-600">Total Sessions</div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </DataCard>
                ) : (
                  <DataCard title="Mentorship Status">
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Mentorship</h3>
                      <p className="text-gray-600">You don't have an active mentorship assigned yet.</p>
                    </div>
                  </DataCard>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-6">
                {/* Session Statistics */}
                <DataCard title="Session Statistics" icon={BarChart2}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatNumber(sessionStats.total_sessions)}
                      </div>
                      <div className="text-sm text-gray-600">Total Sessions</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {formatNumber(sessionStats.completed_sessions)}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {sessionStats.total_time_spent_hours.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Hours Spent</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">
                        {sessionStats.average_rating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Avg. Rating</div>
                    </div>
                  </div>
                </DataCard>

                {/* Session History */}
                <DataCard title="Session History" icon={Clock}>
                  <div className="space-y-4">
                    {sessionHistory?.sessions && sessionHistory.sessions.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Program
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Session Template
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Duration
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {sessionHistory.sessions.slice(0, 5).map((session, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {formatDate(session.actual_date || session.scheduled_date)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{session.program_name || 'N/A'}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{session.template_title || 'N/A'}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{session.duration_minutes || 0} mins</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <StatusBadge status={session.status || 'unknown'} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {sessionHistory.sessions.length > 5 && (
                          <div className="text-center pt-2">
                            <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                              View all {sessionHistory.sessions.length} sessions
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No session history available</p>
                      </div>
                    )}
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