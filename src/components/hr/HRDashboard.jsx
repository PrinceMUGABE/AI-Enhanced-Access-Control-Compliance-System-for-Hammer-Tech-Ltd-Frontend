import React, { useState, useEffect } from 'react';
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

// Mock Auth Context (replace with your actual implementation)
const useAuth = () => ({
  user: { full_name: 'HR Manager', role: 'hr' },
  logout: () => console.log('Logout')
});

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
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
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

      console.log('Dashboard Data:', dashboard);
      console.log('Onboarding Data:', onboarding);

      if (dashboard.success) {
        setDashboardData(dashboard);
        setLastUpdated(new Date(dashboard.generated_at));
      }
      if (onboarding.success) {
        setOnboardingReport(onboarding);
      }
      
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

  // Prepare onboarding status data for pie chart
  const prepareOnboardingStatusData = () => {
    if (!dashboardData?.onboarding) return [];
    
    const statusData = [
      { name: 'In Progress', value: dashboardData.onboarding.in_progress || 0, color: '#3B82F6' },
      { name: 'Overdue', value: dashboardData.onboarding.overdue || 0, color: '#EF4444' },
      { name: 'Recent Completions', value: dashboardData.onboarding.recent_completions || 0, color: '#10B981' }
    ];
    
    return statusData.filter(item => item.value > 0);
  };

  // Prepare module completion data
  const prepareModuleCompletionData = () => {
    if (!onboardingReport?.modules) return [];
    
    return onboardingReport.modules.map(module => ({
      name: module.module_title.length > 20 ? module.module_title.substring(0, 20) + '...' : module.module_title,
      fullName: module.module_title,
      completed: module.completed || 0,
      inProgress: module.in_progress || 0,
      notStarted: module.not_started || 0,
      completionRate: module.completion_rate || 0,
      moduleType: module.module_type
    }));
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

  const onboardingStatusData = prepareOnboardingStatusData();
  const moduleCompletionData = prepareModuleCompletionData();
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {user?.full_name || 'HR Manager'}
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
            title="Pending Approvals"
            value={formatNumber(dashboardData.pending_approvals || 0)}
            icon={UserCheck}
            description="Users waiting for approval"
            color="orange"
          />
          <SummaryCard
            title="Total Modules"
            value={formatNumber(dashboardData.onboarding?.total_modules || 0)}
            icon={BookOpen}
            description="Active onboarding modules"
            color="blue"
          />
          <SummaryCard
            title="In Progress"
            value={formatNumber(dashboardData.onboarding?.in_progress || 0)}
            icon={Clock}
            description="Modules currently in progress"
            color="purple"
          />
          <SummaryCard
            title="Recent Completions"
            value={formatNumber(dashboardData.onboarding?.recent_completions || 0)}
            icon={CheckCircle}
            description="Completed in last 7 days"
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
                onClick={() => setActiveTab('onboarding')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'onboarding'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Onboarding Details
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Onboarding Status Distribution */}
                  <DataCard title="Onboarding Status Distribution" icon={PieChart}>
                    <p className="text-sm text-gray-600 mb-4">Current status of onboarding activities</p>
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
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [formatNumber(value), 'Count']} />
                          </RePieChart>
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
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {onboardingStatusData.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-600">{item.name}: {formatNumber(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </DataCard>

                  {/* Quick Stats */}
                  <DataCard title="Quick Statistics" icon={BarChart2}>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-gray-700">Pending Approvals</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          {formatNumber(dashboardData.pending_approvals || 0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center">
                          <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
                          <span className="text-sm font-medium text-gray-700">Total Modules</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">
                          {formatNumber(dashboardData.onboarding?.total_modules || 0)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-orange-600 mr-2" />
                          <span className="text-sm font-medium text-gray-700">In Progress</span>
                        </div>
                        <span className="text-lg font-bold text-orange-600">
                          {formatNumber(dashboardData.onboarding?.in_progress || 0)}
                        </span>
                      </div>
                      
                      {dashboardData.onboarding?.overdue > 0 && (
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Overdue</span>
                          </div>
                          <span className="text-lg font-bold text-red-600">
                            {formatNumber(dashboardData.onboarding.overdue)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-gray-700">Recent Completions (7d)</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {formatNumber(dashboardData.onboarding?.recent_completions || 0)}
                        </span>
                      </div>
                    </div>
                  </DataCard>
                </div>

                {/* Alert Section */}
                {dashboardData.pending_approvals > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-yellow-800">Action Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          You have {formatNumber(dashboardData.pending_approvals)} user approval{dashboardData.pending_approvals !== 1 ? 's' : ''} pending. 
                          Please review and approve them to allow users to access the system.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {dashboardData.onboarding?.overdue > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-800">Overdue Items</h4>
                        <p className="text-sm text-red-700 mt-1">
                          There are {formatNumber(dashboardData.onboarding.overdue)} overdue onboarding module{dashboardData.onboarding.overdue !== 1 ? 's' : ''}. 
                          Please follow up with the relevant mentees.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'onboarding' && (
              <div className="space-y-6">
                {/* Module Statistics */}
                <DataCard title="Module Completion Statistics" icon={BarChart2}>
                  <p className="text-sm text-gray-600 mb-4">Completion status for each onboarding module</p>
                  <div className="h-80">
                    {moduleCompletionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={moduleCompletionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                    <p className="font-semibold text-gray-900 mb-2">{data.fullName}</p>
                                    <p className="text-sm text-gray-600">Type: {data.moduleType}</p>
                                    <p className="text-sm text-green-600">Completed: {data.completed}</p>
                                    <p className="text-sm text-blue-600">In Progress: {data.inProgress}</p>
                                    <p className="text-sm text-gray-600">Not Started: {data.notStarted}</p>
                                    <p className="text-sm font-semibold text-gray-900 mt-2">
                                      Completion Rate: {data.completionRate}%
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="inProgress" name="In Progress" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="notStarted" name="Not Started" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                        </BarChart>
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
                </DataCard>

                {/* Module Details Table */}
                <DataCard title="Module Details" icon={FileText}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Module Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Assigned
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            In Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Not Started
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completion Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {onboardingReport?.modules?.map((module, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{module.module_title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                module.module_type === 'core' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {module.module_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatNumber(module.total_assigned)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                              {formatNumber(module.completed)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                              {formatNumber(module.in_progress)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatNumber(module.not_started)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${module.completion_rate}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {module.completion_rate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!onboardingReport?.modules || onboardingReport.modules.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No module data available</p>
                      </div>
                    )}
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
                Total Modules: <span className="font-semibold">{formatNumber(onboardingReport?.total_modules || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}