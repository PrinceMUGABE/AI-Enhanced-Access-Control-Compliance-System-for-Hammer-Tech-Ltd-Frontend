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
  Bell,
  X,
  Video,
  Phone,
  BookOpen,
  User,
  PlayCircle,
  PauseCircle,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  List,
  Grid,
  RefreshCw,
  CalendarDays,
  Clock as ClockIcon
} from 'lucide-react';

// API base URL
const BASE_URL = "http://127.0.0.1:8000";

// ==================== HELPER FUNCTIONS ====================
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

const getSessionStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'rescheduled': return 'bg-purple-100 text-purple-800';
    case 'not_scheduled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// ==================== API FUNCTIONS WITH RETRY LOGIC ====================
const fetchAPIWithRetry = async (endpoint, method = 'GET', data = null, retries = 3, delay = 1000) => {
  const token = getAuthToken();

  for (let i = 0; i < retries; i++) {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const config = { method, headers };
      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, config);

      if (response.status === 429) {
        // Rate limited, wait and retry
        const waitTime = delay * Math.pow(2, i); // Exponential backoff
        console.warn(`Rate limited. Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) {
        console.error(`Failed after ${retries} retries for ${endpoint}:`, error);
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

// Mentor-specific API calls
const getMentorDashboard = async () => {
  return fetchAPIWithRetry('/mentorship/my-dashboard/');
};

const getMentorMentorships = async () => {
  return fetchAPIWithRetry('/mentorship/my-mentorships/');
};

const getMentorActiveMentorships = async () => {
  return fetchAPIWithRetry('/mentorship/my-active-mentorships/');
};

const getMentorUpcomingSessions = async () => {
  return fetchAPIWithRetry('/mentorship/my-upcoming-sessions/');
};

const getMentorshipDetails = async (mentorshipId) => {
  return fetchAPIWithRetry(`/mentorship/mentorships/${mentorshipId}/`);
};

const getMentorshipSessions = async (mentorshipId) => {
  return fetchAPIWithRetry(`/mentorship/sessions/?mentorship=${mentorshipId}`);
};

const updateSessionStatus = async (sessionId, status, notes = '') => {
  if (status === 'completed') {
    return fetchAPIWithRetry(`/mentorship/sessions/${sessionId}/complete/`, 'PUT', { notes });
  }
  return fetchAPIWithRetry(`/mentorship/sessions/${sessionId}/cancel/`, 'DELETE', { reason: notes });
};

const getMentorReviews = async () => {
  return fetchAPIWithRetry('/mentorship/reviews/mentor/');
};

const getMentorPerformance = async () => {
  return fetchAPIWithRetry('/mentorship/mentor-performance/');
};

const getMentorshipPrograms = async (mentorshipId) => {
  return fetchAPIWithRetry(`/mentorship/mentorships/${mentorshipId}/`);
};

const getProgramSessions = async (mentorshipId, programId) => {
  return fetchAPIWithRetry(`/mentorship/mentorships/${mentorshipId}/programs/${programId}/sessions/`);
};

const scheduleProgramSession = async (mentorshipId, programId, sessionData) => {
  // Convert scheduled_date to proper ISO format without milliseconds
  let scheduledDateISO;

  if (sessionData.scheduled_date instanceof Date) {
    // Format: YYYY-MM-DDTHH:MM:SS (without milliseconds)
    const date = sessionData.scheduled_date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    scheduledDateISO = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  } else if (typeof sessionData.scheduled_date === 'string') {
    // If it's already a string, try to parse and format it
    try {
      const date = new Date(sessionData.scheduled_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      scheduledDateISO = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    } catch (error) {
      // If parsing fails, use the original string
      scheduledDateISO = sessionData.scheduled_date;
    }
  } else {
    throw new Error('scheduled_date must be a Date object or ISO string');
  }

  const formattedData = {
    template_id: sessionData.template_id,
    scheduled_date: scheduledDateISO,
    duration_minutes: sessionData.duration_minutes || 60,
    agenda: sessionData.agenda || '',
    meeting_link: sessionData.meeting_link || '',
    location: sessionData.location || ''
  };

  console.log('Scheduling session with data:', formattedData);

  return fetchAPIWithRetry(
    `/mentorship/mentorships/${mentorshipId}/programs/${programId}/schedule-session/`,
    'POST',
    formattedData
  );
};

const updateSessionProgress = async (sessionId, action, data = {}) => {
  return fetchAPIWithRetry(
    `/mentorship/sessions/${sessionId}/update-progress/`,
    'PUT',
    { action, ...data }
  );
};

const getMentorProgramOverview = async (mentorshipId) => {
  return fetchAPIWithRetry(`/mentorship/mentorships/${mentorshipId}/program-overview/`);
};

// ==================== UI COMPONENTS ====================
const Card = ({ children, className = '', onClick, hover = true }) => (
  <div
    className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${hover ? 'hover:shadow-xl' : ''} transition-all duration-300 ${className}`}
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
  fullWidth = false,
  loading = false
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-4';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-200 disabled:opacity-50',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-200 disabled:opacity-50',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-200 disabled:opacity-50',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-200 disabled:opacity-50',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-200 disabled:opacity-50',
    outline: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-200 disabled:opacity-50',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200 disabled:opacity-50'
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
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
          {children}
        </>
      )}
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
    outline: 'border border-gray-300 text-gray-700',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const ProgressBar = ({ value, label, showLabel = true, className = '', size = 'md' }) => {
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="font-bold text-gray-900">{value}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`${heights[size]} rounded-full transition-all duration-500 ${getProgressColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

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

const Modal = ({ isOpen, onClose, children, size = 'md', title = '' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        <div className={`relative z-50 w-full ${sizes[size]} bg-white rounded-3xl shadow-2xl transform transition-all overflow-hidden`}>
          {title && (
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-xl transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
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
            {tab.count !== undefined && (
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

const SessionStatusBadge = ({ status }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', className: 'bg-green-100 text-green-800' };
      case 'scheduled':
        return { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' };
      case 'cancelled':
        return { label: 'Cancelled', className: 'bg-red-100 text-red-800' };
      case 'rescheduled':
        return { label: 'Rescheduled', className: 'bg-purple-100 text-purple-800' };
      case 'not_scheduled':
        return { label: 'Not Scheduled', className: 'bg-gray-100 text-gray-800' };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  const statusInfo = getStatusInfo(status);
  return (
    <Badge variant="default" className={statusInfo.className}>
      {statusInfo.label}
    </Badge>
  );
};

// ==================== DATE PICKER COMPONENT ====================
const DateTimePicker = ({
  value,
  onChange,
  minDate = new Date(),
  disabledDates = [],
  disabledTimes = {},
  label = "Select Date & Time"
}) => {
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());
  const [selectedTime, setSelectedTime] = useState(value ? new Date(value).toTimeString().substring(0, 5) : '09:00');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate days in month
  const generateDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days = [];
    const startDay = firstDay.getDay();

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isDisabled: date < minDate || disabledDates.some(d =>
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        )
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isDisabled: date < minDate || disabledDates.some(d =>
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        )
      });
    }

    // Next month days
    const totalCells = 42; // 6 weeks
    for (let i = 1; days.length < totalCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isDisabled: true
      });
    }

    return days;
  };

  // Generate time slots (30-minute intervals from 8:00 to 18:00)
  const generateTimeSlots = () => {
    const slots = [];
    const selectedDateKey = selectedDate.toDateString();
    const disabledTimesForDate = disabledTimes[selectedDateKey] || [];

    for (let hour = 8; hour <= 18; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isDisabled = disabledTimesForDate.includes(time);
        slots.push({ time, isDisabled });
      }
    }
    return slots;
  };

  const handleDateSelect = (date) => {
    if (date < minDate) return;
    const newDate = new Date(date);
    newDate.setHours(selectedTime.split(':')[0]);
    newDate.setMinutes(selectedTime.split(':')[1]);
    setSelectedDate(date);
    setShowDatePicker(false);
    onChange(newDate);
  };

  const handleTimeSelect = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setSelectedTime(time);
    setShowTimePicker(false);
    onChange(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="grid grid-cols-2 gap-4">
        {/* Date Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-left hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-gray-400" />
              <span>{formatDate(selectedDate)}</span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>

          {showDatePicker && (
            <div className="absolute z-10 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
                </button>
                <h3 className="font-semibold text-gray-900">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateDaysInMonth().map((day, index) => {
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  const isSelected = day.date.toDateString() === selectedDate.toDateString();

                  return (
                    <button
                      key={index}
                      onClick={() => !day.isDisabled && handleDateSelect(day.date)}
                      disabled={day.isDisabled}
                      className={`
                        h-10 rounded-lg text-sm font-medium
                        ${isToday ? 'border-2 border-blue-500' : ''}
                        ${isSelected ? 'bg-blue-600 text-white' : ''}
                        ${!isSelected && !day.isDisabled ? 'hover:bg-blue-50 text-gray-900' : ''}
                        ${day.isDisabled ? 'text-gray-400 cursor-not-allowed' : ''}
                        ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                      `}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full border-2 border-blue-500"></div>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Time Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTimePicker(!showTimePicker)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-left hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-400" />
              <span>{selectedTime}</span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>

          {showTimePicker && (
            <div className="absolute z-10 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                {generateTimeSlots().map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => !slot.isDisabled && handleTimeSelect(slot.time)}
                    disabled={slot.isDisabled}
                    className={`
                      py-2 px-3 rounded-lg text-sm font-medium text-center
                      ${selectedTime === slot.time ? 'bg-blue-600 text-white' : ''}
                      ${!slot.isDisabled && selectedTime !== slot.time ? 'hover:bg-blue-50 text-gray-900' : ''}
                      ${slot.isDisabled ? 'text-gray-400 cursor-not-allowed' : ''}
                    `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== SCHEDULE SESSION MODAL ====================
const ScheduleSessionModal = ({
  isOpen,
  onClose,
  template,
  onSchedule,
  loading = false
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [disabledDates, setDisabledDates] = useState([]);
  const [disabledTimes, setDisabledTimes] = useState({});
  const [duration, setDuration] = useState(template?.duration_minutes || 60);
  const [agenda, setAgenda] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const today = new Date();
    const disabledDatesList = [];
    const disabledTimesDict = {};

    // Disable weekends
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() === 0 || date.getDay() === 6) {
        disabledDatesList.push(date);
      }
    }

    // Disable past hours for today
    if (selectedDateTime && selectedDateTime.toDateString() === today.toDateString()) {
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      const disabledTimesForToday = [];

      for (let hour = 8; hour <= 18; hour++) {
        for (let minute of [0, 30]) {
          if (hour < currentHour || (hour === currentHour && minute < currentMinute)) {
            disabledTimesForToday.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
          }
        }
      }

      disabledTimesDict[today.toDateString()] = disabledTimesForToday;
    }

    setDisabledDates(disabledDatesList);
    setDisabledTimes(disabledTimesDict);

    if (!selectedDateTime) {
      const defaultDate = new Date();
      defaultDate.setHours(9, 0, 0, 0);
      if (defaultDate < new Date()) {
        defaultDate.setDate(defaultDate.getDate() + 1);
      }
      setSelectedDateTime(defaultDate);
    }
  }, [isOpen, selectedDateTime]);

  const handleSubmit = () => {
    if (!selectedDateTime) {
      alert('Please select a date and time');
      return;
    }

    const sessionData = {
      template_id: template.template_id,
      scheduled_date: selectedDateTime.toISOString(),
      duration_minutes: duration,
      agenda: agenda,
      meeting_link: meetingLink,
      location: location
    };

    onSchedule(sessionData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Session</h3>
        <p className="text-gray-600 mb-6">{template?.title}</p>

        <div className="space-y-6">
          <DateTimePicker
            value={selectedDateTime}
            onChange={setSelectedDateTime}
            disabledDates={disabledDates}
            disabledTimes={disabledTimes}
            label="Session Date & Time"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="240"
              step="15"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agenda (Optional)
            </label>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="What will be discussed in this session?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Conference Room A"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={!selectedDateTime}
              fullWidth
            >
              Schedule Session
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ==================== PROGRAM SESSIONS MODAL ====================
const ProgramSessionsModal = ({
  isOpen,
  onClose,
  mentorship,
  program,
  sessions,
  onScheduleSession,
  onCompleteSession,
  onCancelSession,
  onRescheduleSession,
  loading = false,
}) => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const handleCompleteSession = async (session) => {
    if (session.status === 'scheduled') {
      setSelectedSession(session);
      setShowNotesModal(true);
    } else {
      // Pass the session_id from the session object
      await onCompleteSession(session.session_id || session.id);
    }
  };



  const handleScheduleClick = (template) => {
    setSelectedTemplate(template);
    setShowScheduleModal(true);
  };

  const handleSubmitCompletion = async () => {
    if (selectedSession && sessionNotes.trim()) {
      // Pass the session_id from selectedSession
      await onCompleteSession(selectedSession.session_id || selectedSession.id, sessionNotes);
      setShowNotesModal(false);
      setSessionNotes('');
      setSelectedSession(null);
    }
  };

  const handleScheduleSubmit = async (sessionData) => {
    await onScheduleSession(selectedTemplate, sessionData);
  };

  const calculateProgress = () => {
    const completed = sessions.filter(s => s.status === 'completed').length;
    const total = sessions.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Program Sessions">
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{program?.name}</h2>
                <p className="text-gray-600">
                  Mentorship with {mentorship?.other_user?.full_name || mentorship?.mentee?.full_name}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{calculateProgress()}%</div>
                <p className="text-sm text-gray-600">Overall Progress</p>
              </div>
            </div>
            <ProgressBar value={calculateProgress()} showLabel={false} className="mt-4" />
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Session Templates</h3>
              <div className="text-sm text-gray-600">
                {sessions.filter(s => s.status === 'completed').length} of {sessions.length} completed
              </div>
            </div>

            {sessions.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Sessions Found</h3>
                <p className="text-gray-500">No session templates defined for this program.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card key={session.template_id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${session.status === 'completed' ? 'bg-green-500' :
                              session.status === 'scheduled' ? 'bg-blue-500' :
                                session.status === 'cancelled' ? 'bg-red-500' :
                                  'bg-gray-300'
                              }`} />
                            <span className="text-sm font-semibold text-gray-700">
                              Session {session.order}
                            </span>
                          </div>
                          <SessionStatusBadge status={session.status} />
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
                            {session.session_type === 'video' ? (
                              <Video className="w-4 h-4 text-gray-400" />
                            ) : session.session_type === 'phone' ? (
                              <Phone className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Users className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="capitalize">{session.session_type?.replace('_', ' ')}</span>
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

                        {/* Notes if completed */}
                        {session.status === 'completed' && session.notes && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Session Notes:</h5>
                            <p className="text-sm text-gray-600">{session.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4 min-w-[150px]">
                        {session.status === 'not_scheduled' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleScheduleClick(session)}
                            icon={Calendar}
                            disabled={loading}
                            loading={loading}
                          >
                            Schedule
                          </Button>
                        )}

                        {session.status === 'scheduled' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleCompleteSession(session)}
                              icon={CheckCircle}
                              disabled={loading}
                              loading={loading}
                            >
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRescheduleSession(session)}
                              icon={Clock}
                              disabled={loading}
                            >
                              Reschedule
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this session?')) {
                                  onCancelSession(session);
                                }
                              }}
                              icon={AlertCircle}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </>
                        )}

                        {session.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              alert(`Session Notes:\n\n${session.notes || 'No notes available'}`);
                            }}
                            icon={FileText}
                          >
                            View Notes
                          </Button>
                        )}

                        {session.status === 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScheduleClick(session)}
                            icon={Calendar}
                            disabled={loading}
                          >
                            Reschedule
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Session Completion Modal */}
      <Modal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)} size="sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Session</h3>
          <p className="text-gray-600 mb-4">Please add notes about what was discussed in this session.</p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Notes *
            </label>
            <textarea
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter session notes..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleSubmitCompletion}
              disabled={!sessionNotes.trim()}
              fullWidth
            >
              Mark as Completed
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowNotesModal(false);
                setSessionNotes('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Session Modal */}
      <ScheduleSessionModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        onSchedule={handleScheduleSubmit}
        loading={loading}
      />
    </>
  );
};

