// services/api.js
import axios from 'axios';

// Use Vite's environment variable syntax
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 400) {
      const errorMessage = error.response.data?.error || 
                          error.response.data?.detail || 
                          'Validation error';
      throw new Error(errorMessage);
    }
    
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to perform this action');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    }
    
    throw error;
  }
);

// Helper function for API responses
const handleApiResponse = (response) => {
  return {
    success: true,
    data: response.data,
    status: response.status,
    message: response.data?.message || 'Success'
  };
};

// Department Management
export const getDepartments = async () => {
  const response = await api.get('/mentorship/departments/');
  return handleApiResponse(response);
};

// Session Templates
export const getSessionTemplates = async () => {
  const response = await api.get('/mentorship/session-templates/');
  return handleApiResponse(response);
};

export const createSessionTemplate = async (data) => {
  const response = await api.post('/mentorship/session-templates/create/', data);
  return handleApiResponse(response);
};

// Mentorship Programs
export const getMentorshipPrograms = async (params = {}) => {
  const response = await api.get('/mentorship/programs/', { params });
  return handleApiResponse(response);
};

export const getMentorshipProgram = async (id) => {
  const response = await api.get(`/mentorship/programs/${id}/`);
  return handleApiResponse(response);
};

export const createMentorshipProgram = async (data) => {
  const response = await api.post('/mentorship/programs/create/', data);
  return handleApiResponse(response);
};

export const updateMentorshipProgram = async (id, data) => {
  const response = await api.put(`/mentorship/programs/${id}/update/`, data);
  return handleApiResponse(response);
};

export const deleteMentorshipProgram = async (id) => {
  const response = await api.delete(`/mentorship/programs/${id}/delete/`);
  return handleApiResponse(response);
};

export const getProgramSessions = async (programId) => {
  const response = await api.get(`/mentorship/programs/${programId}/sessions/`);
  return handleApiResponse(response);
};

// Mentorship Management
export const getMentorships = async (params = {}) => {
  const response = await api.get('/mentorship/mentorships/', { params });
  return handleApiResponse(response);
};

export const getMentorship = async (id) => {
  const response = await api.get(`/mentorship/mentorships/${id}/`);
  return handleApiResponse(response);
};

export const createMentorship = async (data) => {
  const response = await api.post('/mentorship/mentorships/create/', data);
  return handleApiResponse(response);
};

export const updateMentorshipStatus = async (id, data) => {
  const response = await api.put(`/mentorship/mentorships/${id}/status/`, data);
  return handleApiResponse(response);
};

export const updateMentorship = async (id, data) => {
  const response = await api.put(`/mentorship/mentorships/${id}/`, data);
  return handleApiResponse(response);
};

export const deleteMentorship = async (id) => {
  const response = await api.delete(`/mentorship/mentorships/${id}/`);
  return handleApiResponse(response);
};

export const getMentorshipProgress = async (id) => {
  const response = await api.get(`/mentorship/mentorships/${id}/progress/`);
  return handleApiResponse(response);
};

// User Management
export const getAvailableMentors = async (department) => {
  const params = department ? { department } : {};
  const response = await api.get('/mentorship/available-mentors/', { params });
  return handleApiResponse(response);
};

export const getMenteesReadyForMentorship = async (department) => {
  const params = department ? { department } : {};
  const response = await api.get('/mentorship/ready-mentees/', { params });
  return handleApiResponse(response);
};

export const getMentees = async (department) => {
  try {
    const params = department ? { department } : {};
    const response = await api.get('/mentorship/ready-mentees/', { params });
    return handleApiResponse(response);
  } catch (error) {
    console.warn('Mentees endpoint not available, using fallback');
    return {
      success: true,
      data: [],
      message: 'Using fallback data'
    };
  }
};

export const getMentors = async (department) => {
  try {
    const params = department ? { department } : {};
    const response = await api.get('/mentorship/available-mentors/', { params });
    return handleApiResponse(response);
  } catch (error) {
    console.warn('Mentors endpoint not available, using fallback');
    return {
      success: true,
      data: [],
      message: 'Using fallback data'
    };
  }
};

