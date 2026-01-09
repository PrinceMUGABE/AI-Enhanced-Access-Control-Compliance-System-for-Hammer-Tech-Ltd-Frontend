import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  TrendingUp,
  Star,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  MessageSquare,
  UserCheck,
  Target,
  Award,
  PieChart,
  Activity,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Download,
  Share2,
  Bell
} from 'lucide-react';

// Reusing the API functions and UI components from your existing code
// I'll extract and adapt what we need

// API base URL
const BASE_URL = "http://127.0.0.1:8000";


const ProgramSessionsModal = ({
  isOpen,
  onClose,
  mentorship,
  program,
  sessions,
  onScheduleSession,
  onCompleteSession
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Program Sessions</h2>
            <p className="text-gray-600">
              {program.name} • {mentorship.mentee.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Program Progress */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">Program Progress</h3>
              <p className="text-gray-600">
                {program.sessions_completed || 0}/{program.total_sessions} sessions completed
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-gray-900">
                {program.progress_percentage || 0}%
              </span>
            </div>
          </div>
          <ProgressBar
            value={program.progress_percentage || 0}
            className="mt-4"
          />
        </Card>

        {/* Sessions List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Sessions to Cover</h3>

          {sessions.map((session) => (
            <Card key={session.template_id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${session.status === 'completed' ? 'bg-green-500' :
                        session.status === 'scheduled' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`} />
                      <span className="text-sm font-semibold text-gray-700">
                        Session {session.order}
                      </span>
                    </div>
                    <Badge variant={
                      session.status === 'completed' ? 'success' :
                        session.status === 'scheduled' ? 'info' :
                          'default'
                    }>
                      {session.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <h4 className="font-medium text-gray-900">{session.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{session.description}</p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{session.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {session.scheduled_date
                          ? formatDate(session.scheduled_date, true)
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video className="w-4 h-4 text-gray-400" />
                      <span className="capitalize">{session.session_type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {session.status === 'not_scheduled' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onScheduleSession(session)}
                      icon={Calendar}
                    >
                      Schedule
                    </Button>
                  )}

                  {session.status === 'scheduled' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onCompleteSession(session)}
                        icon={CheckCircle}
                      >
                        Complete
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Handle reschedule
                          const newDate = prompt('Enter new date (YYYY-MM-DDTHH:MM:SS):');
                          if (newDate) {
                            updateSessionProgress(session.session_id, 'reschedule', {
                              new_date: newDate
                            });
                          }
                        }}
                        icon={Clock}
                      >
                        Reschedule
                      </Button>
                    </>
                  )}

                  {session.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        alert(`Session Notes:\n\n${session.notes}`);
                      }}
                      icon={FileText}
                    >
                      View Notes
                    </Button>
                  )}
                </div>
              </div>

              {/* Objectives */}
              {session.objectives && session.objectives.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Objectives:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {session.objectives.map((objective, idx) => (
                      <li key={idx}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Modal>
  );
};

// Helper functions (from your existing code)
const getAuthToken = () => localStorage.getItem('access_token');
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
    case 'active': return { className: 'bg-green-100 text-green-800', label: 'Active' };
    case 'completed': return { className: 'bg-blue-100 text-blue-800', label: 'Completed' };
    case 'pending': return { className: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
    case 'paused': return { className: 'bg-orange-100 text-orange-800', label: 'Paused' };
    case 'cancelled': return { className: 'bg-red-100 text-red-800', label: 'Cancelled' };
    default: return { className: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  }
};

const getProgressColor = (progress) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

// API functions for mentor
const fetchAPI = async (endpoint, method = 'GET', data = null) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const config = { method, headers };
    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// Mentor-specific API calls
const getMentorDashboard = async () => {
  return fetchAPI('/mentorship/my-dashboard/');
};

const getMentorMentorships = async () => {
  return fetchAPI('/mentorship/my-mentorships/');
};

const getMentorActiveMentorships = async () => {
  return fetchAPI('/mentorship/my-active-mentorships/');
};

const getMentorUpcomingSessions = async () => {
  return fetchAPI('/mentorship/my-upcoming-sessions/');
};

const getMentorshipDetails = async (mentorshipId) => {
  return fetchAPI(`/mentorship/mentorships/${mentorshipId}/`);
};

const getMentorshipSessions = async (mentorshipId) => {
  return fetchAPI(`/mentorship/sessions/?mentorship=${mentorshipId}`);
};

const updateSessionStatus = async (sessionId, status, notes = '') => {
  if (status === 'completed') {
    return fetchAPI(`/mentorship/sessions/${sessionId}/complete/`, 'PUT', { notes });
  }
  return fetchAPI(`/mentorship/sessions/${sessionId}/cancel/`, 'DELETE', { reason: notes });
};

const getMentorReviews = async () => {
  return fetchAPI('/mentorship/reviews/mentor/');
};

const getMentorPerformance = async () => {
  return fetchAPI('/mentorship/mentor-performance/');
};

const getMentorshipProgramSessions = async (mentorshipId, programId) => {
  return fetchAPI(`/mentorship/mentorships/${mentorshipId}/programs/${programId}/sessions/`);
};

const scheduleProgramSession = async (mentorshipId, programId, sessionData) => {
  return fetchAPI(`/mentorship/mentorships/${mentorshipId}/programs/${programId}/schedule-session/`, 'POST', sessionData);
};

const updateSessionProgress = async (sessionId, action, data = {}) => {
  return fetchAPI(`/mentorship/sessions/${sessionId}/update-progress/`, 'PUT', {
    action,
    ...data
  });
};

// UI Components
const Card = ({ children, className = '', onClick }) => (
  <div
    className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon: Icon,
  fullWidth = false
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-200',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-200',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-200',
    outline: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-200',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800',
    outline: 'border border-gray-300 text-gray-700'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const ProgressBar = ({ value, label, showLabel = true, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {showLabel && (
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">{value}%</span>
      </div>
    )}
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(value)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const StarRating = ({ rating, size = 'md', showNumber = false }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      {showNumber && <span className="ml-2 font-semibold text-gray-700">{rating.toFixed(1)}</span>}
    </div>
  );
};

const Modal = ({ isOpen, onClose, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        <div className={`relative z-50 w-full ${sizes[size]} bg-white rounded-3xl shadow-2xl transform transition-all`}>
          {children}
        </div>
      </div>
    </div>
  );
};

const Tabs = ({ tabs, activeTab, onTabChange }) => (
  <div className="border-b border-gray-200">
    <nav className="-mb-px flex space-x-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300
            ${activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
        >
          <div className="flex items-center gap-2">
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
            {tab.count && (
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                {tab.count}
              </span>
            )}
          </div>
        </button>
      ))}
    </nav>
  </div>
);

// Main Mentor Dashboard Component
export default function MentorMentorshipDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [mentorshipDetails, setMentorshipDetails] = useState(null);
  const [mentorshipSessions, setMentorshipSessions] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [mentorships, setMentorships] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [mentorPerformance, setMentorPerformance] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [programSessions, setProgramSessions] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isProgramSessionsModalOpen, setIsProgramSessionsModalOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalMentorships: 0,
    activeMentorships: 0,
    completedMentorships: 0,
    totalSessions: 0,
    upcomingSessions: 0,
    avgRating: 0,
    completionRate: 0
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      const [
        dashboardRes,
        mentorshipsRes,
        upcomingSessionsRes,
        performanceRes
      ] = await Promise.all([
        getMentorDashboard(),
        getMentorActiveMentorships(),
        getMentorUpcomingSessions(),
        getMentorPerformance()
      ]);

      setDashboardData(dashboardRes);
      setMentorships(mentorshipsRes?.active_mentorships || []);
      setUpcomingSessions(upcomingSessionsRes?.upcoming_sessions || []);
      setMentorPerformance(performanceRes);

      // Calculate stats
      const activeMentorships = mentorshipsRes?.active_mentorships?.length || 0;
      const totalMentorships = dashboardRes?.statistics?.total_mentorships || 0;
      const completedMentorships = dashboardRes?.statistics?.completed_mentorships || 0;

      setStats({
        totalMentorships,
        activeMentorships,
        completedMentorships,
        totalSessions: dashboardRes?.statistics?.total_sessions || 0,
        upcomingSessions: upcomingSessionsRes?.upcoming_sessions?.length || 0,
        avgRating: performanceRes?.average_rating || 0,
        completionRate: totalMentorships > 0 ? Math.round((completedMentorships / totalMentorships) * 100) : 0
      });

    } catch (error) {
      console.error('Error fetching mentor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMentorshipDetails = async (mentorship) => {
    try {
      setSelectedMentorship(mentorship);

      const [detailsRes, sessionsRes] = await Promise.all([
        getMentorshipDetails(mentorship.id),
        getMentorshipSessions(mentorship.id)
      ]);

      setMentorshipDetails(detailsRes?.mentorship || detailsRes);
      setMentorshipSessions(sessionsRes?.sessions || []);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching mentorship details:', error);
    }
  };

  const handleUpdateSessionStatus = async (sessionId, newStatus, notes = '') => {
    try {
      await updateSessionStatus(sessionId, newStatus, notes);
      alert(`Session marked as ${newStatus} successfully!`);

      // Refresh data
      if (selectedMentorship) {
        const sessionsRes = await getMentorshipSessions(selectedMentorship.id);
        setMentorshipSessions(sessionsRes?.sessions || []);
      }

      setIsSessionModalOpen(false);
      fetchMentorData(); // Refresh dashboard stats
    } catch (error) {
      alert(`Failed to update session: ${error.message}`);
    }
  };

  // Function to view program sessions
  const handleViewProgramSessions = async (mentorship, program) => {
    try {
      setSelectedMentorship(mentorship);
      setSelectedProgram(program);

      const sessionsRes = await getMentorshipProgramSessions(mentorship.id, program.id);
      setProgramSessions(sessionsRes.sessions || []);

      // Open modal or navigate to program sessions view
      setIsProgramSessionsModalOpen(true);
    } catch (error) {
      console.error('Error fetching program sessions:', error);
      alert('Failed to load program sessions');
    }
  };

  // Function to schedule a session
  const handleScheduleSession = async (template) => {
    try {
      const scheduledDate = prompt('Enter date and time (YYYY-MM-DDTHH:MM:SS):');
      if (!scheduledDate) return;

      const sessionData = {
        template_id: template.id,
        scheduled_date: scheduledDate,
        session_type: template.session_type,
        duration_minutes: template.duration_minutes
      };

      await scheduleProgramSession(selectedMentorship.id, selectedProgram.id, sessionData);

      // Refresh sessions
      const sessionsRes = await getMentorshipProgramSessions(selectedMentorship.id, selectedProgram.id);
      setProgramSessions(sessionsRes.sessions || []);

      alert('Session scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling session:', error);
      alert(`Failed to schedule session: ${error.message}`);
    }
  };

  // Function to complete a session
  const handleCompleteSession = async (session) => {
    try {
      const notes = prompt('Enter session notes:');
      if (notes === null) return;

      await updateSessionProgress(session.id, 'complete', {
        notes,
        mentor_feedback: '',
        mentee_feedback: '',
        action_items: []
      });

      // Refresh sessions
      const sessionsRes = await getMentorshipProgramSessions(selectedMentorship.id, selectedProgram.id);
      setProgramSessions(sessionsRes.sessions || []);

      // Refresh overall data
      fetchMentorData();

      alert('Session marked as completed!');
    } catch (error) {
      console.error('Error completing session:', error);
      alert(`Failed to complete session: ${error.message}`);
    }
  };



  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: mentorships.length },
    { id: 'mentorships', label: 'Active Mentorships', icon: Users, count: mentorships.length },
    { id: 'sessions', label: 'Upcoming Sessions', icon: Calendar, count: upcomingSessions.length },
    { id: 'performance', label: 'Performance', icon: Award }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Loading your mentorship dashboard...</p>
          <p className="mt-2 text-gray-500">Getting everything ready for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
                <p className="text-gray-600">Manage your mentorship relationships and track progress</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" icon={Bell}>
                Notifications
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/mentor/availability')}
                icon={Calendar}
              >
                Set Availability
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Mentorships</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeMentorships}</p>
                <p className="text-sm text-gray-600 mt-1">{stats.totalMentorships} total</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar value={stats.completionRate} label="Completion Rate" />
            </div>
          </Card>

          <Card className="p-6 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Upcoming Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingSessions}</p>
                <p className="text-sm text-gray-600 mt-1">Next 7 days</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Next session: {upcomingSessions[0]?.scheduled_date ? formatDate(upcomingSessions[0].scheduled_date, true) : 'No upcoming'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Mentor Rating</p>
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={stats.avgRating} size="lg" showNumber />
                </div>
                <p className="text-sm text-gray-600 mt-1">Based on {reviews.length} reviews</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Performance</span>
                <span className="font-semibold">{stats.avgRating >= 4 ? 'Excellent' : stats.avgRating >= 3 ? 'Good' : 'Needs Improvement'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg. Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {mentorships.length > 0
                    ? Math.round(mentorships.reduce((acc, m) => acc + (m.progress_percentage || 0), 0) / mentorships.length)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600 mt-1">Across all mentorships</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="w-4 h-4 mr-2" />
                <span>{mentorships.filter(m => m.progress_percentage === 100).length} completed</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Card className="mb-8">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Performance Overview */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Overview</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
                      {mentorPerformance?.category_ratings ? (
                        <div className="space-y-4">
                          {Object.entries(mentorPerformance.category_ratings).map(([category, rating]) => (
                            <div key={category} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 capitalize">{category.replace('_', ' ')}</span>
                                <span className="font-semibold">{rating.toFixed(1)}/5</span>
                              </div>
                              <ProgressBar value={(rating / 5) * 100} showLabel={false} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No rating data available yet</p>
                      )}
                    </Card>

                    <Card className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Recent Feedback</h3>
                      {reviews.length > 0 ? (
                        <div className="space-y-4">
                          {reviews.slice(0, 3).map((review) => (
                            <div key={review.id} className="border-l-4 border-blue-500 pl-4 py-2">
                              <div className="flex items-center justify-between mb-2">
                                <StarRating rating={review.rating} size="sm" />
                                <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                              </div>
                              <p className="text-gray-700 line-clamp-2">{review.review_text}</p>
                              <p className="text-sm text-gray-500 mt-1">- {review.mentee_name}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No reviews yet</p>
                      )}
                    </Card>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                  <Card className="p-6">
                    <div className="space-y-4">
                      {upcomingSessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Session with {session.mentee_name}</p>
                              <p className="text-sm text-gray-600">{formatDate(session.scheduled_date, true)}</p>
                            </div>
                          </div>
                          <Badge variant={session.status === 'scheduled' ? 'info' : 'warning'}>
                            {session.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'mentorships' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Active Mentorships</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="search"
                        placeholder="Search mentees..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button variant="outline" icon={Filter}>Filter</Button>
                  </div>
                </div>

                {mentorships.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Mentorships</h3>
                    <p className="text-gray-500 mb-6">You don't have any active mentorship relationships at the moment.</p>
                    <Button variant="primary" onClick={() => navigate('/mentor/availability')}>
                      Update Availability
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {mentorships.map((mentorship) => (
                      <Card
                        key={mentorship.id}
                        className="p-6 hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => handleViewMentorshipDetails(mentorship)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{mentorship.other_user?.full_name}</h3>
                            <p className="text-gray-600">{mentorship.other_user?.email}</p>
                          </div>
                          <Badge variant="success">Active</Badge>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Program Progress</span>
                              <span className="font-semibold">{mentorship.progress_percentage || 0}%</span>
                            </div>
                            <ProgressBar value={mentorship.progress_percentage || 0} showLabel={false} />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Department</p>
                              <p className="font-semibold">{mentorship.department?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Start Date</p>
                              <p className="font-semibold">{formatDate(mentorship.start_date)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Sessions</p>
                              <p className="font-semibold">{mentorship.sessions_completed || 0}/{mentorship.total_sessions || 0}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Current Program</p>
                              <p className="font-semibold truncate">{mentorship.current_program?.name || 'Not assigned'}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Eye}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewMentorshipDetails(mentorship);
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={MessageSquare}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/chat/${mentorship.chat_room_id || 'new'}`);
                              }}
                            >
                              Message
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                  <Button variant="primary" icon={Calendar}>Schedule New</Button>
                </div>

                {upcomingSessions.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Upcoming Sessions</h3>
                    <p className="text-gray-500">You don't have any scheduled sessions for the next 7 days.</p>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date & Time</th>
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">Mentee</th>
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">Program</th>
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">Type</th>
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">Duration</th>
                            <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingSessions.map((session) => (
                            <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="font-medium text-gray-900">{formatDate(session.scheduled_date, true)}</div>
                                <div className="text-sm text-gray-500">In {(() => {
                                  const diff = new Date(session.scheduled_date) - new Date();
                                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
                                })()}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-medium">{session.mentee_name}</div>
                                <div className="text-sm text-gray-500">{session.mentee_email}</div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge variant="outline">{session.program_name}</Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded ${session.session_type === 'video' ? 'bg-blue-100' :
                                    session.session_type === 'in_person' ? 'bg-green-100' : 'bg-purple-100'
                                    }`}>
                                    {session.session_type === 'video' && <Video className="w-4 h-4 text-blue-600" />}
                                    {session.session_type === 'in_person' && <Users className="w-4 h-4 text-green-600" />}
                                    {session.session_type === 'phone' && <Phone className="w-4 h-4 text-purple-600" />}
                                  </div>
                                  <span className="capitalize">{session.session_type?.replace('_', ' ')}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  {session.duration_minutes} min
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex gap-2">
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSession(session);
                                      setIsSessionModalOpen(true);
                                    }}
                                    icon={CheckCircle}
                                  >
                                    Complete
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                      if (window.confirm('Cancel this session?')) {
                                        handleUpdateSessionStatus(session.id, 'cancelled', 'Mentor cancelled');
                                      }
                                    }}
                                    icon={AlertCircle}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-8">
                {/* Performance Summary */}
                <Card className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Dashboard</h2>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Overall Rating */}
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
                        <span className="text-3xl font-bold text-white">{stats.avgRating.toFixed(1)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Rating</h3>
                      <StarRating rating={stats.avgRating} size="lg" />
                      <p className="text-gray-600 mt-2">Based on {reviews.length} reviews</p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviews.filter(r => Math.round(r.rating) === stars).length;
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-20">
                                <span className="text-sm text-gray-600">{stars}</span>
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs text-gray-500">({count})</span>
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold w-12">{percentage.toFixed(1)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Detailed Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      {mentorPerformance?.metrics?.map((metric, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-700">{metric.name}</span>
                            <span className="font-semibold">{metric.value}</span>
                          </div>
                          <ProgressBar value={metric.percentage} showLabel={false} />
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Top Strengths</h3>
                    <div className="space-y-3">
                      {mentorPerformance?.strengths?.map((strength, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Award className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Mentorship Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} size="xl">
        {mentorshipDetails && (
          <div className="p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mentorship Details</h2>
                <p className="text-gray-600">ID: {mentorshipDetails.id} • Started: {formatDate(mentorshipDetails.start_date)}</p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mentee Information */}
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{mentorshipDetails.mentee?.full_name}</h3>
                    <p className="text-gray-600">{mentorshipDetails.mentee?.email}</p>
                    <Badge variant="success" className="mt-2">Mentee</Badge>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Department:</span>
                    <span className="font-semibold">{mentorshipDetails.department?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role:</span>
                    <span className="font-semibold">{mentorshipDetails.mentee?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-semibold">{mentorshipDetails.mentee?.phone_number || 'N/A'}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={BookOpen}
                  onClick={() => handleViewProgramSessions(mentorship, mentorship.current_program)}
                >
                  View Sessions
                </Button>
              </Card>

              {/* Program Progress */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Current Program</h3>
                  {mentorshipDetails.current_program ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-900">{mentorshipDetails.current_program.name}</h4>
                          <p className="text-gray-600 text-sm mt-1">{mentorshipDetails.current_program.description}</p>
                        </div>
                        <Badge variant="info">Active</Badge>
                      </div>

                      <div>
                        <ProgressBar
                          value={mentorshipDetails.progress_percentage || 0}
                          label="Overall Progress"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <p className="text-sm text-gray-500">Sessions</p>
                          <p className="text-xl font-bold text-gray-900">{mentorshipDetails.sessions_completed || 0}/{mentorshipDetails.total_sessions || 0}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl">
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="text-xl font-bold text-gray-900">{mentorshipDetails.current_program.total_duration_hours || 0}h</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl">
                          <p className="text-sm text-gray-500">Days</p>
                          <p className="text-xl font-bold text-gray-900">{mentorshipDetails.current_program.total_days || 0}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No program assigned</p>
                  )}
                </Card>

                {/* Session History */}
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-900">Session History</h3>
                    <Button variant="outline" size="sm" icon={Calendar}>
                      Schedule New
                    </Button>
                  </div>

                  {mentorshipSessions.length > 0 ? (
                    <div className="space-y-4">
                      {mentorshipSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${session.status === 'completed' ? 'bg-green-100' :
                              session.status === 'scheduled' ? 'bg-blue-100' :
                                'bg-gray-100'
                              }`}>
                              {session.status === 'completed' && <CheckCircle className="w-6 h-6 text-green-600" />}
                              {session.status === 'scheduled' && <Clock className="w-6 h-6 text-blue-600" />}
                              {session.status === 'cancelled' && <AlertCircle className="w-6 h-6 text-gray-600" />}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Session {session.session_number}</p>
                              <p className="text-sm text-gray-600">{formatDate(session.scheduled_date, true)}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={
                                  session.status === 'completed' ? 'success' :
                                    session.status === 'scheduled' ? 'info' :
                                      'danger'
                                }>
                                  {session.status}
                                </Badge>
                                <span className="text-sm text-gray-500">{session.duration_minutes} min</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {session.status === 'scheduled' && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setIsSessionModalOpen(true);
                                  }}
                                  icon={CheckCircle}
                                >
                                  Complete
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    if (window.confirm('Cancel this session?')) {
                                      handleUpdateSessionStatus(session.id, 'cancelled', 'Mentor cancelled');
                                    }
                                  }}
                                  icon={AlertCircle}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {session.status === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={FileText}
                                onClick={() => {
                                  // View session notes
                                  alert(`Session Notes:\n\n${session.notes || 'No notes provided'}`);
                                }}
                              >
                                View Notes
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No sessions scheduled</p>
                  )}
                </Card>
              </div>
            </div>

            {/* Goals and Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Mentorship Goals</h3>
                {mentorshipDetails.goals?.length > 0 ? (
                  <ul className="space-y-3">
                    {mentorshipDetails.goals.map((goal, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{goal}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">No goals set for this mentorship</p>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Admin Notes</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-700">{mentorshipDetails.notes || 'No notes available for this mentorship.'}</p>
                </div>
              </Card>
            </div>

            {/* Programs to be Covered */}
            {mentorshipDetails.programs?.length > 0 && (
              <Card className="p-6 mt-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Programs in this Mentorship</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mentorshipDetails.programs.map((program) => (
                    <div key={program.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{program.name}</h4>
                          <p className="text-xs text-gray-500">{program.department?.name}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sessions:</span>
                          <span className="font-semibold">{program.total_sessions || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-semibold">{program.total_duration_hours || 0}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status:</span>
                          <Badge variant={program.id === mentorshipDetails.current_program?.id ? 'success' : 'default'}>
                            {program.id === mentorshipDetails.current_program?.id ? 'Current' : 'Assigned'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>

      {/* Session Completion Modal */}
      <Modal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} size="md">
        {selectedSession && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Session</h2>
            <p className="text-gray-600 mb-6">Session with {selectedSession.mentee_name} on {formatDate(selectedSession.scheduled_date, true)}</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Notes</label>
                <textarea
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add notes about what was discussed, achievements, action items, etc."
                  defaultValue={selectedSession.notes || ''}
                  id="sessionNotes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mentee Feedback (Optional)</label>
                <textarea
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Record any feedback from the mentee"
                  id="menteeFeedback"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button
                  variant="primary"
                  onClick={() => {
                    const notes = document.getElementById('sessionNotes').value;
                    const feedback = document.getElementById('menteeFeedback').value;
                    handleUpdateSessionStatus(selectedSession.id, 'completed', notes + (feedback ? `\n\nMentee Feedback: ${feedback}` : ''));
                  }}
                  icon={CheckCircle}
                  fullWidth
                >
                  Mark as Completed
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsSessionModalOpen(false)}
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <ProgramSessionsModal
        isOpen={isProgramSessionsModalOpen}
        onClose={() => setIsProgramSessionsModalOpen(false)}
        mentorship={selectedMentorship}
        program={selectedProgram}
        sessions={programSessions}
        onScheduleSession={handleScheduleSession}
        onCompleteSession={handleCompleteSession}
      />
    </div>
  );
}

// Icons that need to be imported
const X = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Video = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const Phone = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const BookOpen = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);