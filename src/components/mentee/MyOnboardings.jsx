import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://127.0.0.1:8000";

// UI Components
const Card = ({ children, className = '' }) => (
  <div className={`border rounded-lg shadow-sm bg-white ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children }) => <h2 className="text-2xl font-bold text-gray-900">{children}</h2>;
const CardDescription = ({ children }) => <p className="text-gray-600">{children}</p>;

const Button = ({ children, onClick, variant = 'default', className = '', disabled, type = 'button' }) => {
  const base = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'
  };
  return (
    <button 
      type={type}
      className={`${base} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, className = '', type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  />
);

const Select = ({ value, onChange, options, className = '' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse border border-gray-200">{children}</table>
  </div>
);

const TableHeader = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children, className = '' }) => (
  <tr className={`border-b hover:bg-gray-50 ${className}`}>{children}</tr>
);
const TableHead = ({ children, className = '' }) => (
  <th className={`text-left p-3 font-medium text-gray-700 ${className}`}>{children}</th>
);
const TableCell = ({ children, className = '' }) => (
  <td className={`p-3 ${className}`}>{children}</td>
);

const Progress = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className={`h-2 rounded-full transition-all duration-300 ${
        value >= 80 ? 'bg-green-600' : 
        value >= 50 ? 'bg-blue-600' : 
        value >= 30 ? 'bg-yellow-500' : 
        'bg-red-600'
      }`}
      style={{ width: `${value}%` }}
    />
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-indigo-100 text-indigo-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Alert = ({ children, type = 'info', className = '' }) => {
  const types = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200'
  };
  return (
    <div className={`p-4 border rounded-md ${types[type]} ${className}`}>
      {children}
    </div>
  );
};

