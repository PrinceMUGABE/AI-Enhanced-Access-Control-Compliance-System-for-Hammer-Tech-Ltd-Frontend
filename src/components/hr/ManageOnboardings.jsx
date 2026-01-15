import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Eye,
    Clock,
    AlertTriangle,
    TrendingUp,
    Loader2,
    FileText,
    CheckCircle,
    XCircle,
    UserPlus,
    Search,
    ChevronRight,
    Shield,
    Target,
    Trophy,
    TrendingDown,
    UserMinus,
    BookOpen,
    X,
    MoreVertical,
    Calendar,
    BarChart3,
    Users as UsersIcon,
    CalendarDays,
    Building,
    Filter
} from 'lucide-react';

const BASE_URL = "http://127.0.0.1:8000";

export default function HROnboardingManagement() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data states
    const [statistics, setStatistics] = useState(null);
    const [menteesSummary, setMenteesSummary] = useState([]);
    const [modules, setModules] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [departments, setDepartments] = useState([]); // Real departments from API
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal states
    const [isAddMenteeModalOpen, setIsAddMenteeModalOpen] = useState(false);
    const [isAssignModuleModalOpen, setIsAssignModuleModalOpen] = useState(false);
    const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
    const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] = useState(false);

    // Selected items
    const [selectedMentee, setSelectedMentee] = useState(null);
    const [selectedMenteeProgress, setSelectedMenteeProgress] = useState([]);
    const [selectedMentees, setSelectedMentees] = useState([]);
    const [menteeToRemove, setMenteeToRemove] = useState(null);

    // Form states
    const [newMenteeForm, setNewMenteeForm] = useState({
        department_id: '',
        mentee_id: '',
        auto_assign: true
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsersByDepartment, setFilteredUsersByDepartment] = useState([]);

    const [moduleAssignmentForm, setModuleAssignmentForm] = useState({
        mentee_ids: [],
        module_type: 'all',
        department: '',
        include_core: true,
        include_department: true
    });

    const getAuthToken = () => {
        return localStorage.getItem('access_token');
    };

    const getCurrentUser = () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    };

    // Fetch all data for HR dashboard
    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError('');
            const token = getAuthToken();
            const user = getCurrentUser();

            if (!token || !user || user.role !== 'hr') {
                setError("Access denied. HR role required.");
                navigate('/login');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch all departments
            const departmentsResponse = await fetch(`${BASE_URL}/departments/all/`, { headers });
            if (departmentsResponse.ok) {
                const deptData = await departmentsResponse.json();
                setDepartments(deptData.data || []);
            }

            // Fetch all APPROVED mentee users to populate dropdown
            const usersResponse = await fetch(`${BASE_URL}/users/mentees/`, {
                headers,
                params: { status: 'approved' }
            });

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setAllUsers(usersData.users || []);
            }

            // Fetch statistics
            const statsResponse = await fetch(`${BASE_URL}/onboarding/modules/statistics/`, { headers });
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStatistics(statsData);
            }

            // Fetch mentees summary
            const menteesResponse = await fetch(`${BASE_URL}/onboarding/progress/all-summary/`, { headers });
            if (menteesResponse.ok) {
                const data = await menteesResponse.json();
                const menteesData = data.mentees || [];
                setMenteesSummary(menteesData);
            }

            // Fetch modules
            const modulesResponse = await fetch(`${BASE_URL}/onboarding/modules/`, { headers });
            if (modulesResponse.ok) {
                setModules(await modulesResponse.json());
            }

            // Fetch upcoming deadlines (mentees who haven't started modules)
            await fetchUpcomingDeadlines(headers);

        } catch (error) {
            console.error('Error fetching HR onboarding data:', error);
            setError(error.message || "Failed to load onboarding data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUpcomingDeadlines = async (headers) => {
        try {
            // Get all mentees with their progress
            const menteesWithProgress = menteesSummary.filter(m => m.total_modules > 0);
            const deadlines = [];

            for (const mentee of menteesWithProgress) {
                // Get this mentee's progress records
                const progressResponse = await fetch(
                    `${BASE_URL}/onboarding/progress/?mentee_id=${mentee.id}`,
                    { headers }
                );

                if (progressResponse.ok) {
                    const menteeProgress = await progressResponse.json();

                    // Find modules not started for a long time
                    menteeProgress.forEach((progress) => {
                        if (progress.status === 'not_started' && progress.assigned_at) {
                            const assignedDate = new Date(progress.assigned_at);
                            const today = new Date();
                            const daysSinceAssigned = Math.floor((today.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));

                            if (daysSinceAssigned >= 3) {
                                let status;
                                if (daysSinceAssigned >= 7) {
                                    status = 'critical';
                                } else if (daysSinceAssigned >= 5) {
                                    status = 'warning';
                                } else {
                                    status = 'inactive';
                                }

                                deadlines.push({
                                    mentee_id: mentee.id,
                                    mentee_name: mentee.full_name,
                                    mentee_department: mentee.department_name,
                                    module_id: progress.module,
                                    module_title: progress.module_title,
                                    assigned_at: progress.assigned_at,
                                    days_since_assigned: daysSinceAssigned,
                                    status: status,
                                    progress_percentage: progress.progress_percentage
                                });
                            }
                        }
                    });
                }
            }

            // Sort by days since assigned (highest first)
            deadlines.sort((a, b) => b.days_since_assigned - a.days_since_assigned);
            setUpcomingDeadlines(deadlines);

        } catch (error) {
            console.error('Error fetching deadlines:', error);
        }
    };

    // Add new mentee to onboarding
    const addMenteeToOnboarding = async () => {
        try {
            const token = getAuthToken();

            if (!newMenteeForm.mentee_id) {
                alert("Please select a mentee");
                return;
            }

            const menteeId = parseInt(newMenteeForm.mentee_id);

            // Check if mentee is already in onboarding
            const existingMentee = menteesSummary.find(m => m.id === menteeId);
            if (existingMentee) {
                alert("This mentee is already in the onboarding program");
                return;
            }

            // Auto-assign modules if selected
            if (newMenteeForm.auto_assign) {
                const response = await fetch(`${BASE_URL}/onboarding/progress/auto-assign/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ mentee_id: menteeId })
                });

                if (!response.ok) {
                    throw new Error('Failed to auto-assign modules');
                }
            }

            alert("Mentee added to onboarding successfully!");
            setIsAddMenteeModalOpen(false);
            resetNewMenteeForm();
            fetchAllData();

        } catch (error) {
            alert(error.message || "Failed to add mentee to onboarding");
        }
    };

    // Remove mentee from onboarding
    const removeMenteeFromOnboarding = async () => {
        try {
            if (!menteeToRemove) return;

            const token = getAuthToken();

            // Find the mentee details before removal
            const mentee = menteesSummary.find(m => m.id === menteeToRemove);
            if (!mentee) {
                alert("Mentee not found");
                setIsConfirmRemoveModalOpen(false);
                setMenteeToRemove(null);
                return;
            }

            // setIsRemoving(true);

            // Call the API endpoint to remove mentee from onboarding
            const response = await fetch(
                `${BASE_URL}/onboarding/mentees/${menteeToRemove}/remove/`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        remove_all: true  // Remove all modules from this mentee
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to remove mentee from onboarding');
            }

            // Show detailed success message
            const successMessage = `
Successfully Removed from Onboarding:

Name: ${data.mentee_name}
Modules Removed: ${data.modules_removed}
Removed By: ${data.removed_by}

${data.removed_modules && data.removed_modules.length > 0 ?
                    `\nRemoved Modules:\n${data.removed_modules.map(m => `• ${m}`).join('\n')}` :
                    ''
                }
        `.trim();

            alert(successMessage);

            // Close modal and reset state
            setIsConfirmRemoveModalOpen(false);
            setMenteeToRemove(null);

            // Remove from selected mentees if it was selected
            setSelectedMentees(prev => prev.filter(id => id !== menteeToRemove));

            // Refresh all data to reflect changes
            await fetchAllData();

            console.log('✅ Mentee removed successfully:', data);

        } catch (error) {
            console.error('❌ Error removing mentee from onboarding:', error);

            // Show user-friendly error message
            const errorMessage = error.message || "Failed to remove mentee from onboarding. Please try again.";
            alert(`Error: ${errorMessage}`);

            // Close modal on error to allow user to retry
            setIsConfirmRemoveModalOpen(false);
            setMenteeToRemove(null);
        } finally {
            // Reset loading state if you added it
            // setIsRemoving(false);
        }
    };

    // Assign modules to mentees
    const assignModulesToMentees = async () => {
        try {
            const token = getAuthToken();

            // Determine mentees to use
            const menteeIds =
                moduleAssignmentForm.mentee_ids.length > 0
                    ? moduleAssignmentForm.mentee_ids
                    : selectedMentees;

            console.log("📤 Mentee IDs to assign:", menteeIds);

            // Get modules to assign
            const modulesToAssign = await getModulesForAssignment();

            console.log("📤 Modules to assign:", modulesToAssign);

            if (modulesToAssign.length === 0) {
                alert("No modules found matching your criteria");
                return;
            }

            let assignedCount = 0;

            for (const module of modulesToAssign) {
                const requestUrl = `${BASE_URL}/onboarding/modules/${module.id}/assign/`;
                const requestBody = { mentee_ids: menteeIds };

                console.log("➡️ Sending request:", {
                    url: requestUrl,
                    method: "POST",
                    body: requestBody
                });

                const response = await fetch(requestUrl, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });

                const responseData = await response.json();

                console.log("⬅️ Response received:", {
                    moduleId: module.id,
                    status: response.status,
                    ok: response.ok,
                    data: responseData,
                });

                if (response.ok) {
                    assignedCount++;
                }
            }

            console.log("✅ Assignment summary:", {
                totalModules: modulesToAssign.length,
                totalMentees: menteeIds.length,
                successfullyAssigned: assignedCount,
            });

            alert(
                `Successfully assigned ${assignedCount} modules to ${menteeIds.length} mentees`
            );

            setIsAssignModuleModalOpen(false);
            resetModuleAssignmentForm();
            fetchAllData();

        } catch (error) {
            console.error("❌ Error assigning modules:", error);
            alert(error.message || "Failed to assign modules");
        }
    };


    const getModulesForAssignment = async () => {
        const token = getAuthToken();
        let url = `${BASE_URL}/onboarding/modules/?is_active=true`;

        const filters = [];
        if (moduleAssignmentForm.module_type !== 'all') {
            filters.push(`module_type=${moduleAssignmentForm.module_type}`);
        }
        if (moduleAssignmentForm.department) {
            filters.push(`department=${moduleAssignmentForm.department}`);
        }

        if (filters.length > 0) {
            url += `&${filters.join('&')}`;
        }

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const allModules = await response.json();
            let filteredModules = allModules;

            // Apply additional filters
            if (!moduleAssignmentForm.include_core) {
                filteredModules = filteredModules.filter((m) => m.module_type !== 'core');
            }
            if (!moduleAssignmentForm.include_department) {
                filteredModules = filteredModules.filter((m) => m.module_type !== 'department');
            }

            return filteredModules;
        }

        return [];
    };

    // View mentee details
    const viewMenteeDetails = async (mentee) => {
        try {
            const token = getAuthToken();
            setSelectedMentee(mentee);

            const response = await fetch(`${BASE_URL}/onboarding/progress/?mentee_id=${mentee.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setSelectedMenteeProgress(await response.json());
            }

            setIsViewDetailsModalOpen(true);

        } catch (error) {
            console.error('Error fetching mentee details:', error);
        }
    };

    // Filter functions
    const filteredMentees = menteesSummary.filter(mentee => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            mentee.full_name?.toLowerCase().includes(searchLower) ||
            mentee.email?.toLowerCase().includes(searchLower) ||
            mentee.department_name?.toLowerCase().includes(searchLower);

        const matchesDepartment = departmentFilter === 'all' || mentee.department_name === departmentFilter;

        let matchesStatus = true;
        if (statusFilter !== 'all') {
            switch (statusFilter) {
                case 'on_track':
                    matchesStatus = mentee.overall_progress_percentage >= 70;
                    break;
                case 'behind':
                    matchesStatus = mentee.overall_progress_percentage < 70 && mentee.overall_progress_percentage > 30;
                    break;
                case 'at_risk':
                    matchesStatus = mentee.overall_progress_percentage <= 30;
                    break;
                case 'completed':
                    matchesStatus = mentee.overall_progress_percentage === 100;
                    break;
            }
        }

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const filteredDeadlines = upcomingDeadlines.filter(deadline => {
        const searchLower = searchTerm.toLowerCase();
        return (
            deadline.mentee_name?.toLowerCase().includes(searchLower) ||
            deadline.module_title?.toLowerCase().includes(searchLower) ||
            deadline.mentee_department?.toLowerCase().includes(searchLower)
        );
    });

    // Filter users for dropdown - only show approved mentees NOT already in onboarding
    // This function now also filters by selected department
    const filterUsersForDepartment = () => {
        if (!newMenteeForm.department_id) {
            return [];
        }

        const filtered = allUsers
            .filter(user => user.role === 'mentee' && user.status === 'approved')
            .filter(user => user.department === parseInt(newMenteeForm.department_id))
            .filter(user =>
                !menteesSummary.some(mentee => mentee.id === user.id)
            )
            .filter(user => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    user.full_name?.toLowerCase().includes(searchLower) ||
                    user.email?.toLowerCase().includes(searchLower) ||
                    user.work_mail_address?.toLowerCase().includes(searchLower)
                );
            });

        setFilteredUsersByDepartment(filtered);
        return filtered;
    };

    // Reset form functions
    const resetNewMenteeForm = () => {
        setNewMenteeForm({
            department_id: '',
            mentee_id: '',
            auto_assign: true
        });
        setSearchQuery('');
        setFilteredUsersByDepartment([]);
    };

    const resetModuleAssignmentForm = () => {
        setModuleAssignmentForm({
            mentee_ids: [],
            module_type: 'all',
            department: '',
            include_core: true,
            include_department: true
        });
    };

    // Helper functions
    const getStatusBadgeVariant = (progress) => {
        if (progress === 100) return 'bg-green-100 text-green-800';
        if (progress >= 70) return 'bg-blue-100 text-blue-800';
        if (progress >= 30) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getStatusText = (progress) => {
        if (progress === 100) return 'Completed';
        if (progress >= 70) return 'On Track';
        if (progress >= 30) return 'Behind';
        return 'At Risk';
    };

    const getDeadlineStatusVariant = (status) => {
        switch (status) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Toggle selection functions
    const toggleMenteeSelection = (menteeId) => {
        setSelectedMentees(prev =>
            prev.includes(menteeId)
                ? prev.filter(id => id !== menteeId)
                : [...prev, menteeId]
        );
    };

    const toggleAllMenteesSelection = () => {
        if (selectedMentees.length === filteredMentees.length) {
            setSelectedMentees([]);
        } else {
            setSelectedMentees(filteredMentees.map(m => m.id));
        }
    };

    const handleRecipientSelect = (mentee) => {
        setNewMenteeForm({
            ...newMenteeForm,
            mentee_id: mentee.id
        });
    };

    const handleDepartmentSelect = (deptId) => {
        setNewMenteeForm({
            ...newMenteeForm,
            department_id: deptId,
            mentee_id: '' // Reset mentee selection when department changes
        });
        // Filter users for this department
        setTimeout(() => filterUsersForDepartment(), 0);
    };

    // Calculate summary statistics
    const calculateSummaryStats = () => {
        const totalMentees = menteesSummary.length;
        const approvedMentees = allUsers.filter(u => u.role === 'mentee' && u.status === 'approved').length;
        const pendingMentees = approvedMentees - totalMentees;

        const avgProgress = statistics?.average_mentee_progress || 0;
        const criticalDeadlines = upcomingDeadlines.filter(d => d.days_since_assigned >= 7).length;

        return {
            totalMentees,
            approvedMentees,
            pendingMentees,
            avgProgress,
            criticalDeadlines
        };
    };

    const stats = calculateSummaryStats();

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (newMenteeForm.department_id) {
            filterUsersForDepartment();
        }
    }, [newMenteeForm.department_id, searchQuery, allUsers, menteesSummary]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading HR Onboarding Dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="max-w-md p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <h3 className="font-semibold text-red-800">Error</h3>
                    </div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Management</h1>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full flex items-center gap-1">
                            <Shield className="size-3" />
                            HR Dashboard
                        </span>
                        <p className="text-gray-600">Manage new hires onboarding progress</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddMenteeModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                    <UserPlus className="size-4" />
                    Add New Hire
                </button>
            </div>

            {/* Statistics Cards - Simplified and Important Only */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active in Onboarding</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.totalMentees}</h3>
                            </div>
                            <Users className="size-8 text-blue-500" />
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-gray-600">
                                {stats.pendingMentees} approved candidates pending
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</h3>
                            </div>
                            <TrendingUp className="size-8 text-amber-500" />
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-amber-500 h-2 rounded-full"
                                    style={{ width: `${stats.avgProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Departments</p>
                                <h3 className="text-2xl font-bold text-gray-900">{departments.length}</h3>
                            </div>
                            <Building className="size-8 text-green-500" />
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-gray-600">
                                {departments.filter(d => d.status === 'active').length} active departments
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Critical Modules</p>
                                <h3 className="text-2xl font-bold text-yellow-600">
                                    {stats.criticalDeadlines}
                                </h3>
                            </div>
                            <Clock className="size-8 text-yellow-500" />
                        </div>
                        <div className="mt-2">
                            <p className="text-xs text-gray-600">
                                Not started for 7+ days
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full">
                <div className="grid grid-cols-3 mb-8 border-b">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <BarChart3 className="size-4" />
                            Dashboard
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('mentees')}
                        className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'mentees' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <UsersIcon className="size-4" />
                            New Hires ({menteesSummary.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('deadlines')}
                        className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'deadlines' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <CalendarDays className="size-4" />
                            Inactive ({upcomingDeadlines.length})
                        </div>
                    </button>
                </div>

                {/* Dashboard Tab - Simplified */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Performing Mentees */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div className="p-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Trophy className="size-5 text-amber-500" />
                                        Top Performing New Hires
                                    </h2>
                                    <p className="text-gray-600">Highest onboarding progress</p>
                                </div>
                                <div className="space-y-4">
                                    {menteesSummary
                                        .filter(m => m.total_modules > 0)
                                        .sort((a, b) => b.overall_progress_percentage - a.overall_progress_percentage)
                                        .slice(0, 5)
                                        .map((mentee, index) => (
                                            <div key={mentee.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium">
                                                    {mentee.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{mentee.full_name}</h4>
                                                    <p className="text-xs text-gray-600 truncate">{mentee.department_name || 'No Department'}</p>
                                                </div>
                                                <div className="flex-shrink-0 text-right">
                                                    <div className={`text-lg font-bold ${mentee.overall_progress_percentage >= 70 ? 'text-green-600' :
                                                        mentee.overall_progress_percentage >= 30 ? 'text-amber-600' :
                                                            'text-red-600'
                                                        }`}>
                                                        {mentee.overall_progress_percentage}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {mentee.completed_modules}/{mentee.total_modules} modules
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Department Overview */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div className="p-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Department Overview</h2>
                                    <p className="text-gray-600">Onboarding progress by department</p>
                                </div>
                                <div className="space-y-4">
                                    {departments
                                        .filter(dept => dept.status === 'active')
                                        .slice(0, 5)
                                        .map((department) => {
                                            const deptMentees = menteesSummary.filter(m => m.department_name === department.name);
                                            const totalDeptMentees = allUsers.filter(u =>
                                                u.role === 'mentee' &&
                                                u.status === 'approved' &&
                                                u.department === department.id
                                            ).length;

                                            const activeCount = deptMentees.length;
                                            const pendingCount = totalDeptMentees - activeCount;

                                            return (
                                                <div key={department.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-900">{department.name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                                Active: {activeCount}
                                                            </span>
                                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                                                                Pending: {pendingCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {deptMentees.length > 0 ? (
                                                                `${Math.round(deptMentees.reduce((acc, m) => acc + m.overall_progress_percentage, 0) / deptMentees.length)}%`
                                                            ) : '0%'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Avg. progress
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mentees Tab - Main Focus */}
                {activeTab === 'mentees' && (
                    <div className="space-y-6">
                        {/* Filters and Actions */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="lg:col-span-2">
                                        <div className="relative">
                                            <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                placeholder="Search new hires..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <select
                                            value={departmentFilter}
                                            onChange={(e) => setDepartmentFilter(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">All Departments</option>
                                            {departments
                                                .filter(dept => dept.status === 'active')
                                                .map(dept => (
                                                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="on_track">On Track</option>
                                            <option value="behind">Behind</option>
                                            <option value="at_risk">At Risk</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setDepartmentFilter('all');
                                            setStatusFilter('all');
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 justify-center"
                                    >
                                        <X className="size-4" />
                                        Clear
                                    </button>
                                </div>

                                {selectedMentees.length > 0 && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-blue-800">
                                                    {selectedMentees.length} new hires selected
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsAssignModuleModalOpen(true)}
                                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <BookOpen className="size-4" />
                                                    Assign Modules
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mentees Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div className="p-6 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">New Hires ({filteredMentees.length})</h2>
                                        <p className="text-gray-600">Manage onboarding progress for new hires</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsAssignModuleModalOpen(true)}
                                            disabled={selectedMentees.length === 0}
                                            className={`px-4 py-2 border rounded-md flex items-center gap-2 ${selectedMentees.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                        >
                                            <BookOpen className="size-4" />
                                            Assign Modules
                                        </button>
                                        <button
                                            onClick={() => setIsAddMenteeModalOpen(true)}
                                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <UserPlus className="size-4" />
                                            Add New Hire
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-0">
                                {filteredMentees.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No new hires found</h3>
                                        <p className="text-gray-500">Try adjusting your search or add new hires</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-gray-50">
                                                    <th className="py-3 px-4 text-left w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMentees.length === filteredMentees.length}
                                                            onChange={toggleAllMenteesSelection}
                                                            className="rounded"
                                                        />
                                                    </th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Name</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Department</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Progress</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Status</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Modules</th>
                                                    <th className="py-3 px-4 text-right font-medium text-gray-900">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredMentees.map((mentee) => (
                                                    <tr key={mentee.id} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMentees.includes(mentee.id)}
                                                                onChange={() => toggleMenteeSelection(mentee.id)}
                                                                className="rounded"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div>
                                                                <p className="font-medium">{mentee.full_name}</p>
                                                                <p className="text-xs text-gray-600">{mentee.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2 py-1 text-xs border rounded-full">
                                                                {mentee.department_name || 'No Department'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="space-y-1">
                                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-blue-500 h-2 rounded-full"
                                                                        style={{ width: `${mentee.overall_progress_percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <p className="text-xs">{mentee.overall_progress_percentage.toFixed(1)}%</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeVariant(mentee.overall_progress_percentage)}`}>
                                                                {getStatusText(mentee.overall_progress_percentage)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex gap-1">
                                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                    ✓ {mentee.completed_modules}
                                                                </span>
                                                                <span className="px-2 py-1 text-xs border rounded-full">
                                                                    ↗ {mentee.in_progress_modules}
                                                                </span>
                                                                <span className="px-2 py-1 text-xs border rounded-full">
                                                                    ○ {mentee.not_started_modules}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="relative inline-block">
                                                                <button
                                                                    onClick={() => {
                                                                        const dropdown = document.getElementById(`dropdown-${mentee.id}`);
                                                                        if (dropdown) dropdown.classList.toggle('hidden');
                                                                    }}
                                                                    className="p-1 hover:bg-gray-100 rounded"
                                                                >
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </button>
                                                                <div id={`dropdown-${mentee.id}`} className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 hidden">
                                                                    <div className="py-1">
                                                                        <button
                                                                            onClick={() => viewMenteeDetails(mentee)}
                                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                            View Details
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedMentees([mentee.id]);
                                                                                setIsAssignModuleModalOpen(true);
                                                                            }}
                                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                                                        >
                                                                            <BookOpen className="h-4 w-4" />
                                                                            Assign Modules
                                                                        </button>
                                                                        <hr className="my-1" />
                                                                        <button
                                                                            onClick={() => {
                                                                                setMenteeToRemove(mentee.id);
                                                                                setIsConfirmRemoveModalOpen(true);
                                                                            }}
                                                                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                                                                        >
                                                                            <UserMinus className="h-4 w-4" />
                                                                            Remove from Onboarding
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Deadlines Tab */}
                {activeTab === 'deadlines' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-900">Inactive Modules ({filteredDeadlines.length})</h2>
                                <p className="text-gray-600">Modules not started for extended periods</p>
                            </div>
                            <div className="p-0">
                                {filteredDeadlines.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No inactive modules</h3>
                                        <p className="text-gray-500">All modules are actively being worked on</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-gray-50">
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">New Hire</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Department</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Module</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Assigned</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Days Inactive</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Progress</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredDeadlines.map((deadline, index) => (
                                                    <tr key={index} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <div>
                                                                <p className="font-medium">{deadline.mentee_name}</p>
                                                                <p className="text-xs text-gray-600">{deadline.mentee_department}</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2 py-1 text-xs border rounded-full">
                                                                {deadline.mentee_department}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <p className="font-medium">{deadline.module_title}</p>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="size-4 text-gray-400" />
                                                                <span>{formatDate(deadline.assigned_at)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className={`flex items-center gap-2 ${deadline.days_since_assigned >= 7 ? 'text-red-600' :
                                                                deadline.days_since_assigned >= 5 ? 'text-amber-600' :
                                                                    'text-gray-600'
                                                                }`}>
                                                                <Clock className="size-4" />
                                                                <span className="font-medium">
                                                                    {deadline.days_since_assigned} days
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="space-y-1">
                                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-blue-500 h-2 rounded-full"
                                                                        style={{ width: `${deadline.progress_percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <p className="text-xs">{deadline.progress_percentage}%</p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${getDeadlineStatusVariant(deadline.status)}`}>
                                                                {deadline.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Mentee Modal */}
            {isAddMenteeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Add New Hire to Onboarding</h2>
                                    <p className="text-gray-600">Select a department and mentee to add to onboarding program</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAddMenteeModalOpen(false);
                                        resetNewMenteeForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Department Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Department *
                                </label>
                                <select
                                    value={newMenteeForm.department_id}
                                    onChange={(e) => handleDepartmentSelect(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select a department</option>
                                    {departments
                                        .filter(dept => dept.status === 'active')
                                        .map(dept => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>

                            {/* Mentee Search and Selection */}
                            {newMenteeForm.department_id && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Search Approved Mentees in Selected Department
                                        </label>
                                        <div className="relative">
                                            <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                placeholder="Search by name, email, or work email..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Mentee Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Mentee *
                                        </label>
                                        {filteredUsersByDepartment.length === 0 ? (
                                            <div className="text-center py-4 border rounded-md bg-gray-50">
                                                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500">
                                                    {searchQuery ? 'No matching mentees found' : 'No approved mentees available in this department'}
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    All approved mentees in this department are already in onboarding or no mentees available
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                                                {filteredUsersByDepartment.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => handleRecipientSelect(user)}
                                                        className={`p-3 border rounded-md cursor-pointer transition-colors ${newMenteeForm.mentee_id === user.id
                                                            ? 'bg-blue-50 border-blue-200'
                                                            : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                    <span className="text-xs text-gray-500">{user.email}</span>
                                                                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                                                        Work: {user.work_mail_address}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                                        Approved
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                {newMenteeForm.mentee_id === user.id ? (
                                                                    <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-5 w-5 rounded-full border border-gray-300"></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Statistics for selected department */}
                                    <div className="pt-2">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">Department Statistics:</span>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                    Total Mentees: {allUsers.filter(u => u.role === 'mentee' && u.status === 'approved' && u.department === parseInt(newMenteeForm.department_id)).length}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                                    In Onboarding: {menteesSummary.filter(m => m.department === parseInt(newMenteeForm.department_id)).length}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                                    Available: {filteredUsersByDepartment.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Auto-assign modules option */}
                            {newMenteeForm.mentee_id && (
                                <div className="pt-4 border-t">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newMenteeForm.auto_assign}
                                            onChange={(e) => setNewMenteeForm({ ...newMenteeForm, auto_assign: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 rounded"
                                        />
                                        <div>
                                            <span className="font-medium text-gray-900">Auto-assign modules</span>
                                            <p className="text-sm text-gray-500">
                                                Automatically assign core and department-specific modules to this mentee
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAddMenteeModalOpen(false);
                                    resetNewMenteeForm();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addMenteeToOnboarding}
                                disabled={!newMenteeForm.mentee_id}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add to Onboarding
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modules Modal */}
            {isAssignModuleModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Assign Modules</h2>
                                    <p className="text-gray-600">Assign modules to selected new hires</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAssignModuleModalOpen(false);
                                        resetModuleAssignmentForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Selected mentees info */}
                            {selectedMentees.length > 0 && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="font-medium text-blue-800">
                                        Assigning to {selectedMentees.length} new hire(s)
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        {selectedMentees.map(id => {
                                            const mentee = filteredMentees.find(m => m.id === id);
                                            return mentee ? mentee.full_name : '';
                                        }).filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}

                            {/* Module filters */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Module Type
                                    </label>
                                    <select
                                        value={moduleAssignmentForm.module_type}
                                        onChange={(e) => setModuleAssignmentForm({ ...moduleAssignmentForm, module_type: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Modules</option>
                                        <option value="core">Core Modules Only</option>
                                        <option value="department">Department Modules Only</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department (for department modules)
                                    </label>
                                    <select
                                        value={moduleAssignmentForm.department}
                                        onChange={(e) => setModuleAssignmentForm({ ...moduleAssignmentForm, department: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">All Departments</option>
                                        {departments
                                            .filter(dept => dept.status === 'active')
                                            .map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            {/* Include options */}
                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={moduleAssignmentForm.include_core}
                                        onChange={(e) => setModuleAssignmentForm({ ...moduleAssignmentForm, include_core: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <span className="font-medium text-gray-900">Include core modules</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={moduleAssignmentForm.include_department}
                                        onChange={(e) => setModuleAssignmentForm({ ...moduleAssignmentForm, include_department: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <span className="font-medium text-gray-900">Include department-specific modules</span>
                                </label>
                            </div>
                        </div>
                        <div className="p-6 border-t flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setIsAssignModuleModalOpen(false);
                                    resetModuleAssignmentForm();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={assignModulesToMentees}
                                disabled={selectedMentees.length === 0}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Assign Modules
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Mentee Details Modal */}
            {isViewDetailsModalOpen && selectedMentee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Onboarding Progress Details</h2>
                                    <p className="text-gray-600">{selectedMentee.full_name} - {selectedMentee.department_name}</p>
                                </div>
                                <button
                                    onClick={() => setIsViewDetailsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Overall Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Total Modules</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedMentee.total_modules}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-green-600">Completed</p>
                                    <p className="text-2xl font-bold text-green-700">{selectedMentee.completed_modules}</p>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-blue-600">In Progress</p>
                                    <p className="text-2xl font-bold text-blue-700">{selectedMentee.in_progress_modules}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-600">Not Started</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedMentee.not_started_modules}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                    <span className="text-sm font-bold text-gray-900">{selectedMentee.overall_progress_percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full"
                                        style={{ width: `${selectedMentee.overall_progress_percentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Module Progress Details */}
                            {selectedMenteeProgress.length > 0 ? (
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Module Progress</h3>
                                    <div className="space-y-3">
                                        {selectedMenteeProgress.map((progress) => (
                                            <div key={progress.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{progress.module_title}</h4>
                                                        <p className="text-sm text-gray-600">{progress.module_type}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeVariant(progress.progress_percentage)}`}>
                                                        {getStatusText(progress.progress_percentage)}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Progress</span>
                                                        <span className="font-medium">{progress.progress_percentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${progress.progress_percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500">
                                                        <span>Started: {progress.started_at ? formatDate(progress.started_at) : 'Not started'}</span>
                                                        <span>Due: {progress.due_date ? formatDate(progress.due_date) : 'No deadline'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No modules assigned</h3>
                                    <p className="text-gray-500">This new hire doesn't have any modules assigned yet</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t flex justify-end">
                            <button
                                onClick={() => setIsViewDetailsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Remove Modal */}
            {isConfirmRemoveModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Remove from Onboarding</h2>
                            <p className="text-gray-600">Are you sure you want to remove this new hire from onboarding?</p>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setIsConfirmRemoveModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={removeMenteeFromOnboarding}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex-1"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}