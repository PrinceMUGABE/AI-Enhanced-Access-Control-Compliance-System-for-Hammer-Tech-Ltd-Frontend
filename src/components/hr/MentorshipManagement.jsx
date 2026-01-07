import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Define basic UI components (replace with actual imports if available)
const Card = ({ children, className = '' }) => (
  <div className={`border rounded-lg shadow-sm ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children }) => <h2 className="text-2xl font-bold">{children}</h2>;
const CardDescription = ({ children }) => <p className="text-gray-600">{children}</p>;
const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = 'text', className = '' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium">
    {children}
  </label>
);

const Select = ({ value, onValueChange, children }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
  >
    {children}
  </select>
);

const SelectTrigger = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

const SelectValue = ({ placeholder }) => placeholder;

const SelectContent = ({ children }) => (
  <div className="relative z-50">
    <div className="absolute bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
      {children}
    </div>
  </div>
);

const SelectItem = ({ value, children }) => (
  <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300',
    destructive: 'bg-red-100 text-red-800',
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Progress = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);

const Tabs = ({ value, onValueChange, children }) => (
  <div>{children}</div>
);

const TabsList = ({ children, className = '' }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
    {children}
  </div>
);

const TabsTrigger = ({ value, children, onClick, className = '' }) => (
  <button
    onClick={() => onClick(value)}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${className}`}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children }) => (
  <div className="mt-4">{children}</div>
);

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 bg-white rounded-lg shadow-lg mx-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }) => children;

const DialogHeader = ({ children }) => (
  <div className="border-b p-6">{children}</div>
);

