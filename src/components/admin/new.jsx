import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// API base URL
const BASE_URL = "http://127.0.0.1:8000";

// Helper functions
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (includeTime) {
    return date.toLocaleString();
  }
  return date.toLocaleDateString();
};

const getStatusBadgeProps = (status) => {
  switch (status) {
    case 'active':
      return { className: 'bg-green-100 text-green-800', label: 'Active' };
    case 'completed':
      return { className: 'bg-blue-100 text-blue-800', label: 'Completed' };
    case 'pending':
      return { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
    case 'paused':
      return { className: 'bg-orange-100 text-orange-800', label: 'Paused' };
    case 'cancelled':
      return { className: 'bg-red-100 text-red-800', label: 'Cancelled' };
    case 'scheduled':
      return { className: 'bg-blue-100 text-blue-800', label: 'Scheduled' };
    case 'inactive':
      return { className: 'bg-gray-100 text-gray-800', label: 'Inactive' };
    case 'archived':
      return { className: 'bg-gray-100 text-gray-800', label: 'Archived' };
    default:
      return { className: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  }
};

const getProgressColor = (progress) => {
  if (progress >= 80) return 'bg-green-600';
  if (progress >= 50) return 'bg-yellow-600';
  return 'bg-red-600';
};

// API functions
const fetchAPI = async (endpoint, method = 'GET', data = null) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const config = {
      method,
      headers
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// Programs API
const getMentorshipPrograms = async () => {
  return fetchAPI('/mentorship/programs/all/');
};

const getMentorshipProgramById = async (programId) => {
  return fetchAPI(`/mentorship/programs/${programId}/`);
};

const createMentorshipProgram = async (data) => {
  return fetchAPI('/mentorship/programs/create/', 'POST', data);
};

const updateMentorshipProgram = async (programId, data) => {
  return fetchAPI(`/mentorship/programs/${programId}/update/`, 'PUT', data);
};

const deleteMentorshipProgram = async (programId) => {
  return fetchAPI(`/mentorship/programs/${programId}/delete/`, 'DELETE');
};

const getProgramSessions = async (programId) => {
  return fetchAPI(`/mentorship/programs/${programId}/sessions/`);
};

const getProgramStatistics = async (programId) => {
  return fetchAPI(`/mentorship/program/${programId}/stats/`);
};

// Sessions API
const getSessionTemplates = async () => {
  return fetchAPI('/mentorship/session-templates/');
};

const getSessionTemplateById = async (templateId) => {
  return fetchAPI(`/mentorship/session-templates/${templateId}/`);
};

const createSessionTemplate = async (data) => {
  return fetchAPI('/mentorship/session-templates/create/', 'POST', data);
};

const updateSessionTemplate = async (templateId, data) => {
  return fetchAPI(`/mentorship/session-templates/${templateId}/update/`, 'PUT', data);
};

const deleteSessionTemplate = async (templateId) => {
  return fetchAPI(`/mentorship/session-templates/${templateId}/delete/`, 'DELETE');
};

// Mentorships API
const getMentorships = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return fetchAPI(`/mentorship/all-mentorships/?${queryParams}`);
};

const getMentorshipById = async (mentorshipId) => {
  return fetchAPI(`/mentorship/mentorships/${mentorshipId}/`);
};

const getDetailedMentorship = async (mentorshipId) => {
  return fetchAPI(`/mentorship/mentorship/${mentorshipId}/detailed/`);
};

const createMentorship = async (data) => {
  return fetchAPI('/mentorship/mentorships/create/', 'POST', data);
};

const updateMentorshipStatus = async (mentorshipId, status) => {
  return fetchAPI(`/mentorship/mentorships/${mentorshipId}/update-status/`, 'PUT', { status });
};

const deleteMentorship = async (mentorshipId) => {
  return fetchAPI(`/mentorship/mentorships/${mentorshipId}/delete/`, 'DELETE');
};

const bulkMentorshipActions = async (mentorshipIds, action) => {
  return fetchAPI('/mentorship/mentorships/bulk-actions/', 'POST', { mentorshipIds, action });
};

const getAvailableMentors = async (department) => {
  return fetchAPI(`/mentorship/available-mentors/?department=${encodeURIComponent(department)}`);
};

const getReadyMentees = async (department) => {
  return fetchAPI(`/mentorship/ready-mentees/?department=${encodeURIComponent(department)}`);
};

const getDepartments = async () => {
  return fetchAPI('/departments/all/');
};

const getMentorshipReviews = async (mentorshipId) => {
  return fetchAPI(`/mentorship/mentorships/${mentorshipId}/reviews/`);
};

// Enhanced Statistics API
const getDepartmentStatistics = async () => {
  try {
    return await fetchAPI('/mentorship/department-statistics/');
  } catch (error) {
    console.warn('Department statistics endpoint not available:', error.message);
    return null;
  }
};

const getDepartmentProgramStats = async (departmentId) => {
  try {
    return await fetchAPI(`/mentorship/department/${departmentId}/stats/`);
  } catch (error) {
    console.warn('Department program stats endpoint not available:', error.message);
    return null;
  }
};

const getTopPerformingMentors = async () => {
  try {
    return await fetchAPI('/mentorship/top-performing-mentors/');
  } catch (error) {
    console.warn('Top performing mentors endpoint not available:', error.message);
    return null;
  }
};

const getRecentActivity = async () => {
  try {
    return await fetchAPI('/mentorship/recent-activity/');
  } catch (error) {
    console.warn('Recent activity endpoint not available:', error.message);
    return null;
  }
};

// UI Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm border ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
  <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-gray-600 ${className}`}>{children}</p>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t p-6 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, type = 'button' }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-8 text-base',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = 'text', className = '', ...props }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
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

const Select = ({ value, onChange, children, className = '', placeholder = 'Select...' }) => (
  <select
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  >
    <option value="">{placeholder}</option>
    {children}
  </select>
);

const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium mb-1 ${className}`}>
    {children}
  </label>
);

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Progress = ({ value, className = '', showLabel = false }) => (
  <div className="space-y-1">
    {showLabel && (
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Progress</span>
        <span className="font-medium">{value}%</span>
      </div>
    )}
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(value)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const Table = ({ children, className = '' }) => (
  <div className="w-full overflow-x-auto">
    <table className={`w-full border-collapse ${className}`}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="bg-gray-50">{children}</thead>
);

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

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 bg-white rounded-lg shadow-lg mx-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const StarRatingDisplay = ({ rating, size = 'sm' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className={`${sizes[size]}`}>
          <svg
            className={`w-full h-full ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      ))}
      <span className="ml-1 text-sm text-gray-600">{rating ? rating.toFixed(1) : '0'}/5</span>
    </div>
  );
};

const DialogContent = ({ children, className = '' }) => (
  <div className={`relative z-50 bg-white rounded-lg shadow-lg mx-4 w-full max-h-[90vh] overflow-y-auto ${className}`}>
    {children}
  </div>
);

const DialogHeader = ({ children, className = '' }) => (
  <div className={`border-b p-6 ${className}`}>{children}</div>
);

const DialogTitle = ({ children }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

const DialogDescription = ({ children }) => (
  <p className="text-sm text-gray-600 mt-1">{children}</p>
);

const DialogFooter = ({ children, className = '' }) => (
  <div className={`flex justify-end gap-2 p-6 border-t ${className}`}>{children}</div>
);

const Tabs = ({ value, onValueChange, children }) => (
  <div>{children}</div>
);

const TabsList = ({ children, className = '' }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
    {children}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === value ? 'bg-white shadow-sm' : 'hover:bg-white/50'
      }`}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, activeTab }) => (
  <div className={`mt-6 ${value === activeTab ? 'block' : 'hidden'}`}>
    {children}
  </div>
);

// New MetricCard component for enhanced statistics
const MetricCard = ({ title, value, change, icon, color = 'blue', className = '' }) => (
  <Card className={`${className}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <span className={`ml-2 text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-full ${color === 'blue' ? 'bg-blue-100 text-blue-600' : color === 'green' ? 'bg-green-100 text-green-600' : color === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// New PerformanceBadge component
const PerformanceBadge = ({ rating, size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (rating >= 4.0) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (rating >= 3.5) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (rating >= 3.0) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-bold ${getRatingColor(rating)}`}>
      {rating.toFixed(1)}
    </div>
  );
};

// Icons (keep all existing icons, add new ones if needed)

// Enhanced Program Detail Modal
const ProgramDetailModal = ({ program, onClose, onEdit, onDelete }) => {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (program) {
      fetchProgramDetails();
    }
  }, [program]);

  const fetchProgramDetails = async () => {
    try {
      setLoading(true);
      const [sessionsData, statsData] = await Promise.all([
        getProgramSessions(program.id),
        getProgramStatistics(program.id)
      ]);
      
      setSessions(sessionsData.program?.sessions || []);
      setStats(statsData?.program || null);
    } catch (error) {
      console.error('Error fetching program details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!program) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{program.name}</DialogTitle>
              <DialogDescription>
                {getDepartmentName(program)} • {program.total_sessions || 0} sessions • {program.total_duration_hours || 0} hours
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onEdit}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              <Button variant="destructive" onClick={() => onDelete(program.id)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Program Overview */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Program Overview</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <p className="mt-1 text-gray-700">{program.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className={getStatusBadgeProps(program.status).className + ' mt-1'}>
                      {getStatusBadgeProps(program.status).label}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Total Days</Label>
                    <p className="mt-1 text-lg font-semibold">{program.total_days || 0} days</p>
                  </div>
                </div>
                {stats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Mentorships</Label>
                      <p className="mt-1 text-lg font-semibold">{stats.total_mentorships || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Completion Rate</Label>
                      <p className="mt-1 text-lg font-semibold">{stats.completion_rate || 0}%</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              {stats ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Mentorships</span>
                    <span className="font-semibold">{stats.active_mentorships || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Duration</span>
                    <span className="font-semibold">{stats.duration_stats?.average_duration || 0} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Rating</span>
                    <span className="font-semibold">{stats.rating_stats?.avg_rating?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Session Completion</span>
                    <span className="font-semibold">{stats.session_stats?.session_completion_rate || 0}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No statistics available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Session Templates ({sessions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading sessions...</p>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-gray-600">No session templates found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">
                          <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{session.title}</h4>
                          <p className="text-sm text-gray-600">{session.duration_minutes} min • {session.session_type}</p>
                        </div>
                      </div>
                      <Badge variant={session.is_required ? 'success' : 'secondary'}>
                        {session.is_required ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Enhanced Mentorship Detail Modal
const MentorshipDetailModal = ({ mentorship, onClose, onUpdateStatus, onDelete }) => {
  const [details, setDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mentorship) {
      fetchMentorshipDetails();
    }
  }, [mentorship]);

  const fetchMentorshipDetails = async () => {
    try {
      setLoading(true);
      const [detailsData, reviewsData] = await Promise.all([
        getDetailedMentorship(mentorship.id),
        getMentorshipReviews(mentorship.id)
      ]);
      
      setDetails(detailsData.mentorship || detailsData);
      setReviews(reviewsData.reviews || []);
    } catch (error) {
      console.error('Error fetching mentorship details:', error);
      // Fallback to basic data
      setDetails(mentorship);
    } finally {
      setLoading(false);
    }
  };

  if (!mentorship) return null;

  const calculateAverageReview = (reviewsArray) => {
    if (!reviewsArray || reviewsArray.length === 0) return null;

    const total = reviewsArray.reduce((sum, review) => sum + review.rating, 0);
    const communication = reviewsArray.reduce((sum, review) => sum + review.communication_rating, 0);
    const knowledge = reviewsArray.reduce((sum, review) => sum + review.knowledge_rating, 0);
    const helpfulness = reviewsArray.reduce((sum, review) => sum + review.helpfulness_rating, 0);

    return {
      overall: (total / reviewsArray.length).toFixed(1),
      communication: (communication / reviewsArray.length).toFixed(1),
      knowledge: (knowledge / reviewsArray.length).toFixed(1),
      helpfulness: (helpfulness / reviewsArray.length).toFixed(1),
      count: reviewsArray.length
    };
  };

  const averageReview = calculateAverageReview(reviews);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading mentorship details...</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl">Mentorship Details</DialogTitle>
                  <DialogDescription>
                    ID: {mentorship.id} • Created: {formatDate(mentorship.created_at)}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={mentorship.status}
                    onChange={(e) => onUpdateStatus(mentorship.id, e.target.value)}
                    className="w-32"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                  <Button variant="destructive" onClick={() => onDelete(mentorship.id)}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* Left Column - Overview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Participants */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Participants</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold">Mentor</h4>
                          <p className="text-gray-900">{mentorship.mentor?.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{mentorship.mentor?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold">Mentee</h4>
                          <p className="text-gray-900">{mentorship.mentee?.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{mentorship.mentee?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress & Goals */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Progress & Goals</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                          <span className="text-sm font-semibold">{mentorship.progress_percentage || 0}%</span>
                        </div>
                        <Progress value={mentorship.progress_percentage || 0} />
                      </div>
                      {details?.goals && details.goals.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Goals</h4>
                          <div className="space-y-2">
                            {details.goals.map((goal, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>{goal}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews Section */}
                {averageReview && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Reviews & Ratings</h3>
                        <Badge variant="success">{averageReview.count} Review{averageReview.count !== 1 ? 's' : ''}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Overall</p>
                          <div className="flex justify-center mt-2">
                            <PerformanceBadge rating={parseFloat(averageReview.overall)} size="md" />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Average</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Communication</p>
                          <div className="flex justify-center mt-2">
                            <StarRatingDisplay rating={parseFloat(averageReview.communication)} />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{averageReview.communication}/5</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Knowledge</p>
                          <div className="flex justify-center mt-2">
                            <StarRatingDisplay rating={parseFloat(averageReview.knowledge)} />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{averageReview.knowledge}/5</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Helpfulness</p>
                          <div className="flex justify-center mt-2">
                            <StarRatingDisplay rating={parseFloat(averageReview.helpfulness)} />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{averageReview.helpfulness}/5</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Department Info */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Department</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold">{getDepartmentName(mentorship)}</p>
                        <p className="text-sm text-gray-600">{mentorship.department?.description || 'No description'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Timeline</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Start Date</p>
                        <p className="font-medium">{formatDate(mentorship.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Expected End</p>
                        <p className="font-medium">{formatDate(mentorship.expected_end_date)}</p>
                      </div>
                      {mentorship.actual_end_date && (
                        <div>
                          <p className="text-sm text-gray-500">Actual End</p>
                          <p className="font-medium">{formatDate(mentorship.actual_end_date)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Programs */}
                {details?.programs && details.programs.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Assigned Programs</h3>
                      <div className="space-y-2">
                        {details.programs.map((program) => (
                          <div key={program.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <span className="font-medium truncate">{program.name}</span>
                            {program.id === details.current_program?.id && (
                              <Badge variant="success">Current</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Department Performance Modal
const DepartmentPerformanceModal = ({ department, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (department) {
      fetchDepartmentStats();
    }
  }, [department]);

  const fetchDepartmentStats = async () => {
    try {
      setLoading(true);
      const data = await getDepartmentProgramStats(department.id);
      setStats(data);
    } catch (error) {
      console.error('Error fetching department stats:', error);
      // Fallback to basic data
      setStats({
        department: department,
        programs: [],
        total_programs: 0,
        total_mentorships: 0,
        active_mentorships: 0,
        completion_rate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (!department) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{department.name} Performance</DialogTitle>
          <DialogDescription>
            Comprehensive analytics and metrics for {department.name} department
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading department statistics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Key Metrics */}
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Programs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_programs || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Active Mentorships</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.active_mentorships || 0}</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.completion_rate || 0}%</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Mentorships</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_mentorships || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Performance */}
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Program Performance</h3>
                {stats?.programs && stats.programs.length > 0 ? (
                  <div className="space-y-4">
                    {stats.programs.map((program) => (
                      <div key={program.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{program.name}</span>
                          <span className="text-sm font-semibold">{program.completion_rate || 0}%</span>
                        </div>
                        <Progress value={program.completion_rate || 0} />
                        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="text-center">
                            <span className="font-medium">{program.total_mentorships || 0}</span>
                            <p className="text-xs">Total</p>
                          </div>
                          <div className="text-center">
                            <span className="font-medium">{program.active_mentorships || 0}</span>
                            <p className="text-xs">Active</p>
                          </div>
                          <div className="text-center">
                            <span className="font-medium">{program.average_rating || 'N/A'}</span>
                            <p className="text-xs">Avg. Rating</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No program data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Helper function to get department name
const getDepartmentName = (item) => {
  if (!item) return 'N/A';
  
  if (typeof item.department === 'string') {
    return item.department;
  }
  
  if (item.department && typeof item.department === 'object') {
    return item.department.name || 'N/A';
  }
  
  if (item.name) {
    return item.name;
  }
  
  return 'N/A';
};

// Main Component
export default function AdminMentorshipManagement() {
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [showCreateSessionTemplate, setShowCreateSessionTemplate] = useState(false);
  const [showCreateMentorship, setShowCreateMentorship] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Data states
  const [programs, setPrograms] = useState([]);
  const [sessionTemplates, setSessionTemplates] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Enhanced statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalPrograms: 0,
    activePrograms: 0,
    totalSessions: 0,
    totalMentorships: 0,
    activeMentorships: 0,
    completedMentorships: 0,
    departmentStats: [],
    mentorPerformance: [],
    recentActivity: [],
    overallStats: null
  });

  // Filter states
  const [programFilters, setProgramFilters] = useState({
    search: '',
    status: 'all',
    department: 'all'
  });

  const [mentorshipFilters, setMentorshipFilters] = useState({
    search: '',
    status: 'all',
    department: 'all'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Enhanced data fetching
  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        programsData,
        sessionTemplatesData,
        mentorshipsData,
        departmentsData,
        statsData,
        topMentorsData,
        activityData
      ] = await Promise.all([
        getMentorshipPrograms(),
        getSessionTemplates(),
        getMentorships(),
        getDepartments(),
        getDepartmentStatistics(),
        getTopPerformingMentors(),
        getRecentActivity()
      ]);

      // Set data
      setPrograms(Array.isArray(programsData?.programs || programsData?.data || programsData)
        ? (programsData?.programs || programsData?.data || programsData)
        : []);

      setSessionTemplates(Array.isArray(sessionTemplatesData?.templates || sessionTemplatesData?.data || sessionTemplatesData)
        ? (sessionTemplatesData?.templates || sessionTemplatesData?.data || sessionTemplatesData)
        : []);

      setMentorships(Array.isArray(mentorshipsData?.mentorships || mentorshipsData?.data || mentorshipsData)
        ? (mentorshipsData?.mentorships || mentorshipsData?.data || mentorshipsData)
        : []);

      setDepartments(Array.isArray(departmentsData?.departments || departmentsData?.data || departmentsData)
        ? (departmentsData?.departments || departmentsData?.data || departmentsData)
        : []);

      // Set enhanced statistics
      if (statsData) {
        setDashboardStats(prev => ({
          ...prev,
          departmentStats: statsData.departments || [],
          overallStats: statsData.overall || null
        }));
      }

      if (topMentorsData) {
        setDashboardStats(prev => ({
          ...prev,
          mentorPerformance: topMentorsData.mentors || []
        }));
      }

      if (activityData) {
        setDashboardStats(prev => ({
          ...prev,
          recentActivity: activityData.activities || []
        }));
      }

      // Calculate basic stats from local data
      calculateEnhancedStats();

    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't alert for statistics errors, they're not critical
      if (!error.message.includes('department-statistics') && 
          !error.message.includes('top-performing-mentors') &&
          !error.message.includes('recent-activity')) {
        alert('Failed to load main data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate enhanced statistics
  const calculateEnhancedStats = () => {
    const totalPrograms = programs.length;
    const activePrograms = programs.filter(p => p.status === 'active').length;

    const totalSessions = sessionTemplates.length;

    const totalMentorships = mentorships.length;
    const activeMentorships = mentorships.filter(m => m.status === 'active').length;
    const completedMentorships = mentorships.filter(m => m.status === 'completed').length;

    // Use API data if available, otherwise calculate locally
    const departmentStats = dashboardStats.departmentStats && dashboardStats.departmentStats.length > 0
      ? dashboardStats.departmentStats
      : departments.map(dept => {
          const deptPrograms = programs.filter(p => getDepartmentName(p) === dept.name);
          const deptMentorships = mentorships.filter(m => getDepartmentName(m) === dept.name);
          
          return {
            id: dept.id,
            name: dept.name,
            programCount: deptPrograms.length,
            mentorshipCount: deptMentorships.length,
            activeMentorships: deptMentorships.filter(m => m.status === 'active').length,
            completionRate: deptMentorships.length > 0 
              ? Math.round((deptMentorships.filter(m => m.status === 'completed').length / deptMentorships.length) * 100)
              : 0
          };
        });

    // Update dashboard stats
    setDashboardStats(prev => ({
      ...prev,
      totalPrograms,
      activePrograms,
      totalSessions,
      totalMentorships,
      activeMentorships,
      completedMentorships,
      departmentStats
    }));
  };

  // Filter functions
  const filteredPrograms = useMemo(() => {
    let filtered = [...programs];

    if (programFilters.search) {
      const searchLower = programFilters.search.toLowerCase();
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(searchLower) ||
        program.description.toLowerCase().includes(searchLower)
      );
    }

    if (programFilters.status !== 'all') {
      filtered = filtered.filter(program => program.status === programFilters.status);
    }

    if (programFilters.department !== 'all') {
      filtered = filtered.filter(program => getDepartmentName(program) === programFilters.department);
    }

    return filtered;
  }, [programs, programFilters]);

  const filteredMentorships = useMemo(() => {
    let filtered = [...mentorships];

    if (mentorshipFilters.search) {
      const searchLower = mentorshipFilters.search.toLowerCase();
      filtered = filtered.filter(mentorship =>
        (mentorship.mentor?.full_name?.toLowerCase().includes(searchLower)) ||
        (mentorship.mentee?.full_name?.toLowerCase().includes(searchLower))
      );
    }

    if (mentorshipFilters.status !== 'all') {
      filtered = filtered.filter(mentorship => mentorship.status === mentorshipFilters.status);
    }

    if (mentorshipFilters.department !== 'all') {
      filtered = filtered.filter(mentorship => getDepartmentName(mentorship) === mentorshipFilters.department);
    }

    return filtered;
  }, [mentorships, mentorshipFilters]);

  // Handler functions
  const handleCreateProgram = async () => {
    // Implementation from original code
    try {
      alert('Create program functionality to be implemented');
    } catch (error) {
      alert('Failed to create program');
    }
  };

  const handleCreateMentorship = async () => {
    // Implementation from original code
    try {
      alert('Create mentorship functionality to be implemented');
    } catch (error) {
      alert('Failed to create mentorship');
    }
  };

  const handleUpdateProgramStatus = async (programId, status) => {
    try {
      alert(`Update program ${programId} status to ${status}`);
      fetchData();
    } catch (error) {
      alert('Failed to update program status');
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        alert(`Delete program ${programId}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete program');
      }
    }
  };

  const handleUpdateMentorshipStatus = async (mentorshipId, newStatus) => {
    try {
      await updateMentorshipStatus(mentorshipId, newStatus);
      alert(`Mentorship status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleDeleteMentorship = async (mentorshipId) => {
    if (window.confirm('Are you sure you want to delete this mentorship?')) {
      try {
        await deleteMentorship(mentorshipId);
        alert('Mentorship deleted successfully');
        fetchData();
      } catch (error) {
        alert('Failed to delete mentorship');
      }
    }
  };

  const handleViewProgramDetails = (program) => {
    setSelectedProgram(program);
  };

  const handleViewMentorshipDetails = (mentorship) => {
    setSelectedMentorship(mentorship);
  };

  const handleViewDepartmentPerformance = (department) => {
    setSelectedDepartment(department);
  };

  // Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Programs"
          value={dashboardStats.totalPrograms}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="blue"
        />
        <MetricCard
          title="Active Mentorships"
          value={dashboardStats.activeMentorships}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-15" />
            </svg>
          }
          color="green"
        />
        <MetricCard
          title="Completion Rate"
          value={`${dashboardStats.totalMentorships > 0 ? Math.round((dashboardStats.completedMentorships / dashboardStats.totalMentorships) * 100) : 0}%`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="purple"
        />
        <MetricCard
          title="Session Templates"
          value={dashboardStats.totalSessions}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
        />
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Mentorship statistics by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Programs</TableHead>
                  <TableHead>Active Mentorships</TableHead>
                  <TableHead>Completion Rate</TableHead>
                  <TableHead>Total Mentorships</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardStats.departmentStats.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <span className="font-medium">{dept.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{dept.programCount || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{dept.activeMentorships || 0}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${dept.completionRate || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{dept.completionRate || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{dept.mentorshipCount || 0}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDepartmentPerformance(dept)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                dashboardStats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type?.includes('mentorship') ? 'bg-green-100 text-green-600' : 
                      activity.type?.includes('program') ? 'bg-blue-100 text-blue-600' : 
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {activity.type?.includes('mentorship') ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-15" />
                        </svg>
                      ) : activity.type?.includes('program') ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title || 'Activity'}</p>
                      <p className="text-sm text-gray-600">
                        {activity.department || 'System'} • {activity.timestamp ? formatDate(activity.timestamp, true) : 'Recent'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Mentors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Mentors</CardTitle>
            <CardDescription>Based on ratings and completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.mentorPerformance && dashboardStats.mentorPerformance.length > 0 ? (
                dashboardStats.mentorPerformance.slice(0, 5).map((mentor, index) => (
                  <div key={mentor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{mentor.name || 'Unknown Mentor'}</h4>
                        <p className="text-sm text-gray-600">
                          {mentor.completed_mentorships || 0} completed • {mentor.total_mentorships || 0} total
                        </p>
                      </div>
                    </div>
                    <PerformanceBadge rating={mentor.average_rating || 0} size="sm" />
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  {/* Fallback to local calculation if no API data */}
                  {mentorships.reduce((acc, mentorship) => {
                    const mentorId = mentorship.mentor?.id;
                    if (mentorId) {
                      if (!acc[mentorId]) {
                        acc[mentorId] = {
                          id: mentorId,
                          name: mentorship.mentor?.full_name,
                          completed: 0,
                          total: 0,
                          rating: mentorship.rating || 0
                        };
                      }
                      acc[mentorId].total++;
                      if (mentorship.status === 'completed') {
                        acc[mentorId].completed++;
                      }
                    }
                    return acc;
                  }, {}) && Object.values(mentorships.reduce((acc, mentorship) => {
                    const mentorId = mentorship.mentor?.id;
                    if (mentorId) {
                      if (!acc[mentorId]) {
                        acc[mentorId] = {
                          id: mentorId,
                          name: mentorship.mentor?.full_name,
                          completed: 0,
                          total: 0,
                          rating: mentorship.rating || 0
                        };
                      }
                      acc[mentorId].total++;
                      if (mentorship.status === 'completed') {
                        acc[mentorId].completed++;
                      }
                    }
                    return acc;
                  }, {}))
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 5)
                    .map((mentor, index) => (
                      <div key={mentor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold">{mentor.name}</h4>
                            <p className="text-sm text-gray-600">
                              {mentor.completed} completed • {mentor.total} total
                            </p>
                          </div>
                        </div>
                        <PerformanceBadge rating={mentor.rating || 0} size="sm" />
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Manage mentorship programs, sessions, and relationships across all departments
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={fetchData}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>

              <Button
                onClick={() => setActiveTab('dashboard')}
                variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Dashboard
              </Button>

              <Button
                onClick={() => setShowCreateMentorship(true)}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Mentorship
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <TabsTrigger
                  value="dashboard"
                  activeTab={activeTab}
                  onClick={setActiveTab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  Dashboard
                </TabsTrigger>

                <TabsTrigger
                  value="programs"
                  activeTab={activeTab}
                  onClick={setActiveTab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'programs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Programs ({programs.length})
                </TabsTrigger>

                <TabsTrigger
                  value="mentorships"
                  activeTab={activeTab}
                  onClick={setActiveTab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'mentorships' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-15" />
                  </svg>
                  Mentorships ({mentorships.length})
                </TabsTrigger>

                <TabsTrigger
                  value="departments"
                  activeTab={activeTab}
                  onClick={setActiveTab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'departments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Departments ({departments.length})
                </TabsTrigger>
              </nav>
            </div>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" activeTab={activeTab}>
            {renderDashboard()}
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" activeTab={activeTab}>
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Mentorship Programs</h3>
                    <p className="text-gray-600">Manage and monitor all mentorship programs</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <Input
                        placeholder="Search programs..."
                        value={programFilters.search}
                        onChange={(e) => setProgramFilters({...programFilters, search: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={programFilters.status}
                        onChange={(e) => setProgramFilters({...programFilters, status: e.target.value})}
                        className="w-32"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                      </Select>
                      <Select
                        value={programFilters.department}
                        onChange={(e) => setProgramFilters({...programFilters, department: e.target.value})}
                        className="w-40"
                      >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{program.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {getDepartmentName(program)}
                        </Badge>
                      </div>
                      <Badge className={getStatusBadgeProps(program.status).className}>
                        {getStatusBadgeProps(program.status).label}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {program.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sessions:</span>
                        <span className="font-medium">{program.total_sessions || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{program.total_duration_hours || 0} hours</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{formatDate(program.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewProgramDetails(program)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateProgramStatus(program.id, program.status === 'active' ? 'inactive' : 'active')}
                      >
                        {program.status === 'active' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPrograms.length === 0 && (
              <Card className="mt-6">
                <CardContent className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No programs found</h3>
                  <p className="mt-2 text-gray-600">Try adjusting your search or filter to find what you're looking for.</p>
                  <Button className="mt-4" onClick={() => setShowCreateProgram(true)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Program
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Mentorships Tab */}
          <TabsContent value="mentorships" activeTab={activeTab}>
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">All Mentorships</h3>
                    <p className="text-gray-600">Manage mentorship relationships across departments</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <Input
                        placeholder="Search mentors, mentees..."
                        value={mentorshipFilters.search}
                        onChange={(e) => setMentorshipFilters({...mentorshipFilters, search: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={mentorshipFilters.status}
                        onChange={(e) => setMentorshipFilters({...mentorshipFilters, status: e.target.value})}
                        className="w-32"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                      </Select>
                      <Select
                        value={mentorshipFilters.department}
                        onChange={(e) => setMentorshipFilters({...mentorshipFilters, department: e.target.value})}
                        className="w-40"
                      >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mentorships Table */}
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mentor</TableHead>
                        <TableHead>Mentee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMentorships.slice(0, itemsPerPage).map((mentorship) => (
                        <TableRow key={mentorship.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium">{mentorship.mentor?.full_name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">{mentorship.mentor?.email || 'N/A'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium">{mentorship.mentee?.full_name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">{mentorship.mentee?.email || 'N/A'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getDepartmentName(mentorship)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeProps(mentorship.status).className}>
                              {getStatusBadgeProps(mentorship.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Progress value={mentorship.progress_percentage || 0} />
                          </TableCell>
                          <TableCell>
                            {mentorship.rating ? (
                              <div className="flex justify-center">
                                <PerformanceBadge rating={mentorship.rating} size="sm" />
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewMentorshipDetails(mentorship)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateMentorshipStatus(mentorship.id, 'completed')}
                                disabled={mentorship.status === 'completed'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {filteredMentorships.length === 0 && (
              <Card className="mt-6">
                <CardContent className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-15" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No mentorships found</h3>
                  <p className="mt-2 text-gray-600">Try adjusting your search or filter to find what you're looking for.</p>
                  <Button className="mt-4" onClick={() => setShowCreateMentorship(true)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Mentorship
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" activeTab={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>Department Management</CardTitle>
                <CardDescription>View and manage all departments and their mentorship programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departments.map((dept) => {
                    const deptPrograms = programs.filter(p => getDepartmentName(p) === dept.name);
                    const deptMentorships = mentorships.filter(m => getDepartmentName(m) === dept.name);
                    const activeMentorships = deptMentorships.filter(m => m.status === 'active');
                    
                    return (
                      <Card key={dept.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{dept.name}</h3>
                                <Badge variant={dept.status === 'active' ? 'success' : 'secondary'}>
                                  {dept.status}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDepartmentPerformance(dept)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                              </svg>
                            </Button>
                          </div>

                          <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                            {dept.description || 'No description available'}
                          </p>

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{deptPrograms.length}</p>
                                <p className="text-xs text-gray-600">Programs</p>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{activeMentorships.length}</p>
                                <p className="text-xs text-gray-600">Active</p>
                              </div>
                            </div>

                            <div className="pt-4 border-t">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Total Mentorships:</span>
                                <span className="font-semibold">{deptMentorships.length}</span>
                              </div>
                              <div className="flex justify-between text-sm mt-2">
                                <span className="text-gray-600">Completion Rate:</span>
                                <span className="font-semibold">
                                  {deptMentorships.length > 0 
                                    ? Math.round((deptMentorships.filter(m => m.status === 'completed').length / deptMentorships.length) * 100)
                                    : 0}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {deptPrograms.length > 0 && (
                            <div className="mt-6 pt-4 border-t">
                              <h4 className="font-medium mb-2">Top Programs:</h4>
                              <div className="space-y-1">
                                {deptPrograms.slice(0, 2).map(program => (
                                  <div key={program.id} className="flex items-center justify-between text-sm">
                                    <span className="truncate">{program.name}</span>
                                    <Badge variant="outline">{program.total_sessions || 0} sessions</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedProgram && (
        <ProgramDetailModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          onEdit={() => {
            // Handle edit
            setSelectedProgram(null);
          }}
          onDelete={(id) => {
            handleDeleteProgram(id);
            setSelectedProgram(null);
          }}
        />
      )}

      {selectedMentorship && (
        <MentorshipDetailModal
          mentorship={selectedMentorship}
          onClose={() => setSelectedMentorship(null)}
          onUpdateStatus={handleUpdateMentorshipStatus}
          onDelete={handleDeleteMentorship}
        />
      )}

      {selectedDepartment && (
        <DepartmentPerformanceModal
          department={selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
        />
      )}

      {/* Add CSS for line clamping */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}