export const checkMenteeOnboarding = async (menteeId) => {
  try {
    const response = await api.get(`/onboarding/mentee/${menteeId}/status/`);
    return handleApiResponse(response);
  } catch (error) {
    return {
      success: true,
      data: { completed: true, message: 'Onboarding check not available' }
    };
  }
};

// Session Management
export const getSessions = async (params = {}) => {
  const response = await api.get('/mentorship/sessions/', { params });
  return handleApiResponse(response);
};

export const createSession = async (data) => {
  const response = await api.post('/mentorship/sessions/create/', data);
  return handleApiResponse(response);
};

export const markSessionCompleted = async (id, data) => {
  const response = await api.put(`/mentorship/sessions/${id}/complete/`, data);
  return handleApiResponse(response);
};

export const rescheduleSession = async (id, data) => {
  const response = await api.put(`/mentorship/sessions/${id}/reschedule/`, data);
  return handleApiResponse(response);
};

export const cancelSession = async (id, data = {}) => {
  const response = await api.delete(`/mentorship/sessions/${id}/cancel/`, { data });
  return handleApiResponse(response);
};

// Dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/mentorship/dashboard/stats/');
  return handleApiResponse(response);
};

// Chat Management
export const getChatRoomByMentorship = async (mentorshipId) => {
  const response = await api.get(`/mentorship/chat/rooms/mentorship/${mentorshipId}/`);
  return handleApiResponse(response);
};

export const sendMessage = async (chatRoomId, data) => {
  const response = await api.post(`/mentorship/chat/messages/send/`, {
    ...data,
    chat_room_id: chatRoomId
  });
  return handleApiResponse(response);
};

export const getGroupChats = async (params = {}) => {
  const response = await api.get('/mentorship/group-chats/', { params });
  return handleApiResponse(response);
};

// Onboarding Management
export const getOnboardingModules = async (params = {}) => {
  const response = await api.get('/onboarding/modules/', { params });
  return handleApiResponse(response);
};

export const getMenteeOnboardingProgress = async (menteeId) => {
  const response = await api.get(`/onboarding/progress/mentee/${menteeId}/`);
  return handleApiResponse(response);
};

// Notification Management
export const getNotifications = async (params = {}) => {
  const response = await api.get('/mentorship/notifications/', { params });
  return handleApiResponse(response);
};

export const markNotificationRead = async (notificationId) => {
  const response = await api.post(`/mentorship/notifications/${notificationId}/read/`);
  return handleApiResponse(response);
};

export const markAllNotificationsRead = async () => {
  const response = await api.post('/mentorship/notifications/mark-all-read/');
  return handleApiResponse(response);
};

// Export api instance and helper functions
export { api };

