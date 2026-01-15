import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, UserCheck, UserPlus, TrendingUp, Building, 
  BookOpen, Clock, Target, Award, AlertTriangle,
  RefreshCw, Loader2, CheckCircle, XCircle,
  Activity, BarChart2, PieChart, Calendar,
  FileText, Settings, Database, MessageCircle,
  ChevronRight, ChevronDown, User
} from 'lucide-react';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area
} from 'recharts';

// API Service
const apiService = {
  async fetchHRDashboard() {
    const response = await fetch('http://127.0.0.1:8000/report/hr/dashboard/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch HR dashboard data');
    }
    
    return await response.json();
  },

  async fetchOnboardingReport() {
    const response = await fetch('http://127.0.0.1:8000/report/hr/onboarding/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch onboarding report');
    }
    
    return await response.json();
  }
};

// Custom Components
const SummaryCard = ({ title, value, icon: Icon, change, description, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500',
    teal: 'bg-teal-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {change !== undefined && (
              <span className={`ml-2 text-sm font-medium ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            )}
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
    <span className="ml-2 text-gray-600">Loading HR dashboard data...</span>
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
  <div className="bg-gray-50 rounded-lg p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {Icon && <Icon className="w-6 h-6 text-gray-400" />}
    </div>
    {children}
  </div>
);

export default function HRDashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [onboardingReport, setOnboardingReport] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dashboard, onboarding] = await Promise.all([
        apiService.fetchHRDashboard(),
        apiService.fetchOnboardingReport()
      ]);

      console.log('Dashboard Data:', dashboard); // Debug log
      console.log('Onboarding Data:', onboarding); // Debug log

      if (dashboard.success) {
        setDashboardData(dashboard);
        setLastUpdated(new Date(dashboard.generated_at));
      }
      if (onboarding.success) setOnboardingReport(onboarding);
      
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

  // FIXED: Use real-time data from backend directly
  const calculateRealUserStats = () => {
    if (!dashboardData) return { total: 0, mentors: 0, mentees: 0 };
    
    // Use the total_users directly from user_management
    const totalUsers = dashboardData.user_management?.total_users || 0;
    const totalMentorUsers = dashboardData.user_management?.mentor_users || 0;
    const totalMenteeUsers = dashboardData.user_management?.mentee_users || 0;
    
    // Calculate mentors and mentees from department distribution
    let totalMentors = 0;
    let totalMentees = 0;
    
    if (dashboardData.department_distribution) {
      dashboardData.department_distribution.forEach(dept => {
        totalMentors += dept.mentors || 0;
        totalMentees += dept.mentees || 0;
      });
    }
    
    return {
      total: totalUsers, // Use the real total from backend
      mentors: totalMentorUsers,
      mentees: totalMenteeUsers
    };
  };

  const prepareDepartmentDistributionData = () => {
    if (!dashboardData?.department_distribution) return [];
    return dashboardData.department_distribution.map(dept => ({
      name: dept.department.length > 15 ? dept.department.substring(0, 15) + '...' : dept.department,
      mentors: dept.mentors || 0,
      mentees: dept.mentees || 0,
      activeMentorships: dept.active_mentorships || 0,
      fullName: dept.department
    }));
  };

  const prepareModuleStatisticsData = () => {
    if (!onboardingReport?.modules_statistics) return [];
    return onboardingReport.modules_statistics.map(module => ({
      title: module.title,
      completion_rate: module.completion_rate || 0,
      module_type: module.module_type || 'core',
      estimated_duration: module.estimated_duration || 30,
      average_completion_time: module.average_completion_time
    }));
  };

  const prepareOnboardingStatusData = () => {
    if (!dashboardData?.onboarding) return [];
    
    const statusData = [
      { name: 'Completed', value: dashboardData.onboarding.completed || 0 },
      { name: 'In Progress', value: dashboardData.onboarding.in_progress || 0 },
      { name: 'Overdue', value: dashboardData.onboarding.overdue || 0 }
    ];
    
    // Filter out zero values for better visualization
    return statusData.filter(item => item.value > 0);
  };

  const getTopDepartments = (count = 0) => {
    if (!dashboardData?.department_distribution) return [];
    return [...dashboardData.department_distribution]
      .sort((a, b) => (b.mentees + b.mentors) - (a.mentees + a.mentors))
      .slice(0, count);
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const userStats = calculateRealUserStats();
  const departmentDistributionData = prepareDepartmentDistributionData();
  const moduleStatsData = prepareModuleStatisticsData();
  const onboardingStatusData = prepareOnboardingStatusData();
  const topDepartments = getTopDepartments();

  console.log('User Stats:', userStats); // Debug log
  console.log('Dashboard Data:', dashboardData); // Debug log

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {dashboardData.user_info?.name || 'HR Manager'}
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
                Last updated: {lastUpdated.toLocaleString()}
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
            title="Total Users"
            value={formatNumber(userStats.total)}
            icon={Users}
            description="All registered users in the system"
            color="blue"
          />
          <SummaryCard
            title="Mentors"
            value={formatNumber(userStats.mentors)}
            icon={UserCheck}
            description="Active mentors across departments"
            color="green"
          />
          <SummaryCard
            title="Mentees"
            value={formatNumber(userStats.mentees)}
            icon={UserPlus}
            description="Active mentees in the system"
            color="purple"
          />
          <SummaryCard
            title="Onboarding Completion"
            value={`${(dashboardData.onboarding?.completion_rate || 0).toFixed(1)}%`}
            icon={TrendingUp}
            description="Overall onboarding completion rate"
            color="teal"
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
                Onboarding
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'departments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Departments
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Onboarding Status Distribution */}
                  <DataCard title="Onboarding Status" icon={PieChart}>
                    <p className="text-sm text-gray-600 mb-4">Module completion status distribution</p>
                    <div className="h-64">
                      {onboardingStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={onboardingStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {onboardingStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [formatNumber(value), 'Count']} />
                          </RePieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No onboarding data available
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {onboardingStatusData.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-600">{item.name}: {formatNumber(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </DataCard>

                  {/* Department Distribution */}
                  <DataCard title="Department Distribution" icon={BarChart2}>
                    <p className="text-sm text-gray-600 mb-4">Mentors and mentees by department (Top 5)</p>
                    <div className="h-64">
                      {departmentDistributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={departmentDistributionData.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [formatNumber(value), 'Count']} />
                            <Legend />
                            <Bar dataKey="mentors" name="Mentors" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="mentees" name="Mentees" fill="#10B981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                          No department data available
                        </div>
                      )}
                    </div>
                  </DataCard>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* User Statistics */}
                  <DataCard title="User Statistics" icon={Users}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Users</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(userStats.total)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Mentors</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(userStats.mentors)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Mentees</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(userStats.mentees)}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Approved Users</span>
                          <span className="font-semibold text-green-600">
                            {formatNumber(dashboardData.user_management?.approved || 0)}
                          </span>
                        </div>
                        {dashboardData.user_management?.pending > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pending Approval</span>
                            <span className="font-semibold text-orange-600">
                              {formatNumber(dashboardData.user_management.pending)}
                            </span>
                          </div>
                        )}
                        {dashboardData.user_management?.rejected > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Rejected</span>
                            <span className="font-semibold text-red-600">
                              {formatNumber(dashboardData.user_management.rejected)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </DataCard>

                  {/* Onboarding Overview */}
                  <DataCard title="Onboarding Progress" icon={BookOpen}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Modules</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(dashboardData.onboarding?.total || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="font-semibold text-green-600">
                          {formatNumber(dashboardData.onboarding?.completed || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">In Progress</span>
                        <span className="font-semibold text-blue-600">
                          {formatNumber(dashboardData.onboarding?.in_progress || 0)}
                        </span>
                      </div>
                      {dashboardData.onboarding?.overdue > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Overdue</span>
                          <span className="font-semibold text-red-600">
                            {formatNumber(dashboardData.onboarding.overdue)}
                          </span>
                        </div>
                      )}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                          <span className="font-semibold text-teal-600">
                            {dashboardData.onboarding?.completion_rate?.toFixed(1) || '0.0'}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </DataCard>

                  {/* Mentorship Metrics */}
                  <DataCard title="Mentorship Overview" icon={Target}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Active Mentorships</span>
                        <span className="font-semibold text-green-600">
                          {formatNumber(dashboardData.mentorship?.active || 0)}
                        </span>
                      </div>
                      {dashboardData.mentorship?.pending > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Pending Requests</span>
                          <span className="font-semibold text-orange-600">
                            {formatNumber(dashboardData.mentorship.pending)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Departments</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(dashboardData.department_distribution?.length || 0)}
                        </span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Mentorship Coverage</span>
                          <span className="font-semibold text-purple-600">
                            {userStats.mentees > 0 
                              ? Math.round((dashboardData.mentorship?.active / userStats.mentees) * 100) 
                              : 0
                            }%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ 
                              width: `${userStats.mentees > 0 
                                ? Math.min(100, Math.round((dashboardData.mentorship?.active / userStats.mentees) * 100))
                                : 0
                              }%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </DataCard>
                </div>
              </div>
            )}

            {activeTab === 'onboarding' && (
              <div className="space-y-6">
                {/* Module Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Performing Modules */}
                  <DataCard title="Module Performance" icon={Award}>
                    <div className="space-y-3">
                      {moduleStatsData.length > 0 ? (
                        moduleStatsData.map((module, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{module.title}</p>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(module.module_type === 'core' ? 'active' : 'completed')}`}>
                                    {module.module_type}
                                  </span>
                                  <span className="text-xs text-gray-500">{module.completion_rate}% completion</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">{module.completion_rate}%</div>
                              <div className="text-xs text-gray-500">Rate</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p>No module data available</p>
                        </div>
                      )}
                    </div>
                  </DataCard>

                  {/* Onboarding Summary */}
                  <DataCard title="Onboarding Summary" icon={FileText}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Modules</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(onboardingReport?.summary?.total_modules || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Mentees</span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(onboardingReport?.summary?.total_mentees || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completed Modules</span>
                        <span className="font-semibold text-green-600">
                          {formatNumber(
                            onboardingReport?.summary?.progress_by_status?.find(s => s.status === 'completed')?.count || 0
                          )}
                        </span>
                      </div>
                      
                      {/* Module Types Breakdown */}
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Module Types</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Core Modules</span>
                            <span className="font-semibold text-blue-600">
                              {moduleStatsData.filter(m => m.module_type === 'core').length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Department Modules</span>
                            <span className="font-semibold text-purple-600">
                              {moduleStatsData.filter(m => m.module_type === 'department').length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mentees Needing Attention */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Mentees Needing Attention</span>
                          <span className="text-sm font-semibold text-red-600">
                            {formatNumber(onboardingReport?.mentees_needing_attention?.length || 0)}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {onboardingReport?.mentees_needing_attention?.slice(0, 3).map((mentee, index) => (
                            <div key={index} className="flex items-center p-2 bg-red-50 rounded border border-red-100">
                              <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                              <span className="text-sm text-gray-700">{mentee.mentee__full_name || 'Unknown mentee'}</span>
                              <span className="ml-auto text-xs text-gray-500">{mentee.module__title}</span>
                            </div>
                          ))}
                          {(!onboardingReport?.mentees_needing_attention || onboardingReport.mentees_needing_attention.length === 0) && (
                            <div className="text-center py-2 text-gray-500 text-sm bg-green-50 rounded">
                              <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
                              All mentees are up to date
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DataCard>
                </div>
              </div>
            )}

            {activeTab === 'departments' && (
              <div className="space-y-6">
                {/* Department Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topDepartments.map((dept, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{dept.department}</h3>
                        <Building className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Users</span>
                          <span className="font-semibold text-gray-900">
                            {formatNumber((dept.mentees || 0) + (dept.mentors || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Mentors</span>
                          <span className="font-semibold text-blue-600">{formatNumber(dept.mentors || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Mentees</span>
                          <span className="font-semibold text-purple-600">{formatNumber(dept.mentees || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Mentorships</span>
                          <span className="font-semibold text-green-600">
                            {formatNumber(dept.active_mentorships || 0)}
                          </span>
                        </div>
                        
                        {/* Utilization Rate */}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Mentorship Coverage</span>
                            <span className="text-xs font-semibold text-gray-900">
                              {dept.mentees > 0 && dept.active_mentorships > 0 
                                ? Math.round((dept.active_mentorships / dept.mentees) * 100)
                                : 0
                              }%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ 
                                width: `${dept.mentees > 0 && dept.active_mentorships > 0 
                                  ? Math.min(100, Math.round((dept.active_mentorships / dept.mentees) * 100))
                                  : 0
                                }%` 
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Mentee to Mentor Ratio */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Mentee:Mentor Ratio</span>
                          <span>
                            {dept.mentees || 0}:{dept.mentors || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* All Departments Table */}
                <DataCard title="All Departments Overview">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mentors
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mentees
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Active Mentorships
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Coverage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.department_distribution?.map((dept, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{dept.department}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{dept.mentors || 0}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{dept.mentees || 0}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${dept.active_mentorships > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                {dept.active_mentorships || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ 
                                      width: `${dept.mentees > 0 && dept.active_mentorships > 0 
                                        ? Math.min(100, Math.round((dept.active_mentorships / dept.mentees) * 100))
                                        : 0
                                      }%` 
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {dept.mentees > 0 && dept.active_mentorships > 0 
                                    ? Math.round((dept.active_mentorships / dept.mentees) * 100)
                                    : 0
                                  }%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </DataCard>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">System Information</h4>
              <p className="text-sm text-gray-600">
                Data last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                Live data from production
              </div>
              <div className="text-sm text-gray-500">
                Total Departments: <span className="font-semibold">{dashboardData.department_distribution?.length || 0}</span>
              </div>
              <div className="text-sm text-gray-500">
                Data Version: <span className="font-semibold">v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}