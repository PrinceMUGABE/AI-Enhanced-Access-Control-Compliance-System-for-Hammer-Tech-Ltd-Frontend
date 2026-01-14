import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// API base URL
const BASE_URL = "http://127.0.0.1:8000";

const API_CACHE = {
    mentorships: { data: null, timestamp: 0, ttl: 30000 }, // 30 seconds
    activeMentorships: { data: null, timestamp: 0, ttl: 30000 },
    upcomingSessions: { data: null, timestamp: 0, ttl: 30000 },
    mentorshipDetails: {} // Per mentorship ID cache
};

const isCacheValid = (cacheKey, ttl = 30000) => {
    const cache = API_CACHE[cacheKey];
    if (!cache || !cache.data) return false;
    return Date.now() - cache.timestamp < ttl;
};

// Helper functions (from your original code)
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
        default:
            return { className: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
};

const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
};

// API functions specific to mentee

const fetchAPI = async (endpoint, method = 'GET', data = null, retryCount = 0) => {
    try {
        const token = getAuthToken();
        console.log(`🔍 Fetching ${endpoint} with token: ${token ? 'Present' : 'Missing'}`);

        if (!token) {
            console.error('❌ No auth token found! Redirecting to login...');
            window.location.href = '/login';
            throw new Error('No authentication token found');
        }

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

        console.log(`📤 Making ${method} request to: ${BASE_URL}${endpoint}`);

        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        console.log(`📥 Response status for ${endpoint}:`, response.status);

        // Handle non-OK responses
        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ Unauthorized - token may be expired');
                localStorage.removeItem('access_token');
                window.location.href = '/login';
                throw new Error('Unauthorized - please log in again');
            }

            if (response.status === 429) {
                console.error('⚠️ Too many requests');
                throw new Error('Too Many Requests - please wait a moment');
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        // Parse and return the JSON response
        const responseData = await response.json();
        console.log(`✅ Successfully fetched ${endpoint}:`, responseData);
        return responseData;

    } catch (error) {
        console.error(`💥 Error fetching ${endpoint}:`, error);

        // Retry logic for network errors (not 4xx/5xx errors)
        if (retryCount < 2 && !error.message.includes('HTTP')) {
            console.log(`🔄 Retrying ${endpoint} (attempt ${retryCount + 1})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return fetchAPI(endpoint, method, data, retryCount + 1);
        }

        throw error;
    }
};

// Mentee-specific API calls
const getMyMentorships = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid('mentorships')) {
        console.log('Using cached mentorships data');
        return API_CACHE.mentorships.data;
    }

    const data = await fetchAPI('/mentorship/my-mentorships/');
    API_CACHE.mentorships = { data, timestamp: Date.now() };
    return data;
};

const getMyActiveMentorships = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid('activeMentorships')) {
        console.log('Using cached active mentorships data');
        return API_CACHE.activeMentorships.data;
    }

    const data = await fetchAPI('/mentorship/my-active-mentorships/');
    API_CACHE.activeMentorships = { data, timestamp: Date.now() };
    return data;
};

const getMySessions = async () => {
    return fetchAPI('/mentorship/my-sessions/');
};

const getMyUpcomingSessions = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid('upcomingSessions')) {
        console.log('Using cached upcoming sessions data');
        return API_CACHE.upcomingSessions.data;
    }

    const data = await fetchAPI('/mentorship/my-upcoming-sessions/');
    API_CACHE.upcomingSessions = { data, timestamp: Date.now() };
    return data;
};

const getMentorshipDetail = async (mentorshipId) => {
    const cacheKey = `mentorship-${mentorshipId}`;

    if (isCacheValid(cacheKey, 60000)) { // 1 minute cache for details
        console.log(`Using cached mentorship detail for ID: ${mentorshipId}`);
        return API_CACHE.mentorshipDetails[cacheKey].data;
    }

    const data = await fetchAPI(`/mentorship/my-mentorships/${mentorshipId}/`);
    API_CACHE.mentorshipDetails[cacheKey] = { data, timestamp: Date.now() };
    return data;
};


const submitMentorshipReview = async (mentorshipId, reviewData) => {
    return fetchAPI(`/mentorship/reviews/create/`, 'POST', {
        mentorship: mentorshipId,
        ...reviewData
    });
};

// UI Components (simplified from your original)
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }) => (
    <div className={`border-b border-gray-100 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }) => (
    <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>
);

const CardDescription = ({ children, className = '' }) => (
    <p className={`text-gray-600 ${className}`}>{children}</p>
);

const Button = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, type = 'button' }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        default: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400',
        ghost: 'hover:bg-gray-100 hover:text-gray-900',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm',
    };

    const sizes = {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base font-medium',
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
        className={`flex h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
        {...props}
    />
);

const Textarea = ({ value, onChange, placeholder, rows = 4, className = '' }) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
    />
);

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-blue-100 text-blue-800',
        secondary: 'bg-gray-100 text-gray-800',
        outline: 'border border-gray-300',
        destructive: 'bg-red-100 text-red-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-indigo-100 text-indigo-800',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

const Progress = ({ value, className = '', showLabel = false }) => (
    <div className="space-y-2">
        {showLabel && (
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">{value}%</span>
            </div>
        )}
        <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
            <div
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(value)}`}
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

const Select = ({ value, onChange, children, className = '', placeholder = 'Select...' }) => (
    <select
        value={value}
        onChange={onChange}
        className={`flex h-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
    >
        <option value="">{placeholder}</option>
        {children}
    </select>
);

const Label = ({ children, htmlFor, className = '' }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium mb-2 ${className}`}>
        {children}
    </label>
);

// Modal Dialog Component
const Dialog = ({ open, onOpenChange, children, size = 'md' }) => {
    if (!open) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={() => onOpenChange(false)}
            />
            <div className={`relative z-50 bg-white rounded-2xl shadow-2xl mx-4 ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300`}>
                {children}
            </div>
        </div>
    );
};

