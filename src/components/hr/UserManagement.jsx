// components/admin/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Download, ChevronDown, UserPlus, 
  Edit, Trash2, Users, Eye, MoreVertical, Mail, 
  Phone, Calendar, Building, Award, ArrowUpDown,
  ChevronLeft, ChevronRight, CheckCircle, XCircle,
  UserCheck, UserX, RefreshCw, X, Save, User,
  Lock, Briefcase, Shield, FileText, Globe,
  Check, AlertCircle, Plus, Minus
} from 'lucide-react';

// Base URL from your configuration
const BASE_URL = 'http://127.0.0.1:8000';

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  // Selected user for operations
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Form states
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    mentors: 0,
    mentees: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [authToken, setAuthToken] = useState(localStorage.getItem('access_token') || '');

  // Custom API service using fetch
  const apiService = {
    // Users API endpoints
    users: {
      getUsers: async () => {
        try {
          // Only fetch mentor and mentee users
          const response = await fetch(`${BASE_URL}/users/?role=mentor,mentee`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return { success: true, data: data.users || [] };
        } catch (error) {
          console.error('Error fetching users:', error);
          return { success: false, error: error.message };
        }
      },
      
      getUserById: async (userId) => {
        try {
          const response = await fetch(`${BASE_URL}/users/${userId}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return { success: true, data };
        } catch (error) {
          console.error('Error fetching user:', error);
          return { success: false, error: error.message };
        }
      },
      
      deactivateUser: async (userId) => {
        try {
          const response = await fetch(`${BASE_URL}/users/${userId}/deactivate/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return { success: true, data };
        } catch (error) {
          console.error('Error deactivating user:', error);
          return { success: false, error: error.message };
        }
      },
      
      activateUser: async (userId) => {
        try {
          const response = await fetch(`${BASE_URL}/users/${userId}/activate/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return { success: true, data };
        } catch (error) {
          console.error('Error activating user:', error);
          return { success: false, error: error.message };
        }
      },
      
      updateUserStatus: async (userId, status) => {
        try {
          const response = await fetch(`${BASE_URL}/users/${userId}/status/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return { success: true, data };
        } catch (error) {
          console.error('Error updating user status:', error);
          return { success: false, error: error.message };
        }
      }
    }
  };

  // Load users on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter users when filters change
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, selectedStatus, sortField, sortDirection]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load users from backend - only mentor and mentee roles
      const usersResponse = await apiService.users.getUsers();
      if (usersResponse.success) {
        const usersData = usersResponse.data || [];
        
        // Filter out any admin or hr users that might have been returned
        const filteredUsersData = usersData.filter(user => 
          user.role === 'mentor' || user.role === 'mentee'
        );
        
        setUsers(filteredUsersData);
        setFilteredUsers(filteredUsersData);
        calculateStats(filteredUsersData);
      } else {
        console.error('Failed to load users:', usersResponse.error);
        setError(`Failed to load users: ${usersResponse.error}`);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const newStats = {
      total: usersData.length,
      active: usersData.filter(u => u.status === 'approved').length,
      inactive: usersData.filter(u => u.status === 'rejected').length,
      mentors: usersData.filter(u => u.role === 'mentor').length,
      mentees: usersData.filter(u => u.role === 'mentee').length,
      pending: usersData.filter(u => u.status === 'pending').length,
      approved: usersData.filter(u => u.status === 'approved').length,
      rejected: usersData.filter(u => u.status === 'rejected').length
    };
    setStats(newStats);
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search by keyword
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(term) ||
        user.work_mail_address?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.role?.toLowerCase().includes(term)
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    // Sort users
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Export functions
  const exportToCSV = () => {
    const data = showFilters ? filteredUsers : users;
    const headers = ['Name', 'Work Email', 'Personal Email', 'Role', 'Status', 'Phone', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...data.map(user => [
        `"${user.full_name || ''}"`,
        `"${user.work_mail_address || ''}"`,
        `"${user.email || ''}"`,
        `"${user.role || ''}"`,
        `"${user.status || ''}"`,
        `"${user.phone_number || ''}"`,
        `"${user.created_at || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Modal Handlers
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleStatusChange = (user) => {
    setSelectedUser(user);
    setShowStatusModal(true);
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const handleActivateUser = async (userId) => {
    try {
      const result = await apiService.users.activateUser(userId);
      if (result.success) {
        setSuccessMessage('User activated successfully');
        await loadData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(result.error || 'Failed to activate user');
      }
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Failed to activate user');
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      const result = await apiService.users.deactivateUser(userId);
      if (result.success) {
        setSuccessMessage('User deactivated successfully');
        await loadData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(result.error || 'Failed to deactivate user');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Failed to deactivate user');
    }
  };

  const confirmDeleteUser = async () => {
    try {
      if (!userToDelete) return;
      
      const result = await apiService.users.updateUserStatus(userToDelete, 'rejected');
      if (result.success) {
        setSuccessMessage('User deactivated successfully');
        await loadData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(result.error || 'Failed to deactivate user');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Failed to deactivate user');
    } finally {
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedUser) return;
    
    try {
      const result = await apiService.users.updateUserStatus(selectedUser.id, status);
      if (result.success) {
        setSuccessMessage(`User status updated to ${status}`);
        setShowStatusModal(false);
        await loadData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus('all');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved': return 'active';
      case 'active': return 'active';
      case 'rejected': return 'inactive';
      case 'pending': return 'pending';
      default: return 'default';
    }
  };

  // Get role badge variant
  const getRoleVariant = (role) => {
    switch (role) {
      case 'mentor': return 'mentor';
      case 'mentee': return 'mentee';
      default: return 'default';
    }
  };

  // Custom Components
  const Button = ({ children, variant = 'default', onClick, className = '', style = {}, disabled = false }) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: 'none',
      transition: 'all 0.2s',
      opacity: disabled ? 0.6 : 1
    };

    const variants = {
      default: {
        backgroundColor: '#3b82f6',
        color: 'white',
        '&:hover': { backgroundColor: '#2563eb' }
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#374151',
        border: '1px solid #d1d5db',
        '&:hover': { backgroundColor: '#f9fafb' }
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#374151',
        border: 'none',
        '&:hover': { backgroundColor: '#f9fafb' }
      }
    };

    return (
      <button
        style={{ ...baseStyle, ...variants[variant], ...style }}
        onClick={disabled ? undefined : onClick}
        className={className}
        disabled={disabled}
      >
        {children}
      </button>
    );
  };

  const Card = ({ children, className = '' }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
      overflow: 'hidden'
    }} className={className}>
      {children}
    </div>
  );

  const Badge = ({ children, variant = 'default' }) => {
    const styles = {
      default: {
        backgroundColor: '#e5e7eb',
        color: '#374151',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-block'
      },
      active: {
        backgroundColor: '#d1fae5',
        color: '#065f46'
      },
      inactive: {
        backgroundColor: '#fee2e2',
        color: '#991b1b'
      },
      pending: {
        backgroundColor: '#fef3c7',
        color: '#92400e'
      },
      mentor: {
        backgroundColor: '#dbeafe',
        color: '#1e40af'
      },
      mentee: {
        backgroundColor: '#d1fae5',
        color: '#065f46'
      }
    };

    return (
      <span style={styles[variant] || styles.default}>
        {children}
      </span>
    );
  };

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    
    const sizeStyles = {
      sm: { maxWidth: '400px' },
      md: { maxWidth: '600px' },
      lg: { maxWidth: '800px' },
      xl: { maxWidth: '1000px' }
    };
    
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          ...sizeStyles[size]
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                '&:hover': { backgroundColor: '#f9fafb' }
              }}
            >
              <X style={{ height: '20px', width: '20px', color: '#6b7280' }} />
            </button>
          </div>
          <div style={{ padding: '24px' }}>
            {children}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '48px',
            width: '48px',
            borderBottom: '2px solid #2563eb',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#4b5563', fontWeight: '500' }}>
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              User Management
            </h1>
            <p style={{ color: '#4b5563' }}>
              Manage mentors and mentees (Administrator and HR roles are managed separately)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw style={{ height: '16px', width: '16px', marginRight: '8px' }} />
              Refresh
            </Button>
            {/* <Button variant="outline" onClick={exportToCSV}>
              <Download style={{ height: '16px', width: '16px', marginRight: '8px' }} />
              Export CSV
            </Button> */}
          </div>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '12px 16px',
            color: '#991b1b'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{error}</span>
              <button
                onClick={loadData}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#991b1b',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #a7f3d0',
            borderRadius: '6px',
            padding: '12px 16px',
            color: '#065f46'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage('')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#065f46',
                  cursor: 'pointer'
                }}
              >
                <X style={{ height: '16px', width: '16px' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Total Users</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.total}</p>
              </div>
              <Users style={{ height: '24px', width: '24px', color: '#3b82f6' }} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Active Users</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.approved}</p>
              </div>
              <CheckCircle style={{ height: '24px', width: '24px', color: '#10b981' }} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Pending Approval</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.pending}</p>
              </div>
              <UserX style={{ height: '24px', width: '24px', color: '#f59e0b' }} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Mentors</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.mentors}</p>
              </div>
              <Award style={{ height: '24px', width: '24px', color: '#8b5cf6' }} />
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Mentees</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.mentees}</p>
              </div>
              <Users style={{ height: '24px', width: '24px', color: '#10b981' }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '16px',
                width: '16px',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Filter Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                style={{ padding: '6px 12px' }}
              >
                <Filter style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Showing {filteredUsers.length} of {users.length} users
                </span>
                {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
                  <Button variant="ghost" onClick={clearFilters} style={{ padding: '6px 12px' }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {/* Role Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="all">All Roles</option>
                      <option value="mentor">Mentor</option>
                      <option value="mentee">Mentee</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                  onClick={() => handleSort('full_name')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Name
                    <ArrowUpDown style={{ height: '14px', width: '14px' }} />
                  </div>
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Contact
                </th>
                <th 
                  style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                  onClick={() => handleSort('role')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Role
                    <ArrowUpDown style={{ height: '14px', width: '14px' }} />
                  </div>
                </th>
                <th 
                  style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                  onClick={() => handleSort('status')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Status
                    <ArrowUpDown style={{ height: '14px', width: '14px' }} />
                  </div>
                </th>
                <th 
                  style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                  onClick={() => handleSort('created_at')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Created At
                    <ArrowUpDown style={{ height: '14px', width: '14px' }} />
                  </div>
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
                    {loading ? 'Loading users...' : 'No mentors or mentees found. Try adjusting your filters.'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '9999px',
                          backgroundColor: '#dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          color: '#2563eb'
                        }}>
                          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', color: '#111827' }}>
                            {user.full_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail style={{ height: '12px', width: '12px', color: '#9ca3af' }} />
                          <span style={{ fontSize: '14px' }}>{user.work_mail_address}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone style={{ height: '12px', width: '12px', color: '#9ca3af' }} />
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>{user.phone_number || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={getRoleVariant(user.role)}>
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={getStatusVariant(user.status)}>
                        {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ height: '12px', width: '12px', color: '#9ca3af' }} />
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Button
                          variant="ghost"
                          onClick={() => handleViewUser(user)}
                          style={{ padding: '4px 8px' }}
                        >
                          <Eye style={{ height: '14px', width: '14px' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleStatusChange(user)}
                          style={{ padding: '4px 8px', color: user.status === 'approved' ? '#ef4444' : '#10b981' }}
                        >
                          {user.status === 'approved' ? <UserX style={{ height: '14px', width: '14px' }} /> : <UserCheck style={{ height: '14px', width: '14px' }} />}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteUser(user.id)}
                          style={{ padding: '4px 8px', color: '#ef4444' }}
                        >
                          <Trash2 style={{ height: '14px', width: '14px' }} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination and Rows Per Page */}
        <div style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {startIndex + 1}-{endIndex} of {filteredUsers.length}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ padding: '6px 12px', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft style={{ height: '16px', width: '16px' }} />
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
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{ padding: '6px 12px', minWidth: '32px' }}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 12px', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              <ChevronRight style={{ height: '16px', width: '16px' }} />
            </Button>
          </div>
        </div>
      </Card>

      {/* View User Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="User Details"
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* User Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '9999px',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '32px',
                color: '#2563eb'
              }}>
                {selectedUser.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                  {selectedUser.full_name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <Badge variant={getRoleVariant(selectedUser.role)}>
                    {selectedUser.role?.charAt(0).toUpperCase() + selectedUser.role?.slice(1)}
                  </Badge>
                  <Badge variant={getStatusVariant(selectedUser.status)}>
                    {selectedUser.status?.charAt(0).toUpperCase() + selectedUser.status?.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* User Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {/* Contact Information */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail style={{ height: '16px', width: '16px' }} />
                  Contact Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Work Email</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{selectedUser.work_mail_address}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Personal Email</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{selectedUser.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Phone Number</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{selectedUser.phone_number || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User style={{ height: '16px', width: '16px' }} />
                  Account Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Account Status</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>
                      <span style={{
                        color: selectedUser.status === 'approved' ? '#10b981' : 
                               selectedUser.status === 'pending' ? '#f59e0b' : '#ef4444'
                      }}>
                        {selectedUser.status?.charAt(0).toUpperCase() + selectedUser.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Availability</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>
                      <span style={{
                        color: selectedUser.availability_status === 'active' ? '#10b981' : '#ef4444'
                      }}>
                        {selectedUser.availability_status?.charAt(0).toUpperCase() + selectedUser.availability_status?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Created At</div>
                    <div style={{ fontSize: '14px', color: '#111827' }}>{formatDate(selectedUser.created_at)}</div>
                  </div>
                  {selectedUser.created_by && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Created By</div>
                      <div style={{ fontSize: '14px', color: '#111827' }}>{selectedUser.created_by_name || 'System'}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              <Button variant="outline" onClick={() => {
                setShowViewModal(false);
                handleStatusChange(selectedUser);
              }}>
                {selectedUser.status === 'approved' ? (
                  <>
                    <UserX style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                    Activate
                  </>
                )}
              </Button>
              <Button variant="default" onClick={() => setShowViewModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change User Status"
        size="sm"
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '9999px',
                backgroundColor: selectedUser.status === 'approved' ? '#fee2e2' : '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: selectedUser.status === 'approved' ? '#ef4444' : '#10b981'
              }}>
                {selectedUser.status === 'approved' ? (
                  <UserX style={{ height: '32px', width: '32px' }} />
                ) : (
                  <UserCheck style={{ height: '32px', width: '32px' }} />
                )}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                {selectedUser.status === 'approved' ? 'Deactivate User' : 'Activate User'}
              </h3>
              <p style={{ color: '#6b7280' }}>
                Are you sure you want to {selectedUser.status === 'approved' ? 'deactivate' : 'activate'} 
                <strong> {selectedUser.full_name}</strong>?
              </p>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '6px', padding: '12px', marginTop: '16px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Current Status:</div>
                <Badge variant={getStatusVariant(selectedUser.status)}>
                  {selectedUser.status?.charAt(0).toUpperCase() + selectedUser.status?.slice(1)}
                </Badge>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleStatusUpdate(selectedUser.status === 'approved' ? 'rejected' : 'approved')}
                style={{ backgroundColor: selectedUser.status === 'approved' ? '#ef4444' : '#10b981' }}
              >
                {selectedUser.status === 'approved' ? 'Deactivate User' : 'Activate User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Deactivation"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '9999px',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#ef4444'
            }}>
              <Trash2 style={{ height: '32px', width: '32px' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Deactivate User
            </h3>
            <p style={{ color: '#6b7280' }}>
              Are you sure you want to deactivate this user? They will no longer be able to access the system.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDeleteUser} style={{ backgroundColor: '#ef4444', color: 'white' }}>
              Deactivate User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        button:hover:not(:disabled) {
          opacity: 0.9;
        }
        
        select:focus, input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        tr:hover {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
}