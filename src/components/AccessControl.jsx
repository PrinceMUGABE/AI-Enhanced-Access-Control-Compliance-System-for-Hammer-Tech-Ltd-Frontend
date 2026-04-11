import React, { useState, useEffect } from "react";
import {
  X, Calendar, Activity, Clock, User, Shield, CheckCircle,
  XCircle, Search, Filter, Download, AlertCircle, RefreshCw,
  Eye, Lock, Unlock, Mail, Smartphone, Building, Globe,
  ChevronLeft, ChevronRight, BarChart, MoreVertical, TrendingUp
} from "lucide-react";
import axios from "axios";

// API configuration
const API_BASE_URL = "http://127.0.0.1:8000";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Access Control API functions
const accessControlAPI = {
  // Get statistics
  getStats: async () => {
    console.log("📊 Fetching stats from:", `${API_BASE_URL}/get_access_control_stats/`);
    try {
      const response = await api.get("/get_access_control_stats/");
      console.log("📊 Stats API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      throw error;
    }
  },

  // Get users with filters
  getUsers: async (filters = {}) => {
    console.log("👥 Fetching users with filters:", filters);
    try {
      const response = await api.get("/get_users_for_access_control/", { params: filters });
      console.log("👥 Users API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      throw error;
    }
  },

  // Get user logs
  getUserLogs: async (userId, filters = {}) => {
    console.log("🚀 === GET USER LOGS API CALL ===");
    console.log("📌 User ID:", userId);
    console.log("🎛️  Filters:", filters);
    console.log("🌐 Full URL:", `${API_BASE_URL}/get_user_activity_logs/${userId}/`);

    try {
      const response = await api.get(`/get_user_activity_logs/${userId}/`, {
        params: filters
      });

      console.log("✅ API RESPONSE RECEIVED");
      console.log("📊 Status:", response.status);
      console.log("📦 Full response data:", response.data);

      return response.data;

    } catch (error) {
      console.error("❌ API CALL FAILED");
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    }
  },

  // Update user status
  updateUserStatus: async (userId, action) => {
    console.log("🔄 Updating user status:", { userId, action });

    let endpoint = "";
    let method = "PUT";

    switch (action) {
      case "activate":
        endpoint = `/users/${userId}/activate/`;
        break;
      case "deactivate":
        endpoint = `/users/${userId}/deactivate/`;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    try {
      const response = await api({ method, url: endpoint });

      // Log this activity
      try {
        await api.post("/log_activity/", {
          activity: `user_${action}`,
          description: `${action}d user with ID ${userId}`,
          user_id: userId,
          is_success: true
        });
      } catch (logError) {
        console.log("⚠️ Activity logging failed:", logError);
      }

      return response.data;
    } catch (error) {
      console.error(`❌ Error ${action} user:`, error);
      throw error;
    }
  }
};

// Helper Components
const ActivityIcon = ({ activity }) => {
  const icons = {
    login: <Lock className="h-5 w-5 text-blue-600" />,
    logout: <Unlock className="h-5 w-5 text-gray-600" />,
    profile_update: <User className="h-5 w-5 text-green-600" />,
    password_change: <Shield className="h-5 w-5 text-purple-600" />,
    user_create: <User className="h-5 w-5 text-blue-600" />,
    user_update: <User className="h-5 w-5 text-yellow-600" />,
    department_create: <Building className="h-5 w-5 text-indigo-600" />,
    department_update: <Building className="h-5 w-5 text-orange-600" />,
    contact_us: <Mail className="h-5 w-5 text-pink-600" />,
    login_otp_request: <Smartphone className="h-5 w-5 text-teal-600" />,
    login_otp_verify: <CheckCircle className="h-5 w-5 text-green-600" />,
    view_user_logs: <Eye className="h-5 w-5 text-indigo-600" />,
    log_view: <Activity className="h-5 w-5 text-purple-600" />,
    default: <Activity className="h-5 w-5 text-gray-400" />
  };

  return icons[activity] || icons.default;
};

const StatusIcon = ({ isSuccess }) => {
  if (isSuccess) {
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
  return <XCircle className="h-5 w-5 text-red-500" />;
};

const RiskBadge = ({ score }) => {
  if (score < 20) {
    return (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Low Risk
      </span>
    );
  }
  if (score < 50) {
    return (
      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Medium Risk
      </span>
    );
  }
  return (
    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      High Risk
    </span>
  );
};

const StatusBadge = ({ status }) => {
  if (status === "active") {
    return (
      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Active
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
        Pending
      </span>
    );
  }
  return (
    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
      Suspended
    </span>
  );
};

const UserAvatar = ({ user }) => {
  const getColorClass = (name) => {
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-red-600",
      "bg-yellow-600",
      "bg-indigo-600",
      "bg-pink-600",
      "bg-teal-600"
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`w-10 h-10 rounded-full ${getColorClass(user?.name)} flex items-center justify-center text-white font-medium`}>
      {getInitials(user?.name)}
    </div>
  );
};

const LoadingSpinner = ({ text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="mt-4 text-gray-600 font-medium">{text}</p>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
    <div className="flex items-start gap-3">
      <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-bold text-red-800 text-lg mb-1">Error loading data</h3>
        <p className="text-red-700 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);

// Helper Functions
const formatActivityName = (activity) => {
  if (!activity) return 'Unknown Activity';
  return activity
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateString) => {
  if (!dateString) return 'No Date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Date Error';
  }
};

const formatDuration = (duration) => {
  if (!duration) return 'N/A';

  try {
    const seconds = Math.floor(duration);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } catch {
    return 'N/A';
  }
};

// User Logs Modal Component
const UserLogsModal = ({ user, isOpen, onClose, accessControlAPI }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const [filters, setFilters] = useState({
    activity: '',
    log_type: '',
    date_from: '',
    date_to: ''
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user logs
  const fetchUserLogs = async () => {
    if (!user || !isOpen) {
      console.log("❌ Cannot fetch logs: No user or modal not open");
      return;
    }

    console.log("🔄 ===== STARTING FETCH USER LOGS =====");
    console.log("👤 User:", user);
    console.log("🆔 User ID:", user.id);

    setLoading(true);
    setError(null);

    try {
      const response = await accessControlAPI.getUserLogs(user.id, filters);
      console.log("✅ API Response received:", response);

      if (response.success) {
        setLogs(response.logs || []);
        setSummary(response.summary || {
          total_logs: response.logs?.length || 0,
          successful_logs: (response.logs?.filter(log => log.is_success) || []).length,
          failed_logs: (response.logs?.filter(log => !log.is_success) || []).length,
          success_rate: response.logs?.length ?
            Math.round(((response.logs?.filter(log => log.is_success) || []).length / response.logs.length) * 100) : 0,
          top_activities: []
        });
      } else {
        throw new Error(response.error || "Failed to fetch logs");
      }

    } catch (error) {
      console.error("❌ Error fetching logs:", error);
      setError(error.message || "Failed to fetch logs");
      setLogs([]);
      setSummary({
        total_logs: 0,
        successful_logs: 0,
        failed_logs: 0,
        success_rate: 0,
        top_activities: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isOpen && user) {
      fetchUserLogs();
    }
  }, [isOpen, user]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      activity: '',
      log_type: '',
      date_from: '',
      date_to: ''
    });
    setSearchQuery('');
  };

  // Apply filters
  const applyFilters = () => {
    fetchUserLogs();
  };

  // Filter logs by search query
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (log.description?.toLowerCase() || '').includes(searchLower) ||
      (log.activity?.toLowerCase() || '').includes(searchLower) ||
      (log.endpoint?.toLowerCase() || '').includes(searchLower) ||
      (log.ip_address?.toLowerCase() || '').includes(searchLower) ||
      (log.user_email?.toLowerCase() || '').includes(searchLower)
    );
  });

  // Get top 5 recent logs
  const recentLogs = [...filteredLogs]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  // Get logs to display (either top 5 or all)
  const displayLogs = showAllLogs ? filteredLogs : recentLogs;

  // Close modal if no user
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      {/* Backdrop - Click to close */}
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-75"
        onClick={onClose}
      ></div>

      {/* Modal Container - FIXED positioning */}
      <div className="relative z-50 w-full max-w-6xl bg-white shadow-2xl rounded-lg overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  User Activity Logs
                </h2>
                <div className="flex items-center gap-2 mt-1 text-blue-100 text-sm">
                  <User className="h-3 w-3" />
                  <span className="font-medium">{user.name}</span>
                  <span className="text-blue-200">•</span>
                  <span>{user.email}</span>
                  <span className="text-blue-200">•</span>
                  <span className="capitalize">{user.role?.replace(/_/g, ' ')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchUserLogs}
                disabled={loading}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh Logs"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && !loading && (
          <div className="px-6 py-4 bg-gray-50 border-b flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Activities</p>
                    <p className="text-xl font-bold text-gray-800">{summary.total_logs}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</p>
                    <p className="text-xl font-bold text-gray-800">{summary.success_rate}%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-700">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Failed Activities</p>
                    <p className="text-xl font-bold text-gray-800">{summary.failed_logs}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Top Activity</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {summary.top_activities?.[0]?.activity
                        ? formatActivityName(summary.top_activities[0].activity)
                        : filteredLogs.length > 0
                          ? formatActivityName(filteredLogs[0].activity)
                          : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {summary.top_activities?.[0]?.count ||
                        (filteredLogs.length > 0
                          ? `${filteredLogs.filter(l => l.activity === filteredLogs[0].activity).length} times`
                          : '0 times')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-4 bg-white border-b flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Filters & Search</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors font-medium border border-gray-300"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                disabled={loading}
                className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 font-medium shadow-sm"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Apply Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Activity Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">
                Activity Type
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={filters.activity}
                onChange={(e) => handleFilterChange('activity', e.target.value)}
              >
                <option value="">All Activities</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="profile_update">Profile Update</option>
                <option value="password_change">Password Change</option>
                <option value="user_create">User Creation</option>
                <option value="user_update">User Update</option>
                <option value="view_user_logs">View User Logs</option>
                <option value="log_view">Log View</option>
              </select>
            </div>

            {/* Log Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">
                Log Category
              </label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={filters.log_type}
                onChange={(e) => handleFilterChange('log_type', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="authentication">Authentication</option>
                <option value="profile">Profile</option>
                <option value="user_management">User Management</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">
                Date From
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">
                Date To
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">
              Search Logs
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description, IP, endpoint..."
                className="w-full pl-9 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-800 text-sm mb-1">Error Loading Data</h3>
                  <p className="text-red-700 text-sm mb-3">{error}</p>
                  <button
                    onClick={fetchUserLogs}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-xs font-medium transition-colors shadow-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium text-sm">Loading activity logs...</p>
              <p className="text-gray-500 text-xs mt-1">Please wait while we fetch the data</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-lg border border-gray-200">
              <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Activity Logs Found</h3>
              <p className="text-gray-600 text-sm mb-4">
                {searchQuery || filters.activity || filters.date_from
                  ? "Try changing your search or filters"
                  : "No activity logs recorded for this user yet"}
              </p>
              <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="mb-1 font-medium">User ID: <span className="font-bold">{user.id}</span></p>
                <p className="font-medium">Total logs in database: <span className="font-bold">{logs.length}</span></p>
              </div>
            </div>
          ) : (
            <>
              {/* Section Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    {showAllLogs ? 'All Activity Logs' : 'Recent Activity (Top 5)'}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Showing <span className="font-semibold">{displayLogs.length}</span> of <span className="font-semibold">{filteredLogs.length}</span> logs
                    {searchQuery && ` (filtered by "${searchQuery}")`}
                  </p>
                </div>

                {filteredLogs.length > 5 && (
                  <button
                    onClick={() => setShowAllLogs(!showAllLogs)}
                    className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 font-medium shadow-sm"
                  >
                    <BarChart className="h-3 w-3" />
                    {showAllLogs ? 'Show Top 5 Only' : `View All ${filteredLogs.length} Logs`}
                  </button>
                )}
              </div>

              {/* Logs Table */}
              <div className="overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Activity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Device
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayLogs.map((log, index) => (
                        <tr
                          key={log.id || index}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <ActivityIcon activity={log.activity} />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {formatActivityName(log.activity)}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">
                                  {log.log_type?.replace('_', ' ') || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="max-w-xs">
                              <div className="text-sm text-gray-900">
                                {log.description || 'No description'}
                              </div>
                              {log.endpoint && (
                                <div className="text-xs text-gray-600 truncate mt-1 font-mono">
                                  <span className="font-semibold text-blue-700">{log.http_method}</span> {log.endpoint}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <div className="text-sm text-gray-900 font-medium">
                                {formatDate(log.timestamp)}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium bg-gray-100 px-2 py-1 rounded">
                              {log.user_agent || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                                {log.ip_address || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <StatusIcon isSuccess={log.is_success} />
                              <span className={`text-xs font-bold px-2 py-1 rounded ${log.is_success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {log.is_success ? 'Success' : 'Failed'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Logs information */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between text-xs">
                  <div className="text-blue-800">
                    <span className="font-bold">Displaying:</span> {displayLogs.length} logs
                    {filteredLogs.length !== logs.length && (
                      <span className="ml-3">
                        <span className="font-bold">Filtered:</span> {filteredLogs.length} of {logs.length}
                      </span>
                    )}
                  </div>
                  <div className="text-blue-700 text-xs font-medium">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-800 border-t flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              <span className="font-medium">{user.name}</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{user.role}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-400">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(logs, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                  const exportFileDefaultName = `user_${user.id}_logs_${new Date().toISOString().split('T')[0]}.json`;
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                disabled={logs.length === 0}
                className="px-4 py-2 text-xs bg-white hover:bg-gray-100 text-gray-800 rounded-md transition-colors flex items-center gap-2 font-medium border border-gray-300 disabled:opacity-50"
              >
                <Download className="h-3 w-3" />
                Export JSON
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Access Control Dashboard Component
export function AccessControl() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: ""
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Fetch stats data
  const fetchStats = async () => {
    try {
      const response = await accessControlAPI.getStats();
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.error || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(error.message);
    }
  };

  // Fetch users data
  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filters.role) params.append("role", filters.role);
      if (filters.status) params.append("status", filters.status);

      const response = await accessControlAPI.getUsers(params);
      if (response.success) {
        setUsers(response.data);
      } else {
        throw new Error(response.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    }
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchStats(), fetchUsers()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle user actions
  const handleUserAction = async (userId, action) => {
    try {
      const response = await accessControlAPI.updateUserStatus(userId, action);
      alert(`User ${action}d successfully!`);
      loadData(); // Refresh data
    } catch (error) {
      alert(`Failed to ${action} user: ${error.response?.data?.error || error.message}`);
    }
  };

  // Handle view logs
  const handleViewLogs = (user) => {
    console.log("👁️ VIEWING LOGS FOR USER:", user);
    setSelectedUser(user);
    setShowLogsModal(true);
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 bg-white">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Access Control Management</h1>
            <p className="text-gray-600 mt-2">Real-time user access monitoring and management</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* Requirements Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="font-medium text-blue-800">Live Data Dashboard</p>
              <p className="text-gray-700">
                <strong>Real-time Monitoring:</strong> This dashboard displays live data from your Django backend.
                All user statistics, access logs, and risk assessments are updated in real-time.
                Click refresh to get the latest data or use filters to drill down into specific user groups.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.total_users}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <Unlock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.active_users}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-50 text-red-600">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Suspended Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.suspended_users}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent Activity</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.recent_activity_count}</h3>
                <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search by name, email, or department..."
                className="pl-10 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="hr_manager">HR Manager</option>
              <option value="security_analyst">Security Analyst</option>
              <option value="compliance_officer">Compliance Officer</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Directory</h2>
              <p className="text-gray-600 mt-1">
                Showing {users.length} user{users.length !== 1 ? "s" : ""}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>
            {error && (
              <div className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        </div>

        {loading && !refreshing ? (
          <div className="p-12">
            <LoadingSpinner text="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
            <p className="text-gray-500">
              {searchQuery || filters.role || filters.status
                ? "Try changing your search or filters"
                : "No users in the system yet"}
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Risk Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.work_mail_address && (
                              <p className="text-xs text-gray-500">{user.work_mail_address}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.role === "admin" && (
                            <Shield className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="capitalize text-gray-700">{user.role?.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{user.department || 'No Department'}</span>
                          {user.departments && user.departments.length > 0 && (
                            <span className="text-xs text-gray-500">
                              (+{user.departments.length} more)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{user.last_login_display || 'Never'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${user.risk_score < 20 ? "bg-green-500" :
                                user.risk_score < 50 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                              style={{ width: `${Math.min(user.risk_score || 0, 100)}%` }}
                            ></div>
                          </div>
                          <div className="w-12 text-right font-medium text-gray-700">{user.risk_score || 0}</div>
                          <RiskBadge score={user.risk_score || 0} />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewLogs(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                            title="View Activity Logs"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Logs</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Additional Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Multi-Factor Authentication</h2>
              <p className="text-gray-600 mt-1">MFA adoption across organization</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Enabled</span>
                <span className="font-medium text-gray-900">
                  {stats.mfa_enabled_count} users ({stats.mfa_enabled_percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${stats.mfa_enabled_percentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Not Enabled</span>
                <span>
                  {stats.total_users - stats.mfa_enabled_count} users ({100 - stats.mfa_enabled_percentage}%)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Role Distribution</h2>
              <p className="text-gray-600 mt-1">Users by role category</p>
            </div>
            <div className="space-y-3">
              {stats.role_distribution && stats.role_distribution.map((role) => (
                <div key={role.role} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="flex-1 capitalize text-gray-700">{role.role?.replace('_', ' ')}</span>
                  <span className="font-medium text-gray-900">{role.count}</span>
                  <span className="text-sm text-gray-500">
                    ({Math.round((role.count / stats.total_users) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      {stats && (
        <div className="text-center text-sm text-gray-500">
          <p>Data last updated: {new Date(stats.last_updated).toLocaleString()}</p>
        </div>
      )}

      {/* User Logs Modal */}
      {showLogsModal && (
        <UserLogsModal
          user={selectedUser}
          isOpen={showLogsModal}
          onClose={() => {
            setShowLogsModal(false);
            setSelectedUser(null);
          }}
          accessControlAPI={accessControlAPI}
        />
      )}
    </div>
  );
}

export default AccessControl;