// Mock data for testing when API is not available
export const mockApiData = {
  // Mock departments
  departments: [
    { id: 1, name: 'Engineering', description: 'Software engineering department' },
    { id: 2, name: 'Marketing', description: 'Marketing and sales department' },
    { id: 3, name: 'HR', description: 'Human resources department' }
  ],
  
  // Mock users
  mentors: [
    { id: 1, full_name: 'John Doe', email: 'john@example.com', role: 'Senior Engineer', department: 'Engineering' },
    { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', role: 'Marketing Lead', department: 'Marketing' }
  ],
  
  mentees: [
    { id: 3, full_name: 'Alice Johnson', email: 'alice@example.com', role: 'Junior Developer', department: 'Engineering' },
    { id: 4, full_name: 'Bob Wilson', email: 'bob@example.com', role: 'Marketing Intern', department: 'Marketing' }
  ],
  
  // Mock mentorship programs
  programs: [
    {
      id: 1,
      name: 'Engineering Mentorship Program',
      department: 'Engineering',
      total_days: 90,
      total_sessions: 12,
      description: 'A comprehensive mentorship program for engineering team'
    }
  ],
  
  // Mock mentorships
  mentorships: [
    {
      id: 1,
      mentor: { id: 1, full_name: 'John Doe', email: 'john@example.com', role: 'Senior Engineer', department: 'Engineering' },
      mentee: { id: 3, full_name: 'Alice Johnson', email: 'alice@example.com', role: 'Junior Developer', department: 'Engineering' },
      program: { id: 1, name: 'Engineering Mentorship Program', department: 'Engineering', total_days: 90, total_sessions: 12, description: 'A comprehensive mentorship program for engineering team' },
      progress_percentage: 65,
      sessions_completed: 8,
      remaining_sessions: 4,
      rating: 4.5,
      duration_days: 45,
      start_date: '2024-01-15',
      status: 'active'
    }
  ]
};

// Mock API functions for development
export const mockApi = {
  getDepartments: () => Promise.resolve({
    success: true,
    data: mockApiData.departments
  }),
  
  getMentorships: () => Promise.resolve({
    success: true,
    data: mockApiData.mentorships
  }),
  
  getMentorship: (id) => Promise.resolve({
    success: true,
    data: mockApiData.mentorships.find(m => m.id === parseInt(id)) || mockApiData.mentorships[0]
  }),
  
  getMentorshipProgress: (id) => Promise.resolve({
    success: true,
    data: {
      milestones: [
        { id: 1, title: 'Initial Meeting', completed: true, date: '2024-01-20' },
        { id: 2, title: 'Technical Assessment', completed: true, date: '2024-01-27' },
        { id: 3, title: 'Project Kickoff', completed: false, date: null }
      ],
      overallProgress: 65
    }
  }),
  
  getAvailableMentors: () => Promise.resolve({
    success: true,
    data: mockApiData.mentors
  }),
  
  getMenteesReadyForMentorship: () => Promise.resolve({
    success: true,
    data: mockApiData.mentees
  }),
  
  getDashboardStats: () => Promise.resolve({
    success: true,
    data: {
      totalMentorships: 24,
      activeMentorships: 18,
      completedMentorships: 6,
      averageRating: 4.3,
      upcomingSessions: 12,
      pendingActions: 5
    }
  })
};

// Helper to check if we should use mock data
export const isUsingMockData = () => {
  return import.meta.env.VITE_USE_MOCK_DATA === 'true' || !API_BASE_URL;
};

// Unified API calls that can fall back to mock data
export const apiService = {
  getMentorships: async (params) => {
    if (isUsingMockData()) {
      return mockApi.getMentorships(params);
    }
    try {
      return await getMentorships(params);
    } catch (error) {
      console.error('API call failed, using mock data:', error);
      return mockApi.getMentorships(params);
    }
  },
  
  getMentorship: async (id) => {
    if (isUsingMockData()) {
      return mockApi.getMentorship(id);
    }
    try {
      return await getMentorship(id);
    } catch (error) {
      console.error('API call failed, using mock data:', error);
      return mockApi.getMentorship(id);
    }
  },
  
  getMentorshipProgress: async (id) => {
    if (isUsingMockData()) {
      return mockApi.getMentorshipProgress(id);
    }
    try {
      return await getMentorshipProgress(id);
    } catch (error) {
      console.error('API call failed, using mock data:', error);
      return mockApi.getMentorshipProgress(id);
    }
  },
  
  getDashboardStats: async () => {
    if (isUsingMockData()) {
      return mockApi.getDashboardStats();
    }
    try {
      return await getDashboardStats();
    } catch (error) {
      console.error('API call failed, using mock data:', error);
      return mockApi.getDashboardStats();
    }
  },
  
  getAvailableMentors: async (department) => {
    if (isUsingMockData()) {
      return mockApi.getAvailableMentors(department);
    }
    try {
      return await getAvailableMentors(department);
    } catch (error) {
      console.error('API call failed, using mock data:', error);
      return mockApi.getAvailableMentors(department);
    }
  },
  
  getMenteesReadyForMentorship: async (department) => {
    if (isUsingMockData()) {
      return mockApi.getMenteesReadyForMentorship(department);
    }
    try {
      return await getMenteesReadyForMentorship(department);
    } catch (error) {
      console.error('API call failed, using mock data:', error);
      return mockApi.getMenteesReadyForMentorship(department);
    }
  },
  
  // Add other methods as needed
};