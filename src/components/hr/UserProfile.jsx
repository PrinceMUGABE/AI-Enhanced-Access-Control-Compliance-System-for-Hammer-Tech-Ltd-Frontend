
import React, { useState, useEffect } from 'react';
import { 
  Mail, Phone, Briefcase, Users, User, Bell, Trash2, 
  CheckCircle, Eye, Save, Edit, Settings, Send,
  CheckSquare, Square, Key, Search, X, Filter
} from 'lucide-react';

const logNotifications = (notifications, source = 'fetch') => {
  console.log('\n' + '='.repeat(80));
  console.log(`📧 NOTIFICATIONS DEBUG - ${source.toUpperCase()}`);
  console.log('='.repeat(80));
  console.log(`Total Notifications: ${notifications.length}`);
  console.log(`Timestamp: ${new Date().toLocaleString()}`);
  console.log('='.repeat(80));
  
  if (notifications.length === 0) {
    console.log('❌ No notifications found');
  } else {
    notifications.forEach((notif, index) => {
      console.log(`\n--- Notification #${index + 1} ---`);
      console.log(`ID: ${notif.id}`);
      console.log(`Source: ${notif.source || 'chat'}`);
      console.log(`Type: ${notif.notification_type}`);
      console.log(`Title: ${notif.title}`);
      console.log(`Message: ${notif.message}`);
      console.log(`Is Read: ${notif.is_read ? '✓' : '✗'}`);
      console.log(`Is Archived: ${notif.is_archived ? '✓' : '✗'}`);
      console.log(`Created: ${new Date(notif.created_at).toLocaleString()}`);
      
      if (notif.sender) {
        console.log(`Sender: ${notif.sender.full_name} (${notif.sender.email || 'No email'})`);
      } else {
        console.log(`Sender: System`);
      }
      
      if (notif.recipient) {
        console.log(`Recipient: ${notif.recipient.full_name} (${notif.recipient.work_mail_address || notif.recipient.email})`);
      }
      
      if (notif.metadata && Object.keys(notif.metadata).length > 0) {
        console.log(`Metadata:`, JSON.stringify(notif.metadata, null, 2));
      }
      
      console.log(`Read At: ${notif.read_at ? new Date(notif.read_at).toLocaleString() : 'Not read'}`);
      console.log(`Archived At: ${notif.archived_at ? new Date(notif.archived_at).toLocaleString() : 'Not archived'}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 NOTIFICATION STATISTICS');
  console.log('='.repeat(80));
  
  if (notifications.length > 0) {
    const unread = notifications.filter(n => !n.is_read).length;
    const read = notifications.filter(n => n.is_read).length;
    const archived = notifications.filter(n => n.is_archived).length;
    const byType = notifications.reduce((acc, n) => {
      acc[n.notification_type] = (acc[n.notification_type] || 0) + 1;
      return acc;
    }, {});
    const bySource = notifications.reduce((acc, n) => {
      const source = n.source || 'chat';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`Total: ${notifications.length}`);
    console.log(`Unread: ${unread} (${((unread/notifications.length)*100).toFixed(1)}%)`);
    console.log(`Read: ${read} (${((read/notifications.length)*100).toFixed(1)}%)`);
    console.log(`Archived: ${archived}`);
    console.log('\n📈 By Type:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  • ${type}: ${count} (${((count/notifications.length)*100).toFixed(1)}%)`);
    });
    console.log('\n📂 By Source:');
    Object.entries(bySource).forEach(([source, count]) => {
      console.log(`  • ${source}: ${count} (${((count/notifications.length)*100).toFixed(1)}%)`);
    });
  }
  console.log('='.repeat(80) + '\n');
};

