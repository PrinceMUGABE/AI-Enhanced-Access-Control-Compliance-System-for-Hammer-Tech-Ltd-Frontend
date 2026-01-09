import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://127.0.0.1:8000";

// Simple UI Components
const Card = ({ children, className = '' }) => (
  <div className={`border rounded-lg shadow-sm bg-white ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-gray-600 ${className}`}>{children}</p>
);

const Button = ({ children, className = '', variant = 'default', size = 'default', onClick, disabled }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
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

const Input = ({ value, onChange, placeholder, className = '', type = 'text' }) => (
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

const Select = ({ value, onValueChange, children, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}
  >
    {children}
  </select>
);

const SelectTrigger = ({ children }) => children;
const SelectValue = ({ placeholder }) => placeholder;
const SelectContent = ({ children }) => children;

const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
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
const DialogFooter = ({ children }) => (
  <div className="border-t p-6">{children}</div>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
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

const Alert = ({ children, variant = 'destructive', className = '' }) => (
  <div className={`p-4 rounded-md ${variant === 'destructive' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'} ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
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
    <table className="w-full">{children}</table>
  </div>
);

const TableHeader = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => <tr className="border-b hover:bg-gray-50 transition-colors">{children}</tr>;
const TableHead = ({ children, className = '' }) => <th className={`text-left p-3 font-medium text-gray-700 ${className}`}>{children}</th>;
const TableCell = ({ children, className = '' }) => <td className={`p-3 ${className}`}>{children}</td>;

// Icons
const CheckCircle = () => <span>✓</span>;
const XCircle = () => <span>✗</span>;
const Edit = () => <span>✏️</span>;
const Trash = () => <span>🗑️</span>;
const Plus = () => <span>➕</span>;
const Eye = () => <span>👁️</span>;
const Filter = () => <span>🔍</span>;
const Sort = () => <span>↕️</span>;
const ChevronUp = () => <span>↑</span>;
const ChevronDown = () => <span>↓</span>;
const Loader2 = () => <span className="animate-spin">⟳</span>;
const FileText = () => <span>📄</span>;
const Users = () => <span>👥</span>;
const Building = () => <span>🏢</span>;
const Clock = () => <span>⏰</span>;
const BookOpen = () => <span>📖</span>;
const Target = () => <span>🎯</span>;
const TrendingUp = () => <span>📈</span>;
const AlertCircle = () => <span>⚠️</span>;
const CheckSquare = () => <span>✅</span>;
const XSquare = () => <span>❌</span>;
const SearchIcon = () => <span>🔍</span>;

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange }) => {
  const pageSizes = [5, 10, 30, 50, 100];

  return (
    <div className="flex items-center justify-between border-t px-6 py-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Show</span>
        <Select value={pageSize} onValueChange={onPageSizeChange} className="w-20">
          {pageSizes.map(size => (
            <SelectItem key={size} value={size}>{size}</SelectItem>
          ))}
        </Select>
        <span className="text-sm text-gray-700">per page</span>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                size="sm"
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

// Module Status Badge Component
const ModuleStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return { variant: 'success', label: 'Active', icon: '✓' };
      case 'inactive':
        return { variant: 'destructive', label: 'Inactive', icon: '✗' };
      case 'draft':
        return { variant: 'outline', label: 'Draft', icon: '📝' };
      default:
        return { variant: 'secondary', label: status, icon: '?' };
    }
  };

  const config = getStatusConfig(status);
  return <Badge variant={config.variant}><span className="mr-1">{config.icon}</span>{config.label}</Badge>;
};

// Module Type Badge Component
const ModuleTypeBadge = ({ type }) => {
  const getTypeConfig = (type) => {
    switch (type) {
      case 'core':
        return { variant: 'default', label: 'Core', icon: '★' };
      case 'department':
        return { variant: 'secondary', label: 'Department', icon: '🏢' };
      default:
        return { variant: 'outline', label: type, icon: '?' };
    }
  };

  const config = getTypeConfig(type);
  return <Badge variant={config.variant}><span className="mr-1">{config.icon}</span>{config.label}</Badge>;
};

export default function OnboardingProgramManagement() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState('modules');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modules state
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  // Form states
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    module_type: 'core',
    department_ids: [],
    order: 0,
    is_required: true,
    duration_minutes: 30,
    content: [],
    resources: [],
    is_active: true
  });

  // Summary statistics
  const [summaryStats, setSummaryStats] = useState({
    total_modules: 0,
    active_modules: 0,
    core_modules: 0,
    department_modules: 0,
    total_departments: 0,
    avg_duration: 0
  });

  console.log("Logged in user token:", localStorage.getItem('access_token'));

  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  const getUserInfo = () => {
    try {
      // Get user data from localStorage (as stored in login page)
      const userStr = localStorage.getItem('user');

      if (userStr) {
        const userData = JSON.parse(userStr);
        setUserRole(userData.role || '');
        setUserId(userData.id || '');
        return {
          role: userData.role,
          userId: userData.id,
          fullName: userData.full_name,
          email: userData.email,
          workEmail: userData.work_mail_address,
          department: userData.department,
          phoneNumber: userData.phone_number,
          avatar: userData.avatar
        };
      }
    } catch (error) {
      console.error('Error retrieving user info:', error);
    }
    return { role: '', userId: '' };
  };

  // Fetch all modules
  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch modules
      const modulesResponse = await fetch(`${BASE_URL}/onboarding/modules/`, { headers });
      if (modulesResponse.ok) {
        const modulesData = await modulesResponse.json();

        // Transform data to include department_ids
        const transformedModules = modulesData.map(module => ({
          ...module,
          department_ids: module.departments?.map(dept => dept.id) || []
        }));

        setModules(transformedModules);
        setTotalItems(transformedModules.length);

        // Calculate summary statistics
        calculateSummaryStats(transformedModules);
      }

      // Fetch departments
      const departmentsResponse = await fetch(`${BASE_URL}/departments/all/`, { headers });
      if (departmentsResponse.ok) {
        const departmentsData = await departmentsResponse.json();
        setDepartments(departmentsData.data || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const calculateSummaryStats = (modulesData) => {
    const stats = {
      total_modules: modulesData.length,
      active_modules: modulesData.filter(m => m.is_active).length,
      core_modules: modulesData.filter(m => m.module_type === 'core').length,
      department_modules: modulesData.filter(m => m.module_type === 'department').length,
      total_departments: new Set(modulesData.flatMap(m => m.departments?.map(d => d.id) || [])).size,
      avg_duration: modulesData.reduce((sum, m) => sum + (m.duration_minutes || 0), 0) / modulesData.length || 0
    };
    setSummaryStats(stats);
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...modules];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(module =>
        statusFilter === 'active' ? module.is_active : !module.is_active
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(module => module.module_type === typeFilter);
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(module =>
        module.module_type === 'core' ||
        module.departments?.some(dept => dept.id.toString() === departmentFilter)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'duration_minutes':
          aValue = a.duration_minutes || 0;
          bValue = b.duration_minutes || 0;
          break;
        case 'order':
          aValue = a.order || 0;
          bValue = b.order || 0;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setTotalItems(filtered.length);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredModules(filtered.slice(startIndex, endIndex));
  }, [modules, searchTerm, statusFilter, typeFilter, departmentFilter, sortField, sortOrder, currentPage, pageSize]);

  // Handle page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, departmentFilter, pageSize]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sort indicator component
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />;
  };

  // Create module
  const createModule = async () => {
    try {
      const token = getAuthToken();

      // Prepare the data according to backend expectations
      const requestData = {
        title: moduleForm.title,
        description: moduleForm.description,
        module_type: moduleForm.module_type,
        order: moduleForm.order,
        is_required: moduleForm.is_required,
        duration_minutes: moduleForm.duration_minutes,
        content: moduleForm.content,
        resources: moduleForm.resources,
        is_active: moduleForm.is_active
      };

      // Only add departments if it's a department module
      if (moduleForm.module_type === 'department' && moduleForm.department_ids.length > 0) {
        requestData.departments = moduleForm.department_ids;
      }

      const response = await fetch(`${BASE_URL}/onboarding/modules/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const newModule = await response.json();

        // Transform the response to match frontend structure
        const transformedModule = {
          ...newModule,
          department_ids: newModule.departments?.map(dept => dept.id) || []
        };

        setModules([...modules, transformedModule]);
        setShowCreateModal(false);
        resetModuleForm();
        alert('Module created successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.message || JSON.stringify(error) || 'Failed to create module');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Update module
  const updateModule = async () => {
    try {
      const token = getAuthToken();

      // Prepare the data
      const requestData = {
        title: moduleForm.title,
        description: moduleForm.description,
        module_type: moduleForm.module_type,
        order: moduleForm.order,
        is_required: moduleForm.is_required,
        duration_minutes: moduleForm.duration_minutes,
        content: moduleForm.content,
        resources: moduleForm.resources,
        is_active: moduleForm.is_active
      };

      // Handle department_ids based on module type
      if (moduleForm.module_type === 'department') {
        requestData.department_ids = moduleForm.department_ids;
      } else {
        requestData.department_ids = [];
      }

      const response = await fetch(`${BASE_URL}/onboarding/modules/${selectedModule.id}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const updatedModule = await response.json();

        // Transform the response
        const transformedModule = {
          ...updatedModule,
          department_ids: updatedModule.departments?.map(dept => dept.id) || []
        };

        setModules(modules.map(m => m.id === selectedModule.id ? transformedModule : m));
        setShowEditModal(false);
        resetModuleForm();
        setSelectedModule(null);
        alert('Module updated successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.message || JSON.stringify(error) || 'Failed to update module');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Delete module
  const deleteModule = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${BASE_URL}/onboarding/modules/${selectedModule.id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setModules(modules.filter(m => m.id !== selectedModule.id));
        setShowDeleteModal(false);
        setSelectedModule(null);
        alert('Module deleted successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete module');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Assign module to departments
  const assignModuleToDepartments = async () => {
    try {
      const token = getAuthToken();
      const departmentIds = moduleForm.department_ids;

      const response = await fetch(`${BASE_URL}/onboarding/modules/${selectedModule.id}/department-assign/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ department_ids: departmentIds })
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh modules to get updated department assignments
        fetchModules();
        setShowAssignModal(false);
        resetModuleForm();
        alert(`Module assigned to ${result.assigned_count} mentees across ${result.departments_assigned.length} departments`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign module');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };


  const handleModuleTypeChange = (type) => {
    if (type === 'core') {
      // Clear departments when switching to core
      setModuleForm({
        ...moduleForm,
        module_type: type,
        department_ids: []
      });
    } else {
      setModuleForm({
        ...moduleForm,
        module_type: type
      });
    }
  };

  // Reset module form
  const resetModuleForm = () => {
    setModuleForm({
      title: '',
      description: '',
      module_type: 'core',
      department_ids: [],
      order: 0,
      is_required: true,
      duration_minutes: 30,
      content: [],
      resources: [],
      is_active: true
    });
  };

  // Initialize form for edit
  const initEditForm = (module) => {
    setModuleForm({
      title: module.title,
      description: module.description,
      module_type: module.module_type,
      department_ids: module.departments?.map(d => d.id) || [],
      order: module.order || 0,
      is_required: module.is_required,
      duration_minutes: module.duration_minutes || 30,
      content: module.content || [],
      resources: module.resources || [],
      is_active: module.is_active
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Initialize on component mount
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo.role !== 'admin') {
      setError('Only administrators can access this page');
      setLoading(false);
      return;
    }
    fetchModules();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 />
        <span className="ml-2 text-gray-600">Loading onboarding programs...</span>
      </div>
    );
  }

  if (error && !userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Onboarding Program Management
          </h1>
          <p className="text-gray-600">Manage onboarding programs and their department assignments</p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus />
          <span className="ml-2">Create New Program</span>
        </Button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <h3 className="text-2xl font-bold text-gray-900">{summaryStats.total_modules}</h3>
              </div>
              <FileText className="text-blue-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600">
                {summaryStats.core_modules} core • {summaryStats.department_modules} department
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Programs</p>
                <h3 className="text-2xl font-bold text-gray-900">{summaryStats.active_modules}</h3>
              </div>
              <CheckSquare className="text-green-600" />
            </div>
            <div className="mt-2">
              <Progress value={(summaryStats.active_modules / summaryStats.total_modules) * 100} />
              <p className="text-xs text-gray-600 mt-1">
                {((summaryStats.active_modules / summaryStats.total_modules) * 100).toFixed(1)}% active
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments Covered</p>
                <h3 className="text-2xl font-bold text-gray-900">{summaryStats.total_departments}</h3>
              </div>
              <Building className="text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600">
                Out of {departments.length} total departments
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
                <h3 className="text-2xl font-bold text-gray-900">{Math.round(summaryStats.avg_duration)} min</h3>
              </div>
              <Clock className="text-yellow-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600">
                Estimated completion time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search programs by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="department">Department</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredModules.length} of {totalItems} programs
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortField} onValueChange={setSortField} className="w-40">
                <SelectItem value="created_at">Date Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="duration_minutes">Duration</SelectItem>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                <div className="flex items-center">
                  Program Title
                  <SortIndicator field="title" />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Departments</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('duration_minutes')}>
                <div className="flex items-center">
                  Duration
                  <SortIndicator field="duration_minutes" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                <div className="flex items-center">
                  Created
                  <SortIndicator field="created_at" />
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-center">
                    <FileText className="text-4xl text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No programs found</h3>
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || departmentFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first onboarding program'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredModules.map((module, index) => (
                <TableRow key={module.id}>
                  <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{module.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {module.description.substring(0, 60)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ModuleTypeBadge type={module.module_type} />
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {module.module_type === 'core' ? (
                        <Badge variant="default">All Departments</Badge>
                      ) : module.departments?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {module.departments.slice(0, 2).map(dept => (
                            <Badge key={dept.id} variant="outline">{dept.name}</Badge>
                          ))}
                          {module.departments.length > 2 && (
                            <Badge variant="secondary">+{module.departments.length - 2} more</Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="destructive">No departments</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock />
                      <span className="ml-1">{module.duration_minutes} min</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {module.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(module.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedModule(module);
                          setShowAssignModal(true);
                        }}
                        title="Assign to departments"
                      >
                        <Users />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedModule(module);
                          initEditForm(module);
                          setShowEditModal(true);
                        }}
                        title="Edit program"
                      >
                        <Edit />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedModule(module);
                          setShowDeleteModal(true);
                        }}
                        title="Delete program"
                      >
                        <Trash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      {/* Create Program Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Onboarding Program</DialogTitle>
            <DialogDescription>
              Add a new onboarding program. Required fields are marked with *
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Program Title *</Label>
              <Input
                id="title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="e.g., Company Culture Orientation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Describe the program content and objectives..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module_type">Program Type *</Label>
                <Select
                  value={moduleForm.module_type}
                  onValueChange={handleModuleTypeChange}
                >
                  <SelectItem value="core">Core (All Departments)</SelectItem>
                  <SelectItem value="department">Department-Specific</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={moduleForm.duration_minutes}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration_minutes: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="480"
                />
              </div>
            </div>

            {moduleForm.module_type === 'department' && (
              <div className="space-y-2">
                <Label>Assign to Departments *</Label>
                <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id={`dept-${dept.id}`}
                        checked={moduleForm.department_ids.includes(dept.id)}
                        onChange={(e) => {
                          const newDeptIds = e.target.checked
                            ? [...moduleForm.department_ids, dept.id]
                            : moduleForm.department_ids.filter(id => id !== dept.id);
                          setModuleForm({ ...moduleForm, department_ids: newDeptIds });
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`dept-${dept.id}`} className="text-sm">
                        {dept.name} {dept.status === 'inactive' && <span className="text-red-500">(Inactive)</span>}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Selected: {moduleForm.department_ids.length} departments
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active">Status</Label>
                <Select
                  value={moduleForm.is_active ? 'active' : 'inactive'}
                  onValueChange={(value) => setModuleForm({ ...moduleForm, is_active: value === 'active' })}
                >
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={moduleForm.is_required}
                  onChange={(e) => setModuleForm({ ...moduleForm, is_required: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_required" className="text-sm">
                  Required completion for all assigned mentees
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetModuleForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createModule}
                disabled={!moduleForm.title || !moduleForm.description || (moduleForm.module_type === 'department' && moduleForm.department_ids.length === 0)}
              >
                Create Program
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Program Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Onboarding Program</DialogTitle>
            <DialogDescription>
              Update program details for {selectedModule?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            {/* Same form fields as create modal */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Program Title *</Label>
              <Input
                id="edit-title"
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Program Type *</Label>
                <Select
                  value={moduleForm.module_type}
                  onValueChange={(value) => setModuleForm({ ...moduleForm, module_type: value })}
                >
                  <SelectItem value="core">Core (All Departments)</SelectItem>
                  <SelectItem value="department">Department-Specific</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (minutes) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={moduleForm.duration_minutes}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration_minutes: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="480"
                />
              </div>
            </div>

            {moduleForm.module_type === 'department' && (
              <div className="space-y-2">
                <Label>Assign to Departments *</Label>
                <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        id={`edit-dept-${dept.id}`}
                        checked={moduleForm.department_ids.includes(dept.id)}
                        onChange={(e) => {
                          const newDeptIds = e.target.checked
                            ? [...moduleForm.department_ids, dept.id]
                            : moduleForm.department_ids.filter(id => id !== dept.id);
                          setModuleForm({ ...moduleForm, department_ids: newDeptIds });
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`edit-dept-${dept.id}`} className="text-sm">
                        {dept.name} {dept.status === 'inactive' && <span className="text-red-500">(Inactive)</span>}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  resetModuleForm();
                  setSelectedModule(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={updateModule}
                disabled={!moduleForm.title || !moduleForm.description}
              >
                Update Program
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedModule?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <Alert variant="destructive">
              <AlertDescription>
                Warning: Deleting this program will remove it from all assigned mentees' progress.
                This action is permanent and cannot be reversed.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedModule(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteModule}
              >
                Delete Program
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Departments Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Program to Departments</DialogTitle>
            <DialogDescription>
              Assign "{selectedModule?.title}" to departments to make it available for their mentees
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Select Departments</Label>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                {departments.map(dept => (
                  <div key={dept.id} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id={`assign-dept-${dept.id}`}
                      checked={moduleForm.department_ids.includes(dept.id)}
                      onChange={(e) => {
                        const newDeptIds = e.target.checked
                          ? [...moduleForm.department_ids, dept.id]
                          : moduleForm.department_ids.filter(id => id !== dept.id);
                        setModuleForm({ ...moduleForm, department_ids: newDeptIds });
                      }}
                      className="rounded"
                    />
                    <label htmlFor={`assign-dept-${dept.id}`} className="text-sm">
                      {dept.name} {dept.status === 'inactive' && <span className="text-red-500">(Inactive)</span>}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Selected: {moduleForm.department_ids.length} departments
              </p>
            </div>

            <Alert>
              <AlertDescription>
                This will assign the program to all approved mentees in the selected departments.
                Existing assignments will not be duplicated.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                  resetModuleForm();
                  setSelectedModule(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={assignModuleToDepartments}
                disabled={moduleForm.department_ids.length === 0}
              >
                Assign to Selected Departments
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}