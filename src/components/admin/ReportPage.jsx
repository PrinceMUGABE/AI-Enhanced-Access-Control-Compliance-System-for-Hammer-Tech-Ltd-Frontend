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

// API Service
const apiService = {
  async generateReport(reportType, filters) {
    const response = await fetch('http://127.0.0.1:8000/report/generate/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        report_type: reportType, 
        filters: filters 
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate report');
    }
    
    return await response.json();
  },

  async exportReport(format, reportData, config = {}) {
    const response = await fetch('http://127.0.0.1:8000/report/export/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        format, 
        data: reportData,
        config: {
          title: `BigTech Solutions Ltd - ${reportData.report_type} Report`,
          organization: 'BigTech Solutions Ltd (BTSL)',
          system: 'Digital Mentorship System',
          generated_by: config.generatedBy || 'System Admin',
          include_summary: true,
          include_charts: format === 'pdf',
          ...config
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to export report');
    }
    
    if (format === 'pdf') {
      return await response.blob();
    } else if (format === 'excel') {
      return await response.blob();
    } else if (format === 'csv') {
      return await response.blob();
    }
    
    return await response.blob();
  },

  async fetchSystemStats() {
    const response = await fetch('http://127.0.0.1:8000/report/admin/dashboard/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch system statistics');
    }
    
    return await response.json();
  },

  async fetchDepartments() {
    const response = await fetch('http://127.0.0.1:8000/report/admin/departments/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }
    
    return await response.json();
  }
};

// Custom Components
const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
    <span className="text-gray-600">{text}</span>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Occurred</h3>
    <p className="text-red-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

// Helper function to format text
const formatStatusLabel = (status) => {
  if (!status || typeof status !== 'string') return 'Unknown';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    approved: { color: 'bg-blue-100 text-blue-800', label: 'Approved' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    completed: { color: 'bg-purple-100 text-purple-800', label: 'Completed' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    scheduled: { color: 'bg-indigo-100 text-indigo-800', label: 'Scheduled' },
    cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
    'in_progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
    'not_started': { color: 'bg-gray-100 text-gray-800', label: 'Not Started' },
    overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' }
  };

  const config = statusConfig[status] || { 
    color: 'bg-gray-100 text-gray-800', 
    label: formatStatusLabel(status)
  };

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

const ExportButtons = ({ onExport, isExporting, reportData }) => {
  if (!reportData) return null;

  return (
    <div className="flex space-x-3">
      <button
        onClick={() => onExport('pdf')}
        disabled={isExporting}
        className={`flex items-center px-4 py-2 rounded-lg ${isExporting ? 'bg-gray-100 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors disabled:opacity-70`}
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
        disabled={isExporting}
        className={`flex items-center px-4 py-2 rounded-lg ${isExporting ? 'bg-gray-100 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors disabled:opacity-70`}
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
        disabled={isExporting}
        className={`flex items-center px-4 py-2 rounded-lg ${isExporting ? 'bg-gray-100 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors disabled:opacity-70`}
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
};

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
                  <p className="font-medium text-gray-900">{user.full_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="font-medium text-gray-900">{user.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone:</span>
                  <p className="font-medium text-gray-900">{user.phone_number || 'N/A'}</p>
                </div>
                {user.work_mail_address && (
                  <div>
                    <span className="text-sm text-gray-600">Work Email:</span>
                    <p className="font-medium text-gray-900">{user.work_mail_address}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Account Information</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Role:</span>
                  <div className="mt-1">
                    <StatusBadge status={user.role} />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="mt-1">
                    <StatusBadge status={user.status} />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Availability:</span>
                  <div className="mt-1">
                    <StatusBadge status={user.availability_status} />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Created At:</span>
                  <p className="font-medium text-gray-900">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
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
          {user.is_active !== undefined && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Account Status</h4>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.is_active ? 'Active Account' : 'Inactive Account'}
                </div>
                {user.is_staff && (
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                    Staff Member
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ReportDataTable = ({ reportType, data, onViewDetails }) => {
  const renderTableHeaders = () => {
    switch (reportType) {
      case 'users':
        return ['Name', 'Email', 'Role', 'Status', 'Created Date'];
      case 'mentorships':
        return ['Mentor', 'Mentee', 'Department', 'Status', 'Progress', 'Sessions'];
      case 'departments':
        return ['Name', 'Mentees', 'Mentors', 'Active Mentorships', 'Programs', 'Utilization'];
      case 'onboarding':
        return ['Mentee', 'Module', 'Status', 'Progress'];
      case 'sessions':
        return ['Mentor', 'Mentee', 'Program', 'Status', 'Date', 'Duration'];
      default:
        return ['ID', 'Name', 'Status', 'Date', 'Details'];
    }
  };

  const renderTableCell = (item, header) => {
    try {
      switch (header) {
        case 'Name':
          return item.full_name || item.name || 'N/A';
        case 'Email':
          return item.email || item.work_mail_address || 'N/A';
        case 'Role':
          return <StatusBadge status={item.role} />;
        case 'Status':
          return <StatusBadge status={item.status} />;
        case 'Department':
          return item.department || item.department_name || 'N/A';
        case 'Created Date':
          return item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A';
        case 'Progress':
          return `${item.progress_percentage || 0}%`;
        case 'Sessions':
          return item.sessions_completed !== undefined ? `${item.sessions_completed}/${item.total_sessions}` : 'N/A';
        case 'Utilization':
          return `${item.utilization_rate || 0}%`;
        case 'Time Spent':
          return `${item.time_spent_minutes || 0} min`;
        case 'Duration':
          return `${item.duration_minutes || 0} min`;
        case 'Date':
          return item.scheduled_date ? new Date(item.scheduled_date).toLocaleDateString() : 'N/A';
        case 'Mentor':
          return item.mentor_name || 'N/A';
        case 'Mentee':
          return item.mentee_name || 'N/A';
        case 'Program':
          return item.program_name || item.current_program_name || 'N/A';
        case 'Module':
          return item.module_title || 'N/A';
        case 'Mentees':
          return item.mentee_count || 0;
        case 'Mentors':
          return item.mentor_count || 0;
        case 'Active Mentorships':
          return item.active_mentorships || 0;
        case 'Programs':
          return item.programs || 0;
        case 'Actions':
          return (
            <button
              onClick={() => onViewDetails(item)}
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              View Details
            </button>
          );
        default:
          return item[header.toLowerCase()] || 'N/A';
      }
    } catch (error) {
      console.error(`Error rendering table cell for header "${header}":`, error);
      return 'Error';
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No data available for this report</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {renderTableHeaders().map((header, index) => (
              <th 
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {renderTableHeaders().map((header, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  {renderTableCell(item, header)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function AdminReports() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [stats, depts] = await Promise.all([
        apiService.fetchSystemStats(),
        apiService.fetchDepartments()
      ]);

      setSystemStats(stats);
      setDepartments(depts.departments || []);
      
      console.log('✅ System data loaded successfully:', {
        stats: stats,
        departmentsCount: depts.departments?.length || 0
      });
      
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(err.message || 'Failed to load system data');
      
      if (err.message.includes('401') || err.message.includes('403')) {
        setError('Authentication failed. Please log in again.');
        setTimeout(() => logout(), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
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
    setError(null);
    
    try {
      // Prepare filters for API
      const apiFilters = {};
      if (filters.startDate) apiFilters.start_date = filters.startDate;
      if (filters.endDate) apiFilters.end_date = filters.endDate;
      if (filters.role) apiFilters.role = filters.role;
      if (filters.status) apiFilters.status = filters.status;
      if (filters.department) apiFilters.department = filters.department;
      
      console.log('📤 Sending report request:', {
        reportType: selectedReport,
        filters: apiFilters
      });
      
      const result = await apiService.generateReport(selectedReport, apiFilters);
      
      if (result.success) {
        setReportData(result);
        
        // Log report generation success
        console.log(`✅ Report generated: ${selectedReport}`);
        console.log(`Records: ${result.data?.length || 0}`);
        console.log(`Filters: ${JSON.stringify(apiFilters)}`);
        
        // Show sample data in console
        if (result.data && result.data.length > 0) {
          console.log('Sample Data (first 3 records):');
          result.data.slice(0, 3).forEach((item, index) => {
            console.log(`Record ${index + 1}:`, item);
          });
        }
      } else {
        throw new Error(result.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report');
      
      // Show error in console with details
      console.error('Report Generation Error Details:', {
        reportType: selectedReport,
        filters: filters,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format) => {
    if (!reportData) {
      setError('No report data to export. Please generate a report first.');
      return;
    }
    
    setIsExporting(true);
    setError(null);
    
    console.log(`📤 Starting export: ${format}`, {
      reportType: selectedReport,
      recordCount: reportData.data?.length || 0
    });
    
    try {
      const blob = await apiService.exportReport(format, reportData, {
        generatedBy: user?.full_name || 'System Administrator'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      // Set file extension based on format
      const extension = format === 'pdf' ? 'pdf' : 
                       format === 'excel' ? 'xlsx' : 'csv';
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `BTSL_Mentorship_${selectedReport}_${timestamp}.${extension}`;
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Log export success
      console.log(`✅ Report exported: ${format.toUpperCase()}`);
      console.log(`File: ${filename}`);
      console.log(`Size: ${blob.size} bytes`);
      console.log(`MIME type: ${blob.type}`);
      
      // Show success message
      setError(null);
      
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(`Failed to export ${format.toUpperCase()} file: ${err.message}`);
      
      // Show error in console with details
      console.error('Export Error Details:', {
        format: format,
        reportType: selectedReport,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const reportTypes = [
    {
      id: 'users',
      title: 'Users Report',
      description: 'Generate detailed report of all users with filters',
      icon: Users
    },
    {
      id: 'mentorships',
      title: 'Mentorships Report',
      description: 'Active and completed mentorship relationships',
      icon: UserCheck
    },
    {
      id: 'departments',
      title: 'Departments Report',
      description: 'Department-wise activity and metrics',
      icon: Building
    },
    {
      id: 'onboarding',
      title: 'Onboarding Report',
      description: 'Onboarding progress and completion rates',
      icon: BookOpen
    },
    {
      id: 'sessions',
      title: 'Sessions Report',
      description: 'Mentorship session history and metrics',
      icon: Calendar
    }
  ];

  const getReportSummary = () => {
    if (!reportData) return null;
    
    const summary = reportData.summary || {};
    const filters = reportData.filters || {};
    
    switch (selectedReport) {
      case 'users':
        return {
          title: 'User Registration Analysis',
          description: 'This report provides detailed analysis of user registrations within the Digital Mentorship System. It helps identify trends in user growth, role distribution, and account statuses.',
          keyMetrics: [
            { label: 'Total Users', value: formatNumber(summary.total_users || 0) },
            { label: 'Date Range', value: `${filters.start_date || 'All time'} to ${filters.end_date || 'Present'}` },
            { label: 'Active Users', value: formatNumber(summary.active_count || 0) }
          ]
        };
      case 'mentorships':
        return {
          title: 'Mentorship Program Analysis',
          description: 'Comprehensive analysis of mentorship relationships, tracking engagement levels, completion rates, and relationship effectiveness.',
          keyMetrics: [
            { label: 'Total Mentorships', value: formatNumber(summary.total_mentorships || 0) },
            { label: 'Active Mentorships', value: formatNumber(summary.active || 0) },
            { label: 'Average Rating', value: summary.average_rating ? `${summary.average_rating.toFixed(2)}/5` : 'N/A' }
          ]
        };
      case 'departments':
        return {
          title: 'Department Performance Report',
          description: 'Analysis of department-level activity, resource allocation, and mentorship engagement across different teams.',
          keyMetrics: [
            { label: 'Total Departments', value: formatNumber(summary.total_departments || 0) },
            { label: 'Total Mentees', value: formatNumber(summary.total_mentees || 0) },
            { label: 'Total Mentors', value: formatNumber(summary.total_mentors || 0) }
          ]
        };
      case 'onboarding':
        return {
          title: 'Onboarding Progress Report',
          description: 'Analysis of onboarding module completion rates, time spent, and progress tracking for new mentees.',
          keyMetrics: [
            { label: 'Total Records', value: formatNumber(summary.total_records || 0) },
            { label: 'Completed', value: formatNumber(summary.completed || 0) },
            { label: 'Average Progress', value: summary.average_progress ? `${summary.average_progress.toFixed(2)}%` : 'N/A' }
          ]
        };
      case 'sessions':
        return {
          title: 'Session History Report',
          description: 'Detailed analysis of mentorship sessions including completion rates, duration, and participant feedback.',
          keyMetrics: [
            { label: 'Total Sessions', value: formatNumber(summary.total_sessions || 0) },
            { label: 'Completed Sessions', value: formatNumber(summary.completed || 0) },
            { label: 'Completion Rate', value: summary.completion_rate ? `${summary.completion_rate}%` : 'N/A' }
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

  const renderExportOptions = () => {
    if (!reportData) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Export Options</h3>
            <p className="text-sm text-gray-600">Download report in different formats</p>
          </div>
          {isExporting && (
            <div className="flex items-center text-blue-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-sm">Exporting...</span>
            </div>
          )}
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
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading system data..." />;
  }

  const reportSummary = getReportSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Reporting System</h1>
            <p className="text-sm text-gray-600">
              Generate comprehensive reports for BigTech Solutions Ltd (BTSL)
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchInitialData}
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
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {reportData && !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700">
                Report generated successfully! {reportData.data?.length || 0} records found.
              </span>
            </div>
          </div>
        )}

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
            {isGenerating && (
              <div className="flex items-center text-blue-600">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="text-sm">Generating report...</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-8">Date Range</label>
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
                {departments.map((dept) => (
                 <span className='text-gray-700'><option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option></span> 
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Report...
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
        {reportData && reportSummary && (
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
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {reportData.records_count || reportData.data?.length || 0} RECORDS
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
                    <li>• Generated By: {reportData.generated_by || user?.full_name || 'System Administrator'}</li>
                    <li>• Generated At: {new Date(reportData.generated_at).toLocaleString()}</li>
                    <li>• Report Type: {reportTypes.find(r => r.id === selectedReport)?.title}</li>
                    <li>• Report ID: {reportData.report_type.toUpperCase()}_{new Date(reportData.generated_at).getTime()}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Results */}
        {reportData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Report Data</h3>
                  <p className="text-sm text-gray-600">
                    Showing {reportData.data?.length || 0} records
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
            
            <div className="p-6">
              <ReportDataTable 
                reportType={selectedReport}
                data={reportData.data || []}
                onViewDetails={handleViewDetails}
              />
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Report generated: {new Date(reportData.generated_at).toLocaleString()}</span>
                <span>Records: {reportData.data?.length || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        {reportData && renderExportOptions()}

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(systemStats?.users?.total || 0)}
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
                  {formatNumber(systemStats?.departments?.total || 0)}
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
                  {formatNumber(systemStats?.mentorships?.active || 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Onboarding Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(systemStats?.onboarding?.completed || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Advanced Report Generation System</h4>
              <p className="text-sm text-gray-600">
                BigTech Solutions Ltd - Digital Mentorship Platform v2.0
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {user?.full_name ? `Logged in as: ${user.full_name}` : 'System Administrator'}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <UserDetailsModal
          user={selectedItem}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}