// ==================== PROGRAM OVERVIEW MODAL ====================
const ProgramOverviewModal = ({
  isOpen,
  onClose,
  mentorship,
  programs,
  onViewSessions,
  loading = false
}) => {
  const [expandedProgram, setExpandedProgram] = useState(null);

  const toggleProgram = (programId) => {
    setExpandedProgram(expandedProgram === programId ? null : programId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Programs Overview">
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        {programs.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Programs Assigned</h3>
            <p className="text-gray-500">No programs have been assigned to this mentorship yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {programs.map((program) => (
              <Card key={program.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{program.name}</h3>
                          <p className="text-sm text-gray-600">{program.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{program.total_sessions || 0}</div>
                          <div className="text-sm text-gray-600">Total Sessions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{program.completed_sessions || 0}</div>
                          <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{program.scheduled_sessions || 0}</div>
                          <div className="text-sm text-gray-600">Scheduled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{program.progress_percentage || 0}%</div>
                          <div className="text-sm text-gray-600">Progress</div>
                        </div>
                      </div>

                      <ProgressBar value={program.progress_percentage || 0} showLabel={false} />
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        variant={program.is_current ? "primary" : "outline"}
                        size="sm"
                        onClick={() => onViewSessions(program)}
                        icon={List}
                        disabled={loading}
                      >
                        View Sessions
                      </Button>
                      <button
                        onClick={() => toggleProgram(program.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {expandedProgram === program.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedProgram === program.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Program Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <Badge variant={program.status === 'completed' ? 'success' : program.status === 'in_progress' ? 'info' : 'default'}>
                                {program.status?.replace('_', ' ') || 'Not Started'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Can Schedule Next:</span>
                              <span className={`font-semibold ${program.can_schedule ? 'text-green-600' : 'text-gray-600'}`}>
                                {program.can_schedule ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Next Session:</span>
                              <span className="font-semibold">#{program.next_session_number || 1}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                          <div className="space-y-2">
                            {program.can_schedule && (
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Calendar}
                                onClick={() => onViewSessions(program)}
                                fullWidth
                              >
                                Schedule Next Session
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={FileText}
                              onClick={() => {
                                alert(`Program Details:\n\n${program.description}`);
                              }}
                              fullWidth
                            >
                              View Program Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ==================== MAIN COMPONENT ====================
export default function MentorMentorshipDashboard() {
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programSessions, setProgramSessions] = useState([]);
  const [programsOverview, setProgramsOverview] = useState([]);
  const [error, setError] = useState(null);

  // Modal states
  const [isProgramOverviewModalOpen, setIsProgramOverviewModalOpen] = useState(false);
  const [isProgramSessionsModalOpen, setIsProgramSessionsModalOpen] = useState(false);
  const [isSessionModalLoading, setIsSessionModalLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [allMentorships, setAllMentorships] = useState([]);
  const [activeMentorships, setActiveMentorships] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [mentorPerformance, setMentorPerformance] = useState(null);
  const [reviews, setReviews] = useState([]);

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

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all data on component mount
  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        dashboardRes,
        mentorshipsRes,
        activeMentorshipsRes,
        upcomingSessionsRes,
        performanceRes
      ] = await Promise.all([
        getMentorDashboard().catch(err => {
          console.warn('Failed to fetch dashboard:', err);
          return null;
        }),
        getMentorMentorships().catch(err => {
          console.warn('Failed to fetch mentorships:', err);
          return { mentorships: [] };
        }),
        getMentorActiveMentorships().catch(err => {
          console.warn('Failed to fetch active mentorships:', err);
          return { active_mentorships: [] };
        }),
        getMentorUpcomingSessions().catch(err => {
          console.warn('Failed to fetch upcoming sessions:', err);
          return { upcoming_sessions: [] };
        }),
        getMentorPerformance().catch(err => {
          console.warn('Failed to fetch performance:', err);
          return null;
        })
      ]);


      setDashboardData(dashboardRes);
      setAllMentorships(mentorshipsRes?.mentorships || []);
      setActiveMentorships(activeMentorshipsRes?.active_mentorships || []);
      setUpcomingSessions(upcomingSessionsRes?.upcoming_sessions || []);
      setMentorPerformance(performanceRes);

      // Calculate stats
      const activeCount = activeMentorshipsRes?.active_mentorships?.length || 0;
      const totalCount = mentorshipsRes?.mentorships?.length || 0;
      const completedCount = mentorshipsRes?.mentorships?.filter(m => m.status === 'completed').length || 0;

      setStats({
        totalMentorships: totalCount,
        activeMentorships: activeCount,
        completedMentorships: completedCount,
        totalSessions: dashboardRes?.statistics?.total_sessions || 0,
        upcomingSessions: upcomingSessionsRes?.upcoming_sessions?.length || 0,
        avgRating: performanceRes?.average_rating || 0,
        completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
      });

    } catch (error) {
      console.error('Error fetching mentor data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSessionAction = async (sessionId, notes = '') => {
    try {
      setIsSessionModalLoading(true);

      if (!sessionId) {
        throw new Error('Session ID not found');
      }

      await updateSessionProgress(sessionId, 'complete', {
        notes: notes || 'Session completed by mentor',
        mentor_feedback: '',
        mentee_feedback: '',
        action_items: []
      });

      // Refresh sessions
      const sessionsRes = await getProgramSessions(selectedMentorship.id, selectedProgram.id);
      setProgramSessions(sessionsRes.sessions || []);

      // Refresh dashboard data
      fetchMentorData();

      alert('Session marked as completed!');
    } catch (error) {
      console.error('Error completing session:', error);
      alert(`Failed to complete session: ${error.message}`);
    } finally {
      setIsSessionModalLoading(false);
    }
  };

  const handleCancelSessionAction = async (sessionId) => {
    try {
      setIsSessionModalLoading(true);

      if (!sessionId) {
        throw new Error('Session ID not found');
      }

      const reason = prompt('Enter cancellation reason:');
      if (!reason) return;

      await updateSessionProgress(sessionId, 'cancel', {
        reason: reason
      });

      // Refresh sessions
      const sessionsRes = await getProgramSessions(selectedMentorship.id, selectedProgram.id);
      setProgramSessions(sessionsRes.sessions || []);

      // Refresh dashboard data
      fetchMentorData();

      alert('Session cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling session:', error);
      alert(`Failed to cancel session: ${error.message}`);
    } finally {
      setIsSessionModalLoading(false);
    }
  };

  const handleRescheduleSessionAction = async (sessionId) => {
    try {
      setIsSessionModalLoading(true);

      if (!sessionId) {
        throw new Error('Session ID not found');
      }

      const newDate = prompt('Enter new date and time (YYYY-MM-DDTHH:MM:SS):\nExample: 2024-01-15T14:30:00');
      if (!newDate) return;

      await updateSessionProgress(sessionId, 'reschedule', {
        new_date: newDate
      });

      // Refresh sessions
      const sessionsRes = await getProgramSessions(selectedMentorship.id, selectedProgram.id);
      setProgramSessions(sessionsRes.sessions || []);

      // Refresh dashboard data
      fetchMentorData();

      alert('Session rescheduled successfully!');
    } catch (error) {
      console.error('Error rescheduling session:', error);
      alert(`Failed to reschedule session: ${error.message}`);
    } finally {
      setIsSessionModalLoading(false);
    }
  };

  const handleViewProgramsOverview = async (mentorship) => {
    try {
      setSelectedMentorship(mentorship);
      const overviewData = await getMentorProgramOverview(mentorship.id);
      setProgramsOverview(overviewData?.programs || []);
      setIsProgramOverviewModalOpen(true);
    } catch (error) {
      console.error('Error fetching program overview:', error);
      alert('Failed to load program overview');
    }
  };

  const handleViewProgramSessions = async (program) => {
    try {
      setIsSessionModalLoading(true);
      const sessionsData = await getProgramSessions(selectedMentorship.id, program.id);
      setSelectedProgram(program);
      setProgramSessions(sessionsData?.sessions || []);
      setIsProgramOverviewModalOpen(false);
      setIsProgramSessionsModalOpen(true);
    } catch (error) {
      console.error('Error fetching program sessions:', error);
      alert('Failed to load program sessions');
    } finally {
      setIsSessionModalLoading(false);
    }
  };

  const handleScheduleSession = async (template, sessionData) => {
    try {
      setIsSessionModalLoading(true);

      await scheduleProgramSession(selectedMentorship.id, selectedProgram.id, sessionData);

      // Refresh sessions
      const sessionsRes = await getProgramSessions(selectedMentorship.id, selectedProgram.id);
      setProgramSessions(sessionsRes.sessions || []);

      // Refresh dashboard data
      fetchMentorData();

      alert('Session scheduled successfully!');
      return true;
    } catch (error) {
      console.error('Error scheduling session:', error);
      alert(`Failed to schedule session: ${error.message}`);
      return false;
    } finally {
      setIsSessionModalLoading(false);
    }
  };


  // Filter mentorships based on search and status
  const getFilteredMentorships = () => {
    let filtered = allMentorships;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.other_user?.full_name?.toLowerCase().includes(term) ||
        m.department?.name?.toLowerCase().includes(term) ||
        m.current_program?.name?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  // Get mentorships for current tab
  const getCurrentMentorships = () => {
    if (activeTab === 'active') {
      return activeMentorships;
    }
    return getFilteredMentorships();
  };

  const tabs = [
    { id: 'active', label: 'Active Mentorships', icon: Activity, count: activeMentorships.length },
    { id: 'all', label: 'All Mentorships', icon: Users, count: allMentorships.length },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
              <p className="text-gray-600">Manage your mentorship relationships and track progress</p>
            </div>
          </div>
          <Button
            variant="ghost"
            icon={RefreshCw}
            onClick={fetchMentorData}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Mentorships</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMentorships}</p>
                <p className="text-sm text-gray-600 mt-1">{stats.activeMentorships} active</p>
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
                <span>Next: {upcomingSessions[0]?.scheduled_date ? formatDate(upcomingSessions[0].scheduled_date, true) : 'No upcoming'}</span>
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
                <span className="font-semibold">
                  {stats.avgRating >= 4 ? 'Excellent' : stats.avgRating >= 3 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg. Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {activeMentorships.length > 0
                    ? Math.round(activeMentorships.reduce((acc, m) => acc + (m.progress_percentage || 0), 0) / activeMentorships.length)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600 mt-1">Across active mentorships</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="w-4 h-4 mr-2" />
                <span>{stats.completedMentorships} completed</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-6">
            {/* Active Mentorships Tab */}
            {activeTab === 'active' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Active Mentorships</h2>
                  <p className="text-gray-600">{activeMentorships.length} active mentorships</p>
                </div>

                {activeMentorships.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Mentorships</h3>
                    <p className="text-gray-500 mb-6">You don't have any active mentorship relationships at the moment.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeMentorships.map((mentorship) => (
                      <Card key={mentorship.id} className="p-6 hover:shadow-xl transition-all">
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
                              <span className="text-gray-600">Progress</span>
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
                              variant="primary"
                              size="sm"
                              icon={BookOpen}
                              onClick={() => handleViewProgramsOverview(mentorship)}
                            >
                              View Programs
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={MessageSquare}
                              onClick={() => {
                                navigate('/mentor/communication', {
                                  state: {
                                    mentorshipId: mentorship.id,
                                    mentorshipData: mentorship
                                  }
                                });
                              }}
                            >
                              Message
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Eye}
                              onClick={() => {
                                alert(`Mentorship Details:\n\nMentee: ${mentorship.other_user?.full_name}\nDepartment: ${mentorship.department?.name}\nProgress: ${mentorship.progress_percentage}%\nStart Date: ${formatDate(mentorship.start_date)}`);
                              }}
                            >
                              Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Mentorships Tab */}
            {activeTab === 'all' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">All Mentorships</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="search"
                        placeholder="Search mentees..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {getCurrentMentorships().length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Mentorships Found</h3>
                    <p className="text-gray-500">No mentorships match your search criteria.</p>
                  </Card>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Mentee</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Department</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Program</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Progress</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Start Date</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentMentorships().map((mentorship) => (
                          <tr key={mentorship.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="font-medium text-gray-900">{mentorship.other_user?.full_name}</div>
                              <div className="text-sm text-gray-500">{mentorship.other_user?.email}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-medium">{mentorship.department?.name || 'N/A'}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-medium">{mentorship.current_program?.name || 'Not assigned'}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <div className="text-sm font-semibold">{mentorship.progress_percentage || 0}%</div>
                                <ProgressBar value={mentorship.progress_percentage || 0} showLabel={false} size="sm" />
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant={
                                mentorship.status === 'active' ? 'success' :
                                  mentorship.status === 'completed' ? 'info' :
                                    mentorship.status === 'pending' ? 'warning' :
                                      mentorship.status === 'cancelled' ? 'danger' : 'default'
                              }>
                                {mentorship.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">{formatDate(mentorship.start_date)}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex gap-2">
                                {mentorship.status === 'active' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      icon={BookOpen}
                                      onClick={() => handleViewProgramsOverview(mentorship)}
                                    >
                                      Programs
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={MessageSquare}
                                      onClick={() => {
                                        navigate('/mentor/communication', {
                                          state: { mentorshipId: mentorship.id }
                                        });
                                      }}
                                    >
                                      Message
                                    </Button>
                                  </>
                                )}
                                {mentorship.status === 'completed' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Eye}
                                    onClick={() => {
                                      alert(`Completed Mentorship\n\nMentee: ${mentorship.other_user?.full_name}\nCompleted on: ${formatDate(mentorship.actual_end_date)}\nFinal Rating: ${mentorship.rating || 'N/A'}`);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                  <p className="text-gray-600">{upcomingSessions.length} upcoming sessions</p>
                </div>

                {upcomingSessions.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Upcoming Sessions</h3>
                    <p className="text-gray-500">You don't have any scheduled sessions for the next 7 days.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingSessions.map((session) => (
                      <Card key={session.id} className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900">{session.session_template?.title || 'Session'}</h3>
                              <p className="text-sm text-gray-600">{session.mentee_name}</p>
                            </div>
                            <Badge variant="info">Scheduled</Badge>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{formatDate(session.scheduled_date, true)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{session.duration_minutes} minutes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {session.session_type === 'video' ? (
                                <Video className="w-4 h-4 text-gray-400" />
                              ) : session.session_type === 'phone' ? (
                                <Phone className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Users className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="capitalize">{session.session_type?.replace('_', ' ')}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => {
                                const sessionId = session.session_id || session.id;
                                const notes = prompt('Enter session notes (optional):');
                                handleCompleteSessionAction(sessionId, notes || '');
                              }}
                              icon={CheckCircle}
                              disabled={loading}
                              loading={loading}
                            >
                              Complete
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this session?')) {
                                  handleCancelSessionAction(session.session_id || session.id);
                                }
                              }}
                              icon={AlertCircle}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-8">
                {mentorPerformance ? (
                  <>
                    {/* Performance Summary */}
                    <Card className="p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Dashboard</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
                            <span className="text-3xl font-bold text-white">{stats.avgRating.toFixed(1)}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Rating</h3>
                          <StarRating rating={stats.avgRating} size="lg" />
                          <p className="text-gray-600 mt-2">Based on {reviews.length} reviews</p>
                        </div>

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

                    {/* Recent Reviews */}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Reviews</h2>
                      {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {reviews.slice(0, 4).map((review) => (
                            <Card key={review.id} className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <StarRating rating={review.rating} size="md" />
                                <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                              </div>
                              <p className="text-gray-700 mb-4 line-clamp-3">{review.review_text}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-900">{review.mentee_name}</span>
                                {review.would_recommend && (
                                  <Badge variant="success">Would Recommend</Badge>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Card className="p-8 text-center">
                          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
                          <p className="text-gray-500">You haven't received any reviews from your mentees yet.</p>
                        </Card>
                      )}
                    </div>
                  </>
                ) : (
                  <Card className="p-12 text-center">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Performance Data</h3>
                    <p className="text-gray-500">Performance data will be available once you complete mentorships.</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Modals */}
      <ProgramOverviewModal
        isOpen={isProgramOverviewModalOpen}
        onClose={() => setIsProgramOverviewModalOpen(false)}
        mentorship={selectedMentorship}
        programs={programsOverview}
        onViewSessions={handleViewProgramSessions}
        loading={isSessionModalLoading}
      />

      <ProgramSessionsModal
        isOpen={isProgramSessionsModalOpen}
        onClose={() => setIsProgramSessionsModalOpen(false)}
        mentorship={selectedMentorship}
        program={selectedProgram}
        sessions={programSessions}
        onScheduleSession={handleScheduleSession}
        onCompleteSession={handleCompleteSessionAction} // Use the new function
        onCancelSession={handleCancelSessionAction}     // Use the new function
        onRescheduleSession={handleRescheduleSessionAction} // Use the new function
        loading={isSessionModalLoading}
      />
    </div>
  );
}