// utils/programUtils.ts
import { MentorshipProgram } from '../components/types/mentorship';

export interface ProgramStats {
  totalPrograms: number;
  activePrograms: number;
  inactivePrograms: number;
  archivedPrograms: number;
  totalMentorships: number;
  averageSessions: number;
  averageDuration: number;
  departmentStats: {
    department: string;
    count: number;
    activeMentorships: number;
    completionRate: number;
  }[];
}

export const calculateProgramStats = (programs: MentorshipProgram[] = []): ProgramStats => {
  // Ensure programs is always an array
  const programsArray = Array.isArray(programs) ? programs : [];
  
  const stats: ProgramStats = {
    totalPrograms: programsArray.length,
    activePrograms: programsArray.filter(p => p?.status === 'active').length,
    inactivePrograms: programsArray.filter(p => p?.status === 'inactive').length,
    archivedPrograms: programsArray.filter(p => p?.status === 'archived').length,
    totalMentorships: programsArray.reduce((sum, p) => sum + (p?.active_mentorships || 0), 0),
    averageSessions: programsArray.length > 0 
      ? programsArray.reduce((sum, p) => sum + (p?.total_sessions || 0), 0) / programsArray.length 
      : 0,
    averageDuration: programsArray.length > 0 
      ? programsArray.reduce((sum, p) => sum + (p?.total_days || 0), 0) / programsArray.length 
      : 0,
    departmentStats: [],
  };

  // Calculate department stats
  const departmentMap = new Map<string, {
    count: number;
    totalMentorships: number;
    totalCompletion: number;
    programCount: number;
  }>();

  programsArray.forEach(program => {
    if (!program) return;
    
    const dept = program.department || 'Unassigned';
    const current = departmentMap.get(dept) || {
      count: 0,
      totalMentorships: 0,
      totalCompletion: 0,
      programCount: 0
    };

    current.programCount++;
    current.totalMentorships += program.active_mentorships || 0;
    current.totalCompletion += program.completion_rate || 0;
    current.count += program.active_mentorships || 0;

    departmentMap.set(dept, current);
  });

  stats.departmentStats = Array.from(departmentMap.entries()).map(([department, data]) => ({
    department,
    count: data.programCount,
    activeMentorships: data.totalMentorships,
    completionRate: data.programCount > 0 ? data.totalCompletion / data.programCount : 0
  }));

  return stats;
};

export const filterPrograms = (
  programs: MentorshipProgram[] = [],
  filters: {
    search: string;
    status: string;
    department: string;
    hasSessions: boolean;
    minSessions: number;
    maxSessions: number;
  }
): MentorshipProgram[] => {
  // Ensure programs is always an array
  const programsArray = Array.isArray(programs) ? programs : [];
  
  return programsArray.filter(program => {
    if (!program) return false;
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const name = program.name?.toLowerCase() || '';
      const description = program.description?.toLowerCase() || '';
      const department = program.department?.toLowerCase() || '';
      
      const matchesSearch = 
        name.includes(searchLower) ||
        description.includes(searchLower) ||
        department.includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== 'all' && program.status !== filters.status) {
      return false;
    }

    // Department filter
    if (filters.department !== 'all' && program.department !== filters.department) {
      return false;
    }

    // Has sessions filter
    if (filters.hasSessions && (!program.total_sessions || program.total_sessions === 0)) {
      return false;
    }

    // Session count range filter
    if (filters.minSessions > 0 && (program.total_sessions || 0) < filters.minSessions) {
      return false;
    }

    if (filters.maxSessions > 0 && (program.total_sessions || 0) > filters.maxSessions) {
      return false;
    }

    return true;
  });
};

