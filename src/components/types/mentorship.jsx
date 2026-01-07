
// Base User Types
export interface UserBasic {
  id: string;
  phone_number?: string;
  email: string;
  work_mail_address?: string;
  full_name: string;
  role: 'admin' | 'mentor' | 'mentee' | 'hr';
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  availability_status?: 'active' | 'inactive' | 'busy' | 'away';
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  bio?: string;
  expertise: string[];
  experience_years?: number;
  education?: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  certifications?: string[];
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  skills: string[];
  interests: string[];
  created_at: string;
  updated_at: string;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  head_of_department?: UserBasic;
  total_programs: number;
  total_mentors: number;
  total_mentees: number;
  created_at: string;
  updated_at: string;
}

// Session Template Types
export interface SessionTemplate {
  id: string;
  title: string;
  session_type: 'video' | 'in_person' | 'phone' | 'chat' | 'workshop' | 'training' | 'assessment';
  description: string;
  objectives: string[];
  requirements: string[];
  duration_minutes: number;
  order: number;
  is_required: boolean;
  is_active: boolean;
  created_by?: UserBasic;
  created_at: string;
  updated_at: string;
}

export interface SessionTemplateCreateData {
  title: string;
  session_type: 'video' | 'in_person' | 'phone' | 'chat' | 'workshop' | 'training' | 'assessment';
  description: string;
  objectives: string[];
  requirements: string[];
  duration_minutes: number;
  order: number;
  is_required: boolean;
  is_active: boolean;
}

// Mentorship Program Types
export interface MentorshipProgram {
  id: string;
  name: string;
  description: string;
  department: string;
  status: 'active' | 'inactive' | 'archived';
  session_templates: SessionTemplate[];
  total_days: number;
  total_sessions: number;
  objectives: string[];
  prerequisites: string[];
  active_mentorships: number;
  completion_rate: number;
  average_rating: number;
  created_by: UserBasic;
  created_at: string;
  updated_at: string;
}

export interface ProgramCreateData {
  name: string;
  description: string;
  department: string;
  status: 'active' | 'inactive' | 'archived';
  session_template_ids: string[];
  objectives: string[];
  prerequisites: string[];
  category?: string;
  tags: string[];
  is_required?: boolean;
  estimated_hours?: number;
}

export interface ProgramUpdateData {
  name?: string;
  description?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'archived';
  session_template_ids?: string[];
  objectives?: string[];
  prerequisites?: string[];
  category?: string;
  tags?: string[];
  is_required?: boolean;
  estimated_hours?: number;
}

// Mentorship Types
export interface Mentorship {
  id: string;
  mentor: UserBasic;
  mentee: UserBasic;
  program: MentorshipProgram;
  status: 'pending' | 'active' | 'completed' | 'paused' | 'cancelled';
  start_date: string;
  expected_end_date?: string;
  actual_end_date?: string;
  sessions_completed: number;
  rating?: number;
  feedback?: string;
  goals: string[];
  achievements: string[];
  notes?: string;
  created_by?: UserBasic;
  created_at: string;
  updated_at: string;
  progress_percentage: number;
  remaining_sessions: number;
  duration_days: number;
  is_overdue: boolean;
  can_schedule: boolean;
}

export interface MentorshipCreateData {
  mentor_id: string;
  mentee_id: string;
  program_id: string;
  start_date: string;
  goals: string[];
  notes?: string;
  session_templates?: string[];
}

export interface MentorshipUpdateData {
  status?: 'pending' | 'active' | 'completed' | 'paused' | 'cancelled';
  goals?: string[];
  achievements?: string[];
  feedback?: string;
  rating?: number;
  notes?: string;
}

// Session Types
export interface MentorshipSession {
  id: string;
  mentorship: Mentorship;
  session_template: SessionTemplate;
  session_number: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  scheduled_date: string;
  actual_date?: string;
  duration_minutes: number;
  agenda: string;
  objectives: string[];
  requirements: string[];
  notes: string;
  action_items: string[];
  mentor_rating?: number;
  mentor_feedback?: string;
  mentee_feedback?: string;
  meeting_link?: string;
  location?: string;
  completed_by?: UserBasic;
  created_at: string;
  updated_at: string;
  is_upcoming: boolean;
  is_past_due: boolean;
}

