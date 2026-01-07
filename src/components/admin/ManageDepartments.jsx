import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
  Users,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical
} from 'lucide-react';

const BASE_URL = "http://127.0.0.1:8000";

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [viewDeptModal, setViewDeptModal] = useState(false);
  const [deptToView, setDeptToView] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalUsers: 0
  });

  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  const getAuthToken = () => {
    return localStorage.getItem('access_token');
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        alert("Please log in to access department management");
        return;
      }

      const response = await fetch(`${BASE_URL}/departments/all/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setDepartments(data.data);
        calculateStats(data.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      alert("Failed to load departments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (depts) => {
    const total = depts.length;
    const active = depts.filter(dept => dept.status === 'active').length;
    const inactive = depts.filter(dept => dept.status === 'inactive').length;
    
    // Calculate total users across all departments
    let totalUsers = 0;
    depts.forEach(dept => {
      // You would need to fetch user counts per department from backend
      // For now, we'll use a placeholder
      totalUsers += dept.user_count || 0;
    });
    
    setStats({
      total,
      active,
      inactive,
      totalUsers
    });
  };

  const createDepartment = async (deptData) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${BASE_URL}/departments/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deptData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create department');
      }

      alert(data.message || "Department created successfully");
      fetchDepartments();
      resetForm();
      setIsDialogOpen(false);

    } catch (error) {
      alert(error.message || "Failed to create department");
    }
  };

  const updateDepartment = async (deptId, deptData) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${BASE_URL}/departments/${deptId}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deptData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update department');
      }

      alert(data.message || "Department updated successfully");
      fetchDepartments();
      resetForm();
      setIsDialogOpen(false);
      setIsEditing(false);
      setSelectedDept(null);

    } catch (error) {
      alert(error.message || "Failed to update department");
    }
  };

  const deleteDepartment = async (deptId) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${BASE_URL}/departments/${deptId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete department');
      }

      alert(data.message || "Department deleted successfully");
      fetchDepartments();
      setDeleteConfirmOpen(false);
      setDeptToDelete(null);

    } catch (error) {
      alert(error.message || "Failed to delete department");
    }
  };

  const initializeFormForEdit = (dept) => {
    setFormData({
      name: dept.name,
      description: dept.description || '',
      status: dept.status
    });
    setSelectedDept(dept);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setSelectedDept(null);
    setIsEditing(false);
  };

  const openViewModal = (dept) => {
    setDeptToView(dept);
    setViewDeptModal(true);
  };

  const openDeleteConfirm = (deptId) => {
    setDeptToDelete(deptId);
    setDeleteConfirmOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert("Department name is required");
      return;
    }

    if (isEditing && selectedDept) {
      updateDepartment(selectedDept.id, formData);
    } else {
      createDepartment(formData);
    }
  };

  const filteredDepartments = departments
    .filter(dept => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        dept.name.toLowerCase().includes(searchLower) ||
        (dept.description && dept.description.toLowerCase().includes(searchLower)) ||
        (dept.created_by_details && dept.created_by_details.full_name && 
         dept.created_by_details.full_name.toLowerCase().includes(searchLower)) ||
        dept.status.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;

      return matchesSearch && matchesStatus;
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

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const paginatedDepartments = filteredDepartments.slice(
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
    fetchDepartments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading departments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Management</h1>
          <p className="text-gray-600">Organize and manage company departments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="size-4" />
          Add New Department
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="size-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Departments</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="size-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive Departments</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <XCircle className="size-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="size-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search"
                  placeholder="Search by department name, description, creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">All Departments ({filteredDepartments.length})</h2>
              <p className="text-gray-600">Manage and monitor department information</p>
            </div>
          </div>
        </div>

        <div className="p-0">
          {filteredDepartments.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th 
                        onClick={() => handleSort('name')} 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <Building2 className="size-4 mr-2" />
                          Department Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-900"
                      >
                        Description
                      </th>
                      <th 
                        onClick={() => handleSort('status')} 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      >
                        Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        onClick={() => handleSort('created_at')} 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <Calendar className="size-4 mr-2" />
                          Created Date {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </div>
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-900"
                      >
                        <div className="flex items-center">
                          <User className="size-4 mr-2" />
                          Created By
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDepartments.map((dept) => (
                      <tr key={dept.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Building2 className="size-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{dept.name}</p>
                              <div className="text-xs text-gray-500">
                                ID: {dept.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {dept.description || 'No description'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                            dept.status === 'active' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {dept.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {new Date(dept.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(dept.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {dept.created_by_details ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="size-3 text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{dept.created_by_details.full_name}</p>
                                <p className="text-xs text-gray-500">{dept.created_by_details.role}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">System</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openViewModal(dept)}
                              title="View Details"
                              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <Eye className="size-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => initializeFormForEdit(dept)}
                              title="Edit Department"
                              className="p-2 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit className="size-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(dept.id)}
                              title="Delete Department"
                              className="p-2 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="size-4 text-red-600" />
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
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} departments
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md text-sm flex items-center gap-1 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages}, (_, i) => i + 1).map(page => (
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
                    className={`px-3 py-1 border rounded-md text-sm flex items-center gap-1 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
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

      {/* Add/Edit Department Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Department' : 'Add New Department'}
              </h2>
              <p className="text-gray-600">
                {isEditing ? 'Update department information' : 'Create a new department'}
              </p>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    Department Name *
                    <span className="text-xs text-gray-500">Required</span>
                  </label>
                  <input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Software Development"
                    required
                    maxLength={100}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Maximum 100 characters. Department names must be unique.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the department's purpose and responsibilities..."
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Optional. Provide details about the department's function.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mr-2"
                      />
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span>Active</span>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={formData.status === 'inactive'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mr-2"
                      />
                      <div className="flex items-center gap-2">
                        <XCircle className="size-4 text-red-500" />
                        <span>Inactive</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Department Details Modal */}
      {viewDeptModal && deptToView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Department Details</h2>
              <p className="text-gray-600">Complete information about the department</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="size-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">{deptToView.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        deptToView.status === 'active' 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {deptToView.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {deptToView.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Building2 className="size-4" />
                      Department Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-500">Name</label>
                        <p className="text-sm font-medium">{deptToView.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Description</label>
                        <p className="text-sm text-gray-700 mt-1">
                          {deptToView.description || 'No description provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Calendar className="size-4" />
                      Timeline
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-500">Created On</label>
                        <p className="text-sm font-medium">
                          {new Date(deptToView.created_at).toLocaleDateString()} at{' '}
                          {new Date(deptToView.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Last Updated</label>
                        <p className="text-sm font-medium">
                          {new Date(deptToView.updated_at).toLocaleDateString()} at{' '}
                          {new Date(deptToView.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <User className="size-4" />
                      Created By
                    </h4>
                    {deptToView.created_by_details ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-500">Full Name</label>
                          <p className="text-sm font-medium">{deptToView.created_by_details.full_name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Role</label>
                          <p className="text-sm font-medium capitalize">{deptToView.created_by_details.role}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Email</label>
                          <p className="text-sm font-medium">{deptToView.created_by_details.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">Phone</label>
                          <p className="text-sm font-medium">{deptToView.created_by_details.phone_number}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Created by system</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <Users className="size-4" />
                      Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded border">
                        <p className="text-2xl font-bold text-blue-600">0</p>
                        <p className="text-xs text-gray-500 mt-1">Total Users</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <p className="text-2xl font-bold text-green-600">0</p>
                        <p className="text-xs text-gray-500 mt-1">Mentors</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <p className="text-2xl font-bold text-purple-600">0</p>
                        <p className="text-xs text-gray-500 mt-1">Mentees</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <p className="text-2xl font-bold text-orange-600">0</p>
                        <p className="text-xs text-gray-500 mt-1">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-6 border-t">
                <button
                  onClick={() => setViewDeptModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewDeptModal(false);
                    initializeFormForEdit(deptToView);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="size-4" />
                  Edit Department
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
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="size-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
                  <p className="text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-700">
                Are you sure you want to delete this department? All users in this department will need to be reassigned.
              </p>
            </div>
            <div className="p-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeptToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deptToDelete) {
                    deleteDepartment(deptToDelete);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="size-4" />
                Delete Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}