// Base URL configuration
const BASE_URL = 'http://127.0.0.1:8000';

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md animate-fade-in`}>
      <div className="flex items-center justify-between gap-4">
        <p className="font-medium">{message}</p>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          ✕
        </button>
      </div>
    </div>
  );
};

export default function ProfileAndNotifications() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Send Notification State
  const [sendNotificationData, setSendNotificationData] = useState({
    title: '',
    message: '',
    notification_type: 'announcement',
    recipient_type: 'individual', // individual, role, department, all
    recipient_ids: [],
    recipient_roles: [],
    recipient_departments: [],
    send_to_all: false
  });
  
  const [allUsers, setAllUsers] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
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

  // Toast helper function
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('=== FETCHING USER DATA ===');
        const token = localStorage.getItem('access_token');
        console.log('Access Token:', token ? 'Present' : 'Missing');
        
        const response = await fetch(`${BASE_URL}/notifications/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Response Status:', response.status);
        console.log('Response OK:', response.ok);
        
        const data = await response.json();
        console.log('=== USER DATA RESPONSE ===');
        console.log('Full Response:', JSON.stringify(data, null, 2));
        
        if (response.ok && data.success) {
          console.log('User Profile:', data.profile);
          console.log('User Role:', data.profile.role);
          
          setUser(data.profile);
          setProfileData({
            name: data.profile.full_name || '',
            email: data.profile.email || '',
            phone: data.profile.phone_number || '',
            availability_status: data.profile.availability_status || 'active'
          });
        } else {
          console.error('Failed to fetch user data:', data);
        }
      } catch (error) {
        console.error('=== ERROR FETCHING USER DATA ===');
        console.error('Error:', error);
        
        // Fallback to localStorage
        const userData = localStorage.getItem('user');
        console.log('Attempting fallback to localStorage');
        
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('Parsed User from localStorage:', parsedUser);
            
            setUser(parsedUser);
            setProfileData({
              name: parsedUser.full_name || '',
              email: parsedUser.email || '',
              phone: parsedUser.phone_number || '',
              availability_status: parsedUser.availability_status || 'active'
            });
          } catch (e) {
            console.error('Error parsing localStorage user data:', e);
          }
        }
      }
    };

    fetchUserData();
  }, []);

  // Fetch all users and departments for admin/HR
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'hr')) {
      fetchAllUsers();
      fetchAllDepartments();
    }
  }, [user]);

  const fetchAllUsers = async () => {
    try {
      console.log('=== FETCHING ALL USERS ===');
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${BASE_URL}/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('All Users Response:', data);
      
      if (data.users) {
        setAllUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to fetch users', 'error');
    }
  };

  const fetchAllDepartments = async () => {
    try {
      console.log('=== FETCHING ALL DEPARTMENTS ===');
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${BASE_URL}/departments/all/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('All Departments Response:', data);
      
      if (data.success && data.data) {
        setAllDepartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      showToast('Failed to fetch departments', 'error');
    }
  };

  // Filter users based on role, department, and search
  useEffect(() => {
    let filtered = [...allUsers];
    
    // Filter by role
    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(user => {
        if (user.department && user.department.id === parseInt(selectedDepartment)) {
          return true;
        }
        if (user.departments && user.departments.some(dept => dept.id === parseInt(selectedDepartment))) {
          return true;
        }
        return false;
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.work_mail_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  }, [selectedRole, selectedDepartment, searchTerm, allUsers]);

  // Fetch notifications
  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab, notificationFilter]);

  const fetchNotifications = async () => {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔄 FETCHING NOTIFICATIONS - START');
    console.log('='.repeat(80));
    console.log(`👤 User: ${user?.full_name || 'Unknown'} (${user?.work_mail_address || 'Unknown'})`);
    console.log(`🎭 Role: ${user?.role || 'Unknown'}`);
    console.log(`🔍 Filter: ${notificationFilter}`);
    console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
    console.log('='.repeat(80));
    
    setLoading(true);
    const token = localStorage.getItem('access_token');
    
    // Build URL with proper parameters
    const params = new URLSearchParams();
    params.append('source', 'all'); // Get both chat and onboarding notifications
    
    if (notificationFilter !== 'all') {
      params.append('is_read', notificationFilter === 'read' ? 'true' : 'false');
    }
    
    // Admin/HR can view all notifications
    if (user?.role === 'admin' || user?.role === 'hr') {
      params.append('view_all', 'true');
      console.log('👑 Admin/HR mode: Fetching ALL notifications');
    }
    
    const url = `${BASE_URL}/notifications/?${params.toString()}`;
    
    console.log('\n📡 REQUEST DETAILS:');
    console.log(`   URL: ${url}`);
    console.log(`   Method: GET`);
    console.log(`   Token: ${token ? `Present (${token.substring(0, 20)}...)` : 'Missing'}`);
    console.log('='.repeat(80));
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n📥 RESPONSE RECEIVED:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   OK: ${response.ok ? '✓' : '✗'}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    
    const data = await response.json();
    
    console.log('\n📦 RESPONSE DATA (Full):');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ SUCCESS - Processing notifications...');
      console.log(`   Notifications in response: ${data.notifications?.length || 0}`);
      console.log(`   Total count: ${data.total_count || 0}`);
      console.log(`   Unread count: ${data.unread_count || 0}`);
      console.log(`   Archived count: ${data.archived_count || 0}`);
      
      const notifs = data.notifications || [];
      setNotifications(notifs);
      
      // Log detailed notification info
      logNotifications(notifs, 'API Response');
      
      console.log('✅ FETCH COMPLETE - Notifications set in React state');
      showToast(`Loaded ${notifs.length} notifications`, 'success');
    } else {
      console.error('\n❌ API ERROR:');
      console.error(`   Error: ${data.error || 'Unknown error'}`);
      console.error('   Full response:', data);
      showToast(data.error || 'Failed to fetch notifications', 'error');
    }
  } catch (error) {
    console.error('\n❌❌❌ EXCEPTION IN FETCH NOTIFICATIONS ❌❌❌');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Error Stack:');
    console.error(error.stack);
    showToast('An error occurred while fetching notifications', 'error');
  } finally {
    setLoading(false);
    console.log('\n' + '='.repeat(80));
    console.log('🏁 FETCH NOTIFICATIONS - END');
    console.log('='.repeat(80) + '\n');
  }
};