const DialogTitle = ({ children }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

const DialogDescription = ({ children }) => (
  <p className="text-sm text-gray-600">{children}</p>
);

const DialogFooter = ({ children, className = '' }) => (
  <div className={`flex justify-end gap-2 p-6 border-t ${className}`}>{children}</div>
);

const Textarea = ({ value, onChange, placeholder, rows = 4, className = '' }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className={`flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
);

const Table = ({ children }) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full border-collapse">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children, className = '' }) => <tr className={`border-b ${className}`}>{children}</tr>;
const TableHead = ({ children }) => <th className="text-left p-3 font-medium">{children}</th>;
const TableCell = ({ children, className = '' }) => <td className={`p-3 ${className}`}>{children}</td>;

// Icons (text placeholders)
const SearchIcon = () => <span>🔍</span>;
const FilterIcon = () => <span>⚙️</span>;
const PlusIcon = () => <span>➕</span>;
const EditIcon = () => <span>✏️</span>;
const TrashIcon = () => <span>🗑️</span>;
const EyeIcon = () => <span>👁️</span>;
const UsersIcon = () => <span>👥</span>;
const BookOpenIcon = () => <span>📚</span>;
const ClockIcon = () => <span>⏰</span>;
const CheckCircleIcon = () => <span>✓</span>;
const XCircleIcon = () => <span>✗</span>;
const MoreVerticalIcon = () => <span>⋮</span>;
const DownloadIcon = () => <span>📥</span>;
const BuildingIcon = () => <span>🏢</span>;
const AlertCircleIcon = () => <span>⚠️</span>;
const RefreshIcon = () => <span>🔄</span>;
const SortAscIcon = () => <span>↑</span>;
const SortDescIcon = () => <span>↓</span>;
const BarChartIcon = () => <span>📊</span>;
const TrendingUpIcon = () => <span>📈</span>;
const TrendingDownIcon = () => <span>📉</span>;
const CalendarDaysIcon = () => <span>📅</span>;
const MailIcon = () => <span>✉️</span>;
const ExternalLinkIcon = () => <span>↗️</span>;
const FileTextIcon = () => <span>📄</span>;
const StarIcon = () => <span>⭐</span>;
const ChevronLeftIcon = () => <span>‹</span>;
const ChevronRightIcon = () => <span>›</span>;
const UserPlusIcon = () => <span>👤+</span>;
const FilterXIcon = () => <span>✖️</span>;
const CheckSquareIcon = () => <span>☑️</span>;

// API base URL
const BASE_URL = "http://127.0.0.1:8000";

// Utility functions
const getStatusBadgeProps = (status) => {
  switch (status) {
    case 'active':
      return { className: 'bg-green-100 text-green-800' };
    case 'completed':
      return { className: 'bg-blue-100 text-blue-800' };
    case 'pending':
      return { className: 'bg-yellow-100 text-yellow-800' };
    case 'paused':
      return { className: 'bg-orange-100 text-orange-800' };
    case 'cancelled':
      return { className: 'bg-red-100 text-red-800' };
    default:
      return { className: 'bg-gray-100 text-gray-800' };
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Active';
    case 'completed': return 'Completed';
    case 'pending': return 'Pending';
    case 'paused': return 'Paused';
    case 'cancelled': return 'Cancelled';
    default: return 'Unknown';
  }
};

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (includeTime) {
    return date.toLocaleString();
  }
  return date.toLocaleDateString();
};

const getProgressColor = (progress) => {
  if (progress >= 80) return 'bg-green-600';
  if (progress >= 50) return 'bg-yellow-600';
  return 'bg-red-600';
};

// API functions
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

const getMentorships = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/mentorships/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch mentorships');
  } catch (error) {
    console.error('Error fetching mentorships:', error);
    return [];
  }
};

const getMentorshipPrograms = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/mentorship/programs/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch programs');
  } catch (error) {
    console.error('Error fetching programs:', error);
    return [];
  }
};

const getDepartments = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/departments/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch departments');
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

const getMentors = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/users/mentors/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.users || data || [];
    }
    throw new Error('Failed to fetch mentors');
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return [];
  }
};

const getMentees = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/users/mentees/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.users || data || [];
    }
    throw new Error('Failed to fetch mentees');
  } catch (error) {
    console.error('Error fetching mentees:', error);
    return [];
  }
};

const createMentorship = async (mentorshipData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/mentorships/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mentorshipData)
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to create mentorship');
  } catch (error) {
    console.error('Error creating mentorship:', error);
    throw error;
  }
};

const updateMentorshipStatus = async (mentorshipId, statusData) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/mentorships/${mentorshipId}/status/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusData)
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to update status');
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

const deleteMentorship = async (mentorshipId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/mentorships/${mentorshipId}/delete/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to delete mentorship');
  } catch (error) {
    console.error('Error deleting mentorship:', error);
    throw error;
  }
};

const checkMenteeOnboarding = async (menteeId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/onboarding/check/${menteeId}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return { completed: false, message: 'Cannot verify onboarding status' };
  } catch (error) {
    console.error('Error checking onboarding:', error);
    return { completed: false, message: 'Error checking onboarding status' };
  }
};

const getMentorshipProgress = async (mentorshipId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/mentorships/${mentorshipId}/progress/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return { sessions_completed: 0, total_sessions: 0 };
  } catch (error) {
    console.error('Error fetching progress:', error);
    return { sessions_completed: 0, total_sessions: 0 };
  }
};

// Statistics calculation
const calculateMentorshipStats = (mentorships) => {
  const totalMentorships = mentorships.length;
  const activeMentorships = mentorships.filter(m => m.status === 'active').length;
  const completedMentorships = mentorships.filter(m => m.status === 'completed').length;
  
  const totalProgress = mentorships.reduce((sum, m) => sum + (m.progress_percentage || 0), 0);
  const averageProgress = totalMentorships > 0 ? totalProgress / totalMentorships : 0;
  
  // Calculate department stats
  const departmentStats = {};
  mentorships.forEach(m => {
    const dept = m.mentor?.department || m.program?.department || 'Unassigned';
    if (!departmentStats[dept]) {
      departmentStats[dept] = { count: 0, active: 0 };
    }
    departmentStats[dept].count++;
    if (m.status === 'active') {
      departmentStats[dept].active++;
    }
  });
  
  const departmentStatsArray = Object.entries(departmentStats).map(([department, stats]) => ({
    department,
    count: stats.count,
    active: stats.active
  })).sort((a, b) => b.count - a.count);
  
  return {
    totalMentorships,
    activeMentorships,
    completedMentorships,
    averageProgress,
    departmentStats: departmentStatsArray
  };
};

// Filter and sort functions
const filterMentorships = (mentorships, filters) => {
  return mentorships.filter(mentorship => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchMatch = 
        (mentorship.mentor?.full_name || '').toLowerCase().includes(searchLower) ||
        (mentorship.mentee?.full_name || '').toLowerCase().includes(searchLower) ||
        (mentorship.program?.name || '').toLowerCase().includes(searchLower);
      if (!searchMatch) return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && mentorship.status !== filters.status) {
      return false;
    }
    
    // Program filter
    if (filters.program !== 'all' && mentorship.program?.id !== filters.program) {
      return false;
    }
    
    // Department filter
    if (filters.department !== 'all') {
      const mentorDept = mentorship.mentor?.department;
      const programDept = mentorship.program?.department;
      if (mentorDept !== filters.department && programDept !== filters.department) {
        return false;
      }
    }
    
    return true;
  });
};

const sortMentorships = (mentorships, sortBy, sortOrder) => {
  return [...mentorships].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'mentor':
        valueA = a.mentor?.full_name || '';
        valueB = b.mentor?.full_name || '';
        break;
      case 'mentee':
        valueA = a.mentee?.full_name || '';
        valueB = b.mentee?.full_name || '';
        break;
      case 'program':
        valueA = a.program?.name || '';
        valueB = b.program?.name || '';
        break;
      case 'status':
        valueA = a.status || '';
        valueB = b.status || '';
        break;
      case 'progress':
        valueA = a.progress_percentage || 0;
        valueB = b.progress_percentage || 0;
        break;
      case 'start_date':
        valueA = new Date(a.start_date || 0);
        valueB = new Date(b.start_date || 0);
        break;
      case 'created_at':
        valueA = new Date(a.created_at || 0);
        valueB = new Date(b.created_at || 0);
        break;
      default:
        valueA = a[sortBy] || '';
        valueB = b[sortBy] || '';
    }
    
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

// Main component
export default function HRMentorshipManagement() {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedMentorships, setSelectedMentorships] = useState(new Set());
  
  // Data states
  const [mentorships, setMentorships] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [readyMentees, setReadyMentees] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    program: 'all',
    department: 'all',
    mentor: 'all',
    mentee: 'all',
    dateRange: {
      start: '',
      end: ''
    }
  });
  
  // Dialog states
  const [showCreateMentorship, setShowCreateMentorship] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  // Create mentorship form
  const [newMentorship, setNewMentorship] = useState({
    mentor_id: '',
    mentee_id: '',
    program_id: '',
    start_date: new Date().toISOString().split('T')[0],
    goals: [],
    notes: '',
  });
  
  const [step, setStep] = useState(1);
  const [menteeOnboardingStatus, setMenteeOnboardingStatus] = useState(null);
  
  // Calculate derived data
  const stats = useMemo(() => calculateMentorshipStats(mentorships || []), [mentorships]);
  
  const filteredMentorships = useMemo(() => {
    let filtered = filterMentorships(mentorships || [], filters);
    return sortMentorships(filtered, sortBy, sortOrder);
  }, [mentorships, filters, sortBy, sortOrder]);
  
  const totalPages = Math.ceil(filteredMentorships.length / itemsPerPage);
  const paginatedMentorships = filteredMentorships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [mentorshipsData, programsData, deptsData] = await Promise.all([
        getMentorships(),
        getMentorshipPrograms(),
        getDepartments()
      ]);
      
      setMentorships(mentorshipsData || []);
      setPrograms(programsData || []);
      setDepartments(deptsData || []);
      
      try {
        const [mentorsData, menteesData] = await Promise.all([
          getMentors(),
          getMentees()
        ]);
        
        setMentors(mentorsData || []);
        setReadyMentees(menteesData || []);
      } catch (userError) {
        console.warn('Failed to fetch user data:', userError);
        setMentors([]);
        setReadyMentees([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(error.message || 'Failed to load data');
      
      setMentorships([]);
      setPrograms([]);
      setDepartments([]);
      setMentors([]);
      setReadyMentees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  const handleCreateMentorship = async () => {
    try {
      if (!newMentorship.mentor_id || !newMentorship.mentee_id || !newMentorship.program_id) {
        alert('Please fill all required fields');
        return;
      }
      
      await createMentorship(newMentorship);
      
      alert('Mentorship created successfully');
      
      setShowCreateMentorship(false);
      setNewMentorship({
        mentor_id: '',
        mentee_id: '',
        program_id: '',
        start_date: new Date().toISOString().split('T')[0],
        goals: [],
        notes: '',
      });
      setStep(1);
      setMenteeOnboardingStatus(null);
      
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to create mentorship');
    }
  };
  
  const handleUpdateStatus = async (mentorshipId, newStatus) => {
    try {
      await updateMentorshipStatus(mentorshipId, { status: newStatus });
      alert(`Status updated to ${getStatusText(newStatus)}`);
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to update status');
    }
  };
  
  const handleDeleteMentorship = async (mentorshipId) => {
    if (!window.confirm('Are you sure you want to delete this mentorship? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteMentorship(mentorshipId);
      alert('Mentorship deleted successfully');
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to delete mentorship');
    }
  };
  
  const handleBulkAction = async (action) => {
    if (selectedMentorships.size === 0) {
      alert('Please select at least one mentorship');
      return;
    }
    
    try {
      switch (action) {
        case 'activate':
          await Promise.all(
            Array.from(selectedMentorships).map(id =>
              updateMentorshipStatus(id, { status: 'active' })
            )
          );
          break;
        case 'complete':
          await Promise.all(
            Array.from(selectedMentorships).map(id =>
              updateMentorshipStatus(id, { status: 'completed' })
            )
          );
          break;
        case 'pause':
          await Promise.all(
            Array.from(selectedMentorships).map(id =>
              updateMentorshipStatus(id, { status: 'paused' })
            )
          );
          break;
        case 'cancel':
          await Promise.all(
            Array.from(selectedMentorships).map(id =>
              updateMentorshipStatus(id, { status: 'cancelled' })
            )
          );
          break;
        case 'delete':
          if (!window.confirm(`Are you sure you want to delete ${selectedMentorships.size} mentorships?`)) {
            return;
          }
          await Promise.all(
            Array.from(selectedMentorships).map(id => deleteMentorship(id))
          );
          break;
      }
      
      alert(`Bulk action "${action}" completed successfully`);
      
      setSelectedMentorships(new Set());
      setShowBulkActions(false);
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to perform bulk action');
    }
  };
  
  const handleCheckOnboarding = async (menteeId) => {
    try {
      const status = await checkMenteeOnboarding(menteeId);
      setMenteeOnboardingStatus(status);
      
      if (!status.completed) {
        alert(`Onboarding Required: ${status.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      alert('Failed to check onboarding status');
      return false;
    }
  };
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  const handleExport = () => {
    alert('Export functionality coming soon');
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      program: 'all',
      department: 'all',
      mentor: 'all',
      mentee: 'all',
      dateRange: { start: '', end: '' }
    });
    setCurrentPage(1);
  };
  
  const toggleSelectAll = () => {
    if (selectedMentorships.size === paginatedMentorships.length) {
      setSelectedMentorships(new Set());
    } else {
      const allIds = new Set(paginatedMentorships.map(m => m.id));
      setSelectedMentorships(allIds);
    }
  };
  
  const toggleSelectMentorship = (mentorshipId) => {
    const newSelected = new Set(selectedMentorships);
    if (newSelected.has(mentorshipId)) {
      newSelected.delete(mentorshipId);
    } else {
      newSelected.add(mentorshipId);
    }
    setSelectedMentorships(newSelected);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading mentorship data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentorship Management</h1>
          <p className="text-gray-600">
            Manage all mentorship relationships, programs, and assignments
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshIcon />
            <span className="ml-2">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          
          <Button onClick={() => setShowCreateMentorship(true)}>
            <PlusIcon />
            <span className="ml-2">New Mentorship</span>
          </Button>
          
          {selectedMentorships.size > 0 && (
            <Button variant="secondary" onClick={() => setShowBulkActions(true)}>
              <CheckSquareIcon />
              <span className="ml-2">{selectedMentorships.size} Selected</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Mentorships</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMentorships}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <UsersIcon />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUpIcon />
              <span className="ml-1 text-green-600">{stats.activeMentorships} active</span>
              <span className="mx-2">•</span>
              <span className="text-gray-500">{stats.averageProgress.toFixed(0)}% avg progress</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Mentorships</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeMentorships}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="text-gray-900 font-medium">
                  {mentorships.filter(m => m.status === 'active').length > 0
                    ? (mentorships.filter(m => m.status === 'active')
                      .reduce((sum, m) => sum + m.progress_percentage, 0) /
                      mentorships.filter(m => m.status === 'active').length).toFixed(0)
                    : 0}% avg
                </span>
              </div>
              <Progress
                value={mentorships.filter(m => m.status === 'active').length > 0
                  ? mentorships.filter(m => m.status === 'active')
                    .reduce((sum, m) => sum + m.progress_percentage, 0) /
                  mentorships.filter(m => m.status === 'active').length
                  : 0
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">
            <BarChartIcon />
            <span className="ml-2">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="mentorships">
            <UsersIcon />
            <span className="ml-2">Mentorships ({filteredMentorships.length})</span>
          </TabsTrigger>
          <TabsTrigger value="programs">
            <BookOpenIcon />
            <span className="ml-2">Programs ({programs.length})</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest mentorship updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentorship</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentorships.slice(0, 5).map((mentorship) => {
                    const badgeProps = getStatusBadgeProps(mentorship.status);
                    return (
                      <TableRow key={mentorship.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {mentorship.mentor?.full_name} → {mentorship.mentee?.full_name}
                            </span>
                            <span className="text-sm text-gray-500">{mentorship.program?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={badgeProps.className}>
                            {getStatusText(mentorship.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{mentorship.progress_percentage}%</span>
                            </div>
                            <Progress
                              value={mentorship.progress_percentage}
                              className={`h-2 ${getProgressColor(mentorship.progress_percentage)}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {formatDate(mentorship.updated_at, true)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/mentorships/${mentorship.id}`)}
                          >
                            <EyeIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-center border-t pt-4">
              <Button variant="outline" onClick={() => setActiveTab('mentorships')}>
                View All Mentorships
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Mentorships Tab */}
        <TabsContent value="mentorships" className="space-y-6">
          {/* Filters Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Search */}
                <div className="flex-1 w-full">
                  <div className="relative">
                    <SearchIcon />
                    <Input
                      placeholder="Search mentors, mentees, programs..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2">
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <FilterIcon />
                    Filters
                  </Button>
                  
                  {(filters.search || filters.status !== 'all' || filters.program !== 'all') && (
                    <Button variant="ghost" onClick={clearFilters} size="sm">
                      <FilterXIcon />
                      <span className="ml-1">Clear</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Mentorships Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Mentorships</CardTitle>
                  <CardDescription>
                    {filteredMentorships.length} mentorships found
                    {filters.search && ` matching "${filters.search}"`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 per page</SelectItem>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="25">25 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={() => setShowExport(true)}>
                    <DownloadIcon />
                    <span className="ml-2">Export</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedMentorships.size === paginatedMentorships.length && paginatedMentorships.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('mentor')}>
                        <div className="flex items-center gap-1">
                          Mentor
                          {sortBy === 'mentor' && (
                            sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('mentee')}>
                        <div className="flex items-center gap-1">
                          Mentee
                          {sortBy === 'mentee' && (
                            sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('program')}>
                        <div className="flex items-center gap-1">
                          Program
                          {sortBy === 'program' && (
                            sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                        <div className="flex items-center gap-1">
                          Status
                          {sortBy === 'status' && (
                            sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('progress')}>
                        <div className="flex items-center gap-1">
                          Progress
                          {sortBy === 'progress' && (
                            sortOrder === 'asc' ? <SortAscIcon /> : <SortDescIcon />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMentorships.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <UsersIcon />
                            <p className="text-gray-600">No mentorships found</p>
                            {filters.search || filters.status !== 'all' || filters.program !== 'all' ? (
                              <p className="text-sm text-gray-500 mt-1">
                                Try adjusting your filters
                              </p>
                            ) : (
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => setShowCreateMentorship(true)}
                              >
                                <PlusIcon />
                                <span className="ml-2">Create Your First Mentorship</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedMentorships.map((mentorship) => {
                        const badgeProps = getStatusBadgeProps(mentorship.status);
                        const progressColor = getProgressColor(mentorship.progress_percentage);
                        
                        return (
                          <TableRow key={mentorship.id} className="hover:bg-gray-50">
                            <TableCell>
                              <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                checked={selectedMentorships.has(mentorship.id)}
                                onChange={() => toggleSelectMentorship(mentorship.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {mentorship.mentor?.full_name}
                                </span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <MailIcon />
                                  <span>{mentorship.mentor?.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {mentorship.mentee?.full_name}
                                </span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <MailIcon />
                                  <span>{mentorship.mentee?.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {mentorship.program?.name}
                                </span>
                                <Badge variant="outline" className="text-xs w-fit">
                                  {mentorship.program?.department}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={badgeProps.className}>
                                {getStatusText(mentorship.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {mentorship.sessions_completed}/{mentorship.program?.total_sessions} sessions
                                  </span>
                                  <span className="font-medium">{mentorship.progress_percentage}%</span>
                                </div>
                                <Progress
                                  value={mentorship.progress_percentage}
                                  className={`h-2 ${progressColor}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/admin/mentorships/${mentorship.id}`)}
                                  title="View Details"
                                >
                                  <EyeIcon />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(mentorship.id, 'active')}
                                  title="Mark Active"
                                >
                                  <CheckCircleIcon />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteMentorship(mentorship.id)}
                                  title="Delete"
                                  className="text-red-600"
                                >
                                  <TrashIcon />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMentorships.length)} of {filteredMentorships.length} mentorships
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon />
                  <span className="ml-1">Previous</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="mr-1">Next</span>
                  <ChevronRightIcon />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create Mentorship Dialog */}
      <Dialog open={showCreateMentorship} onOpenChange={setShowCreateMentorship}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Mentorship</DialogTitle>
            <DialogDescription>
              Step {step}: {step === 1 && "Select Mentor and Mentee"}
              {step === 2 && "Choose Program"}
              {step === 3 && "Set Details"}
            </DialogDescription>
          </DialogHeader>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stepNum === step
                  ? 'bg-blue-600 text-white'
                  : stepNum < step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }`}>
                  {stepNum < step ? '✓' : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-0.5 ${stepNum < step ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step 1: Mentor & Mentee Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Mentor Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Select Mentor</Label>
                    <Badge variant="outline">
                      {mentors.filter(m => m.availability_status === 'active').length} available
                    </Badge>
                  </div>
                  
                  <Select
                    value={newMentorship.mentor_id}
                    onValueChange={(value) => setNewMentorship({ ...newMentorship, mentor_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      {mentors.map(mentor => (
                        <SelectItem key={mentor.id} value={mentor.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{mentor.full_name}</span>
                            <span className="text-sm text-gray-500">
                              {mentor.department} • {mentor.availability_status === 'active' ? 'Available' : 'Busy'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Mentee Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Select Mentee</Label>
                    <Badge variant="outline">
                      {readyMentees.length} ready for mentorship
                    </Badge>
                  </div>
                  
                  <Select
                    value={newMentorship.mentee_id}
                    onValueChange={async (value) => {
                      setNewMentorship({ ...newMentorship, mentee_id: value });
                      
                      if (value) {
                        const status = await checkMenteeOnboarding(value);
                        setMenteeOnboardingStatus(status);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a mentee" />
                    </SelectTrigger>
                    <SelectContent>
                      {readyMentees.map(mentee => (
                        <SelectItem key={mentee.id} value={mentee.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{mentee.full_name}</span>
                            <span className="text-sm text-gray-500">
                              {mentee.department} • Onboarding ✓
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Program Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Select Program</Label>
                <Select
                  value={newMentorship.program_id}
                  onValueChange={(value) => setNewMentorship({ ...newMentorship, program_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a mentorship program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs
                      .filter(p => p.status === 'active')
                      .map(program => (
                        <SelectItem key={program.id} value={program.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{program.name}</span>
                            <span className="text-sm text-gray-500">
                              {program.department} • {program.total_sessions} sessions
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-semibold">Start Date</Label>
                <Input
                  type="date"
                  value={newMentorship.start_date}
                  onChange={(e) => setNewMentorship({ ...newMentorship, start_date: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-base font-semibold">Goals (Optional)</Label>
                <Textarea
                  placeholder="Enter mentorship goals, one per line"
                  value={newMentorship.goals.join('\n')}
                  onChange={(e) => setNewMentorship({
                    ...newMentorship,
                    goals: e.target.value.split('\n').filter(g => g.trim())
                  })}
                  rows={4}
                />
              </div>
              
              <div className="space-y-4">
                <Label className="text-base font-semibold">Notes (Optional)</Label>
                <Textarea
                  placeholder="Additional notes about this mentorship"
                  value={newMentorship.notes}
                  onChange={(e) => setNewMentorship({ ...newMentorship, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                onClick={() => {
                  if (step === 1) {
                    if (!newMentorship.mentor_id || !newMentorship.mentee_id) {
                      alert('Please select both mentor and mentee');
                      return;
                    }
                    
                    if (menteeOnboardingStatus && !menteeOnboardingStatus.completed) {
                      alert('Mentee must complete onboarding first');
                      return;
                    }
                  }
                  
                  if (step === 2 && !newMentorship.program_id) {
                    alert('Please select a program');
                    return;
                  }
                  
                  setStep(step + 1);
                }}
              >
                Continue
              </Button>
            ) : (
              <Button onClick={handleCreateMentorship}>
                Create Mentorship
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Perform actions on {selectedMentorships.size} selected mentorships
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleBulkAction('activate')}
                className="justify-start"
              >
                <CheckCircleIcon />
                <span className="ml-2">Mark as Active</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleBulkAction('complete')}
                className="justify-start"
              >
                <CheckCircleIcon />
                <span className="ml-2">Mark as Completed</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleBulkAction('pause')}
                className="justify-start"
              >
                <AlertCircleIcon />
                <span className="ml-2">Pause</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleBulkAction('cancel')}
                className="justify-start"
              >
                <XCircleIcon />
                <span className="ml-2">Cancel</span>
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActions(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}