// Icons
const BookOpen = () => <span className="text-lg">📚</span>;
const Clock = () => <span className="text-lg">⏰</span>;
const Calendar = () => <span className="text-lg">📅</span>;
const CheckCircle = () => <span className="text-lg">✅</span>;
const AlertCircle = () => <span className="text-lg">⚠️</span>;
const TrendingUp = () => <span className="text-lg">📈</span>;
const SearchIcon = () => <span className="text-lg">🔍</span>;
const FilterIcon = () => <span className="text-lg">🔧</span>;
const SortIcon = () => <span className="text-lg">↕️</span>;
const PlayIcon = () => <span className="text-lg">▶️</span>;
const PauseIcon = () => <span className="text-lg">⏸️</span>;
const RefreshIcon = () => <span className="text-lg">🔄</span>;

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizes[size]} sm:w-full`}>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                ✕
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MenteeOnboardingDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedModuleType, setSelectedModuleType] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [summary, setSummary] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isStartingModule, setIsStartingModule] = useState(false);
  const [isCompletingModule, setIsCompletingModule] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState({});
  const [checklistProgress, setChecklistProgress] = useState({});
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  };

  // Fetch mentee's onboarding data
  const fetchMenteeData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;

      // Fetch modules assigned to mentee
      const modulesResponse = await fetch(`${BASE_URL}/onboarding/progress/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();
        setProgress(modulesData);
        
        // Extract modules from progress
        const assignedModules = modulesData.map(item => item.module);
        setModules(assignedModules);
      }

      // Fetch mentee summary
      const summaryResponse = await fetch(`${BASE_URL}/onboarding/progress/my-summary/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }

      // Fetch notifications
      const notificationsResponse = await fetch(`${BASE_URL}/onboarding/notifications/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.notifications || []);
      }

      // Fetch upcoming deadlines
      const deadlinesResponse = await fetch(`${BASE_URL}/onboarding/progress/upcoming-deadlines/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (deadlinesResponse.ok) {
        const deadlinesData = await deadlinesResponse.json();
        setDeadlines(deadlinesData);
      }

    } catch (error) {
      console.error('Error fetching mentee data:', error);
      alert("Failed to load onboarding data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch module details
  const fetchModuleDetails = async (moduleId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${BASE_URL}/onboarding/modules/${moduleId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const moduleData = await response.json();
        setSelectedModule(moduleData);
        
        // Fetch checklist progress for this module
        const progressRecord = progress.find(p => p.module === moduleId);
        if (progressRecord) {
          setChecklistProgress(progressRecord.checklist_progress || []);
        }
      }
    } catch (error) {
      console.error('Error fetching module details:', error);
    }
  };

  // Start a module
  const startModule = async (moduleId) => {
    try {
      setIsStartingModule(true);
      const token = getAuthToken();
      if (!token) return;

      const progressRecord = progress.find(p => p.module === moduleId);
      if (!progressRecord) {
        alert("Module not found in your assigned modules");
        return;
      }

      const response = await fetch(`${BASE_URL}/onboarding/progress/${progressRecord.id}/start/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert("Module started successfully!");
        await fetchMenteeData();
        
        // Start timer for this module
        setActiveTimer({
          moduleId,
          startTime: Date.now()
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to start module");
      }
    } catch (error) {
      console.error('Error starting module:', error);
      alert("Failed to start module");
    } finally {
      setIsStartingModule(false);
    }
  };

  // Update progress percentage
  const updateProgress = async (moduleId, percentage) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const progressRecord = progress.find(p => p.module === moduleId);
      if (!progressRecord) return;

      // Calculate time spent if timer is active
      let timeSpent = 0;
      if (activeTimer && activeTimer.moduleId === moduleId) {
        timeSpent = Math.floor((Date.now() - activeTimer.startTime) / 60000); // Convert to minutes
      }

      const response = await fetch(`${BASE_URL}/onboarding/progress/${progressRecord.id}/update-percentage/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          progress_percentage: percentage,
          time_spent_minutes: timeSpent
        })
      });

      if (response.ok) {
        setProgressPercentage(prev => ({
          ...prev,
          [moduleId]: percentage
        }));
        
        // Reset timer
        if (activeTimer && activeTimer.moduleId === moduleId) {
          setActiveTimer(null);
          setElapsedTime(0);
        }
        
        await fetchMenteeData();
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Complete a module
  const completeModule = async (moduleId) => {
    try {
      setIsCompletingModule(true);
      const token = getAuthToken();
      if (!token) return;

      const progressRecord = progress.find(p => p.module === moduleId);
      if (!progressRecord) return;

      const response = await fetch(`${BASE_URL}/onboarding/progress/${progressRecord.id}/complete/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert("Module completed successfully! 🎉");
        await fetchMenteeData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to complete module");
      }
    } catch (error) {
      console.error('Error completing module:', error);
      alert("Failed to complete module");
    } finally {
      setIsCompletingModule(false);
    }
  };

  // Update checklist item
  const updateChecklistItem = async (checklistItemId, isCompleted) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const progressRecord = progress.find(p => p.module === selectedModule?.id);
      if (!progressRecord) return;

      const response = await fetch(`${BASE_URL}/onboarding/progress/${progressRecord.id}/update-checklist/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          checklist_item_id: checklistItemId,
          is_completed: isCompleted
        })
      });

      if (response.ok) {
        // Update local state
        setChecklistProgress(prev =>
          prev.map(item =>
            item.id === checklistItemId
              ? { ...item, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null }
              : item
          )
        );
        
        // Recalculate overall progress
        const totalItems = selectedModule?.checklist_items?.length || 0;
        const completedItems = checklistProgress.filter(item => item.is_completed).length + (isCompleted ? 1 : -1);
        const newPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        
        await updateProgress(selectedModule.id, newPercentage);
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      await fetch(`${BASE_URL}/onboarding/notifications/${notificationId}/read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Open module details modal
  const openModuleModal = (moduleId) => {
    fetchModuleDetails(moduleId);
    setIsModuleModalOpen(true);
  };

  // Filter and sort modules
  const getFilteredAndSortedModules = () => {
    let filtered = [...progress];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.module_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.module_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Module type filter
    if (selectedModuleType !== 'all') {
      filtered = filtered.filter(item => item.module_type === selectedModuleType);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'due_date':
          aValue = new Date(a.due_date || 0);
          bValue = new Date(b.due_date || 0);
          break;
        case 'title':
          aValue = a.module_title?.toLowerCase() || '';
          bValue = b.module_title?.toLowerCase() || '';
          break;
        case 'progress':
          aValue = a.progress_percentage || 0;
          bValue = b.progress_percentage || 0;
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 60000); // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  // Initial data fetch
  useEffect(() => {
    fetchMenteeData();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (minutes) => {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'overdue': return 'destructive';
      case 'needs_attention': return 'warning';
      case 'off_track': return 'destructive';
      case 'paused': return 'secondary';
      default: return 'secondary';
    }
  };

  // Get priority color
  const getPriorityColor = (daysRemaining) => {
    if (daysRemaining < 0) return 'text-red-600 bg-red-50';
    if (daysRemaining <= 1) return 'text-red-600 bg-red-50';
    if (daysRemaining <= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading your onboarding dashboard...</span>
      </div>
    );
  }

  const filteredModules = getFilteredAndSortedModules();
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Dashboard</h1>
          <p className="text-gray-600">
            Track your onboarding progress, complete modules, and manage deadlines
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTimer && (
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <Clock />
                <span className="text-sm font-medium text-blue-700">
                  Timer: {formatTime(elapsedTime)}
                </span>
              </div>
            </div>
          )}
          {unreadNotifications > 0 && (
            <Button
              variant="outline"
              onClick={() => setActiveTab('notifications')}
              className="relative"
            >
              <span>Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          )}
          <Button
            onClick={fetchMenteeData}
            variant="outline"
            disabled={loading}
          >
            <RefreshIcon />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {summary.overall_percentage || 0}%
                  </h3>
                </div>
                <TrendingUp />
              </div>
              <Progress value={summary.overall_percentage || 0} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Modules Completed</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {summary.completed_modules || 0} / {summary.total_modules || 0}
                  </h3>
                </div>
                <CheckCircle />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {summary.total_modules - summary.completed_modules || 0} remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Time Spent</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatTime(summary.total_time_spent || 0)}
                  </h3>
                </div>
                <Clock />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Est. remaining: {formatTime(summary.estimated_time_remaining || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Deadlines</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {deadlines.filter(d => d.days_remaining <= 3 && d.days_remaining >= 0).length || 0}
                  </h3>
                </div>
                <Calendar />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {deadlines.filter(d => d.days_remaining < 0).length || 0} overdue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            className={`pb-2 px-1 flex items-center whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('overview')}
          >
            <BookOpen />
            <span className="ml-2">Modules ({modules.length})</span>
          </button>
          <button
            className={`pb-2 px-1 flex items-center whitespace-nowrap ${activeTab === 'deadlines' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('deadlines')}
          >
            <Calendar />
            <span className="ml-2">Deadlines ({deadlines.length})</span>
          </button>
          <button
            className={`pb-2 px-1 flex items-center whitespace-nowrap relative ${activeTab === 'notifications' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <AlertCircle />
            <span className="ml-2">Notifications</span>
            {unreadNotifications > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'not_started', label: 'Not Started' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'overdue', label: 'Overdue' },
                      { value: 'needs_attention', label: 'Needs Attention' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Type
                  </label>
                  <Select
                    value={selectedModuleType}
                    onChange={(e) => setSelectedModuleType(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Types' },
                      { value: 'core', label: 'Core Modules' },
                      { value: 'department', label: 'Department Modules' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="flex space-x-2">
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      options={[
                        { value: 'due_date', label: 'Due Date' },
                        { value: 'title', label: 'Title' },
                        { value: 'progress', label: 'Progress' },
                        { value: 'status', label: 'Status' }
                      ]}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3"
                    >
                      <SortIcon />
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules Table */}
          <Card>
            <CardHeader>
              <CardTitle>My Onboarding Modules</CardTitle>
              <CardDescription>
                {filteredModules.length} modules found • Click on a module to view details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredModules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No modules found</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedStatus !== 'all' || selectedModuleType !== 'all'
                      ? "Try adjusting your filters or search terms"
                      : "No modules have been assigned to you yet"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModules.map((item) => (
                      <TableRow 
                        key={item.id}
                        className="cursor-pointer hover:bg-blue-50"
                        onClick={() => openModuleModal(item.module)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{item.module_title}</p>
                            <p className="text-sm text-gray-600 truncate max-w-xs">
                              {item.module_description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.module_type === 'core' ? 'default' : 'secondary'}>
                            {item.module_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Progress value={item.progress_percentage} />
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{item.progress_percentage}%</span>
                              {item.time_spent_minutes > 0 && (
                                <span>{formatTime(item.time_spent_minutes)}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(item.status)}>
                            {item.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={`px-2 py-1 rounded text-center text-sm font-medium ${getPriorityColor(item.days_remaining || 0)}`}>
                            {item.due_date ? formatDate(item.due_date) : 'N/A'}
                            {item.days_remaining !== undefined && (
                              <div className="text-xs mt-1">
                                {item.days_remaining < 0 
                                  ? `${Math.abs(item.days_remaining)} days overdue` 
                                  : `${item.days_remaining} days left`}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatTime(item.time_spent_minutes || 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                            {item.status === 'not_started' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => startModule(item.module)}
                                disabled={isStartingModule}
                              >
                                <PlayIcon />
                                <span className="ml-2">Start</span>
                              </Button>
                            )}
                            {item.status === 'in_progress' && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => completeModule(item.module)}
                                  disabled={isCompletingModule}
                                >
                                  <CheckCircle />
                                  <span className="ml-2">Complete</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateProgress(item.module, Math.min(item.progress_percentage + 25, 100))}
                                >
                                  +25%
                                </Button>
                              </div>
                            )}
                            {item.status === 'completed' && (
                              <Badge variant="success" className="px-3 py-1">
                                COMPLETED
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deadlines Tab */}
      {activeTab === 'deadlines' && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>
              Track your module deadlines and completion targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming deadlines</h3>
                <p className="text-gray-600">All your modules are on track!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deadlines.map((deadline) => (
                  <div
                    key={deadline.module_id}
                    className={`p-4 border rounded-lg ${deadline.status === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{deadline.module_title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Due: {formatDate(deadline.due_date)}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">
                            Progress: {deadline.progress_percentage}%
                          </span>
                          {deadline.status === 'overdue' && (
                            <Badge variant="destructive">OVERDUE</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${deadline.days_remaining < 0 ? 'text-red-600' : deadline.days_remaining <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {deadline.days_remaining < 0 
                            ? `${Math.abs(deadline.days_remaining)} days overdue`
                            : `${deadline.days_remaining} days left`}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => openModuleModal(deadline.module_id)}
                        >
                          View Module
                        </Button>
                      </div>
                    </div>
                    {deadline.days_remaining < 0 && (
                      <Alert type="error" className="mt-3">
                        This module is overdue! Please complete it as soon as possible.
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Updates about your onboarding progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">🔔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    {unreadNotifications} unread of {notifications.length} total
                  </span>
                  {unreadNotifications > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const token = getAuthToken();
                        if (!token) return;
                        
                        await fetch(`${BASE_URL}/onboarding/notifications/mark-all-read/`, {
                          method: 'POST',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        setNotifications(prev => 
                          prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
                        );
                      }}
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg ${!notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          {!notification.is_read && (
                            <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(notification.sent_at)} • {notification.type}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                    {notification.module_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          openModuleModal(notification.module_id);
                          if (!notification.is_read) {
                            markNotificationAsRead(notification.id);
                          }
                        }}
                      >
                        Go to Module
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Module Details Modal */}
      <Modal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        title={selectedModule?.title}
        size="lg"
      >
        {selectedModule && (
          <div className="space-y-6">
            {/* Module Info */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">
                    {selectedModule.module_type === 'core' ? 'Core Module' : 'Department Module'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Duration</p>
                  <p className="font-medium">{selectedModule.duration_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">
                    <Badge variant={getStatusVariant(
                      progress.find(p => p.module === selectedModule.id)?.status || 'not_started'
                    )}>
                      {progress.find(p => p.module === selectedModule.id)?.status?.replace('_', ' ').toUpperCase() || 'NOT STARTED'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="font-medium">
                    {progress.find(p => p.module === selectedModule.id)?.progress_percentage || 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600">{selectedModule.description}</p>
            </div>

            {/* Content Sections */}
            {selectedModule.content && selectedModule.content.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                <ul className="space-y-2">
                  {selectedModule.content.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {selectedModule.resources && selectedModule.resources.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Resources</h4>
                <div className="space-y-2">
                  {selectedModule.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-blue-600 mr-2">🔗</span>
                      <div>
                        <p className="font-medium text-gray-900">{resource.title}</p>
                        <p className="text-sm text-gray-600">{resource.type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist */}
            {selectedModule.checklist_items && selectedModule.checklist_items.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Checklist</h4>
                <div className="space-y-3">
                  {selectedModule.checklist_items.map((item) => {
                    const checklistItem = checklistProgress.find(c => c.checklist_item === item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={checklistItem?.is_completed || false}
                            onChange={(e) => updateChecklistItem(item.id, e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            {item.description && (
                              <p className="text-sm text-gray-600">{item.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Estimated: {item.estimated_minutes} minutes
                            </p>
                          </div>
                        </div>
                        {checklistItem?.completed_at && (
                          <span className="text-xs text-gray-500">
                            Completed: {formatDate(checklistItem.completed_at)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsModuleModalOpen(false)}
              >
                Close
              </Button>
              {progress.find(p => p.module === selectedModule.id)?.status === 'not_started' && (
                <Button
                  variant="default"
                  onClick={() => {
                    startModule(selectedModule.id);
                    setIsModuleModalOpen(false);
                  }}
                  disabled={isStartingModule}
                >
                  <PlayIcon />
                  <span className="ml-2">Start Module</span>
                </Button>
              )}
              {progress.find(p => p.module === selectedModule.id)?.status === 'in_progress' && (
                <Button
                  variant="success"
                  onClick={() => {
                    completeModule(selectedModule.id);
                    setIsModuleModalOpen(false);
                  }}
                  disabled={isCompletingModule}
                >
                  <CheckCircle />
                  <span className="ml-2">Mark as Complete</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Quick Tips</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Click on any module to view detailed information</li>
                <li>Start modules early to avoid deadline pressure</li>
                <li>Complete checklist items to track your progress</li>
                <li>Check notifications regularly for updates</li>
                <li>Contact your mentor if you need help</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}