export interface SessionCreateData {
  mentorship_id: string;
  session_template_id?: string;
  session_number: number;
  session_type?: 'video' | 'in_person' | 'phone' | 'chat' | 'workshop' | 'training' | 'assessment';
  scheduled_date: string;
  duration_minutes?: number;
  agenda?: string;
  meeting_link?: string;
  location?: string;
}

export interface SessionCompletionData {
  notes?: string;
  mentor_feedback?: string;
  mentee_feedback?: string;
  action_items?: string[];
  mentor_rating?: number;
}

// Message & Chat Types
export interface Message {
  id: string;
  chat_room_id: string;
  sender: UserBasic;
  message_type: 'text' | 'file' | 'image' | 'system';
  content: string;
  attachment?: string;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  read_at?: string;
  is_own_message?: boolean;
  formatted_time?: string;
}

export interface MessageCreateData {
  chat_room_id: string;
  message_type: 'text' | 'file' | 'image' | 'system';
  content: string;
  attachment?: File;
}

export interface ChatRoom {
  id: string;
  mentorship?: Mentorship;
  chat_type: 'mentor_mentee' | 'mentee_admin' | 'mentee_hr' | 'mentor_admin' | 'mentor_hr' | 'admin_hr';
  user1: UserBasic;
  user2: UserBasic;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count?: number;
}

// Group Chat Types
export interface GroupChatRoom {
  id: string;
  name: string;
  description: string;
  chat_type: 'one_on_one' | 'mentorship_group' | 'department_group' | 'cross_department';
  department?: string;
  mentorship?: Mentorship;
  created_by: UserBasic;
  participants: UserBasic[];
  is_active: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  participant_count: number;
  last_message?: GroupChatMessage;
  unread_count?: number;
  can_manage?: boolean;
}

export interface GroupChatMessage {
  id: string;
  chat_room: GroupChatRoom;
  sender: UserBasic;
  message_type: 'text' | 'file' | 'image' | 'system' | 'announcement';
  content: string;
  attachment?: string;
  is_edited: boolean;
  is_deleted: boolean;
  edited_at?: string;
  deleted_at?: string;
  reply_to?: GroupChatMessage;
  created_at: string;
  updated_at: string;
  is_own_message?: boolean;
  formatted_time?: string;
  read_by?: string[];
}

export interface GroupMessageCreateData {
  chat_room_id: string;
  message_type: 'text' | 'file' | 'image' | 'system' | 'announcement';
  content: string;
  attachment?: File;
  reply_to_id?: string;
}

// Notification Types
export interface Notification {
  id: string;
  recipient: UserBasic;
  sender?: UserBasic;
  notification_type: 'new_message' | 'case_assigned' | 'case_status_changed' | 
                    'module_assigned' | 'module_started' | 'module_completed' | 
                    'deadline_approaching' | 'status_changed' | 'needs_attention' | 
                    'off_track' | 'overdue';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  related_module_id?: string;
  related_mentorship_id?: string;
  related_session_id?: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  // User Stats
  total_users: number;
  total_mentors: number;
  total_mentees: number;
  total_admins: number;
  total_hr: number;
  
  // Mentorship Stats
  total_mentorships: number;
  active_mentorships: number;
  completed_mentorships: number;
  pending_mentorships: number;
  paused_mentorships: number;
  cancelled_mentorships: number;
  
  // Program Stats
  total_programs: number;
  active_programs: number;
  inactive_programs: number;
  archived_programs: number;
  
  // Session Stats
  total_sessions: number;
  upcoming_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  
  // Performance Stats
  average_progress: number;
  average_rating: number;
  completion_rate: number;
  
  // Communication Stats
  unread_messages: number;
  unread_notifications: number;
  total_messages: number;
  
