import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, UserCheck, UserX, TrendingUp, BarChart3, 
  Calendar, Clock, Target, Award, Briefcase, Building, 
  MessageSquare, Video, FileText, ChevronRight, Download,
  Eye, Filter, RefreshCw, AlertCircle, CheckCircle, XCircle,
  Activity, DollarSign, Layers, BarChart2,
  TrendingDown, Shield, Database,
  ArrowUpRight, ArrowDownRight, Percent, Loader2,
  AlertTriangle, UserPlus, BookOpen, MessageCircle,
  Settings, GraduationCap, Book, Mail,
  FileSpreadsheet, FileText as FileTextIcon, 
  FileBarChart, Search, X, Calendar as CalendarIcon,
  Printer, FileDown, DownloadCloud, Upload,
  ChevronDown, ChevronUp, ExternalLink,
  MoreVertical, Trash2, Edit, Eye as EyeIcon,
  Plus, Minus, Grid, List, Settings as SettingsIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, 
  Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

// API Service with new report endpoints
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
  },

  async generateReport(reportType, filters) {
    const response = await fetch('http://127.0.0.1:8000/report/generate/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ report_type: reportType, filters })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate report');
    }
    
    return await response.json();
  },

  async exportReport(format, data, reportConfig) {
    const response = await fetch('http://127.0.0.1:8000/report/export/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        format, 
        data, 
        config: reportConfig 
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to export report');
    }
    
    if (format === 'pdf') {
      return await response.blob();
    } else {
      return await response.blob();
    }
  }
};

// Custom Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    <span className="ml-2 text-gray-600">Loading data...</span>
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

const ReportCard = ({ title, description, icon: Icon, onSelect, isActive }) => (
  <button
    onClick={onSelect}
    className={`w-full bg-white rounded-xl shadow-sm border ${isActive ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'} p-6 hover:shadow-md transition-all text-left`}
  >
    <div className="flex items-start">
      <div className={`p-3 rounded-lg ${isActive ? 'bg-blue-500' : 'bg-gray-100'}`}>
        <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-600'}`} />
      </div>
      <div className="ml-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  </button>
);

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => (
  <div className="flex items-center space-x-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  </div>
);

