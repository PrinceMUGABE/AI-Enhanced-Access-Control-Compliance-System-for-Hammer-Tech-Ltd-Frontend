import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, Briefcase, Users, User, Bell, Trash2, 
  CheckCircle, Eye, EyeOff, Save, Edit, Lock, Settings,
  Filter, Archive, CheckSquare, Square, Key
} from 'lucide-react';
import { toast } from 'react-toastify';

// Base URL configuration
const BASE_URL = 'http://127.0.0.1:8000';

export default function ProfileAndNotifications() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    availability_status: 'active'
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BASE_URL}/notifications/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.profile);
            setProfileData({
              name: data.profile.full_name || '',
              email: data.profile.email || '',
              phone: data.profile.phone_number || '',
              availability_status: data.profile.availability_status || 'active'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setProfileData({
              name: parsedUser.full_name || '',
              email: parsedUser.email || '',
              phone: parsedUser.phone_number || '',
              availability_status: parsedUser.availability_status || 'active'
            });
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }
      }
    };

    fetchUserData();
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab, notificationFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/notifications/?type=${notificationFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        throw new Error(data.error || 'Failed to fetch notifications');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/notifications/profile/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update local user data
        setUser(prev => ({
          ...prev,
          full_name: profileData.name,
          email: profileData.email,
          phone_number: profileData.phone,
          availability_status: profileData.availability_status
        }));
        
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      // Validate passwords
      if (passwordData.new_password !== passwordData.confirm_password) {
        toast.error('New passwords do not match');
        return;
      }

      if (passwordData.new_password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BASE_URL}/notifications/profile/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setIsChangingPassword(false);
      } else {
        throw new Error(data.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotifications = async (deleteType = 'selected') => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (deleteType === 'selected' && selectedNotifications.length === 0) {
        toast.error('Please select notifications to delete');
        return;
      }

      const deleteData = {};
      if (deleteType === 'selected') {
        deleteData.notification_ids = selectedNotifications;
      } else if (deleteType === 'all') {
        deleteData.delete_all = true;
      }

      const response = await fetch(`${BASE_URL}/notifications/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deleteData)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(`Deleted ${data.count} notifications`);
        setSelectedNotifications([]);
        fetchNotifications();
      } else {
        throw new Error(data.error || 'Failed to delete notifications');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMarkAsRead = async (notificationId = null) => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (notificationId) {
        const response = await fetch(`${BASE_URL}/notifications/${notificationId}/read/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          fetchNotifications();
        }
      } else {
        const response = await fetch(`${BASE_URL}/notifications/mark-all-read/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          toast.success(`Marked ${data.count} notifications as read`);
          fetchNotifications();
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleNotificationSelection = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nid => nid !== id)
        : [...prev, id]
    );
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const getDepartmentInfo = () => {
    if (!user) return null;
    
    if (user.role === 'mentee' && user.department) {
      return {
        type: 'single',
        department: user.department
      };
    } else if (user.role === 'mentor' && user.departments && user.departments.length > 0) {
      return {
        type: 'multiple',
        departments: user.departments
      };
    } else if (user.role === 'admin' || user.role === 'hr') {
      return {
        type: 'none',
        message: 'Admin/HR users are not assigned to specific departments'
      };
    }
    
    return null;
  };

  const departmentInfo = getDepartmentInfo();

  return (
    <div className="space-y-6 max-w-5xl p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Notifications</h1>
        <p className="text-gray-600">Manage your profile and notification settings</p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b">
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="inline-block size-4 mr-2" />
            Profile
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="inline-block size-4 mr-2" />
            Notifications
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="inline-block size-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  <p className="text-gray-600">View and update your personal information</p>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                    disabled={loading}
                  >
                    <Edit className="size-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        if (user) {
                          setProfileData({
                            name: user.full_name || '',
                            email: user.email || '',
                            phone: user.phone_number || '',
                            availability_status: user.availability_status || 'active'
                          });
                        }
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                      disabled={loading}
                    >
                      <Save className="size-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-semibold">
                      {user?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{user?.full_name || 'User'}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                  </p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user?.availability_status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.availability_status || 'inactive'}
                  </span>
                </div>
              </div>

              {/* Work Email (Read Only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Work Email Address</label>
                <div className="relative">
                  <Mail className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={user?.work_mail_address || ''}
                    disabled
                    className="w-full pl-10 px-3 py-2 border rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <span className="text-xs text-gray-500 mt-1">Work email cannot be changed</span>
                </div>
              </div>

              {/* Department Information (Read Only) */}
              {departmentInfo && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Briefcase className="size-4" />
                    {departmentInfo.type === 'multiple' ? 'Departments' : 'Department'}
                  </label>
                  <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                    {departmentInfo.type === 'single' && departmentInfo.department && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{departmentInfo.department.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            departmentInfo.department.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {departmentInfo.department.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Single department assigned (cannot be changed)
                        </p>
                      </div>
                    )}
                    
                    {departmentInfo.type === 'multiple' && departmentInfo.departments && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {departmentInfo.departments.map((dept, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-2">
                              <Users className="size-3" />
                              {dept.name}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          Multiple departments assigned (cannot be changed)
                        </p>
                      </div>
                    )}
                    
                    {departmentInfo.type === 'none' && (
                      <div className="text-gray-600">
                        <p>{departmentInfo.message}</p>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Department information is managed by administrators
                  </span>
                </div>
              )}

              {/* Editable Profile Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Personal Email</label>
                  <div className="relative">
                    <Mail className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="availability" className="text-sm font-medium text-gray-700">Availability Status</label>
                  <select
                    id="availability"
                    value={profileData.availability_status}
                    onChange={(e) => setProfileData({ ...profileData, availability_status: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Account Status (Read Only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Account Status</label>
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Pending'}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user?.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : user?.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user?.status || 'pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {user?.status === 'approved' 
                      ? 'Your account is approved and active.'
                      : user?.status === 'rejected'
                      ? 'Your account has been rejected. Contact administrator.'
                      : 'Your account is pending approval.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                  <p className="text-gray-600">
                    {user?.role === 'admin' || user?.role === 'hr' 
                      ? 'Manage all system notifications'
                      : 'View and manage your notifications'}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={notificationFilter}
                      onChange={(e) => setNotificationFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Notifications</option>
                      <option value="unread">Unread Only</option>
                      <option value="read">Read Only</option>
                    </select>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkAsRead()}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                    >
                      <CheckCircle className="size-4" />
                      Mark All Read
                    </button>
                    
                    {selectedNotifications.length > 0 && (
                      <button
                        onClick={() => handleDeleteNotifications('selected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                      >
                        <Trash2 className="size-4" />
                        Delete Selected ({selectedNotifications.length})
                      </button>
                    )}
                    
                    {(user?.role === 'admin' || user?.role === 'hr') && (
                      <button
                        onClick={() => handleDeleteNotifications('all')}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="size-4" />
                        Delete All
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="size-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-600">You don't have any notifications yet.</p>
                </div>
              ) : (
                <>
                  {/* Selection Header */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={selectAllNotifications}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {selectedNotifications.length === notifications.length ? (
                          <CheckSquare className="size-5" />
                        ) : (
                          <Square className="size-5" />
                        )}
                      </button>
                      <span className="text-sm text-gray-600">
                        {selectedNotifications.length} of {notifications.length} selected
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Total: {notifications.length}
                    </div>
                  </div>
                  
                  {/* Notifications List */}
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 border rounded-lg ${notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Selection Checkbox */}
                            <button
                              onClick={() => toggleNotificationSelection(notification.id)}
                              className="mt-1"
                            >
                              {selectedNotifications.includes(notification.id) ? (
                                <CheckSquare className="size-5 text-blue-600" />
                              ) : (
                                <Square className="size-5 text-gray-400" />
                              )}
                            </button>
                            
                            {/* Notification Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                {!notification.is_read && (
                                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{new Date(notification.created_at).toLocaleString()}</span>
                                {notification.sender && (
                                  <span>From: {notification.sender.full_name}</span>
                                )}
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                  {notification.notification_type}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                              >
                                <Eye className="size-3" />
                                Mark Read
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDeleteNotifications('selected', [notification.id])}
                              className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 flex items-center gap-1"
                            >
                              <Trash2 className="size-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                  <p className="text-gray-600">Update your account password securely</p>
                </div>
                {!isChangingPassword ? (
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Key className="size-4" />
                    Change Password
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          current_password: '',
                          new_password: '',
                          confirm_password: ''
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handlePasswordChange}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Changing...' : 'Update Password'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {isChangingPassword && (
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="current_password" className="text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    id="current_password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    placeholder="Enter your current password"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="new_password" className="text-sm font-medium text-gray-700">New Password</label>
                  <input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}