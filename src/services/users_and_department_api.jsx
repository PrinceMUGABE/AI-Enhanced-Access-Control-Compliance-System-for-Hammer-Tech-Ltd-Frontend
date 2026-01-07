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

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling and token refresh
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

// ============ AUTHENTICATION ============

export const authService = {
  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Registration successful'
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Registration failed'
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      const { token, ...userData } = response.data;
      
      if (token?.access && token?.refresh) {
        localStorage.setItem('access_token', token.access);
        localStorage.setItem('refresh_token', token.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Error logging in:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Login failed'
      };
    }
  },

  // Logout user
  logout: () => {
    localStorage.clear();
    return { success: true, message: 'Logged out successfully' };
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/profile/');
      return {
        success: true,
        data: response.data,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to get user'
      };
    }
  },

  // Password reset request OTP
  requestPasswordResetOTP: async (email) => {
    try {
      const response = await api.post('/auth/password-reset/request-otp/', {
        work_mail_address: email
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to send OTP'
      };
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/password-reset/verify-otp/', {
        work_mail_address: email,
        otp
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'OTP verification failed'
      };
    }
  },

  // Reset password with OTP
  resetPassword: async (email, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/password-reset/confirm/', {
        work_mail_address: email,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Password reset successful'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Password reset failed'
      };
    }
  }
};

// ============ DEPARTMENT MANAGEMENT ============

export const departmentService = {
  // Get all departments
  getDepartments: async (params = {}) => {
    try {
      const response = await api.get('/departments/all/', { params });
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.count || 0,
        message: response.data.message || 'Departments retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching departments:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.error || 'Failed to fetch departments'
      };
    }
  },

  // Get single department
  getDepartment: async (id) => {
    try {
      const response = await api.get(`/departments/${id}/`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Department retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching department:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to fetch department'
      };
    }
  },

  // Create department
  createDepartment: async (data) => {
    try {
      const response = await api.post('/departments/create/', data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Department created successfully'
      };
    } catch (error) {
      console.error('Error creating department:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to create department'
      };
    }
  },

  // Update department
  updateDepartment: async (id, data) => {
    try {
      const response = await api.put(`/departments/${id}/update/`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Department updated successfully'
      };
    } catch (error) {
      console.error('Error updating department:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to update department'
      };
    }
  },

  // Delete department
  deleteDepartment: async (id) => {
    try {
      const response = await api.delete(`/departments/${id}/delete/`);
      return {
        success: true,
        data: null,
        message: response.data.message || 'Department deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting department:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to delete department'
      };
    }
  },

  // Get my departments
  getMyDepartments: async () => {
    try {
      const response = await api.get('/departments/my-departments/');
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.count || 0,
        message: response.data.message || 'My departments retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching my departments:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.error || 'Failed to fetch my departments'
      };
    }
  }
};

// ============ USER MANAGEMENT ============

export const userService = {
  // Get all users
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users/', { params });
      return {
        success: true,
        data: response.data.users || [],
        total: response.data.users?.length || 0,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.error || 'Failed to fetch users'
      };
    }
  },

  // Get single user
  getUser: async (id) => {
    try {
      const response = await api.get(`/users/${id}/`);
      return {
        success: true,
        data: response.data,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to fetch user'
      };
    }
  },

  // Create user
  createUser: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'User created successfully'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to create user'
      };
    }
  },

  // Update user
  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}/update/`, data);
      return {
        success: true,
        data: response.data.user,
        message: response.data.message || 'User updated successfully'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to update user'
      };
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}/delete/`);
      return {
        success: true,
        data: null,
        message: response.data.message || 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to delete user'
      };
    }
  },

  // Update user status
  updateUserStatus: async (id, status) => {
    try {
      const response = await api.put(`/users/${id}/status/`, { status });
      return {
        success: true,
        data: response.data.user,
        message: response.data.message || 'User status updated successfully'
      };
    } catch (error) {
      console.error('Error updating user status:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to update user status'
      };
    }
  },

  // Activate user
  activateUser: async (id) => {
    try {
      const response = await api.put(`/users/${id}/activate/`);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'User activated successfully'
      };
    } catch (error) {
      console.error('Error activating user:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to activate user'
      };
    }
  },

  // Deactivate user
  deactivateUser: async (id) => {
    try {
      const response = await api.put(`/users/${id}/deactivate/`);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'User deactivated successfully'
      };
    } catch (error) {
      console.error('Error deactivating user:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to deactivate user'
      };
    }
  },

  // Search users by email
  searchUserByEmail: async (email) => {
    try {
      const response = await api.get('/users/search/email/', { params: { email } });
      return {
        success: true,
        data: response.data,
        message: 'User found successfully'
      };
    } catch (error) {
      console.error('Error searching user by email:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'User not found'
      };
    }
  },

  // Search users by phone
  searchUserByPhone: async (phone) => {
    try {
      const response = await api.get('/users/search/phone/', { params: { phone_number: phone } });
      return {
        success: true,
        data: response.data,
        message: 'User found successfully'
      };
    } catch (error) {
      console.error('Error searching user by phone:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'User not found'
      };
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const response = await api.put('/profile/update/', data);
      return {
        success: true,
        data: response.data.user,
        message: response.data.message || 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to update profile'
      };
    }
  }
};

// ============ CONTACT US ============

export const contactService = {
  sendContactMessage: async (data) => {
    try {
      const response = await api.post('/contact/', data);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Message sent successfully'
      };
    } catch (error) {
      console.error('Error sending contact message:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to send message'
      };
    }
  }
};

// ============ UNIFIED API SERVICE ============

export const apiService = {
  // Authentication methods
  auth: authService,
  
  // Department methods
  departments: departmentService,
  
  // User methods
  users: userService,
  
  // Contact methods
  contact: contactService,
  
  // Helper to check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
  
  // Helper to get current user from localStorage
  getCurrentUserFromStorage: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Export api instance for direct use if needed
export { api };
export default apiService;