export const sortPrograms = (
  programs: MentorshipProgram[] = [],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): MentorshipProgram[] => {
  // Ensure programs is always an array
  const programsArray = Array.isArray(programs) ? programs : [];
  
  return [...programsArray].sort((a, b) => {
    if (!a || !b) return 0;
    
    let valueA: any, valueB: any;

    switch (sortBy) {
      case 'name':
        valueA = a.name?.toLowerCase() || '';
        valueB = b.name?.toLowerCase() || '';
        break;
      case 'department':
        valueA = a.department?.toLowerCase() || '';
        valueB = b.department?.toLowerCase() || '';
        break;
      case 'sessions':
        valueA = a.total_sessions || 0;
        valueB = b.total_sessions || 0;
        break;
      case 'duration':
        valueA = a.total_days || 0;
        valueB = b.total_days || 0;
        break;
      case 'mentorships':
        valueA = a.active_mentorships || 0;
        valueB = b.active_mentorships || 0;
        break;
      case 'completion':
        valueA = a.completion_rate || 0;
        valueB = b.completion_rate || 0;
        break;
      case 'rating':
        valueA = a.average_rating || 0;
        valueB = b.average_rating || 0;
        break;
      case 'status':
        const statusOrder = ['active', 'inactive', 'archived'];
        valueA = statusOrder.indexOf(a.status || '');
        valueB = statusOrder.indexOf(b.status || '');
        break;
      default:
        try {
          valueA = new Date(a.created_at || '').getTime();
          valueB = new Date(b.created_at || '').getTime();
        } catch {
          valueA = 0;
          valueB = 0;
        }
    }

    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
};

export const getStatusBadgeProps = (status: string = '') => {
  switch (status.toLowerCase()) {
    case 'active':
      return {
        className: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
        icon: 'CheckCircle',
        color: 'green'
      };
    case 'inactive':
      return {
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
        icon: 'PauseCircle',
        color: 'yellow'
      };
    case 'archived':
      return {
        className: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
        icon: 'Archive',
        color: 'gray'
      };
    default:
      return {
        className: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
        icon: 'HelpCircle',
        color: 'gray'
      };
  }
};

export const getStatusText = (status: string = ''): string => {
  const statusMap: Record<string, string> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'archived': 'Archived',
  };
  return statusMap[status.toLowerCase()] || status;
};

export const formatDuration = (days: number = 0): string => {
  if (!days || days < 1) return 'N/A';
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  if (remainingDays > 0) return `${months} months ${remainingDays} days`;
  return `${months} months`;
};

export const validateProgramData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data?.name?.trim()) {
    errors.push('Program name is required');
  }

  if (!data?.department) {
    errors.push('Department is required');
  }

  if (!data?.description?.trim()) {
    errors.push('Description is required');
  }

  if (!Array.isArray(data?.objectives) || data.objectives.length === 0) {
    errors.push('At least one objective is required');
  }

  if (!Array.isArray(data?.session_template_ids) || data.session_template_ids.length === 0) {
    errors.push('At least one session template is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const getProgramMetrics = (program: MentorshipProgram) => {
  if (!program) {
    return [
      { label: 'Sessions', value: 0, icon: 'Calendar', color: 'blue' },
      { label: 'Duration', value: '0 days', icon: 'Clock', color: 'purple' },
      { label: 'Active', value: 0, icon: 'Users', color: 'green' },
      { label: 'Completion', value: '0%', icon: 'Target', color: 'orange' },
      { label: 'Rating', value: '0.0', icon: 'Star', color: 'yellow' }
    ];
  }

  const metrics = [
    {
      label: 'Sessions',
      value: program.total_sessions || 0,
      icon: 'Calendar',
      color: 'blue'
    },
    {
      label: 'Duration',
      value: `${program.total_days || 0} days`,
      icon: 'Clock',
      color: 'purple'
    },
    {
      label: 'Active',
      value: program.active_mentorships || 0,
      icon: 'Users',
      color: 'green'
    },
    {
      label: 'Completion',
      value: `${program.completion_rate || 0}%`,
      icon: 'Target',
      color: 'orange'
    },
    {
      label: 'Rating',
      value: (program.average_rating || 0).toFixed(1),
      icon: 'Star',
      color: 'yellow'
    }
  ];

  return metrics;
};