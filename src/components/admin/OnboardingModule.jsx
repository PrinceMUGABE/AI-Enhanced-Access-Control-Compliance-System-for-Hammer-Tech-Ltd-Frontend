import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "http://127.0.0.1:8000";

// Simple UI Components (since imported ones don't exist)
const Card = ({ children, className = '' }) => (
  <div className={`border rounded-lg shadow-sm ${className}`}>{children}</div>
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

const Select = ({ value, onValueChange, children }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
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
      <div className="relative z-50 bg-white rounded-lg shadow-lg mx-4 max-w-lg w-full max-h-[90vh] overflow-y-auto">
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

const TableHeader = ({ children }) => <thead>{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => <tr className="border-b">{children}</tr>;
const TableHead = ({ children }) => <th className="text-left p-3 font-medium">{children}</th>;
const TableCell = ({ children }) => <td className="p-3">{children}</td>;

// Icons
const CheckCircle = () => <span>✓</span>;
const Circle = () => <span>○</span>;
const Clock = () => <span>⏰</span>;
const UserPlus = () => <span>👤+</span>;
const Eye = () => <span>👁️</span>;
const Mail = () => <span>✉️</span>;
const Calendar = () => <span>📅</span>;
const Users = () => <span>👥</span>;
const AlertTriangle = () => <span>⚠️</span>;
const TrendingUp = () => <span>📈</span>;
const Loader2 = () => <span className="animate-spin">⟳</span>;
const FileText = () => <span>📄</span>;
const ListChecks = () => <span>✓✓</span>;
const Bell = () => <span>🔔</span>;
const SearchIcon = () => <span>🔍</span>;
const User = () => <span>👤</span>;
const AlertCircle = () => <span>⭕</span>;
const Target = () => <span>🎯</span>;
const BookOpen = () => <span>📖</span>;
const Lock = () => <span>🔒</span>;
const Zap = () => <span>⚡</span>;
const Award = () => <span>🏆</span>;
const ArrowRight = () => <span>→</span>;


const MultimediaUploader = ({ moduleId, onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: getFileTypeFromExtension(file.name),
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: '',
      progress: 0,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const getFileTypeFromExtension = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    if (audioExtensions.includes(extension)) return 'audio';
    return 'document';
  };

  const uploadFiles = async () => {
    setUploading(true);
    
    for (const fileData of files) {
      if (fileData.status === 'completed') continue;
      
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('module_id', moduleId);
      formData.append('type', fileData.type);
      formData.append('title', fileData.title);
      formData.append('description', fileData.description);
      
      try {
        const response = await fetch(`${BASE_URL}/onboarding/modules/${moduleId}/upload-file/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: formData
        });
        
        if (response.ok) {
          setFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          ));
        }
      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'error' }
            : f
        ));
      }
    }
    
    setUploading(false);
    onUploadComplete();
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-gray-400 mb-2 text-4xl">📁</div>
          <p className="text-gray-600">Click to upload multimedia files</p>
          <p className="text-sm text-gray-500 mt-1">Supports images, videos, audio, and documents</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(fileData => (
            <div key={fileData.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${
                    fileData.type === 'image' ? 'bg-blue-100' :
                    fileData.type === 'video' ? 'bg-purple-100' :
                    fileData.type === 'audio' ? 'bg-green-100' :
                    'bg-gray-100'
                  }`}>
                    {fileData.type === 'image' && '🖼️'}
                    {fileData.type === 'video' && '🎬'}
                    {fileData.type === 'audio' && '🎵'}
                    {fileData.type === 'document' && '📄'}
                  </div>
                  <div>
                    <p className="font-medium truncate">{fileData.title}</p>
                    <p className="text-xs text-gray-500">
                      {fileData.type} • {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {fileData.status === 'completed' && (
                    <Badge variant="success">Uploaded</Badge>
                  )}
                  {fileData.status === 'uploading' && (
                    <span className="text-sm text-gray-600">{fileData.progress}%</span>
                  )}
                  {fileData.status === 'error' && (
                    <Badge variant="destructive">Error</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <Button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload All Files'}
          </Button>
        </div>
      )}
    </div>
  );
};


export default function OnboardingModule() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [menteesSummary, setMenteesSummary] = useState([]);
  const [myProgress, setMyProgress] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  const [addMenteeModal, setAddMenteeModal] = useState(false);
  const [sendReminderModal, setSendReminderModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);

  const departmentsList = [
    "Software Development", "Frontend Development", "Backend Development",
    "Mobile Development", "Data Science", "Cybersecurity", "Cloud & DevOps",
    "UI/UX Design", "Project Management", "Business Development",
    "HR & Recruitment", "Digital Marketing", "IT Support",
    "Quality Assurance", "Product Management"
  ];

  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  const getUserInfo = () => {
    try {
      const token = getAuthToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || '');
        setUserId(payload.user_id || '');
        return { role: payload.role, userId: payload.user_id };
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return { role: '', userId: '' };
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      const userInfo = getUserInfo();
      
      if (!token) {
        setError("Please log in to access onboarding management");
        navigate('/login');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      // For admin/HR
      if (['admin', 'hr'].includes(userInfo.role)) {
        try {
          const statsResponse = await fetch(`${BASE_URL}/onboarding/modules/statistics/`, { headers });
          if (statsResponse.ok) {
            setStatistics(await statsResponse.json());
          }
        } catch (err) {
          console.error('Stats error:', err);
        }
      }

      // For admin/HR/mentor
      if (['admin', 'hr', 'mentor'].includes(userInfo.role)) {
        try {
          const menteesResponse = await fetch(`${BASE_URL}/onboarding/progress/all-summary/`, { headers });
          if (menteesResponse.ok) {
            const data = await menteesResponse.json();
            setMenteesSummary(data.mentees || []);
          }
        } catch (err) {
          console.error('Mentees error:', err);
        }
      } else if (userInfo.role === 'mentee') {
        // For mentee
        try {
          const myProgressResponse = await fetch(`${BASE_URL}/onboarding/progress/my-summary/`, { headers });
          if (myProgressResponse.ok) {
            setMyProgress(await myProgressResponse.json());
          }
        } catch (err) {
          console.error('Mentee progress error:', err);
        }
      }

      // Notifications for all
      try {
        const notificationsResponse = await fetch(`${BASE_URL}/onboarding/notifications/`, { headers });
        if (notificationsResponse.ok) {
          const data = await notificationsResponse.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error('Notifications error:', err);
      }

    } catch (error) {
      console.error('Error fetching onboarding data:', error);
      setError("Failed to load onboarding data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendReminderEmail = async () => {
    if (!selectedMentee) return;
    
    try {
      if (!reminderMessage.trim()) {
        alert("Please enter a reminder message");
        return;
      }
      
      setSendingReminder(true);
      
      const response = await fetch(`${BASE_URL}/onboarding/reminder/send/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: selectedMentee.id,
          notification_type: 'deadline_approaching',
          title: 'Onboarding Progress Reminder',
          message: reminderMessage,
        })
      });

      if (response.ok) {
        alert("Reminder sent successfully!");
        setSendReminderModal(false);
        setReminderMessage('');
        setSelectedMentee(null);
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Failed to send reminder');
      }

    } catch (error) {
      console.error("Error sending reminder:", error);
      alert(error.message || "Failed to send reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  const getStatusBadgeVariant = (progress) => {
    if (progress === 100) return 'default';
    if (progress >= 70) return 'secondary';
    if (progress >= 40) return 'outline';
    return 'destructive';
  };

  const getStatusText = (progress) => {
    if (progress === 100) return 'Completed';
    if (progress >= 70) return 'On Track';
    if (progress >= 40) return 'In Progress';
    return 'Needs Attention';
  };

  const canAddMentee = () => ['admin', 'hr'].includes(userRole);
  const canViewAllMentees = () => ['admin', 'hr', 'mentor'].includes(userRole);
  const canSendReminder = () => ['admin', 'hr', 'mentor'].includes(userRole);

  const filteredMentees = menteesSummary.filter(mentee => {
    const matchesSearch = 
      (mentee.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mentee.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || mentee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const getAccessibleTabs = () => {
    switch(userRole) {
      case 'admin':
      case 'hr':
        return ['overview', 'mentees', 'notifications'];
      case 'mentor':
        return ['overview', 'mentees', 'notifications'];
      case 'mentee':
        return ['overview', 'my-progress', 'notifications'];
      default:
        return ['overview'];
    }
  };

  const isTabAccessible = (tab) => {
    return getAccessibleTabs().includes(tab);
  };

  useEffect(() => {
    getUserInfo();
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 />
        <span className="ml-2 text-gray-600">Loading onboarding data...</span>
      </div>
    );
  }

  if (error) {
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Onboarding Management
            <Badge variant="outline" className="ml-2">
              {userRole.toUpperCase()}
            </Badge>
          </h1>
          <p className="text-gray-600">Track and manage onboarding progress</p>
        </div>
        
        {canAddMentee() && (
          <Button onClick={() => setAddMenteeModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus />
            <span className="ml-2">Add New Hire to Onboarding</span>
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      {['admin', 'hr'].includes(userRole) && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Onboarding</p>
                  <h3 className="text-2xl font-bold text-gray-900">{menteesSummary.length}</h3>
                </div>
                <Users />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-600">
                  Out of {statistics.total_mentees || 0} total mentees
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <h3 className="text-2xl font-bold text-gray-900">{statistics.completion_rate || 0}%</h3>
                </div>
                <Target />
              </div>
              <div className="mt-2">
                <Progress value={statistics.completion_rate || 0} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="overview">
            <Eye />
            <span className="ml-2">Overview</span>
          </TabsTrigger>
          
          {isTabAccessible('mentees') && (
            <TabsTrigger value="mentees">
              <Users />
              <span className="ml-2">Mentees ({menteesSummary.length})</span>
            </TabsTrigger>
          )}
          
          {isTabAccessible('my-progress') && (
            <TabsTrigger value="my-progress">
              <ListChecks />
              <span className="ml-2">My Progress</span>
            </TabsTrigger>
          )}
          
          <TabsTrigger value="notifications">
            <Bell />
            <span className="ml-2">Notifications ({notifications.filter(n => !n.is_read).length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {userRole === 'mentee' ? (
            <Card>
              <CardHeader>
                <CardTitle>My Onboarding Journey</CardTitle>
                <CardDescription>Track your progress and upcoming tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {myProgress.overall_progress_percentage !== undefined ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Overall Progress</h3>
                      <Progress value={myProgress.overall_progress_percentage} className="h-3 mb-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">
                          {myProgress.overall_progress_percentage.toFixed(1)}% Complete
                        </span>
                        <span className="text-gray-600">
                          {myProgress.completed_modules || 0}/{myProgress.total_modules || 0} modules
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No progress data available</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {canViewAllMentees() && (
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <div className="relative">
                          <SearchIcon />
                          <Input
                            placeholder="Search mentees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departmentsList.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    {userRole === 'mentor' ? 'My Mentees' : 'Active New Hires'}
                  </CardTitle>
                  <CardDescription>
                    {userRole === 'mentor' 
                      ? 'Monitor onboarding progress for mentees in your department' 
                      : 'Monitor onboarding progress for recent hires'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredMentees.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No mentees found</h3>
                      <p className="text-gray-500">
                        {userRole === 'mentor' 
                          ? 'No mentees assigned to your department yet' 
                          : 'Try adjusting your search or add new mentees to onboarding'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredMentees.map((mentee) => (
                        <div key={mentee.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                              <User />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 mb-1">{mentee.full_name}</h3>
                                  <p className="text-xs text-gray-600">
                                    {mentee.email} • {mentee.department}
                                  </p>
                                </div>
                                <Badge variant={getStatusBadgeVariant(mentee.overall_progress_percentage)}>
                                  {getStatusText(mentee.overall_progress_percentage)}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span>Onboarding Progress</span>
                                  <span>
                                    {mentee.overall_progress_percentage.toFixed(1)}% • 
                                    {mentee.completed_modules}/{mentee.total_modules} modules completed
                                  </span>
                                </div>
                                <Progress value={mentee.overall_progress_percentage} className="h-2" />
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="outline">
                                  <Eye />
                                  <span className="ml-2">View Details</span>
                                </Button>
                                {canSendReminder() && (
                                  <Button size="sm" variant="outline" onClick={() => {
                                    setSelectedMentee(mentee);
                                    setSendReminderModal(true);
                                  }}>
                                    <Mail />
                                    <span className="ml-2">Send Reminder</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Mentees Tab */}
        {isTabAccessible('mentees') && (
          <TabsContent value="mentees">
            <Card>
              <CardHeader>
                <CardTitle>
                  {userRole === 'mentor' ? 'My Department Mentees' : 'All Mentees in Onboarding'}
                </CardTitle>
                <CardDescription>
                  {userRole === 'mentor' 
                    ? 'View progress of mentees in your department' 
                    : 'Detailed view of all mentees\' progress'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredMentees.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {userRole === 'mentor' 
                        ? 'No mentees in your department' 
                        : 'No mentees in onboarding'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mentee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMentees.map((mentee) => (
                        <TableRow key={mentee.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{mentee.full_name}</p>
                              <p className="text-xs text-gray-500">{mentee.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{mentee.department}</Badge>
                          </TableCell>
                          <TableCell>
                            <Progress value={mentee.overall_progress_percentage} className="w-32" />
                            <p className="text-xs mt-1">{mentee.overall_progress_percentage.toFixed(1)}%</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(mentee.overall_progress_percentage)}>
                              {getStatusText(mentee.overall_progress_percentage)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell />
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 border rounded-lg ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.sent_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Send Reminder Modal */}
      <Dialog open={sendReminderModal} onOpenChange={setSendReminderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Reminder Email</DialogTitle>
            <DialogDescription>
              Send a reminder to {selectedMentee?.full_name} about their onboarding progress
            </DialogDescription>
          </DialogHeader>
          
          {selectedMentee && (
            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="reminder-message">Message *</Label>
                <Textarea
                  id="reminder-message"
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder={`Dear ${selectedMentee.full_name},\n\nThis is a reminder about your onboarding progress...`}
                  rows={6}
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Email will be sent to: {selectedMentee.email}</p>
                <p className="mt-2">Progress: {selectedMentee.overall_progress_percentage.toFixed(1)}%</p>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSendReminderModal(false);
                    setReminderMessage('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendReminderEmail}
                  disabled={sendingReminder || !reminderMessage.trim()}
                >
                  {sendingReminder ? (
                    <>
                      <Loader2 />
                      <span className="ml-2">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail />
                      <span className="ml-2">Send Reminder</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}