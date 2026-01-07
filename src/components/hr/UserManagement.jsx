import React, { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  Calendar,
  Building2,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const BASE_URL = "http://127.0.0.1:8000";

const departments = [
  "Software Development",
  "Frontend Development",
  "Backend Development",
  "Mobile Development",
  "Data Science",
  "Cybersecurity",
  "Cloud & DevOps",
  "UI/UX Design",
  "Project Management",
  "Business Development",
  "HR & Recruitment",
  "Digital Marketing",
  "IT Support",
  "Quality Assurance",
  "Product Management"
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortField, setSortField] = useState('full_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [viewUserModal, setViewUserModal] = useState(false);
  const [userToView, setUserToView] = useState(null);

  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: 'mentee',
    department: '',
    status: 'approved',
    availability_status: 'active'
  });

  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        alert("Please log in to access user management");
        return;
      }

      const response = await fetch(`${BASE_URL}/users/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      const token = getAuthToken();
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      const apiData = {
        ...userData,
        phone_number: userData.phone_number,
        email: userData.email,
        full_name: userData.full_name,
        department: userData.department,
        role: userData.role,
        status: userData.status,
        availability_status: userData.availability_status,
        created_by: currentUser.id
      };

      const response = await fetch(`${BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create user');
      }

      alert(data.message || "User created successfully");
      fetchUsers();
      resetForm();
      setIsDialogOpen(false);

    } catch (error) {
      alert(error.message || "Failed to create user");
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${BASE_URL}/users/${userId}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update user');
      }

      alert("User updated successfully");
      fetchUsers();
      resetForm();
      setIsDialogOpen(false);
      setIsEditing(false);
      setSelectedUser(null);

    } catch (error) {
      alert(error.message || "Failed to update user");
    }
  };

  const deleteUser = async (userId) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${BASE_URL}/users/${userId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete user');
      }

      alert(data.message || "User deleted successfully");
      fetchUsers();
      setDeleteConfirmOpen(false);
      setUserToDelete(null);

    } catch (error) {
      alert(error.message || "Failed to delete user");
    }
  };

  const initializeFormForEdit = (user) => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      department: user.department,
      status: user.status,
      availability_status: user.availability_status
    });
    setSelectedUser(user);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone_number: '',
      role: 'mentee',
      department: '',
      status: 'approved',
      availability_status: 'active'
    });
    setSelectedUser(null);
    setIsEditing(false);
  };

  const openViewModal = (user) => {
    setUserToView(user);
    setViewUserModal(true);
  };

  const openDeleteConfirm = (userId) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (isEditing && selectedUser) {
      updateUser(selectedUser.id, formData);
    } else {
      createUser(formData);
    }
  };

  const filteredUsers = users
    .filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.work_mail_address.toLowerCase().includes(searchLower) ||
        user.phone_number.toLowerCase().includes(searchLower) ||
        user.created_at.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        (user.created_by_name && user.created_by_name.toLowerCase().includes(searchLower)) ||
        user.status.toLowerCase().includes(searchLower) ||
        user.availability_status.toLowerCase().includes(searchLower) ||
        user.department.toLowerCase().includes(searchLower);

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesAvailability = availabilityFilter === 'all' || user.availability_status === availabilityFilter;

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus && matchesAvailability;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return -1 * modifier;
      if (bValue == null) return 1 * modifier;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      return (aValue > bValue ? 1 : -1) * modifier;
    });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, departmentFilter, statusFilter, availabilityFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <UserPlus className="size-4" />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search"
                  placeholder="Search by name, email, phone, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="hr">HR</option>
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
              </select>
            </div>
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">All Users ({filteredUsers.length})</h2>
              <p className="text-gray-600">Manage and monitor user accounts</p>
            </div>
          </div>
        </div>

        <div className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th 
                        onClick={() => handleSort('full_name')} 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <User className="size-4 mr-2" />
                          User {sortField === 'full_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('role')} 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <Shield className="size-4 mr-2" />
                          Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('department')} 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <Building2 className="size-4 mr-2" />
                          Department {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('status')} 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      >
                        Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('availability_status')} 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      >
                        Availability {sortField === 'availability_status' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('created_at')} 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <Calendar className="size-4 mr-2" />
                          Joined {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="size-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.full_name}</p>
                              <div className="flex flex-col text-xs text-gray-500">
                                <span>{user.email}</span>
                                <span className="flex items-center gap-1">
                                  <Mail className="size-3" />
                                  {user.work_mail_address}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="size-3" />
                                  {user.phone_number}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{user.department}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                            user.status === 'approved' ? 'bg-green-100 text-green-800' :
                            user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {user.availability_status === 'active' ? (
                              <CheckCircle className="size-4 text-green-500" />
                            ) : (
                              <XCircle className="size-4 text-red-500" />
                            )}
                            <span className="capitalize">{user.availability_status}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                          {user.created_by_name && (
                            <div className="text-xs text-gray-500">
                              By: {user.created_by_name}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openViewModal(user)}
                              title="View Details"
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              onClick={() => initializeFormForEdit(user)}
                              title="Edit User"
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(user.id)}
                              title="Delete User"
                              className="p-1 hover:bg-red-50 text-red-600 rounded"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-6 border-t">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-md text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded-md text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit User' : 'Add New User'}
              </h2>
              <p className="text-gray-600">
                {isEditing ? 'Update user information and roles' : 'Create a new user account and assign roles'}
              </p>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Personal Email (Gmail) *</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@gmail.com"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone_number" className="text-sm font-medium text-gray-700">Phone Number *</label>
                  <input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+250 XXX XXX XXX"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium text-gray-700">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mentee">Mentee</option>
                    <option value="mentor">Mentor</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium text-gray-700">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-gray-700">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="availability_status" className="text-sm font-medium text-gray-700">Availability Status *</label>
                  <select
                    value={formData.availability_status}
                    onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {isEditing ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {viewUserModal && userToView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <p className="text-gray-600">Complete information about the user</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="size-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{userToView.full_name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${userToView.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {userToView.role}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${userToView.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {userToView.status}
                    </span>
                    <div className="flex items-center gap-1">
                      {userToView.availability_status === 'active' ? (
                        <CheckCircle className="size-4 text-green-500" />
                      ) : (
                        <XCircle className="size-4 text-red-500" />
                      )}
                      <span className="text-sm capitalize">{userToView.availability_status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-gray-400" />
                        <span className="text-sm">{userToView.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-gray-400" />
                        <span className="text-sm">{userToView.work_mail_address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 text-gray-400" />
                        <span className="text-sm">{userToView.phone_number}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Department</h4>
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-gray-400" />
                      <span>{userToView.department}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Account Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">Joined Date:</span>
                        <p className="text-sm">{new Date(userToView.created_at).toLocaleDateString()}</p>
                      </div>
                      {userToView.created_by_name && (
                        <div>
                          <span className="text-sm text-gray-500">Created By:</span>
                          <p className="text-sm">{userToView.created_by_name}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-500">Account Status:</span>
                        <p className="text-sm capitalize">{userToView.is_active ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setViewUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewUserModal(false);
                    initializeFormForEdit(userToView);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit className="size-4" />
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
              <p className="text-gray-600">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (userToDelete) {
                    deleteUser(userToDelete);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="size-4" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}