const DialogContent = ({ children }) => children;

const DialogHeader = ({ children, className = '' }) => (
    <div className={`sticky top-0 z-10 border-b border-gray-200 bg-white p-6 ${className}`}>
        {children}
    </div>
);

const DialogTitle = ({ children }) => (
    <h3 className="text-xl font-semibold text-gray-900">{children}</h3>
);

const DialogDescription = ({ children }) => (
    <p className="text-sm text-gray-600 mt-1">{children}</p>
);

const DialogFooter = ({ children, className = '' }) => (
    <div className={`flex justify-end gap-3 p-6 border-t border-gray-200 ${className}`}>{children}</div>
);

// Star Rating Component
const StarRating = ({ rating, onRatingChange, editable = false, size = 'md' }) => {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => editable && onRatingChange(star)}
                    disabled={!editable}
                    className={`${sizes[size]} ${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
                >
                    <svg
                        className={`w-full h-full ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
        </div>
    );
};

// Icons (updated with more modern ones)
const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0h-15" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TrophyIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const ChatIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const StarIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const XIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// Main Component
export default function MenteeMentorshipDashboard() {
    const navigate = useNavigate();

    // State management
    const [loading, setLoading] = useState(true);
    const [mentorships, setMentorships] = useState([]);
    const [activeMentorships, setActiveMentorships] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0,
        sessionsThisWeek: 0,
        averageRating: 0
    });

    // Modal states
    const [selectedMentorship, setSelectedMentorship] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const isFetchingRef = useRef(false);

    // Review form state
    const [reviewForm, setReviewForm] = useState({
        rating: 0,
        communication_rating: 0,
        knowledge_rating: 0,
        helpfulness_rating: 0,
        review_text: '',
        would_recommend: true
    });

    // Fetch data on component mount
    useEffect(() => {
        const controller = new AbortController();

        const loadData = async () => {
            if (mentorships.length === 0 && !loading) {
                await fetchMenteeData();
            }
        };

        loadData();

        return () => {
            controller.abort();
        };
    }, []);

    const fetchMenteeData = async () => {
        if (isFetchingRef.current) {
            console.log('Already fetching data, skipping...');
            return;
        }

        try {
            isFetchingRef.current = true;
            setLoading(true);

            console.log('🚀 Starting to fetch mentee data...');

            // Test each endpoint individually to identify which one fails
            let mentorshipsData = null;
            let activeMentorshipsData = null;
            let upcomingSessionsData = null;

            try {
                console.log('📋 Testing mentorships endpoint...');
                mentorshipsData = await getMyMentorships();
                console.log('✅ Mentorships data received:', mentorshipsData);
            } catch (mentorshipError) {
                console.error('❌ Failed to fetch mentorships:', mentorshipError);
            }

            try {
                console.log('📋 Testing active mentorships endpoint...');
                activeMentorshipsData = await getMyActiveMentorships();
                console.log('✅ Active mentorships data received:', activeMentorshipsData);
            } catch (activeError) {
                console.error('❌ Failed to fetch active mentorships:', activeError);
            }

            try {
                console.log('📋 Testing upcoming sessions endpoint...');
                upcomingSessionsData = await getMyUpcomingSessions();
                console.log('✅ Upcoming sessions data received:', upcomingSessionsData);
            } catch (sessionsError) {
                console.error('❌ Failed to fetch upcoming sessions:', sessionsError);
            }

            // Handle responses
            const allMentorships = mentorshipsData?.mentorships || [];
            const activeMentorshipsList = activeMentorshipsData?.active_mentorships || [];
            const upcomingSessionsList = upcomingSessionsData?.upcoming_sessions || [];

            console.log(`📊 Setting state: ${allMentorships.length} mentorships, ${activeMentorshipsList.length} active, ${upcomingSessionsList.length} upcoming sessions`);

            setMentorships(allMentorships);
            setActiveMentorships(activeMentorshipsList);
            setUpcomingSessions(upcomingSessionsList);

            // Calculate statistics
            calculateStats(allMentorships, upcomingSessionsList);

        } catch (error) {
            console.error('💥 Error in fetchMenteeData:', error);

            // Check specific error types
            if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
                alert('Please wait a moment and try again. Too many requests sent.');

                // Implement exponential backoff
                setTimeout(() => {
                    fetchMenteeData();
                }, 5000);
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                alert('Your session has expired. Please log in again.');
                navigate('/login');
            } else {
                alert(`Failed to load your mentorship data: ${error.message}`);
            }
        } finally {
            isFetchingRef.current = false;
            setLoading(false);
            console.log('🏁 Finished fetching mentee data');
        }
    };



    // Call this in your useEffect
    useEffect(() => {
        console.log('🔧 MenteeMentorshipDashboard mounted');


        const controller = new AbortController();
        const loadData = async () => {
            await fetchMenteeData();
        };

        loadData();

        return () => {
            console.log('🧹 Cleaning up...');
            controller.abort();
        };
    }, []);


    const calculateStats = (mentorshipsList, sessionsList) => {
        const total = mentorshipsList.length;
        const active = mentorshipsList.filter(m => m.status === 'active').length;
        const completed = mentorshipsList.filter(m => m.status === 'completed').length;

        // Count sessions in next 7 days
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const sessionsThisWeek = sessionsList.filter(session => {
            const sessionDate = new Date(session.scheduled_date);
            return sessionDate >= now && sessionDate <= nextWeek;
        }).length;

        // Calculate average rating from completed mentorships
        const completedMentorships = mentorshipsList.filter(m => m.status === 'completed');
        const totalRating = completedMentorships.reduce((sum, m) => sum + (m.rating || 0), 0);
        const averageRating = completedMentorships.length > 0 ? (totalRating / completedMentorships.length).toFixed(1) : 0;

        setStats({
            total,
            active,
            completed,
            sessionsThisWeek,
            averageRating
        });
    };


    const handleViewDetails = async (mentorship) => {
        try {
            const detail = await getMentorshipDetail(mentorship.id);
            setSelectedMentorship(detail?.mentorship || mentorship);
            setShowDetailsModal(true);
        } catch (error) {
            console.error('Error fetching mentorship details:', error);
            setSelectedMentorship(mentorship);
            setShowDetailsModal(true);
        }
    };




    // Add this API function
    const checkCanReviewMentorship = async (mentorshipId) => {
        return fetchAPI(`/mentorship/mentorships/${mentorshipId}/can-review/`);
    };

    // Update the handleOpenReview function
    const handleOpenReview = async (mentorship) => {
        try {
            // Check if user can review this mentorship
            const canReview = await checkCanReviewMentorship(mentorship.id);

            if (!canReview.can_review) {
                alert(canReview.reason || 'You cannot review this mentorship');
                return;
            }

            setSelectedMentorship(mentorship);
            setReviewForm({
                rating: 0,
                communication_rating: 0,
                knowledge_rating: 0,
                helpfulness_rating: 0,
                review_text: '',
                would_recommend: true
            });
            setShowReviewModal(true);
        } catch (error) {
            console.error('Error checking review eligibility:', error);
            alert('Unable to check review eligibility. Please try again.');
        }
    };

    const handleSubmitReview = async () => {
        if (!selectedMentorship) return;

        try {
            await submitMentorshipReview(selectedMentorship.id, {
                ...reviewForm,
                reviewer_type: 'mentee'
            });

            alert('Thank you for your review!');
            setShowReviewModal(false);
            fetchMenteeData(); // Refresh data
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        }
    };


    const navigateToChat = (mentorship) => {
        // Navigate to communication page with mentorship ID as state
        navigate('/mentee/communication', {
            state: {
                mentorshipId: mentorship.id,
                mentorshipData: mentorship,
                autoOpenChat: true
            }
        });
    };
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading your mentorship dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Mentorship Journey</h1>
                            <p className="text-gray-600 mt-2">
                                Track your progress, connect with mentors, and achieve your goals
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={fetchMenteeData}
                                className="flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </Button>

                            {activeMentorships.length > 0 && (
                                <Button
                                    onClick={() => navigateToChat(activeMentorships[0])}
                                    className="flex items-center gap-2"
                                >
                                    <ChatIcon />
                                    Go to Chat
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active Mentorships</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.active}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                                    <UsersIcon />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600">{stats.total} total mentorships</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Sessions This Week</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.sessionsThisWeek}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-green-100 to-green-50 rounded-xl">
                                    <CalendarIcon />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600">Check your schedule</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Completed Programs</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completed}</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl">
                                    <TrophyIcon />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600">Great work!</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Average Rating</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <StarRating rating={parseFloat(stats.averageRating)} size="md" />
                                        <span className="text-2xl font-bold text-gray-900">{stats.averageRating}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl">
                                    <StarIcon />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600">Your feedback matters</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Sessions Section */}
                {upcomingSessions.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/my-sessions')}>
                                View All
                                <ChevronRightIcon />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingSessions.slice(0, 3).map((session) => (
                                <Card key={session.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{session.session_template?.title || 'Session'}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    with {session.mentorship?.mentor?.full_name}
                                                </p>
                                            </div>
                                            <Badge variant="info">
                                                {formatDate(session.scheduled_date, true)}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <ClockIcon />
                                                <span>{session.duration_minutes} minutes</span>
                                            </div>

                                            {session.meeting_link && (
                                                <a
                                                    href={session.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Join Meeting
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mentorships Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">My Mentorships</h2>
                        <div className="flex items-center gap-2">
                            <Badge variant={stats.active > 0 ? 'success' : 'secondary'}>
                                {stats.active} Active
                            </Badge>
                            <Badge variant="secondary">
                                {stats.total} Total
                            </Badge>
                        </div>
                    </div>

                    {mentorships.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                                    <UsersIcon />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No mentorships yet</h3>
                                <p className="text-gray-600 mb-6">
                                    You haven't been assigned to any mentorship programs yet.
                                </p>
                                <Button onClick={() => navigate('/programs')}>
                                    Browse Available Programs
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {mentorships.map((mentorship) => {
                                const badgeProps = getStatusBadgeProps(mentorship.status);
                                const isCompleted = mentorship.status === 'completed';
                                const canReview = isCompleted && !mentorship.has_reviewed;

                                return (
                                    <Card key={mentorship.id} className="hover:shadow-lg transition-all duration-200">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                                {/* Left side - Mentor info and progress */}
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-lg font-semibold text-blue-600">
                                                                {mentorship.mentor?.full_name?.charAt(0) || 'M'}
                                                            </span>
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-lg font-semibold text-gray-900">
                                                                    {mentorship.mentor?.full_name}
                                                                </h3>
                                                                <Badge className={badgeProps.className}>
                                                                    {badgeProps.label}
                                                                </Badge>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                                    <div className="flex items-center gap-1">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                        </svg>
                                                                        <span>{mentorship.department?.name || 'Department'}</span>
                                                                    </div>

                                                                    <div className="flex items-center gap-1">
                                                                        <CalendarIcon />
                                                                        <span>Started: {formatDate(mentorship.start_date)}</span>
                                                                    </div>
                                                                </div>

                                                                {mentorship.current_program && (
                                                                    <div>
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <span className="text-sm font-medium text-gray-700">
                                                                                {mentorship.current_program.name}
                                                                            </span>
                                                                            <span className="text-sm font-semibold text-gray-900">
                                                                                {mentorship.progress_percentage || 0}%
                                                                            </span>
                                                                        </div>
                                                                        <Progress value={mentorship.progress_percentage || 0} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right side - Actions and rating */}
                                                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {mentorship.rating ? (
                                                            <StarRating rating={mentorship.rating} size="sm" />
                                                        ) : (
                                                            <span className="text-sm text-gray-500">Not rated yet</span>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(mentorship)}
                                                            className="flex-1"
                                                        >
                                                            <EyeIcon />
                                                            <span className="ml-2">Details</span>
                                                        </Button>

                                                        {mentorship.status === 'active' && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => navigateToChat(mentorship)}
                                                                className="flex-1"
                                                            >
                                                                <ChatIcon />
                                                                <span className="ml-2">Chat</span>
                                                            </Button>
                                                        )}

                                                        {mentorship.status === 'completed' && !mentorship.has_reviewed && (
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => handleOpenReview(mentorship)}
                                                                className="flex-1"
                                                            >
                                                                <StarIcon />
                                                                <span className="ml-2">Review</span>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Goals preview */}
                                            {mentorship.goals && mentorship.goals.length > 0 && (
                                                <div className="mt-6 pt-6 border-t border-gray-100">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Goals</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {mentorship.goals.slice(0, 3).map((goal, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                {goal}
                                                            </Badge>
                                                        ))}
                                                        {mentorship.goals.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{mentorship.goals.length - 3} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Mentorship Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal} size="lg">
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle>Mentorship Details</DialogTitle>
                                {selectedMentorship && (
                                    <DialogDescription>
                                        {selectedMentorship.mentor?.full_name} • {selectedMentorship.department?.name}
                                    </DialogDescription>
                                )}
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <XIcon />
                            </button>
                        </div>
                    </DialogHeader>

                    {selectedMentorship && (
                        <div className="p-6 space-y-8">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500">Mentor</h4>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {selectedMentorship.mentor?.full_name}
                                    </p>
                                    <p className="text-gray-600">{selectedMentorship.mentor?.email}</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <Badge className={getStatusBadgeProps(selectedMentorship.status).className}>
                                        {getStatusBadgeProps(selectedMentorship.status).label}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                                    <p className="text-gray-900">{formatDate(selectedMentorship.start_date)}</p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500">Progress</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <Progress value={selectedMentorship.progress_percentage || 0} showLabel />
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {selectedMentorship.progress_percentage || 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Program Information */}
                            {selectedMentorship.current_program && (
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Program</h4>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h5 className="font-medium text-gray-900">
                                                        {selectedMentorship.current_program.name}
                                                    </h5>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {selectedMentorship.current_program.description}
                                                    </p>
                                                </div>
                                                <Badge variant="info">
                                                    {selectedMentorship.sessions_completed || 0}/{selectedMentorship.total_sessions || 0} sessions
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Goals */}
                            {selectedMentorship.goals && selectedMentorship.goals.length > 0 && (
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Goals</h4>
                                    <div className="space-y-2">
                                        {selectedMentorship.goals.map((goal, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-700">{goal}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sessions */}
                            {selectedMentorship.sessions && selectedMentorship.sessions.length > 0 && (
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h4>
                                    <div className="space-y-3">
                                        {selectedMentorship.sessions.slice(0, 5).map((session) => (
                                            <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {session.session_template?.title || 'Session'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {formatDate(session.actual_date || session.scheduled_date, true)}
                                                    </p>
                                                </div>
                                                <Badge variant={session.status === 'completed' ? 'success' : 'warning'}>
                                                    {session.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                            Close
                        </Button>
                        {selectedMentorship?.status === 'active' && (
                            <Button onClick={() => {
                                setShowDetailsModal(false);
                                navigateToChat(selectedMentorship);
                            }}>
                                <ChatIcon />
                                <span className="ml-2">Open Chat</span>
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Review Modal */}
            <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rate Your Mentorship</DialogTitle>
                        {selectedMentorship && (
                            <DialogDescription>
                                Share your feedback about your mentorship with {selectedMentorship.mentor?.full_name}
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        {/* Overall Rating */}
                        <div className="space-y-3">
                            <Label>Overall Rating</Label>
                            <div className="flex flex-col items-center p-6 bg-gray-50 rounded-xl">
                                <StarRating
                                    rating={reviewForm.rating}
                                    onRatingChange={(rating) => setReviewForm({ ...reviewForm, rating })}
                                    editable={true}
                                    size="lg"
                                />
                                <p className="text-sm text-gray-600 mt-3">
                                    {reviewForm.rating === 0 ? 'Select your rating' :
                                        reviewForm.rating === 5 ? 'Excellent!' :
                                            reviewForm.rating === 4 ? 'Very Good' :
                                                reviewForm.rating === 3 ? 'Good' :
                                                    reviewForm.rating === 2 ? 'Fair' : 'Poor'}
                                </p>
                            </div>
                        </div>

                        {/* Category Ratings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-3">
                                <Label>Communication</Label>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <StarRating
                                        rating={reviewForm.communication_rating}
                                        onRatingChange={(rating) => setReviewForm({ ...reviewForm, communication_rating: rating })}
                                        editable={true}
                                        size="sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Knowledge</Label>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <StarRating
                                        rating={reviewForm.knowledge_rating}
                                        onRatingChange={(rating) => setReviewForm({ ...reviewForm, knowledge_rating: rating })}
                                        editable={true}
                                        size="sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Helpfulness</Label>
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <StarRating
                                        rating={reviewForm.helpfulness_rating}
                                        onRatingChange={(rating) => setReviewForm({ ...reviewForm, helpfulness_rating: rating })}
                                        editable={true}
                                        size="sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Review Text */}
                        <div className="space-y-3">
                            <Label>Your Review</Label>
                            <Textarea
                                value={reviewForm.review_text}
                                onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                                placeholder="Share your experience with this mentorship. What went well? What could be improved?"
                                rows={5}
                            />
                            <p className="text-sm text-gray-500">
                                Your review helps improve the mentorship experience for others.
                            </p>
                        </div>

                        {/* Recommendation */}
                        <div className="space-y-3">
                            <Label>Would you recommend this mentor?</Label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setReviewForm({ ...reviewForm, would_recommend: true })}
                                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${reviewForm.would_recommend
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${reviewForm.would_recommend ? 'bg-green-100' : 'bg-gray-100'
                                            }`}>
                                            <svg className={`w-5 h-5 ${reviewForm.would_recommend ? 'text-green-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                            </svg>
                                        </div>
                                        <span className={`font-medium ${reviewForm.would_recommend ? 'text-green-700' : 'text-gray-700'
                                            }`}>
                                            Yes, I would recommend
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setReviewForm({ ...reviewForm, would_recommend: false })}
                                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${!reviewForm.would_recommend
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center ${!reviewForm.would_recommend ? 'bg-red-100' : 'bg-gray-100'
                                            }`}>
                                            <svg className={`w-5 h-5 ${!reviewForm.would_recommend ? 'text-red-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                            </svg>
                                        </div>
                                        <span className={`font-medium ${!reviewForm.would_recommend ? 'text-red-700' : 'text-gray-700'
                                            }`}>
                                            No, I wouldn't recommend
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitReview}
                            disabled={reviewForm.rating === 0 || reviewForm.review_text.trim() === ''}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                            Submit Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}