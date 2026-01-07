// utils/mentorshipUtils.ts
import { Mentorship } from '../components/types/mentorship';

export const calculateMentorshipStats = (mentorships: Mentorship[] = []) => {
  // Ensure mentorships is always an array
  if (!mentorships || !Array.isArray(mentorships)) {
    return {
      totalMentorships: 0,
      activeMentorships: 0,
      completedMentorships: 0,
      pendingMentorships: 0,
      cancelledMentorships: 0,
      averageProgress: 0,
      departmentStats: []
    };
  }

  const totalMentorships = mentorships.length;
  const activeMentorships = mentorships.filter(m => m?.status === 'active').length;
  const completedMentorships = mentorships.filter(m => m?.status === 'completed').length;
  const pendingMentorships = mentorships.filter(m => m?.status === 'pending').length;
  const cancelledMentorships = mentorships.filter(m => m?.status === 'cancelled').length;
  
  // Safely calculate progress
  const totalProgress = mentorships.reduce((sum, m) => {
    const progress = m?.progress_percentage || 0;
    return sum + progress;
  }, 0);
  
  const averageProgress = totalMentorships > 0 ? totalProgress / totalMentorships : 0;
  
  // Group by department with safety checks
  const departmentStats = Object.entries(
    mentorships.reduce((acc, m) => {
      if (!m) return acc;
      
      const mentorDept = m.mentor?.department;
      const programDept = m.program?.department;
      const dept = mentorDept || programDept || 'Unassigned';
      
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([department, count]) => ({
    department,
    count,
    active: mentorships.filter(m => {
      if (!m) return false;
      const mentorDept = m.mentor?.department;
      const programDept = m.program?.department;
      return (mentorDept === department || programDept === department) && 
             m.status === 'active';
    }).length
  }));

  return {
    totalMentorships,
    activeMentorships,
    completedMentorships,
    pendingMentorships,
    cancelledMentorships,
    averageProgress,
    departmentStats
  };
};

export const filterMentorships = (mentorships: Mentorship[] = [], filters: any) => {
  // Ensure mentorships is always an array
  if (!mentorships || !Array.isArray(mentorships)) {
    return [];
  }

  return mentorships.filter(mentorship => {
    if (!mentorship) return false;
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const mentorName = mentorship.mentor?.full_name?.toLowerCase() || '';
      const menteeName = mentorship.mentee?.full_name?.toLowerCase() || '';
      const programName = mentorship.program?.name?.toLowerCase() || '';
      
      const searchMatch = 
        mentorName.includes(searchLower) ||
        menteeName.includes(searchLower) ||
        programName.includes(searchLower);
      
      if (!searchMatch) return false;
    }
    
    // Status filter
    if (filters.status !== 'all' && mentorship.status !== filters.status) {
      return false;
    }
    
    // Program filter
    if (filters.program !== 'all' && mentorship.program?.id !== filters.program) {
      return false;
    }
    
    // Department filter
    if (filters.department !== 'all') {
      const mentorDept = mentorship.mentor?.department || '';
      const programDept = mentorship.program?.department || '';
      if (!mentorDept.includes(filters.department) && !programDept.includes(filters.department)) {
        return false;
      }
    }
    
    // Mentor filter
    if (filters.mentor !== 'all' && mentorship.mentor?.id !== filters.mentor) {
      return false;
    }
    
    // Mentee filter
    if (filters.mentee !== 'all' && mentorship.mentee?.id !== filters.mentee) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      try {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        const mentorshipDate = new Date(mentorship.start_date || '');
        
        if (mentorshipDate < startDate || mentorshipDate > endDate) {
          return false;
        }
      } catch (error) {
        console.warn('Error parsing dates:', error);
      }
    }
    
    return true;
  });
};

export const sortMentorships = (mentorships: Mentorship[] = [], sortBy: string, sortOrder: 'asc' | 'desc') => {
  // Ensure mentorships is always an array
  if (!mentorships || !Array.isArray(mentorships)) {
    return [];
  }

  return [...mentorships].sort((a, b) => {
    if (!a || !b) return 0;
    
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'mentor':
        aValue = a.mentor?.full_name || '';
        bValue = b.mentor?.full_name || '';
        break;
      case 'mentee':
        aValue = a.mentee?.full_name || '';
        bValue = b.mentee?.full_name || '';
        break;
      case 'program':
        aValue = a.program?.name || '';
        bValue = b.program?.name || '';
        break;
      case 'status':
        aValue = a.status || '';
        bValue = b.status || '';
        break;
      case 'progress':
        aValue = a.progress_percentage || 0;
        bValue = b.progress_percentage || 0;
        break;
      case 'start_date':
        aValue = new Date(a.start_date || '');
        bValue = new Date(b.start_date || '');
        break;
      case 'created_at':
        aValue = new Date(a.created_at || '');
        bValue = new Date(b.created_at || '');
        break;
      default:
        aValue = a.created_at || '';
        bValue = b.created_at || '';
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    return sortOrder === 'asc'
      ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
      : (aValue > bValue ? -1 : aValue < bValue ? 1 : 0);
  });
};

export const getStatusBadgeProps = (status: string) => {
  switch (status) {
    case 'active':
      return { className: 'bg-green-100 text-green-700' };
    case 'completed':
      return { className: 'bg-blue-100 text-blue-700' };
    case 'pending':
      return { className: 'bg-yellow-100 text-yellow-700' };
    case 'paused':
      return { className: 'bg-orange-100 text-orange-700' };
    case 'cancelled':
      return { className: 'bg-red-100 text-red-700' };
    default:
      return { className: 'bg-gray-100 text-gray-700' };
  }
};

export const getStatusText = (status: string) => {
  if (!status) return 'Unknown';
  
  switch (status.toLowerCase()) {
    case 'active': return 'Active';
    case 'completed': return 'Completed';
    case 'pending': return 'Pending';
    case 'paused': return 'Paused';
    case 'cancelled': return 'Cancelled';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const formatDate = (dateString: string | undefined, includeTime = false) => {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    if (includeTime) {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const getProgressColor = (percentage: number | undefined) => {
  const percent = percentage || 0;
  
  if (percent >= 80) return 'bg-green-500';
  if (percent >= 50) return 'bg-blue-500';
  if (percent >= 30) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const formatDuration = (minutes: number | undefined) => {
  const mins = minutes || 0;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMins}m`;
  }
  return `${remainingMins}m`;
};

// Helper function to safely extract data from API response
export const extractDataFromResponse = (response: any): Mentorship[] => {
  if (!response) return [];
  
  // Handle different response structures
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  if (response.success && Array.isArray(response.data)) {
    return response.data;
  }
  
  return [];
};