useEffect(() => {
  console.log('\n' + '🔄 '.repeat(20));
  console.log('📊 NOTIFICATIONS STATE CHANGED');
  console.log('🔄 '.repeat(20));
  console.log(`Current notifications count: ${notifications.length}`);
  console.log(`Current filter: ${notificationFilter}`);
  console.log(`Active tab: ${activeTab}`);
  
  if (notifications.length > 0) {
    logNotifications(notifications, 'React State');
  } else {
    console.log('❌ Notifications array is empty');
  }
  console.log('🔄 '.repeat(20) + '\n');
}, [notifications]);

// Monitor filter changes:
useEffect(() => {
  console.log('\n📋 Filter changed to:', notificationFilter);
  if (activeTab === 'notifications') {
    console.log('   Triggering fetch...');
    fetchNotifications();
  }
}, [notificationFilter]);

// Monitor tab changes:
useEffect(() => {
  console.log('\n📑 Active tab changed to:', activeTab);
  if (activeTab === 'notifications') {
    console.log('   Notifications tab active - fetching data...');
    fetchNotifications();
  }
}, [activeTab]);

  const handleSaveProfile = async () => {
    try {
      console.log('=== SAVING PROFILE ===');
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
      console.log('=== PROFILE UPDATE RESPONSE ===', data);
      
      if (response.ok && data.success) {
        setUser(prev => ({
          ...prev,
          full_name: profileData.name,
          email: profileData.email,
          phone_number: profileData.phone,
          availability_status: profileData.availability_status
        }));
        
        setIsEditing(false);
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('=== ERROR SAVING PROFILE ===', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    console.log('=== PASSWORD CHANGE INITIATED ===');
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.new_password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    try {
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
      console.log('=== PASSWORD CHANGE RESPONSE ===', data);

      if (response.ok && data.success) {
        showToast('Password changed successfully!', 'success');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setIsChangingPassword(false);
      } else {
        showToast(data.error || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('=== ERROR CHANGING PASSWORD ===', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotifications = async (deleteType = 'selected') => {
    try {
      console.log('=== DELETING NOTIFICATIONS ===');
      const token = localStorage.getItem('access_token');
      
      if (deleteType === 'selected' && selectedNotifications.length === 0) {
        showToast('Please select notifications to delete', 'error');
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
      console.log('=== DELETE NOTIFICATIONS RESPONSE ===', data);
      
      if (response.ok && data.success) {
        showToast(`Deleted ${data.count} notifications`, 'success');
        setSelectedNotifications([]);
        fetchNotifications();
      } else {
        showToast(data.error || 'Failed to delete notifications', 'error');
      }
    } catch (error) {
      console.error('=== ERROR DELETING NOTIFICATIONS ===', error);
      showToast('An error occurred while deleting notifications', 'error');
    }
  };

  const handleMarkAsRead = async (notificationId = null) => {
    try {
      console.log('=== MARKING NOTIFICATIONS AS READ ===');
      const token = localStorage.getItem('access_token');
      
      if (notificationId) {
        const url = `${BASE_URL}/notifications/${notificationId}/read/`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          fetchNotifications();
        } else {
          showToast(data.error || 'Failed to mark as read', 'error');
        }
      } else {
        const url = `${BASE_URL}/notifications/mark-all-read/`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          showToast(`Marked ${data.count} notifications as read`, 'success');
          fetchNotifications();
        } else {
          showToast(data.error || 'Failed to mark notifications as read', 'error');
        }
      }
    } catch (error) {
      console.error('=== ERROR MARKING AS READ ===', error);
      showToast('An error occurred', 'error');
    }
  };

  const toggleNotificationSelection = (id) => {
    setSelectedNotifications(prev => {
      const newSelection = prev.includes(id) 
        ? prev.filter(nid => nid !== id)
        : [...prev, id];
      return newSelection;
    });
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      const allIds = notifications.map(n => n.id);
      setSelectedNotifications(allIds);
    }
  };

  const handleSendNotification = async () => {
    try {
      console.log('=== SENDING NOTIFICATION ===');
      
      // Validate inputs
      if (!sendNotificationData.title.trim()) {
        showToast('Please enter a notification title', 'error');
        return;
      }
      
      if (!sendNotificationData.message.trim()) {
        showToast('Please enter a notification message', 'error');
        return;
      }
      
      // Build request payload based on recipient type
      const payload = {
        title: sendNotificationData.title,
        message: sendNotificationData.message,
        notification_type: sendNotificationData.notification_type
      };
      
      if (sendNotificationData.recipient_type === 'all') {
        payload.send_to_all = true;
      } else if (sendNotificationData.recipient_type === 'individual') {
        if (sendNotificationData.recipient_ids.length === 0) {
          showToast('Please select at least one user', 'error');
          return;
        }
        payload.recipient_ids = sendNotificationData.recipient_ids;
      } else if (sendNotificationData.recipient_type === 'role') {
        if (sendNotificationData.recipient_roles.length === 0) {
          showToast('Please select at least one role', 'error');
          return;
        }
        payload.recipient_roles = sendNotificationData.recipient_roles;
      } else if (sendNotificationData.recipient_type === 'department') {
        if (sendNotificationData.recipient_departments.length === 0) {
          showToast('Please select at least one department', 'error');
          return;
        }
        payload.recipient_departments = sendNotificationData.recipient_departments;
      }
      
      console.log('Notification Payload:', payload);
      
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${BASE_URL}/notifications/send/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      console.log('=== SEND NOTIFICATION RESPONSE ===', data);
      
      if (response.ok && data.success) {
        showToast(data.message || 'Notification sent successfully!', 'success');
        
        // Reset form
        setSendNotificationData({
          title: '',
          message: '',
          notification_type: 'announcement',
          recipient_type: 'individual',
          recipient_ids: [],
          recipient_roles: [],
          recipient_departments: [],
          send_to_all: false
        });
        setSearchTerm('');
        setSelectedRole('');
        setSelectedDepartment('');
      } else {
        showToast(data.error || 'Failed to send notification', 'error');
      }
    } catch (error) {
      console.error('=== ERROR SENDING NOTIFICATION ===', error);
      showToast('An error occurred while sending notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSendNotificationData(prev => {
      const newIds = prev.recipient_ids.includes(userId)
        ? prev.recipient_ids.filter(id => id !== userId)
        : [...prev.recipient_ids, userId];
      return { ...prev, recipient_ids: newIds };
    });
  };

  const toggleRoleSelection = (role) => {
    setSendNotificationData(prev => {
      const newRoles = prev.recipient_roles.includes(role)
        ? prev.recipient_roles.filter(r => r !== role)
        : [...prev.recipient_roles, role];
      return { ...prev, recipient_roles: newRoles };
    });
  };

  const toggleDepartmentSelection = (deptId) => {
    setSendNotificationData(prev => {
      const newDepts = prev.recipient_departments.includes(deptId)
        ? prev.recipient_departments.filter(id => id !== deptId)
        : [...prev.recipient_departments, deptId];
      return { ...prev, recipient_departments: newDepts };
    });
  };

  const getDepartmentInfo = () => {
    console.log('=== GETTING DEPARTMENT INFO ===');
    if (!user) {
      return null;
    }
    
    if (user.role === 'mentee' && user.single_department) {
      return {
        type: 'single',
        department: user.single_department
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
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

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
          {(user?.role === 'admin' || user?.role === 'hr') && (
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'send-notification' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('send-notification')}
            >
              <Send className="inline-block size-4 mr-2" />
              Send Notification
            </button>
          )}
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
                    type="text"
                    value={user?.work_mail_address || ''}
                    disabled
                    className="w-full pl-10 px-3 py-2 border rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <span className="text-xs text-gray-500">Work email cannot be changed</span>
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
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                          <div className="flex items-center gap-2">
                            <Briefcase className="size-5 text-blue-600" />
                            <span className="font-medium text-gray-900">{departmentInfo.department.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            departmentInfo.department.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {departmentInfo.department.status}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {departmentInfo.type === 'multiple' && departmentInfo.departments && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {departmentInfo.departments.map((dept, index) => (
                            <div key={index} className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                              <Users className="size-4 text-blue-600" />
                              <span className="font-medium text-gray-900">{dept.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                dept.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {dept.status}
                              </span>
                            </div>
                          ))}
                        </div>
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
                  
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 border rounded-lg ${notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
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
                                  <span>From: {notification.sender.full_name} - {notification.sender.role}</span>
                                )}
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                  {notification.notification_type}
                                </span>
                              </div>
                            </div>
                          </div>
                          
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
                              onClick={() => {
                                setSelectedNotifications([notification.id]);
                                handleDeleteNotifications('selected');
                              }}
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

      {/* Send Notification Tab (Admin/HR Only) */}
      {activeTab === 'send-notification' && (user?.role === 'admin' || user?.role === 'hr') && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Send Notification</h2>
              <p className="text-gray-600">Send notifications to users, roles, or departments</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Notification Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="notif-title" className="text-sm font-medium text-gray-700">Notification Title *</label>
                  <input
                    id="notif-title"
                    type="text"
                    value={sendNotificationData.title}
                    onChange={(e) => setSendNotificationData({ ...sendNotificationData, title: e.target.value })}
                    placeholder="Enter notification title"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="notif-message" className="text-sm font-medium text-gray-700">Message *</label>
                  <textarea
                    id="notif-message"
                    value={sendNotificationData.message}
                    onChange={(e) => setSendNotificationData({ ...sendNotificationData, message: e.target.value })}
                    placeholder="Enter notification message"
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="notif-type" className="text-sm font-medium text-gray-700">Notification Type</label>
                  <select
                    id="notif-type"
                    value={sendNotificationData.notification_type}
                    onChange={(e) => setSendNotificationData({ ...sendNotificationData, notification_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="update">Update</option>
                    <option value="alert">Alert</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>

              {/* Recipient Selection */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Select Recipients</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Recipient Type *</label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSendNotificationData({ ...sendNotificationData, recipient_type: 'individual', recipient_roles: [], recipient_departments: [], send_to_all: false })}
                      className={`px-4 py-2 rounded-md border ${
                        sendNotificationData.recipient_type === 'individual'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <User className="inline-block size-4 mr-2" />
                      Individual Users
                    </button>
                    <button
                      onClick={() => setSendNotificationData({ ...sendNotificationData, recipient_type: 'role', recipient_ids: [], recipient_departments: [], send_to_all: false })}
                      className={`px-4 py-2 rounded-md border ${
                        sendNotificationData.recipient_type === 'role'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Users className="inline-block size-4 mr-2" />
                      By Role
                    </button>
                    <button
                      onClick={() => setSendNotificationData({ ...sendNotificationData, recipient_type: 'department', recipient_ids: [], recipient_roles: [], send_to_all: false })}
                      className={`px-4 py-2 rounded-md border ${
                        sendNotificationData.recipient_type === 'department'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Briefcase className="inline-block size-4 mr-2" />
                      By Department
                    </button>
                    <button
                      onClick={() => setSendNotificationData({ ...sendNotificationData, recipient_type: 'all', recipient_ids: [], recipient_roles: [], recipient_departments: [] })}
                      className={`px-4 py-2 rounded-md border ${
                        sendNotificationData.recipient_type === 'all'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Bell className="inline-block size-4 mr-2" />
                      All Users
                    </button>
                  </div>
                </div>

                {/* Individual Users Selection */}
                {sendNotificationData.recipient_type === 'individual' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Filter by Role</label>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Roles</option>
                          <option value="admin">Admin</option>
                          <option value="hr">HR</option>
                          <option value="mentor">Mentor</option>
                          <option value="mentee">Mentee</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Filter by Department</label>
                        <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Departments</option>
                          {allDepartments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Search Users</label>
                        <div className="relative">
                          <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-md">
                      {filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No users found matching your filters
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredUsers.map((u) => (
                            <div key={u.id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleUserSelection(u.id)}
                                  className="flex-shrink-0"
                                >
                                  {sendNotificationData.recipient_ids.includes(u.id) ? (
                                    <CheckSquare className="size-5 text-blue-600" />
                                  ) : (
                                    <Square className="size-5 text-gray-400" />
                                  )}
                                </button>
                                <div>
                                  <p className="font-medium text-gray-900">{u.full_name}</p>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{u.email}</span>
                                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                      {u.role}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {sendNotificationData.recipient_ids.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">
                          {sendNotificationData.recipient_ids.length} user(s) selected
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Role Selection */}
                {sendNotificationData.recipient_type === 'role' && (
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">Select Roles *</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['admin', 'hr', 'mentor', 'mentee'].map((role) => (
                        <button
                          key={role}
                          onClick={() => toggleRoleSelection(role)}
                          className={`px-4 py-3 rounded-md border text-left ${
                            sendNotificationData.recipient_roles.includes(role)
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {sendNotificationData.recipient_roles.includes(role) ? (
                              <CheckSquare className="size-5 text-blue-600" />
                            ) : (
                              <Square className="size-5 text-gray-400" />
                            )}
                            <span className="font-medium capitalize">{role}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {sendNotificationData.recipient_roles.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">
                          Selected roles: {sendNotificationData.recipient_roles.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Department Selection */}
                {sendNotificationData.recipient_type === 'department' && (
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">Select Departments *</label>
                    <div className="max-h-96 overflow-y-auto border rounded-md">
                      {allDepartments.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No departments available
                        </div>
                      ) : (
                        <div className="divide-y">
                          {allDepartments.map((dept) => (
                            <div key={dept.id} className="p-3 hover:bg-gray-50">
                              <button
                                onClick={() => toggleDepartmentSelection(dept.id)}
                                className="w-full flex items-center gap-3"
                              >
                                {sendNotificationData.recipient_departments.includes(dept.id) ? (
                                  <CheckSquare className="size-5 text-blue-600" />
                                ) : (
                                  <Square className="size-5 text-gray-400" />
                                )}
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-gray-900">{dept.name}</p>
                                  <p className="text-sm text-gray-600">{dept.description || 'No description'}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  dept.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {dept.status}
                                </span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {sendNotificationData.recipient_departments.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">
                          {sendNotificationData.recipient_departments.length} department(s) selected
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* All Users Confirmation */}
                {sendNotificationData.recipient_type === 'all' && (
                  <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <Bell className="size-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Send to All Users</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          This notification will be sent to all users in the system regardless of their role or department.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <div className="flex items-center justify-end gap-4 border-t pt-6">
                <button
                  onClick={() => {
                    setSendNotificationData({
                      title: '',
                      message: '',
                      notification_type: 'announcement',
                      recipient_type: 'individual',
                      recipient_ids: [],
                      recipient_roles: [],
                      recipient_departments: [],
                      send_to_all: false
                    });
                    setSearchTerm('');
                    setSelectedRole('');
                    setSelectedDepartment('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Clear Form
                </button>
                <button
                  onClick={handleSendNotification}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  disabled={loading}
                >
                  <Send className="size-4" />
                  {loading ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
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
                    onChange={(e) => {
                      console.log('Current password updated');
                      setPasswordData({ ...passwordData, current_password: e.target.value });
                    }}
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
                    onChange={(e) => {
                      console.log('New password updated');
                      setPasswordData({ ...passwordData, new_password: e.target.value });
                    }}
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => {
                      console.log('Confirm password updated');
                      setPasswordData({ ...passwordData, confirm_password: e.target.value });
                    }}
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}