const ExportButtons = ({ onExport, isExporting, reportData }) => (
  <div className="flex space-x-3">
    <button
      onClick={() => onExport('pdf')}
      disabled={isExporting || !reportData}
      className={`flex items-center px-4 py-2 rounded-lg ${isExporting ? 'bg-gray-100' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileTextIcon className="w-4 h-4 mr-2" />
      )}
      PDF
    </button>
    <button
      onClick={() => onExport('excel')}
      disabled={isExporting || !reportData}
      className={`flex items-center px-4 py-2 rounded-lg ${isExporting ? 'bg-gray-100' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileSpreadsheet className="w-4 h-4 mr-2" />
      )}
      Excel
    </button>
    <button
      onClick={() => onExport('csv')}
      disabled={isExporting || !reportData}
      className={`flex items-center px-4 py-2 rounded-lg ${isExporting ? 'bg-gray-100' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileBarChart className="w-4 h-4 mr-2" />
      )}
      CSV
    </button>
  </div>
);

const UserDetailsModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Full Name:</span>
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone:</span>
                  <p className="font-medium text-gray-900">{user.phone_number}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Account Information</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Role:</span>
                  <StatusBadge status={user.role} />
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <StatusBadge status={user.status} />
                </div>
                <div>
                  <span className="text-sm text-gray-600">Created At:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {user.department && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Department Information</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{user.department}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminReports() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [departmentReport, setDepartmentReport] = useState(null);
  
  // Report State
  const [selectedReport, setSelectedReport] = useState('users');
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    role: '',
    status: '',
    department: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Mock data for demonstration (in production, this would come from API)
  const mockUsers = [
    {
      id: 1,
      full_name: 'John Doe',
      email: 'john@btsl.com',
      phone_number: '+1234567890',
      role: 'admin',
      status: 'active',
      department: 'IT Support',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      full_name: 'Jane Smith',
      email: 'jane@btsl.com',
      phone_number: '+1234567891',
      role: 'mentor',
      status: 'active',
      department: 'Backend Development',
      created_at: '2024-01-14T14:20:00Z'
    },
    {
      id: 3,
      full_name: 'Bob Johnson',
      email: 'bob@btsl.com',
      phone_number: '+1234567892',
      role: 'mentee',
      status: 'pending',
      department: 'Frontend Development',
      created_at: '2024-01-13T09:15:00Z'
    },
    {
      id: 4,
      full_name: 'Alice Williams',
      email: 'alice@btsl.com',
      phone_number: '+1234567893',
      role: 'hr',
      status: 'active',
      department: 'HR',
      created_at: '2024-01-12T11:45:00Z'
    },
    {
      id: 5,
      full_name: 'Charlie Brown',
      email: 'charlie@btsl.com',
      phone_number: '+1234567894',
      role: 'mentor',
      status: 'inactive',
      department: 'Mobile Development',
      created_at: '2024-01-11T16:30:00Z'
    }
  ];

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [dashboard, analytics, departments] = await Promise.all([
        apiService.fetchDashboardData(),
        apiService.fetchUserAnalytics(),
        apiService.fetchDepartmentReport()
      ]);

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
      setError(err.message || 'Failed to load data');
      
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // In production, this would call the API
      // const result = await apiService.generateReport(selectedReport, filters);
      
      // For demo, simulate API call
      setTimeout(() => {
        let filteredData = [...mockUsers];
        
        // Apply date filter
        if (filters.startDate && filters.endDate) {
          filteredData = filteredData.filter(user => {
            const userDate = new Date(user.created_at);
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            return userDate >= start && userDate <= end;
          });
        }
        
        // Apply role filter
        if (filters.role) {
          filteredData = filteredData.filter(user => user.role === filters.role);
        }
        
        // Apply status filter
        if (filters.status) {
          filteredData = filteredData.filter(user => user.status === filters.status);
        }
        
        // Apply department filter
        if (filters.department) {
          filteredData = filteredData.filter(user => user.department === filters.department);
        }
        
        setReportData({
          type: selectedReport,
          filters,
          data: filteredData,
          generated_at: new Date(),
          summary: {
            total_records: filteredData.length,
            start_date: filters.startDate,
            end_date: filters.endDate
          }
        });
        setIsGenerating(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
      setIsGenerating(false);
    }
  };

  const handleExport = async (format) => {
    if (!reportData) return;
    
    setIsExporting(true);
    try {
      // In production, this would call the API
      // const blob = await apiService.exportReport(format, reportData, {
      //   title: 'BigTech Solutions Ltd - Digital Mentorship System Report',
      //   organization: 'BigTech Solutions Ltd (BTSL)',
      //   system: 'Digital Mentorship System',
      //   generated_by: user?.full_name || 'Admin',
      //   include_summary: true,
      //   include_charts: format === 'pdf'
      // });
      
      // For demo, create mock blob
      const mockBlob = new Blob(['Mock export content'], { type: 'text/plain' });
      const url = window.URL.createObjectURL(mockBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `btsl_mentorship_report_${selectedReport}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsExporting(false);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report');
      setIsExporting(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const reportTypes = [
    {
      id: 'users',
      title: 'Users Report',
      description: 'Generate detailed report of all users with filters',
      icon: Users,
      columns: ['Name', 'Email', 'Role', 'Status', 'Department', 'Created Date']
    },
    {
      id: 'mentorships',
      title: 'Mentorships Report',
      description: 'Active and completed mentorship relationships',
      icon: UserCheck,
      columns: ['Mentor', 'Mentee', 'Department', 'Status', 'Start Date', 'Progress']
    },
    {
      id: 'departments',
      title: 'Departments Report',
      description: 'Department-wise activity and metrics',
      icon: Building,
      columns: ['Department', 'Mentees', 'Mentors', 'Active Mentorships', 'Programs', 'Status']
    },
    {
      id: 'onboarding',
      title: 'Onboarding Report',
      description: 'Onboarding progress and completion rates',
      icon: BookOpen,
      columns: ['User', 'Module', 'Status', 'Progress', 'Started', 'Completed']
    },
    {
      id: 'sessions',
      title: 'Sessions Report',
      description: 'Mentorship session history and metrics',
      icon: Calendar,
      columns: ['Session', 'Mentor', 'Mentee', 'Date', 'Duration', 'Status']
    }
  ];

  const getReportSummary = () => {
    if (!reportData) return null;
    
    switch (selectedReport) {
      case 'users':
        return {
          title: 'User Registration Analysis',
          description: 'This report provides detailed analysis of user registrations within the Digital Mentorship System. It helps identify trends in user growth, role distribution, and account statuses.',
          keyMetrics: [
            { label: 'Total Users', value: formatNumber(reportData.summary.total_records) },
            { label: 'Date Range', value: `${filters.startDate || 'All time'} to ${filters.endDate || 'Present'}` },
            { label: 'Average Daily Registrations', value: '2.5' }
          ]
        };
      case 'mentorships':
        return {
          title: 'Mentorship Program Analysis',
          description: 'Comprehensive analysis of mentorship relationships, tracking engagement levels, completion rates, and relationship effectiveness.',
          keyMetrics: [
            { label: 'Active Mentorships', value: formatNumber(dashboardData?.mentorships?.active || 0) },
            { label: 'Completion Rate', value: '75%' },
            { label: 'Average Duration', value: '45 days' }
          ]
        };
      case 'departments':
        return {
          title: 'Department Performance Report',
          description: 'Analysis of department-level activity, resource allocation, and mentorship engagement across different teams.',
          keyMetrics: [
            { label: 'Active Departments', value: formatNumber(departmentReport?.total_departments || 0) },
            { label: 'Total Mentees', value: formatNumber(reportData.summary.total_records) },
            { label: 'Utilization Rate', value: '68%' }
          ]
        };
      default:
        return {
          title: 'System Report',
          description: 'General system performance and activity report.',
          keyMetrics: []
        };
    }
  };

  const renderReportTable = () => {
    if (!reportData || !reportData.data) return null;

    const currentReport = reportTypes.find(r => r.id === selectedReport);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Report Data</h3>
              <p className="text-sm text-gray-600">
                Showing {reportData.data.length} records
                {filters.startDate && filters.endDate && 
                  ` from ${filters.startDate} to ${filters.endDate}`}
              </p>
            </div>
            <ExportButtons 
              onExport={handleExport} 
              isExporting={isExporting} 
              reportData={reportData}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {currentReport.columns.map((col, index) => (
                  <th 
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.role} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewUser(item)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Report generated: {new Date(reportData.generated_at).toLocaleString()}</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchAllData} />;
  }

  const reportSummary = getReportSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Reporting</h1>
            <p className="text-sm text-gray-600">
              Generate comprehensive reports for BigTech Solutions Ltd (BTSL)
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchAllData}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Report Type Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Select Report Type</h3>
              <p className="text-sm text-gray-600">Choose the type of report you want to generate</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <ReportCard
                key={report.id}
                title={report.title}
                description={report.description}
                icon={report.icon}
                onSelect={() => setSelectedReport(report.id)}
                isActive={selectedReport === report.id}
              />
            ))}
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
              <p className="text-sm text-gray-600">Customize your report with filters</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <DateRangePicker
                startDate={filters.startDate}
                endDate={filters.endDate}
                onStartDateChange={(date) => handleFilterChange('startDate', date)}
                onEndDateChange={(date) => handleFilterChange('endDate', date)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
                <option value="hr">HR</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {departmentReport?.departments?.map((dept) => (
                  <option key={dept.department_id} value={dept.department_name}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileBarChart className="w-5 h-5 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Summary */}
        {reportSummary && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Report Summary</h3>
                <p className="text-sm text-gray-600">BigTech Solutions Ltd (BTSL) - Digital Mentorship System</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  CONFIDENTIAL
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{reportSummary.title}</h4>
                <p className="text-gray-600">{reportSummary.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportSummary.keyMetrics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">{metric.label}</div>
                    <div className="text-lg font-semibold text-gray-900">{metric.value}</div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Report Information:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Organization: BigTech Solutions Ltd (BTSL)</li>
                    <li>• System: Digital Mentorship System</li>
                    <li>• Generated By: {user?.full_name || 'System Administrator'}</li>
                    <li>• Generated At: {new Date().toLocaleString()}</li>
                    <li>• Report Type: {reportTypes.find(r => r.id === selectedReport)?.title}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Results */}
        {reportData && renderReportTable()}

        {/* Export Preview */}
        {reportData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
                <p className="text-sm text-gray-600">Download report in different formats</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileTextIcon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">PDF Format</h4>
                    <p className="text-sm text-gray-600">Professional document</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Includes company header</li>
                  <li>• Professional formatting</li>
                  <li>• Charts and graphs</li>
                  <li>• Executive summary</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Excel Format</h4>
                    <p className="text-sm text-gray-600">Data analysis ready</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Raw data export</li>
                  <li>• Formulas and filters</li>
                  <li>• Multiple sheets</li>
                  <li>• Pivot table ready</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileBarChart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">CSV Format</h4>
                    <p className="text-sm text-gray-600">Universal compatibility</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Simple text format</li>
                  <li>• Database import ready</li>
                  <li>• Machine readable</li>
                  <li>• Cross-platform</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <ExportButtons 
                onExport={handleExport} 
                isExporting={isExporting} 
                reportData={reportData}
              />
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.users?.total || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(departmentReport?.total_departments || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Mentorships</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.mentorships?.active || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Onboarding Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(dashboardData?.onboarding?.completion_rate || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Report Generation System</h4>
              <p className="text-sm text-gray-600">
                BigTech Solutions Ltd - Digital Mentorship Platform
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Version 2.0 • Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}