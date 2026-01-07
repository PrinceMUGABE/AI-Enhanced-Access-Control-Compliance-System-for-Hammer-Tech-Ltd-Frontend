import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ChevronLeft, ChevronRight, Plus,
  Edit, Trash2, Eye, BookOpen, Building, Target,
  MoreVertical, Download, RefreshCw, SortAsc, SortDesc,
  BarChart3, PieChartIcon, TrendingUp, Calendar, Clock,
  Users, Star, CheckCircle, PauseCircle, Archive, FileText,
  ExternalLink, Copy, EyeOff, Eye as EyeIcon, X, Check,
  ArrowUpDown, FilterX, DownloadCloud, Upload, Settings,
  Hash, Briefcase, Tag, Globe, Lock, Unlock, Zap,
  AlertCircle, Info, HelpCircle, Award, Trophy, Medal
} from 'lucide-react';

const BASE_URL = "http://127.0.0.1:8000";

// Helper functions (you'll need to implement these)
const getStatusBadgeProps = (status) => {
  switch(status) {
    case 'active': return { className: 'bg-green-100 text-green-800' };
    case 'inactive': return { className: 'bg-yellow-100 text-yellow-800' };
    case 'archived': return { className: 'bg-gray-100 text-gray-800' };
    default: return { className: 'bg-gray-100 text-gray-800' };
  }
};

const getStatusText = (status) => {
  switch(status) {
    case 'active': return 'Active';
    case 'inactive': return 'Inactive';
    case 'archived': return 'Archived';
    default: return status;
  }
};

const calculateProgramStats = (programs) => {
  return {
    totalPrograms: programs.length,
    activePrograms: programs.filter(p => p.status === 'active').length,
    archivedPrograms: programs.filter(p => p.status === 'archived').length,
    totalMentorships: programs.reduce((sum, p) => sum + (p.active_mentorships || 0), 0),
    averageSessions: programs.length > 0 
      ? programs.reduce((sum, p) => sum + (p.total_sessions || 0), 0) / programs.length 
      : 0,
    averageDuration: programs.length > 0 
      ? programs.reduce((sum, p) => sum + (p.duration_days || 0), 0) / programs.length 
      : 0,
    departmentStats: []
  };
};

const filterPrograms = (programs, filters) => {
  return programs.filter(program => {
    const matchesSearch = !filters.search || 
      program.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      program.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      program.department.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || program.status === filters.status;
    const matchesDepartment = filters.department === 'all' || program.department === filters.department;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });
};

