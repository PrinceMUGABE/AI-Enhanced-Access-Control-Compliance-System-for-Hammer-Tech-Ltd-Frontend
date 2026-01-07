import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search,
    UserPlus,
    Users,
    Eye,
    Mail,
    Clock,
    AlertTriangle,
    TrendingUp,
    Loader2,
    FileText,
    ListChecks,
    Bell,
    CalendarDays,
    CheckCircle,
    XCircle,
    Edit,
    Trash2,
    Filter,
    Download,
    Plus,
    X,
    ChevronRight,
    Shield,
    GraduationCap,
    Target,
    BarChart3,
    MessageSquare,
    UserCheck,
    UserX,
    RefreshCw,
    Send,
    BookOpen,
    FileSpreadsheet,
    Calendar,
    MoreVertical,
    ExternalLink,
    BellRing,
    CheckCheck,
    Clock3,
    AlertCircle,
    PieChart,
    Trophy,
    Crown,
    Award,
    Star,
    TrendingDown,
    UserCog,
    UserMinus,
    UserCheck as UserCheckIcon,
    MailCheck,
    MailWarning,
    MailOpen
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
    const [progressData, setProgressData] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const [departmentStats, setDepartmentStats] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');

    // Modal states
    const [isAddMenteeModalOpen, setIsAddMenteeModalOpen] = useState(false);
    const [isAssignModuleModalOpen, setIsAssignModuleModalOpen] = useState(false);
    const [isSendNotificationModalOpen, setIsSendNotificationModalOpen] = useState(false);
    const [isViewDetailsModalOpen, setIsViewDetailsModalOpen] = useState(false);
    const [isMassActionModalOpen, setIsMassActionModalOpen] = useState(false);
    const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);
    const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] = useState(false);
    const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);

    // Selected items
    const [selectedMentee, setSelectedMentee] = useState(null);
    const [selectedMenteeProgress, setSelectedMenteeProgress] = useState([]);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [selectedMentees, setSelectedMentees] = useState([]);
    const [menteeToRemove, setMenteeToRemove] = useState(null);

    // Form states
    const [newMenteeForm, setNewMenteeForm] = useState({
        mentee_id: '',
        auto_assign: true
    });

    const [searchQuery, setSearchQuery] = useState('');

    const [moduleAssignmentForm, setModuleAssignmentForm] = useState({
        mentee_ids: [],
        module_type: 'all',
        department: '',
        include_core: true,
        include_department: true
    });

    const [notificationForm, setNotificationForm] = useState({
        recipient_id: 0,
        recipient_name: '',
        recipient_email: '',
        notification_type: 'progress_reminder',
        title: '',
        message: '',
        send_email: true
    });

    const [reportForm, setReportForm] = useState({
        report_type: 'progress_summary',
        department: 'all',
        date_from: '',
        date_to: '',
        include_details: true,
        format: 'pdf'
    });

    const [bulkAssignForm, setBulkAssignForm] = useState({
        mentee_ids: [],
        module_ids: [],
        auto_start: false
    });

    // Departments list
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

            // Fetch all users to populate dropdown
            const usersResponse = await fetch(`${BASE_URL}/users/?role=mentee`, { headers });
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setAllUsers(usersData.users || []);
            }

            // Fetch statistics
            const statsResponse = await fetch(`${BASE_URL}/onboarding/modules/statistics/`, { headers });
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStatistics(statsData);
                
                // Calculate additional statistics
                if (statsData.total_mentees > 0) {
                    const behindCount = Math.round((statsData.behind_schedule_percentage / 100) * statsData.total_mentees);
                    setStatistics(prev => ({
                        ...statsData,
                        mentees_behind_schedule: behindCount
                    }));
                }
            }

            // Fetch mentees summary
            const menteesResponse = await fetch(`${BASE_URL}/onboarding/progress/all-summary/`, { headers });
            if (menteesResponse.ok) {
                const data = await menteesResponse.json();
                const menteesData = data.mentees || [];
                setMenteesSummary(menteesData);

                // Calculate department stats
                calculateDepartmentStats(menteesData);

                // Calculate top performing mentees
                calculateTopMentees(menteesData);
            }

            // Fetch modules
            const modulesResponse = await fetch(`${BASE_URL}/onboarding/modules/`, { headers });
            if (modulesResponse.ok) {
                setModules(await modulesResponse.json());
            }

            // Fetch progress data
            const progressResponse = await fetch(`${BASE_URL}/onboarding/progress/`, { headers });
            if (progressResponse.ok) {
                setProgressData(await progressResponse.json());
            }

            // Fetch notifications
            const notificationsResponse = await fetch(`${BASE_URL}/onboarding/notifications/`, { headers });
            if (notificationsResponse.ok) {
                const data = await notificationsResponse.json();
                setNotifications(data.notifications || []);
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
                            
                            if (daysSinceAssigned >= 3) { // Show if not started for 3+ days
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
                                    mentee_department: mentee.department,
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

    const calculateDepartmentStats = (mentees) => {
        const stats = [];

        departments.forEach(dept => {
            const deptMentees = mentees.filter(m => m.department === dept);
            const totalMentees = deptMentees.length;

            if (totalMentees > 0) {
                const activeMentees = deptMentees.filter(m => m.total_modules > 0).length;
                const avgProgress = deptMentees.reduce((sum, m) => sum + m.overall_progress_percentage, 0) / totalMentees;
                const completed = deptMentees.filter(m => m.overall_progress_percentage === 100).length;
                const completionRate = (completed / totalMentees) * 100;

                stats.push({
                    department: dept,
                    total_mentees: totalMentees,
                    active_mentees: activeMentees,
                    avg_progress: avgProgress,
                    completion_rate: completionRate
                });
            }
        });

        // Sort by average progress descending
        stats.sort((a, b) => b.avg_progress - a.avg_progress);
        setDepartmentStats(stats);
    };

    const calculateTopMentees = (mentees) => {
        // Filter mentees with progress and sort by overall progress
        const menteesWithProgress = mentees.filter(m => m.total_modules > 0);
        const sortedMentees = [...menteesWithProgress].sort((a, b) => 
            b.overall_progress_percentage - a.overall_progress_percentage
        );
        
        return sortedMentees.slice(0, 3); // Top 3
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
            
            // In a real implementation, you would have an endpoint to remove mentee
            // For now, we'll simulate by removing from local state
            setMenteesSummary(prev => prev.filter(m => m.id !== menteeToRemove));
            
            // Also remove their progress records
            setProgressData(prev => prev.filter(p => p.mentee !== menteeToRemove));
            
            alert("Mentee removed from onboarding successfully!");
            setIsConfirmRemoveModalOpen(false);
            setMenteeToRemove(null);
            
        } catch (error) {
            alert(error.message || "Failed to remove mentee");
        }
    };

    // Assign modules to mentees
    const assignModulesToMentees = async () => {
        try {
            const token = getAuthToken();

            if (moduleAssignmentForm.mentee_ids.length === 0) {
                alert("Please select at least one mentee");
                return;
            }

            // Get modules to assign
            const modulesToAssign = await getModulesForAssignment();

            if (modulesToAssign.length === 0) {
                alert("No modules found matching your criteria");
                return;
            }

            // Assign each module to selected mentees
            let assignedCount = 0;
            for (const module of modulesToAssign) {
                const response = await fetch(`${BASE_URL}/onboarding/modules/${module.id}/assign/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ mentee_ids: moduleAssignmentForm.mentee_ids })
                });

                if (response.ok) {
                    assignedCount++;
                }
            }

            alert(`Successfully assigned ${assignedCount} modules to ${moduleAssignmentForm.mentee_ids.length} mentees`);
            setIsAssignModuleModalOpen(false);
            resetModuleAssignmentForm();
            fetchAllData();

        } catch (error) {
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

    // Send notifications
    const sendNotification = async () => {
        try {
            const token = getAuthToken();

            if (!notificationForm.recipient_id) {
                alert("Please select a recipient");
                return;
            }

            if (!notificationForm.title || !notificationForm.message) {
                alert("Please enter title and message");
                return;
            }

            const response = await fetch(`${BASE_URL}/onboarding/reminder/send/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipient_id: notificationForm.recipient_id,
                    notification_type: notificationForm.notification_type,
                    title: notificationForm.title,
                    message: notificationForm.message
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send notification');
            }

            alert("Notification sent successfully!");
            setIsSendNotificationModalOpen(false);
            resetNotificationForm();
            fetchAllData();

        } catch (error) {
            alert(error.message || "Failed to send notification");
        }
    };

    // Mark notifications as read
    const markNotificationsAsRead = async (notificationIds) => {
        try {
            const token = getAuthToken();

            for (const id of notificationIds) {
                await fetch(`${BASE_URL}/onboarding/notifications/${id}/read/`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            setSelectedNotifications([]);
            fetchAllData();

        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    // Clear notifications from database
    const clearNotifications = async () => {
        try {
            const token = getAuthToken();
            
            if (selectedNotifications.length === 0) {
                alert("Please select notifications to clear");
                return;
            }

            if (!confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)? This action cannot be undone.`)) {
                return;
            }

            // In a real implementation, you would have a bulk delete endpoint
            // For now, we'll simulate by removing from state
            setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
            setSelectedNotifications([]);
            
            alert("Notifications cleared successfully!");
            
        } catch (error) {
            alert(error.message || "Failed to clear notifications");
        }
    };

    // Bulk assign modules
    const bulkAssignModules = async () => {
        try {
            const token = getAuthToken();

            if (bulkAssignForm.mentee_ids.length === 0) {
                alert("Please select at least one mentee");
                return;
            }

            if (bulkAssignForm.module_ids.length === 0) {
                alert("Please select at least one module");
                return;
            }

            let assignedCount = 0;
            for (const moduleId of bulkAssignForm.module_ids) {
                const response = await fetch(`${BASE_URL}/onboarding/modules/${moduleId}/assign/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ mentee_ids: bulkAssignForm.mentee_ids })
                });

                if (response.ok) {
                    assignedCount++;
                }
            }

            alert(`Successfully assigned ${assignedCount} modules to ${bulkAssignForm.mentee_ids.length} mentees`);
            setIsBulkAssignModalOpen(false);
            setBulkAssignForm({
                mentee_ids: [],
                module_ids: [],
                auto_start: false
            });
            fetchAllData();

        } catch (error) {
            alert(error.message || "Failed to assign modules");
        }
    };

    // Mass actions on mentees
    const performMassAction = async (action) => {
        try {
            const token = getAuthToken();

            if (selectedMentees.length === 0) {
                alert("Please select at least one mentee");
                return;
            }

            let successCount = 0;

            switch (action) {
                case 'auto_assign':
                    for (const menteeId of selectedMentees) {
                        const response = await fetch(`${BASE_URL}/onboarding/progress/auto-assign/`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ mentee_id: menteeId })
                        });

                        if (response.ok) successCount++;
                    }
                    alert(`Auto-assigned modules to ${successCount} mentees`);
                    break;

                case 'send_reminder':
                    // Send reminder to all selected mentees
                    const reminderTitle = "Onboarding Progress Reminder";
                    const reminderMessage = "This is a reminder about your onboarding progress. Please complete your pending modules.";

                    for (const menteeId of selectedMentees) {
                        const response = await fetch(`${BASE_URL}/onboarding/reminder/send/`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                recipient_id: menteeId,
                                notification_type: 'progress_reminder',
                                title: reminderTitle,
                                message: reminderMessage
                            })
                        });

                        if (response.ok) successCount++;
                    }
                    alert(`Reminders sent to ${successCount} mentees`);
                    break;
            }

            setSelectedMentees([]);
            setIsMassActionModalOpen(false);
            fetchAllData();

        } catch (error) {
            alert(error.message || "Failed to perform mass action");
        }
    };

    // Generate report
    const generateReport = async () => {
        try {
            const token = getAuthToken();
            
            // Create report data
            const reportData = {
                type: reportForm.report_type,
                department: reportForm.department,
                date_range: reportForm.date_from && reportForm.date_to
                    ? `${reportForm.date_from} to ${reportForm.date_to}`
                    : 'All time',
                generated_at: new Date().toISOString(),
                statistics: statistics,
                department_stats: departmentStats,
                top_mentees: calculateTopMentees(menteesSummary),
                deadlines: upcomingDeadlines,
                notifications_summary: {
                    total: notifications.length,
                    unread: notifications.filter(n => !n.is_read).length,
                    sent_last_week: notifications.filter(n => {
                        const sentDate = new Date(n.sent_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return sentDate > weekAgo;
                    }).length
                }
            };

            // Create and download JSON file
            const dataStr = JSON.stringify(reportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

            const exportFileDefaultName = `onboarding_report_${new Date().toISOString().split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();

            alert("Report generated successfully!");
            setIsGenerateReportModalOpen(false);
            resetReportForm();

        } catch (error) {
            alert(error.message || "Failed to generate report");
        }
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
            mentee.full_name.toLowerCase().includes(searchLower) ||
            mentee.email.toLowerCase().includes(searchLower) ||
            mentee.department.toLowerCase().includes(searchLower);

        const matchesDepartment = departmentFilter === 'all' || mentee.department === departmentFilter;

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
            deadline.mentee_name.toLowerCase().includes(searchLower) ||
            deadline.module_title.toLowerCase().includes(searchLower) ||
            deadline.mentee_department.toLowerCase().includes(searchLower)
        );
    });

    const filteredNotifications = notifications.filter(notification => {
        const searchLower = searchTerm.toLowerCase();
        return (
            notification.title.toLowerCase().includes(searchLower) ||
            notification.message.toLowerCase().includes(searchLower) ||
            (notification.recipient_name || '').toLowerCase().includes(searchLower)
        );
    });

    // Filter users for dropdown
    const filteredUsers = allUsers.filter(user => {
        const searchLower = searchQuery.toLowerCase();
        return (
            user.full_name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.department.toLowerCase().includes(searchLower) ||
            user.work_mail_address.toLowerCase().includes(searchLower)
        );
    }).filter(user => 
        !menteesSummary.some(mentee => mentee.id === user.id)
    );

    // Reset form functions
    const resetNewMenteeForm = () => {
        setNewMenteeForm({
            mentee_id: '',
            auto_assign: true
        });
        setSearchQuery('');
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

    const resetNotificationForm = () => {
        setNotificationForm({
            recipient_id: 0,
            recipient_name: '',
            recipient_email: '',
            notification_type: 'progress_reminder',
            title: '',
            message: '',
            send_email: true
        });
    };

    const resetReportForm = () => {
        setReportForm({
            report_type: 'progress_summary',
            department: 'all',
            date_from: '',
            date_to: '',
            include_details: true,
            format: 'pdf'
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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
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

    const toggleNotificationSelection = (notificationId) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const toggleAllNotificationsSelection = () => {
        if (selectedNotifications.length === filteredNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(filteredNotifications.map(n => n.id));
        }
    };

    // Handle notification recipient selection
    const handleRecipientSelect = (mentee) => {
        setNotificationForm({
            ...notificationForm,
            recipient_id: mentee.id,
            recipient_name: mentee.full_name,
            recipient_email: mentee.email
        });
    };

    useEffect(() => {
        fetchAllData();
    }, []);

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

    const topMentees = calculateTopMentees(menteesSummary);

    // Modals need to be implemented - I'll show the structure for the main modals

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
                        <p className="text-gray-600">Manage onboarding for new hires across departments</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setIsGenerateReportModalOpen(true)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FileSpreadsheet className="size-4" />
                        Generate Report
                    </button>
                    <button
                        onClick={() => setIsSendNotificationModalOpen(true)}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Send className="size-4" />
                        Send Notification
                    </button>
                    <button
                        onClick={() => setIsAddMenteeModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <UserPlus className="size-4" />
                        Add New Hire
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total New Hires</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{statistics.total_mentees}</h3>
                                </div>
                                <Users className="size-8 text-blue-500" />
                            </div>
                            <div className="mt-2">
                                <p className="text-xs text-gray-600">
                                    {statistics.mentees_with_modules} with assigned modules
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Overall Completion</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{statistics.completion_rate}%</h3>
                                </div>
                                <Target className="size-8 text-green-500" />
                            </div>
                            <div className="mt-2">
                                <p className="text-xs text-gray-600">
                                    {statistics.completed_records}/{statistics.total_progress_records} modules
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{statistics.average_mentee_progress}%</h3>
                                </div>
                                <TrendingUp className="size-8 text-amber-500" />
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-amber-500 h-2 rounded-full" 
                                        style={{ width: `${statistics.average_mentee_progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Behind Schedule</p>
                                    <h3 className="text-2xl font-bold text-red-600">{statistics.mentees_behind_schedule}</h3>
                                </div>
                                <AlertTriangle className="size-8 text-red-500" />
                            </div>
                            <div className="mt-2">
                                <p className="text-xs text-gray-600">
                                    {statistics.behind_schedule_percentage}% of all mentees
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Modules</p>
                                <h3 className="text-xl font-bold text-gray-900">{modules.filter(m => m.is_active).length}</h3>
                            </div>
                            <BookOpen className="size-6 text-purple-500" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            {modules.filter(m => m.module_type === 'core').length} core modules
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {notifications.filter(n => !n.is_read).length}
                                </h3>
                            </div>
                            <Bell className="size-6 text-amber-500" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Total: {notifications.length}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Inactive Modules</p>
                                <h3 className="text-xl font-bold text-yellow-600">
                                    {upcomingDeadlines.filter(d => d.days_since_assigned >= 7).length}
                                </h3>
                            </div>
                            <Clock className="size-6 text-yellow-500" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Not started for 7+ days
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                                <h3 className="text-xl font-bold text-green-600">
                                    {topMentees.length > 0 ? `${topMentees[0].overall_progress_percentage}%` : 'N/A'}
                                </h3>
                            </div>
                            <Trophy className="size-6 text-green-500" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            {topMentees.length > 0 ? topMentees[0].full_name : 'No data'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full">
                <div className="grid grid-cols-4 mb-8 border-b">
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
                            <Users className="size-4" />
                            New Hires ({menteesSummary.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('deadlines')}
                        className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'deadlines' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <CalendarDays className="size-4" />
                            Inactive Modules ({upcomingDeadlines.length})
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`px-4 py-2 font-medium border-b-2 ${activeTab === 'notifications' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Bell className="size-4" />
                            Notifications ({notifications.length})
                        </div>
                    </button>
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Top Performing Mentees */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                <div className="p-6">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <Trophy className="size-5 text-amber-500" />
                                            Top Performing New Hires
                                        </h2>
                                        <p className="text-gray-600">Mentees with highest onboarding progress</p>
                                    </div>
                                    <div className="space-y-4">
                                        {topMentees.length === 0 ? (
                                            <div className="text-center py-4">
                                                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-500">No mentees with progress data</p>
                                            </div>
                                        ) : (
                                            topMentees.map((mentee, index) => (
                                                <div key={mentee.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                                                    <div className="flex-shrink-0">
                                                        {index === 0 && <Crown className="size-5 text-yellow-500" />}
                                                        {index === 1 && <Award className="size-5 text-gray-400" />}
                                                        {index === 2 && <Star className="size-5 text-amber-600" />}
                                                    </div>
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium">
                                                        {mentee.full_name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-900 truncate">{mentee.full_name}</h4>
                                                        <p className="text-xs text-gray-600 truncate">{mentee.department}</p>
                                                    </div>
                                                    <div className="flex-shrink-0 text-right">
                                                        <div className="text-lg font-bold text-green-600">
                                                            {mentee.overall_progress_percentage}%
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {mentee.completed_modules}/{mentee.total_modules} modules
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Department Performance */}
                            <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                <div className="p-6">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Department Performance</h2>
                                        <p className="text-gray-600">Onboarding progress by department</p>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900">New Hires</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900">Active</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Progress</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900">Completion</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {departmentStats.map((dept) => (
                                                    <tr key={dept.department} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4 font-medium">{dept.department}</td>
                                                        <td className="py-3 px-4">{dept.total_mentees}</td>
                                                        <td className="py-3 px-4">{dept.active_mentees}</td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                    <div 
                                                                        className="bg-blue-500 h-2 rounded-full" 
                                                                        style={{ width: `${dept.avg_progress}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-sm">{dept.avg_progress.toFixed(1)}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">{dept.completion_rate.toFixed(1)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Notifications */}
                            <div className="lg:col-span-3 bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                <div className="p-6">
                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Recent Notifications</h2>
                                        <p className="text-gray-600">Latest onboarding notifications sent</p>
                                    </div>
                                    <div className="space-y-4">
                                        {notifications.slice(0, 5).map((notification) => (
                                            <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                                <div className={`w-2 h-2 mt-2 rounded-full ${notification.is_read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-900 truncate">{notification.title}</p>
                                                            <p className="text-xs text-gray-600 truncate">{notification.message}</p>
                                                        </div>
                                                        <span className="px-2 py-1 text-xs border rounded-full">
                                                            {notification.notification_type.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-xs text-gray-500">
                                                            To: {notification.recipient_name || 'Multiple'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDateTime(notification.sent_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mentees Tab */}
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
                                            {departments.map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
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
                                                <CheckCheck className="size-4 text-blue-600" />
                                                <span className="font-medium text-blue-800">
                                                    {selectedMentees.length} new hires selected
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="relative">
                                                    <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                                                        <MoreVertical className="size-4" />
                                                        Actions
                                                    </button>
                                                    <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-10 hidden">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => setIsAssignModuleModalOpen(true)}
                                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                                            >
                                                                <BookOpen className="size-4" />
                                                                Assign Modules
                                                            </button>
                                                            <button
                                                                onClick={() => setIsBulkAssignModalOpen(true)}
                                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                                            >
                                                                <ListChecks className="size-4" />
                                                                Bulk Assign Modules
                                                            </button>
                                                            <button
                                                                onClick={() => performMassAction('auto_assign')}
                                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                                            >
                                                                <RefreshCw className="size-4" />
                                                                Auto-assign Modules
                                                            </button>
                                                            <button
                                                                onClick={() => performMassAction('send_reminder')}
                                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                                            >
                                                                <Send className="size-4" />
                                                                Send Reminder
                                                            </button>
                                                            <hr className="my-1" />
                                                            <button
                                                                onClick={() => {
                                                                    if (selectedMentees.length === 1) {
                                                                        setMenteeToRemove(selectedMentees[0]);
                                                                        setIsConfirmRemoveModalOpen(true);
                                                                    } else {
                                                                        alert("Please select only one mentee to remove");
                                                                    }
                                                                }}
                                                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                                                            >
                                                                <UserMinus className="size-4" />
                                                                Remove from Onboarding
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
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
                                                                {mentee.department}
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
                                                            <div className="relative">
                                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </button>
                                                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 hidden">
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
                                                                                handleRecipientSelect(mentee);
                                                                                setIsSendNotificationModalOpen(true);
                                                                            }}
                                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                                                                        >
                                                                            <Send className="h-4 w-4" />
                                                                            Send Message
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const progress = progressData.find(p => p.mentee === mentee.id);
                                                                                if (progress) {
                                                                                    setSelectedMentees([mentee.id]);
                                                                                    setIsAssignModuleModalOpen(true);
                                                                                } else {
                                                                                    alert("No modules assigned yet");
                                                                                }
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

                {/* Deadlines Tab (Renamed to Inactive Modules) */}
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
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Assigned On</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Days Inactive</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Progress</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Status</th>
                                                    <th className="py-3 px-4 text-right font-medium text-gray-900">Actions</th>
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
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        const mentee = menteesSummary.find(m => m.id === deadline.mentee_id);
                                                                        if (mentee) {
                                                                            handleRecipientSelect(mentee);
                                                                            setIsSendNotificationModalOpen(true);
                                                                        }
                                                                    }}
                                                                    className="p-1 hover:bg-gray-100 rounded"
                                                                >
                                                                    <Send className="size-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const mentee = menteesSummary.find(m => m.id === deadline.mentee_id);
                                                                        if (mentee) viewMenteeDetails(mentee);
                                                                    }}
                                                                    className="p-1 hover:bg-gray-100 rounded"
                                                                >
                                                                    <Eye className="size-4" />
                                                                </button>
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

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        {/* Notification Actions */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="relative max-w-md">
                                            <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                placeholder="Search notifications..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedNotifications.length > 0 && (
                                            <>
                                                <button
                                                    onClick={() => markNotificationsAsRead(selectedNotifications)}
                                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
                                                >
                                                    <CheckCheck className="size-4" />
                                                    Mark as Read
                                                </button>
                                                <button
                                                    onClick={clearNotifications}
                                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm"
                                                >
                                                    <Trash2 className="size-4" />
                                                    Clear Selected
                                                </button>
                                                <button
                                                    onClick={() => setSelectedNotifications([])}
                                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
                                                >
                                                    <X className="size-4" />
                                                    Clear Selection
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => setIsSendNotificationModalOpen(true)}
                                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
                                        >
                                            <Send className="size-4" />
                                            Send New
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-900">Notifications ({filteredNotifications.length})</h2>
                                <p className="text-gray-600">View and manage all onboarding notifications</p>
                            </div>
                            <div className="p-0">
                                {filteredNotifications.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                                        <p className="text-gray-500">Try adjusting your search or send new notifications</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-gray-50">
                                                    <th className="py-3 px-4 text-left w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedNotifications.length === filteredNotifications.length}
                                                            onChange={toggleAllNotificationsSelection}
                                                            className="rounded"
                                                        />
                                                    </th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Title</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Type</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Recipient</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Sent At</th>
                                                    <th className="py-3 px-4 text-left font-medium text-gray-900">Status</th>
                                                    <th className="py-3 px-4 text-right font-medium text-gray-900">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredNotifications.map((notification) => (
                                                    <tr key={notification.id} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedNotifications.includes(notification.id)}
                                                                onChange={() => toggleNotificationSelection(notification.id)}
                                                                className="rounded"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div>
                                                                <p className="font-medium">{notification.title}</p>
                                                                <p className="text-xs text-gray-600 truncate max-w-xs">
                                                                    {notification.message}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2 py-1 text-xs border rounded-full">
                                                                {notification.notification_type.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {notification.recipient_name ? (
                                                                <div>
                                                                    <p className="text-sm">{notification.recipient_name}</p>
                                                                    <p className="text-xs text-gray-600">{notification.recipient_email}</p>
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-500">Multiple recipients</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="text-sm">
                                                                {formatDateTime(notification.sent_at)}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {notification.is_read ? (
                                                                <span className="px-2 py-1 text-xs border rounded-full text-green-600 flex items-center gap-1 w-fit">
                                                                    <MailOpen className="size-3" />
                                                                    Read
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full flex items-center gap-1 w-fit">
                                                                    <MailWarning className="size-3" />
                                                                    Unread
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => markNotificationsAsRead([notification.id])}
                                                                    className="p-1 hover:bg-gray-100 rounded"
                                                                >
                                                                    <CheckCheck className="size-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedNotifications([notification.id]);
                                                                        if (confirm("Are you sure you want to delete this notification?")) {
                                                                            clearNotifications();
                                                                        }
                                                                    }}
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
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals would be implemented here with conditional rendering */}
            {isAddMenteeModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Add New Hire to Onboarding</h2>
                            <p className="text-gray-600">Select an existing mentee to add to the onboarding program</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Add Mentee Form Content */}
                        </div>
                        <div className="p-6 border-t flex justify-end gap-2">
                            <button
                                onClick={() => setIsAddMenteeModalOpen(false)}
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

            {/* Similar modals would be implemented for other modal states */}
        </div>
    );
}