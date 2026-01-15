import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, UserCheck, UserX, TrendingUp, BarChart3, PieChart as PieChartIcon, 
  Calendar, Clock, Target, Award, Briefcase, Building, 
  MessageSquare, Video, FileText, ChevronRight, Download,
  Eye, Filter, RefreshCw, AlertCircle, CheckCircle, XCircle,
  Activity, DollarSign, Layers, BarChart2,
  TrendingDown, Shield, Database,
  ArrowUpRight, ArrowDownRight, Percent, Loader2,
  AlertTriangle, UserPlus, BookOpen, MessageCircle,
  Settings, GraduationCap, Book, Mail
} from 'lucide-react';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
  RadialBarChart, RadialBar
} from 'recharts';

// API Service
const apiService = {
  async fetchDashboardData() {
    const response = await fetch('http://127.0.0.1:8000/report/admin/dashboard/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    return await response.json();
  },

  async fetchUserAnalytics() {
    const response = await fetch('http://127.0.0.1:8000/report/admin/users/analytics/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user analytics');
    }
    
    return await response.json();
  },

  async fetchDepartmentReport() {
    const response = await fetch('http://127.0.0.1:8000/report/admin/departments/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch department report');
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
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline">
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {change && (
              <span className={`ml-2 text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
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

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    approved: { color: 'bg-blue-100 text-blue-800', label: 'Approved' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    completed: { color: 'bg-purple-100 text-purple-800', label: 'Completed' }
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [departmentReport, setDepartmentReport] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dashboard, analytics, departments] = await Promise.all([
        apiService.fetchDashboardData(),
        apiService.fetchUserAnalytics(),
        apiService.fetchDepartmentReport()
      ]);

      console.log('Dashboard Data:', dashboard);
      console.log('User Analytics:', analytics);
      console.log('Department Report:', departments);

      // Transform the data to ensure consistent structure
      const transformedDashboard = {
        ...dashboard,
        users: dashboard.users || {},
        departments: dashboard.departments || {},
        mentorships: dashboard.mentorships || {},
        onboarding: dashboard.onboarding || {},
        sessions: dashboard.sessions || {},
        generated_at: dashboard.generated_at || new Date()
      };

      const transformedAnalytics = {
        ...analytics,
        users_by_department: analytics.users_by_department || [],
        users_by_status: analytics.users_by_status || [],
        recent_registrations: analytics.recent_registrations || 0
      };

      const transformedDepartments = {
        ...departments,
        departments: departments.departments || [],
        total_departments: departments.total_departments || 0
      };

      setDashboardData(transformedDashboard);
      setUserAnalytics(transformedAnalytics);
      setDepartmentReport(transformedDepartments);
      
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

  // Prepare data for user role distribution chart
  const prepareUserRoleChartData = () => {
    if (!dashboardData?.users?.by_role) return [];
    return dashboardData.users.by_role.map(item => ({
      name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
      value: item.count
    }));
  };

  // Prepare data for department activity chart
  const prepareDepartmentChartData = () => {
    if (!departmentReport?.departments) return [];
    
    return departmentReport.departments.slice(0, 6).map(dept => ({
      name: dept.department_name.length > 10 ? dept.department_name.substring(0, 10) + '...' : dept.department_name,
      mentees: dept.mentee_count || 0,
      mentors: dept.mentor_count || 0,
      active_mentorships: dept.active_mentorships || 0
    }));
  };

  // Prepare data for onboarding status chart
  const prepareOnboardingChartData = () => {
    if (!dashboardData?.onboarding) return [];
    
    const total = dashboardData.onboarding.total_progress_records || 0;
    const completed = dashboardData.onboarding.completed || 0;
    const inProgress = 0; // We don't have this data in the API
    const overdue = 0; // We don't have this data
    
    return [
      { name: 'Completed', value: completed },
      { name: 'In Progress', value: inProgress },
      { name: 'Overdue', value: overdue }
    ].filter(item => item.value > 0);
  };

  // FIXED: Prepare dynamic data for mentorship overview chart
  const prepareMentorshipChartData = () => {
    if (!dashboardData?.mentorships) return [];
    
    // Calculate different metrics for dynamic values
    const active = dashboardData.mentorships.active || 0;
    const completed = dashboardData.mentorships.completed || 0;
    const total = dashboardData.mentorships.total || 0;
    
    // Calculate percentages and derived metrics
    const activePercentage = total > 0 ? (active / total) * 100 : 0;
    const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
    const inProgress = Math.max(0, total - active - completed); // If we had in-progress data
    
    // Return array of objects with different metrics
    return [
      { 
        name: 'Active', 
        value: active,
        percentage: activePercentage,
        count: active,
        fill: '#10B981'
      },
      { 
        name: 'Completed', 
        value: completed,
        percentage: completedPercentage,
        count: completed,
        fill: '#3B82F6'
      },
      { 
        name: 'Total', 
        value: total,
        percentage: 100,
        count: total,
        fill: '#8B5CF6'
      },
      { 
        name: 'Session Rate', 
        value: dashboardData.sessions?.completed || 0,
        percentage: dashboardData.sessions?.total ? 
          ((dashboardData.sessions.completed / dashboardData.sessions.total) * 100) : 0,
        count: dashboardData.sessions?.completed || 0,
        fill: '#F59E0B'
      }
    ];
  };

  // Prepare data for user status chart
  const prepareUserStatusChartData = () => {
    if (!userAnalytics?.users_by_status) return [];
    
    return userAnalytics.users_by_status.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      percentage: (item.count / (dashboardData?.users?.total || 1)) * 100
    }));
  };

  // FIXED: Prepare data for user roles breakdown
  const prepareUserRolesBreakdown = () => {
    if (!dashboardData?.users?.by_role) return [];
    
    return dashboardData.users.by_role.map(item => ({
      role: item.role.charAt(0).toUpperCase() + item.role.slice(1),
      count: item.count,
      percentage: (item.count / (dashboardData.users.total || 1)) * 100
    }));
  };

  // Calculate active departments count
  const calculateActiveDepartments = () => {
    if (!departmentReport?.departments) return 0;
    
    // A department is considered active if it has mentees or mentors or programs
    return departmentReport.departments.filter(dept => 
      (dept.mentee_count || 0) > 0 || 
      (dept.mentor_count || 0) > 0 || 
      (dept.programs || 0) > 0
    ).length;
  };

  // Calculate mentorship engagement rate
  const calculateMentorshipEngagementRate = () => {
    if (!dashboardData?.mentorships || !dashboardData.mentorships.total) return 0;
    
    const active = dashboardData.mentorships.active || 0;
    const total = dashboardData.mentorships.total || 1;
    
    return Math.round((active / total) * 100);
  };

  // Calculate user activity rate
  const calculateUserActivityRate = () => {
    if (!dashboardData?.users || !dashboardData.users.total) return 0;
    
    const active = dashboardData.users.active || 0;
    const total = dashboardData.users.total || 1;
    
    return Math.round((active / total) * 100);
  };

  // Calculate active mentorships across all departments
  const calculateTotalActiveMentorships = () => {
    if (!departmentReport?.departments) return 0;
    
    return departmentReport.departments.reduce((total, dept) => {
      return total + (dept.active_mentorships || 0);
    }, 0);
  };

  // Calculate session completion rate
  const calculateSessionCompletionRate = () => {
    if (!dashboardData?.sessions || !dashboardData.sessions.total) return 0;
    
    const completed = dashboardData.sessions.completed || 0;
    const total = dashboardData.sessions.total || 1;
    
    return Math.round((completed / total) * 100);
  };

  // Calculate department activity metrics
  const calculateDepartmentMetrics = () => {
    if (!departmentReport?.departments) return { active: 0, total: 0, utilization: 0 };
    
    const total = departmentReport.total_departments || 0;
    const active = calculateActiveDepartments();
    const utilization = total > 0 ? (active / total) * 100 : 0;
    
    return { active, total, utilization: Math.round(utilization) };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchAllData} />;
  }

  if (!dashboardData) {
    return <ErrorMessage message="No data available" onRetry={fetchAllData} />;
  }

  // Calculate derived values
  const userRoleData = prepareUserRoleChartData();
  const departmentData = prepareDepartmentChartData();
  const onboardingData = prepareOnboardingChartData();
  const mentorshipData = prepareMentorshipChartData();
  const userStatusData = prepareUserStatusChartData();
  const userRolesBreakdown = prepareUserRolesBreakdown();
  const activeDepartments = calculateActiveDepartments();
  const totalActiveMentorships = calculateTotalActiveMentorships();
  const mentorshipEngagementRate = calculateMentorshipEngagementRate();
  const userActivityRate = calculateUserActivityRate();
  const sessionCompletionRate = calculateSessionCompletionRate();
  const departmentMetrics = calculateDepartmentMetrics();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {user?.full_name || 'Admin'}
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
            <div className="text-sm text-gray-500">
              Last updated: {new Date(dashboardData.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard
            title="Total Users"
            value={formatNumber(dashboardData.users?.total)}
            icon={Users}
            description={`${dashboardData.users?.active || 0} active users`}
            color="blue"
          />
          <SummaryCard
            title="Active Mentorships"
            value={formatNumber(totalActiveMentorships)}
            icon={UserCheck}
            description="Currently ongoing mentorship relationships"
            color="green"
          />
          <SummaryCard
            title="Onboarding Completion"
            value={`${(dashboardData.onboarding?.completion_rate || 0).toFixed(1)}%`}
            icon={TrendingUp}
            description={`${dashboardData.onboarding?.completed || 0} of ${dashboardData.onboarding?.total_progress_records || 0} completed`}
            color="purple"
          />
          <SummaryCard
            title="Department Utilization"
            value={`${departmentMetrics.utilization}%`}
            icon={Building}
            description={`${departmentMetrics.active} of ${departmentMetrics.total} active`}
            color="orange"
          />
        </div>

        {/* First Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Role Distribution Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Role Distribution</h3>
                <p className="text-sm text-gray-600">Breakdown of users by their roles</p>
              </div>
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <div className="h-64">
              {userRoleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userRoleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userRoleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(value), 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No user data available</p>
                  </div>
                </div>
              )}
            </div>
            {userRoleData.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {userRoleData.map((item, index) => (
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
          </div>

          {/* Department Activity Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Department Activity</h3>
                <p className="text-sm text-gray-600">Mentees and mentors by department</p>
              </div>
              <Building className="w-6 h-6 text-gray-400" />
            </div>
            <div className="h-64">
              {departmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatNumber(value), 'Count']} />
                    <Legend />
                    <Bar dataKey="mentees" name="Mentees" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mentors" name="Mentors" fill="#EC4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Building className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No department data available</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Showing top {Math.min(6, departmentData.length)} of {departmentReport?.total_departments || 0} departments
            </div>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Onboarding Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Onboarding Progress</h3>
                <p className="text-sm text-gray-600">Module completion status overview</p>
              </div>
              <BookOpen className="w-6 h-6 text-gray-400" />
            </div>
            <div className="h-64">
              {onboardingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={onboardingData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {onboardingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(value), 'Count']} />
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
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion Rate:</span>
                <span className="font-semibold text-gray-900">
                  {(dashboardData.onboarding?.completion_rate || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Modules:</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(dashboardData.onboarding?.total_modules)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress Records:</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(dashboardData.onboarding?.total_progress_records)}
                </span>
              </div>
            </div>
          </div>

          {/* FIXED: Mentorship Overview Chart - Dynamic Area Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mentorship Overview</h3>
                <p className="text-sm text-gray-600">Mentorship status and session metrics</p>
              </div>
              <GraduationCap className="w-6 h-6 text-gray-400" />
            </div>
            <div className="h-64">
              {mentorshipData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mentorshipData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'Percentage' ? `${value.toFixed(1)}%` : formatNumber(value),
                        name === 'Percentage' ? 'Percentage' : 'Count'
                      ]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="percentage" 
                      name="Percentage"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.3}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No mentorship data available</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {mentorshipData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold text-gray-900" style={{ color: item.fill }}>
                    {item.name === 'Percentage' ? `${item.value}%` : formatNumber(item.value)}
                  </div>
                  <div className="text-xs text-gray-600">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Statistics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FIXED: User Status Overview with Roles Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Status Overview</h3>
                <p className="text-sm text-gray-600">User approval and activity status</p>
              </div>
              <UserCheck className="w-6 h-6 text-gray-400" />
            </div>
            
            {/* User Status Section */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Approval Status</h4>
              {userStatusData.map((status, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">{status.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{formatNumber(status.value)}</span>
                    <StatusBadge status={status.name.toLowerCase()} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* User Roles Breakdown Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">User Roles Distribution</h4>
                <span className="text-xs text-gray-500">
                  {formatNumber(userAnalytics?.recent_registrations || 0)} total users
                </span>
              </div>
              
              <div className="space-y-3">
                {userRolesBreakdown.map((role, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{role.role}</span>
                      <span className="font-medium text-gray-900">{formatNumber(role.count)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${role.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Recent Registrations */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(userAnalytics?.recent_registrations || 0)}
                  </div>
                  <div className="text-sm text-blue-700">Recent Registrations (30 days)</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {userRolesBreakdown.map(r => r.role).join(' • ')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Health Metrics</h3>
                <p className="text-sm text-gray-600">Overall platform performance indicators</p>
              </div>
              <Activity className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              {/* User Activity */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">User Activity Rate</span>
                  <span className="font-semibold text-green-600">
                    {userActivityRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${userActivityRate}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Mentorship Engagement */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Mentorship Engagement</span>
                  <span className="font-semibold text-blue-600">
                    {mentorshipEngagementRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${mentorshipEngagementRate}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Onboarding Success */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Onboarding Success Rate</span>
                  <span className="font-semibold text-purple-600">
                    {(dashboardData.onboarding?.completion_rate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${dashboardData.onboarding?.completion_rate || 0}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Session Completion */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Session Completion Rate</span>
                  <span className="font-semibold text-teal-600">
                    {sessionCompletionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full" 
                    style={{ width: `${sessionCompletionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Department Utilization */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Department Utilization</span>
                  <span className="font-semibold text-orange-600">
                    {departmentMetrics.utilization}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${departmentMetrics.utilization}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats & Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Alerts & Quick Stats</h3>
                <p className="text-sm text-gray-600">Critical metrics and notifications</p>
              </div>
              <AlertCircle className="w-6 h-6 text-gray-400" />
            </div>
            <div className="space-y-4">
              {/* Alerts */}
              {dashboardData.users?.pending_approvals > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <div className="font-medium text-yellow-800">
                        {formatNumber(dashboardData.users.pending_approvals)} pending user approval{dashboardData.users.pending_approvals !== 1 ? 's' : ''}
                      </div>
                      <div className="text-xs text-yellow-700">Requires immediate attention</div>
                    </div>
                  </div>
                </div>
              )}
              
              {departmentReport?.departments?.some(dept => dept.mentee_count === 0 && dept.mentor_count > 0) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
                    <div>
                      <div className="font-medium text-orange-800">Departments with mentors but no mentees</div>
                      <div className="text-xs text-orange-700">Consider reallocating resources</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">{formatNumber(activeDepartments)}</div>
                  <div className="text-xs text-gray-600">Active Departments</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">{formatNumber(dashboardData.users?.pending_approvals || 0)}</div>
                  <div className="text-xs text-gray-600">Pending Approvals</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">
                    {dashboardData.sessions?.upcoming || 0}
                  </div>
                  <div className="text-xs text-gray-600">Upcoming Sessions</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(dashboardData.onboarding?.total_modules || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Total Modules</div>
                </div>
              </div>
              
              {/* Department with most activity */}
              {departmentReport?.departments && departmentReport.departments.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-900 mb-2">Most Active Department</div>
                  {(() => {
                    const mostActiveDept = departmentReport.departments.reduce((prev, current) => {
                      const prevActivity = (prev.mentee_count || 0) + (prev.mentor_count || 0) + (prev.active_mentorships || 0);
                      const currentActivity = (current.mentee_count || 0) + (current.mentor_count || 0) + (current.active_mentorships || 0);
                      return prevActivity > currentActivity ? prev : current;
                    });
                    
                    return (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{mostActiveDept.department_name}</div>
                          <div className="text-xs text-gray-600">
                            {mostActiveDept.mentee_count || 0} mentees • {mostActiveDept.mentor_count || 0} mentors • {mostActiveDept.active_mentorships || 0} active mentorships
                          </div>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {((mostActiveDept.mentee_count || 0) + (mostActiveDept.mentor_count || 0) + (mostActiveDept.active_mentorships || 0))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Department Details Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Department Details</h3>
                <p className="text-sm text-gray-600">Comprehensive overview of all departments</p>
              </div>
              <span className="text-sm text-gray-500">
                {formatNumber(departmentReport?.total_departments || 0)} departments total
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mentees
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mentors
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Mentorships
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programs
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentReport?.departments?.map((dept, index) => {
                  const activityScore = (dept.mentee_count || 0) + (dept.mentor_count || 0) + (dept.active_mentorships || 0) + (dept.programs || 0);
                  const isActive = activityScore > 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dept.department_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${dept.mentee_count > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                          {formatNumber(dept.mentee_count || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${dept.mentor_count > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                          {formatNumber(dept.mentor_count || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${dept.active_mentorships > 0 ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                          {formatNumber(dept.active_mentorships || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${dept.programs > 0 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                          {formatNumber(dept.programs || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Data Last Updated</h4>
              <p className="text-sm text-gray-600">
                {new Date(dashboardData.generated_at).toLocaleString()}
              </p>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}