const sortPrograms = (programs, sortBy, sortOrder) => {
  return [...programs].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

const getProgramMetrics = (program) => {
  return [
    { label: 'Sessions', value: program.total_sessions || 0 },
    { label: 'Active', value: program.active_mentorships || 0 },
    { label: 'Rate', value: `${program.completion_rate || 0}%` },
    { label: 'Duration', value: `${program.duration_days || 0} days` }
  ];
};

export default function ProgramManagement() {
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedPrograms, setSelectedPrograms] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');

  // Data states
  const [programs, setPrograms] = useState([]);
  const [sessionTemplates, setSessionTemplates] = useState([]);

  const departmentsList = [
    "Software Development", "Frontend Development", "Backend Development",
    "Mobile Development", "Data Science", "Cybersecurity", "Cloud & DevOps",
    "UI/UX Design", "Project Management", "Business Development",
    "HR & Recruitment", "Digital Marketing", "IT Support",
    "Quality Assurance", "Product Management"
  ];

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    department: 'all',
    hasSessions: false,
    minSessions: 0,
    maxSessions: 0
  });

  // Dialog states
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [showEditProgram, setShowEditProgram] = useState(false);
  const [showViewProgram, setShowViewProgram] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states
  const [programForm, setProgramForm] = useState({
    name: '',
    description: '',
    department: '',
    status: 'active',
    session_template_ids: [],
    objectives: [],
    prerequisites: [],
    tags: [],
    is_required: false,
    estimated_hours: 0,
    category: ''
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentObjective, setCurrentObjective] = useState('');
  const [currentPrerequisite, setCurrentPrerequisite] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programSessions, setProgramSessions] = useState([]);
  const [formStep, setFormStep] = useState(1);

  // Calculate derived data
  const stats = useMemo(() => calculateProgramStats(programs || []), [programs]);

  const filteredPrograms = useMemo(() => {
    let filtered = filterPrograms(programs || [], filters);
    return sortPrograms(filtered, sortBy, sortOrder);
  }, [programs, filters, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const [programsResponse] = await Promise.all([
        fetch(`${BASE_URL}/mentorship-programs/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
      ]);

      const programsData = await programsResponse.json();
      setPrograms(Array.isArray(programsData) ? programsData : []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setPrograms([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreateProgram = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${BASE_URL}/mentorship-programs/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programForm)
      });

      if (response.ok) {
        alert('Program created successfully');
        setShowCreateProgram(false);
        fetchData();
      }
    } catch (error) {
      alert('Failed to create program');
    }
  };

  const handleEditProgram = async () => {
    if (!selectedProgram) return;

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${BASE_URL}/mentorship-programs/${selectedProgram.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programForm)
      });

      if (response.ok) {
        alert('Program updated successfully');
        setShowEditProgram(false);
        fetchData();
      }
    } catch (error) {
      alert('Failed to update program');
    }
  };

  const handleDeleteProgram = async (programId) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${BASE_URL}/mentorship-programs/${programId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        alert('Program deleted successfully');
        setShowDeleteConfirm(false);
        fetchData();
      }
    } catch (error) {
      alert('Failed to delete program');
    }
  };

  const resetForm = () => {
    setProgramForm({
      name: '',
      description: '',
      department: '',
      status: 'active',
      session_template_ids: [],
      objectives: [],
      prerequisites: [],
      tags: [],
      is_required: false,
      estimated_hours: 0,
      category: ''
    });
    setCurrentTag('');
    setCurrentObjective('');
    setCurrentPrerequisite('');
    setFormStep(1);
  };

  const openEditModal = (program) => {
    setSelectedProgram(program);
    setProgramForm({
      name: program.name,
      description: program.description,
      department: program.department,
      status: program.status,
      session_template_ids: [],
      objectives: program.objectives || [],
      prerequisites: program.prerequisites || [],
      tags: [],
      is_required: false,
      estimated_hours: 0,
      category: ''
    });
    setShowEditProgram(true);
  };

  const openViewModal = (program) => {
    setSelectedProgram(program);
    setShowViewProgram(true);
  };

  const toggleSelectAll = () => {
    if (selectedPrograms.size === paginatedPrograms.length) {
      setSelectedPrograms(new Set());
    } else {
      const allIds = new Set(paginatedPrograms.map(p => p.id));
      setSelectedPrograms(allIds);
    }
  };

  const toggleSelectProgram = (programId) => {
    const newSelected = new Set(selectedPrograms);
    if (newSelected.has(programId)) {
      newSelected.delete(programId);
    } else {
      newSelected.add(programId);
    }
    setSelectedPrograms(newSelected);
  };

  const addTag = () => {
    if (currentTag.trim()) {
      setProgramForm({
        ...programForm,
        tags: [...programForm.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setProgramForm({
      ...programForm,
      tags: programForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addObjective = () => {
    if (currentObjective.trim()) {
      setProgramForm({
        ...programForm,
        objectives: [...programForm.objectives, currentObjective.trim()]
      });
      setCurrentObjective('');
    }
  };

  const removeObjective = (objectiveToRemove) => {
    setProgramForm({
      ...programForm,
      objectives: programForm.objectives.filter(obj => obj !== objectiveToRemove)
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      department: 'all',
      hasSessions: false,
      minSessions: 0,
      maxSessions: 0
    });
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading program data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Program Management</h1>
          <p className="text-gray-600">
            Create, manage, and monitor mentorship programs across departments
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            onClick={() => setShowCreateProgram(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="size-4" />
            New Program
          </button>

          {selectedPrograms.size > 0 && (
            <button
              className="px-4 py-2 border border-gray-300 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <Check className="size-4" />
              {selectedPrograms.size} Selected
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Programs', value: stats.totalPrograms, icon: BookOpen, color: 'blue' },
          { title: 'Active Programs', value: stats.activePrograms, icon: CheckCircle, color: 'green' },
          { title: 'Archived', value: stats.archivedPrograms, icon: Archive, color: 'gray' },
          { title: 'Active Mentorships', value: stats.totalMentorships, icon: Users, color: 'purple' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                  <stat.icon className={`size-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Programs</h2>
              <p className="text-gray-600">
                {filteredPrograms.length} programs found
                {filters.search && ` matching "${filters.search}"`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <div className="grid grid-cols-2 gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-current" />
                    ))}
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <div className="flex flex-col gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-4 h-1 bg-current" />
                    ))}
                  </div>
                </button>
              </div>

              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <FilterX className="size-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Search programs by name, description, or department..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departmentsList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Program List/Grid */}
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="size-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Programs Found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters
              </p>
              <button 
                onClick={() => setShowCreateProgram(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Plus className="size-4" />
                Create Your First Program
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPrograms.map((program) => {
                const badgeProps = getStatusBadgeProps(program.status);
                const metrics = getProgramMetrics(program);

                return (
                  <div key={program.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{program.name}</h3>
                          <p className="text-gray-600 flex items-center gap-2 mt-1">
                            <Building className="size-3" />
                            {program.department}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedPrograms.has(program.id)}
                            onChange={() => toggleSelectProgram(program.id)}
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${badgeProps.className}`}>
                          {getStatusText(program.status)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-4 line-clamp-2">
                        {program.description}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        {metrics.map((metric, index) => (
                          <div key={index} className="text-center p-2 bg-gray-50 rounded">
                            <div className="text-xs text-gray-500">{metric.label}</div>
                            <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between mt-6 pt-4 border-t">
                        <button
                          onClick={() => openViewModal(program)}
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <EyeIcon className="size-4" />
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(program)}
                          className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <Edit className="size-4" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Table View
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-3 px-4 text-left w-12">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedPrograms.size === paginatedPrograms.length && paginatedPrograms.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Name
                          {sortBy === 'name' && (
                            sortOrder === 'asc' ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('department')}
                      >
                        <div className="flex items-center gap-1">
                          Department
                          {sortBy === 'department' && (
                            sortOrder === 'asc' ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="py-3 px-4 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {sortBy === 'status' && (
                            sortOrder === 'asc' ? <SortAsc className="size-4" /> : <SortDesc className="size-4" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPrograms.map((program) => {
                      const badgeProps = getStatusBadgeProps(program.status);

                      return (
                        <tr key={program.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={selectedPrograms.has(program.id)}
                              onChange={() => toggleSelectProgram(program.id)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{program.name}</span>
                              <span className="text-sm text-gray-500 truncate max-w-xs">
                                {program.description}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Building className="size-4 text-gray-400" />
                              <span>{program.department}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${badgeProps.className}`}>
                              {getStatusText(program.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openViewModal(program)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="View Details"
                              >
                                <EyeIcon className="size-4" />
                              </button>
                              <button
                                onClick={() => openEditModal(program)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Edit Program"
                              >
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProgram(program);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1 hover:bg-red-50 text-red-600 rounded"
                                title="Delete Program"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPrograms.length)} of {filteredPrograms.length} programs
                </div>
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
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNumber = currentPage - 2 + i;
                      }
                      if (pageNumber > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`w-8 h-8 rounded-md text-sm ${currentPage === pageNumber ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
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

      {/* Create Program Modal */}
      {showCreateProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Create New Program</h2>
              <p className="text-gray-600">
                Define a new mentorship program with objectives and session templates
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Form Steps Navigation */}
              <div className="flex border-b">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    onClick={() => setFormStep(step)}
                    className={`px-4 py-3 font-medium border-b-2 ${formStep === step ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Step {step}
                  </button>
                ))}
              </div>

              {/* Step 1: Basic Information */}
              {formStep === 1 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Program Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Leadership Development Program"
                          value={programForm.name}
                          onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Department *
                        </label>
                        <select
                          value={programForm.department}
                          onChange={(e) => setProgramForm({ ...programForm, department: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select department</option>
                          {departmentsList.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Status *
                        </label>
                        <select
                          value={programForm.status}
                          onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description *
                    </label>
                    <textarea
                      placeholder="Describe the program objectives, target audience, and benefits..."
                      value={programForm.description}
                      onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Objectives */}
              {formStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Objectives *
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a learning objective"
                          value={currentObjective}
                          onChange={(e) => setCurrentObjective(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={addObjective}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                      {programForm.objectives.length > 0 && (
                        <div className="space-y-2">
                          {programForm.objectives.map((objective, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                              <Check className="size-4 text-green-600 mt-0.5" />
                              <span className="flex-1">{objective}</span>
                              <button
                                type="button"
                                onClick={() => removeObjective(objective)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <X className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {formStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">Program Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{programForm.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{programForm.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Objectives:</span>
                        <span className="font-medium">{programForm.objectives.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeProps(programForm.status).className}`}>
                          {getStatusText(programForm.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                {formStep > 1 ? (
                  <button
                    onClick={() => setFormStep(formStep - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                ) : (
                  <div></div>
                )}
                
                {formStep < 3 ? (
                  <button
                    onClick={() => setFormStep(formStep + 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleCreateProgram}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Program
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {showEditProgram && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Edit Program</h2>
              <p className="text-gray-600">Update program details and configuration</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Program Name *
                    </label>
                    <input
                      type="text"
                      value={programForm.name}
                      onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Department *
                    </label>
                    <select
                      value={programForm.department}
                      onChange={(e) => setProgramForm({ ...programForm, department: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select department</option>
                      {departmentsList.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status *
                    </label>
                    <select
                      value={programForm.status}
                      onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  value={programForm.description}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Objectives *
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a learning objective"
                      value={currentObjective}
                      onChange={(e) => setCurrentObjective(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addObjective}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  {programForm.objectives.length > 0 && (
                    <div className="space-y-2">
                      {programForm.objectives.map((objective, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                          <Check className="size-4 text-green-600 mt-0.5" />
                          <span className="flex-1">{objective}</span>
                          <button
                            type="button"
                            onClick={() => removeObjective(objective)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowEditProgram(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProgram}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Program Modal */}
      {showViewProgram && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Program Details</h2>
              <p className="text-gray-600">
                {selectedProgram.name} - {selectedProgram.department}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Program Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedProgram.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeProps(selectedProgram.status).className}`}>
                      {getStatusText(selectedProgram.status)}
                    </span>
                    <span className="px-2 py-1 text-xs border border-gray-300 rounded-full flex items-center gap-1">
                      <Building className="size-3" />
                      {selectedProgram.department}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(selectedProgram)}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Edit className="size-4" />
                    Edit
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedProgram.description}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getProgramMetrics(selectedProgram).map((metric, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded text-center">
                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Objectives */}
              {selectedProgram.objectives && selectedProgram.objectives.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Objectives</h4>
                  <div className="space-y-2">
                    {selectedProgram.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded">
                        <Target className="size-4 text-blue-600 mt-0.5" />
                        <span className="flex-1">{objective}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowViewProgram(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Delete Program</h2>
              <p className="text-gray-600">
                Are you sure you want to delete "{selectedProgram.name}"?
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Warning</h4>
                    <p className="text-sm text-red-600 mt-1">
                      This action cannot be undone. This will permanently delete the program.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProgram(selectedProgram.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}