  // Department Stats
  department_stats: Array<{
    department: string;
    mentors: number;
    mentees: number;
    active_mentorships: number;
    programs: number;
  }>;
  
  // Recent Activity
  recent_activity: Array<{
    id: string;
    type: 'mentorship_created' | 'session_scheduled' | 'program_created' | 
          'message_sent' | 'status_changed' | 'goal_completed';
    description: string;
    user: UserBasic;
    timestamp: string;
  }>;
}

// Onboarding Types
export interface OnboardingModule {
  id: string;
  title: string;
  description: string;
  module_type: 'core' | 'department';
  department?: string;
  order: number;
  is_required: boolean;
  duration_minutes: number;
  content: any[];
  resources: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: UserBasic;
  applicable_departments: string;
  total_mentees_assigned: number;
  total_completed: number;
  checklist_items: OnboardingChecklist[];
}

export interface OnboardingChecklist {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order: number;
  is_required: boolean;
  estimated_minutes: number;
}

export interface MenteeOnboardingProgress {
  id: string;
  mentee: UserBasic;
  module: OnboardingModule;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 
          'paused' | 'needs_attention' | 'off_track';
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  notes?: string;
  time_spent_minutes: number;
  last_updated: string;
  assigned_by?: UserBasic;
  assigned_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Filter Types
export interface MentorshipFilters {
  search?: string;
  status?: string;
  program?: string;
  department?: string;
  mentor?: string;
  mentee?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface ProgramFilters {
  search?: string;
  status?: string;
  department?: string;
  hasSessions?: boolean;
  minSessions?: number;
  maxSessions?: number;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface StatusChartData extends ChartDataPoint {
  status: string;
}

export interface DepartmentChartData {
  department: string;
  count: number;
  active: number;
}

// Form Types
export interface ProgramFormData {
  id?: string;
  name: string;
  description: string;
  department: string;
  status: 'active' | 'inactive' | 'archived';
  session_template_ids: string[];
  objectives: string[];
  prerequisites: string[];
  is_required?: boolean;
  estimated_hours?: number;
  category?: string;
  tags: string[];
}

export interface MentorshipFormData {
  id?: string;
  mentor_id: string;
  mentee_id: string;
  program_id: string;
  start_date: string;
  goals: string[];
  notes?: string;
  session_templates?: string[];
}

// Utility Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BadgeProps {
  className: string;
  icon: string;
  color: string;
}

// Event Types for WebSocket/Real-time
export interface ChatEvent {
  type: 'message' | 'typing' | 'read_receipt' | 'user_joined' | 'user_left';
  data: any;
  timestamp: string;
  sender_id: string;
  room_id: string;
}

export interface NotificationEvent {
  type: 'new_notification' | 'notification_read';
  data: Notification;
  timestamp: string;
}

// Search Types
export interface SearchResult {
  id: string;
  type: 'mentorship' | 'program' | 'user' | 'session';
  title: string;
  description: string;
  link: string;
  metadata?: Record<string, any>;
}

// Export All Types
export type {
  UserBasic,
  UserProfile,
  Department,
  SessionTemplate,
  SessionTemplateCreateData,
  MentorshipProgram,
  ProgramCreateData,
  ProgramUpdateData,
  Mentorship,
  MentorshipCreateData,
  MentorshipUpdateData,
  MentorshipSession,
  SessionCreateData,
  SessionCompletionData,
  Message,
  MessageCreateData,
  ChatRoom,
  GroupChatRoom,
  GroupChatMessage,
  GroupMessageCreateData,
  Notification,
  DashboardStats,
  OnboardingModule,
  OnboardingChecklist,
  MenteeOnboardingProgress,
  ApiResponse,
  PaginatedResponse,
  MentorshipFilters,
  ProgramFilters,
  ChartDataPoint,
  StatusChartData,
  DepartmentChartData,
  ProgramFormData,
  MentorshipFormData,
  SelectOption,
  BadgeProps,
  ChatEvent,
  NotificationEvent,
  SearchResult
};