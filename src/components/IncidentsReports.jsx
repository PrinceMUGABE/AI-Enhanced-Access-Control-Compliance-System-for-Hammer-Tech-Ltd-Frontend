import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle, FileText, Download, Calendar,
  TrendingUp, Bell, AlertCircle, Users, Clock,
  CheckCircle, XCircle, Filter, Search, BarChart3,
  Eye, Edit, Trash2, UserPlus, Mail, ChevronLeft,
  ChevronRight, ChevronsLeft, ChevronsRight, MoreVertical,
  Upload, Users as UsersIcon, Building, Clock as ClockIcon,
  Shield, FileBarChart, Activity, AlertOctagon, UserCheck,
  ExternalLink, Printer, Send, Loader2, Save, ArrowUpDown,
  MessageSquare, Flag, AlertCircle as AlertCircleIcon,
  Settings, UserX, UserCheck as UserCheckIcon, ShieldAlert,
  FileWarning, Database, Cpu, Zap, Target, BarChart,
  PieChart, LineChart, TrendingDown, Cloud, ShieldOff,
  Key, Lock, Unlock, Fingerprint, QrCode, Smartphone,
  Wifi, WifiOff, Globe, Server, HardDrive, Cpu as CpuIcon,
  MemoryStick, Network, ShieldCheck, ShieldX
} from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const base_url = 'http://127.0.0.1:8000';

// Toast notification utility
const showToast = (message, type = 'success') => {
  if (type === 'success') {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
    });
  } else {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
      },
    });
  }
};

// Helper function to safely extract incident ID
const getIncidentId = (incident) => {
  if (!incident) return null;
  if (incident.incident_id !== undefined) return incident.incident_id;
  if (incident.id !== undefined) return incident.id;
  if (incident.pk !== undefined) return incident.pk;
  return null;
};

// Safe string rendering helper
const safeRender = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'object') return defaultValue;
  return String(value);
};

// Enhanced API request helper
const apiRequest = async (method, endpoint, body = null, isBlob = false) => {
  try {
    const token = localStorage.getItem('access_token');

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${base_url}${endpoint}`, options);

    if (isBlob) {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      return await response.blob();
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true };
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;

  } catch (error) {
    console.error('API request failed:', error);

    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Network error. Please check your connection.');
    }

    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      throw new Error('Server returned invalid response format.');
    }

    throw error;
  }
};

export function IncidentsReports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("incidents");
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [dangerZoneLogs, setDangerZoneLogs] = useState([]);

  // Pagination states
  const [incidentPagination, setIncidentPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  const [reportPagination, setReportPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    priority: '',
    assigned_to: '',
    department: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    dangerZone: false,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Report filters
  const [reportFilters, setReportFilters] = useState({
    report_type: '',
    format: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Modal states
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('incident_details');
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    assigned_to: '',
    due_date: '',
    priority: '',
    notes: ''
  });

  // Update incident modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updatingIncident, setUpdatingIncident] = useState(false);
  const [incidentUpdateData, setIncidentUpdateData] = useState({
    status: '',
    priority: '',
    resolution_notes: '',
    notes: '',
    severity: '',
    assigned_to: '',
    sla_due_date: '',
    escalation_reason: ''
  });

  // Generate report modal state
  const [reportData, setReportData] = useState({
    report_type: 'incident',
    title: '',
    description: '',
    format: 'pdf',
    dateFrom: '',
    dateTo: '',
    severity: '',
    status: '',
    department_id: '',
    is_public: false,
    send_email: true,
    email_recipients: user?.email || ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data when active tab changes
  useEffect(() => {
    if (activeTab === 'incidents') {
      fetchIncidents();
    } else if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'danger-zone') {
      fetchDangerZoneLogs();
    }
  }, [activeTab, filters, reportFilters]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch statistics
      const statsResponse = await apiRequest('GET', '/incidents/statistics/');
      if (statsResponse.success) {
        setStatistics(statsResponse.statistics);
      } else {
        showToast('Failed to fetch statistics', 'error');
      }

      // Fetch based on active tab
      if (activeTab === 'incidents') {
        await fetchIncidents();
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidents = async () => {
    try {
      // Build query params
      const params = new URLSearchParams();

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== false) {
          params.append(key, value);
        }
      });

      // Add pagination
      params.append('page', incidentPagination.currentPage);
      params.append('page_size', incidentPagination.pageSize);

      // Use different endpoints based on user role
      let endpoint;
      if (user?.is_admin) {
        // Admin users get ALL incidents
        endpoint = `/incidents/all/?${params.toString()}`;
      } else {
        // Non-admin users get only their incidents
        endpoint = `/incidents/my/?${params.toString()}`;
      }

      const response = await apiRequest('GET', endpoint);

      if (response.success) {
        // Transform data to ensure consistency
        const transformedIncidents = response.incidents.map(incident => ({
          id: getIncidentId(incident),
          incident_id: getIncidentId(incident),
          incident_number: safeRender(incident.incident_number, ''),
          title: safeRender(incident.title, 'Untitled Incident'),
          description: safeRender(incident.description, ''),
          status: safeRender(incident.status, 'pending'),
          severity: safeRender(incident.severity, 'medium'),
          priority: safeRender(incident.priority, 'medium'),
          risk_score: safeRender(incident.risk_score, 0),
          created_at: safeRender(incident.created_at),
          assigned_at: safeRender(incident.assigned_at),
          sla_due_date: safeRender(incident.sla_due_date),
          assigned_to: incident.assigned_to_details || null,
          department: incident.department_details || null,
          is_overdue: Boolean(incident.is_overdue),
          overdue_hours: safeRender(incident.overdue_hours, 0),
          danger_zone: Boolean(incident.danger_zone),
          resolution_notes: safeRender(incident.resolution_notes, ''),
          escalation_reason: safeRender(incident.escalation_reason, '')
        }));

        setIncidents(transformedIncidents);
        setIncidentPagination({
          ...incidentPagination,
          totalItems: response.pagination?.total_items || 0,
          totalPages: response.pagination?.total_pages || 1
        });
      } else {
        showToast(response.error || 'Failed to fetch incidents', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch incidents', 'error');
    }
  };

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();

      Object.entries(reportFilters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      params.append('page', reportPagination.currentPage);
      params.append('page_size', reportPagination.pageSize);

      const endpoint = params.toString() ? `/incidents/reports/?${params.toString()}` : '/incidents/reports/';
      const response = await apiRequest('GET', endpoint);

      if (response.success) {
        setReports(response.results || response);
        setReportPagination({
          ...reportPagination,
          totalItems: response.count || response.results?.length || 0,
          totalPages: Math.ceil((response.count || response.results?.length || 0) / reportPagination.pageSize)
        });
      } else if (Array.isArray(response)) {
        setReports(response);
        setReportPagination({
          ...reportPagination,
          totalItems: response.length,
          totalPages: Math.ceil(response.length / reportPagination.pageSize)
        });
      } else {
        showToast('Failed to fetch reports', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch reports', 'error');
    }
  };

  const fetchDangerZoneLogs = async () => {
    try {
      // Fetch danger zone logs
      const response = await apiRequest('GET', '/incidents/danger-zone/');
      if (response.success) {
        setDangerZoneLogs(response.logs || []);
      } else {
        showToast(response.error || 'Failed to fetch danger zone logs', 'error');
      }

      // Fetch high-risk incidents based on user role
      const params = new URLSearchParams();
      params.append('severity', 'critical,high');
      params.append('page_size', 100);

      let endpoint;
      if (user?.is_admin) {
        // Admin users get ALL high-risk incidents
        endpoint = `/incidents/all/?${params.toString()}`;
      } else {
        // Non-admin users get only their incidents
        endpoint = `/incidents/my/?${params.toString()}`;
      }

      const incidentsResponse = await apiRequest('GET', endpoint);
      if (incidentsResponse.success) {
        // This will update the incidents state with high-risk incidents
        // The DangerZoneTab will use the incidents prop to show them
        const highRiskIncidents = incidentsResponse.incidents.filter(inc =>
          inc.severity === 'critical' || inc.severity === 'high'
        );
        // Merge with existing incidents or update state as needed
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch danger zone logs', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'danger-zone' && incidents.length === 0) {
      fetchIncidents();
    }
  }, [activeTab]);

  const fetchAssignableUsers = async (incidentId = null) => {
    try {
      const endpoint = incidentId
        ? `/incidents/incidents/${incidentId}/assignable-users/`
        : '/incidents/assignable-users/';

      const response = await apiRequest('GET', endpoint);
      if (response.success) {
        setAssignableUsers(response.users || []);
      } else {
        showToast(response.error || 'Failed to fetch assignable users', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch assignable users', 'error');
    }
  };

  const openIncidentModal = (incident, type = 'details') => {
    setSelectedIncident(incident);
    setModalType(type === 'assign' ? 'assign_incident' : 'incident_details');
    setIsModalOpen(true);

    if (type === 'assign') {
      fetchAssignableUsers(getIncidentId(incident));
    }
  };

  const openUpdateIncidentModal = (incident) => {
    setSelectedIncident(incident);
    setIncidentUpdateData({
      status: incident.status || '',
      priority: incident.priority || '',
      resolution_notes: incident.resolution_notes || '',
      notes: '',
      severity: incident.severity || '',
      assigned_to: incident.assigned_to?.id || '',
      sla_due_date: incident.sla_due_date ? new Date(incident.sla_due_date).toISOString().slice(0, 16) : '',
      escalation_reason: incident.escalation_reason || ''
    });
    setUpdateModalOpen(true);
  };

  const openReportModal = (report) => {
    setSelectedReport(report);
    setModalType('report_details');
    setIsModalOpen(true);
  };

  const openGenerateReportModal = () => {
    setModalType('generate_report');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIncident(null);
    setSelectedReport(null);
    setAssignmentData({
      assigned_to: '',
      due_date: '',
      priority: '',
      notes: ''
    });
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedIncident(null);
    setIncidentUpdateData({
      status: '',
      priority: '',
      resolution_notes: '',
      notes: '',
      severity: '',
      assigned_to: '',
      sla_due_date: '',
      escalation_reason: ''
    });
  };

  const handleAssignIncident = async () => {
    if (!selectedIncident || !assignmentData.assigned_to) {
      showToast('Please select a user to assign', 'error');
      return;
    }

    try {
      setIsAssigning(true);
      const response = await apiRequest('POST', '/incidents/incidents/manual-assign/', {
        incident_id: getIncidentId(selectedIncident),
        assigned_to_id: assignmentData.assigned_to,
        due_date: assignmentData.due_date || null,
        priority: assignmentData.priority || selectedIncident.priority
      });

      if (response.success) {
        showToast('Incident assigned successfully');
        closeModal();
        fetchIncidents();
      } else {
        showToast(response.error || 'Failed to assign incident', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to assign incident', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUpdateIncident = async () => {
    if (!selectedIncident) {
      showToast('No incident selected', 'error');
      return;
    }

    try {
      setUpdatingIncident(true);
      const incidentId = getIncidentId(selectedIncident);

      // Prepare update data
      const updateData = {
        status: incidentUpdateData.status,
        priority: incidentUpdateData.priority,
        severity: incidentUpdateData.severity,
        resolution_notes: incidentUpdateData.resolution_notes || null,
        escalation_reason: incidentUpdateData.escalation_reason || null,
        notes: incidentUpdateData.notes || null,
        ...(incidentUpdateData.assigned_to && { assigned_to: incidentUpdateData.assigned_to }),
        ...(incidentUpdateData.sla_due_date && { sla_due_date: incidentUpdateData.sla_due_date })
      };

      // Remove null/undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const response = await apiRequest('PATCH', `/incidents/${incidentId}/`, updateData);

      if (response.success) {
        showToast('Incident updated successfully');
        closeUpdateModal();
        fetchIncidents();
      } else {
        showToast(response.error || 'Failed to update incident', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update incident', 'error');
    } finally {
      setUpdatingIncident(false);
    }
  };

  const handleUpdateIncidentStatus = async (incidentOrId, newStatus) => {
    try {
      const incidentId = typeof incidentOrId === 'object'
        ? getIncidentId(incidentOrId)
        : incidentOrId;

      const response = await apiRequest('PATCH', `/incidents/${incidentId}/`, {
        status: newStatus
      });

      if (response.success) {
        showToast('Incident status updated successfully');
        fetchIncidents();
      } else {
        showToast(response.error || 'Failed to update incident status', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update incident status', 'error');
    }
  };

  const handleDeleteIncident = async (incidentOrId) => {
    if (!window.confirm('Are you sure you want to delete this incident? This action cannot be undone.')) {
      return;
    }

    try {
      const incidentId = typeof incidentOrId === 'object'
        ? getIncidentId(incidentOrId)
        : incidentOrId;

      const response = await apiRequest('DELETE', `/incidents/${incidentId}/`);

      if (response.success) {
        showToast('Incident deleted successfully');
        fetchIncidents();
      } else {
        showToast(response.error || 'Failed to delete incident', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete incident', 'error');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiRequest('DELETE', `/incidents/reports/${reportId}/`);

      if (response.success) {
        showToast('Report deleted successfully');
        fetchReports();
      } else {
        showToast(response.error || 'Failed to delete report', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete report', 'error');
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      const params = {
        report_type: reportData.report_type,
        title: reportData.title || `${reportData.report_type.charAt(0).toUpperCase() + reportData.report_type.slice(1)} Report`,
        description: reportData.description || `Generated ${reportData.report_type} report`,
        format: reportData.format,
        date_from: reportData.dateFrom || null,
        date_to: reportData.dateTo || null,
        severity: reportData.severity || null,
        status: reportData.status || null,
        department_id: reportData.department_id || null,
        is_public: reportData.is_public,
        send_email: reportData.send_email,
        email_recipients: reportData.email_recipients
      };

      const response = await apiRequest('POST', '/incidents/reports/generate/', params);

      if (response.success) {
        showToast('Report generated successfully and sent to your email');
        closeModal();
        fetchReports();

        if (reportData.send_email) {
          showToast('Report has been generated and sent to your email address');
        }
      } else {
        showToast(response.error || 'Failed to generate report', 'error');
      }
    } catch (err) {
      showToast('Failed to generate report: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      const reportId = report.id;
      const blob = await apiRequest('GET', `/incidents/reports/${reportId}/file/`, null, true);

      let filename = `report_${report.report_number || report.id}`;
      if (report.format) {
        filename = `${filename}.${report.format}`;
      } else {
        filename = `${filename}.pdf`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setReports(prevReports =>
        prevReports.map(r =>
          r.id === reportId
            ? { ...r, download_count: (r.download_count || 0) + 1 }
            : r
        )
      );

      showToast(`Report downloaded: ${filename}`);

    } catch (err) {
      showToast(`Failed to download report: ${err.message}`, 'error');
    }
  };

  const handleExportIncidents = async (format = 'csv') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== false) {
          params.append(key, value);
        }
      });

      const blob = await apiRequest('GET', `/incidents/export/?${params.toString()}`, null, true);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidents_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Incidents exported successfully to ${format.toUpperCase()}`);
    } catch (err) {
      showToast('Failed to export incidents: ' + err.message, 'error');
    }
  };

  // Helper functions for UI
  const getSeverityBadge = (severity) => {
    const config = {
      critical: { color: 'bg-red-100 text-red-800 border border-red-200', icon: <AlertOctagon className="h-3 w-3" />, label: 'Critical' },
      high: { color: 'bg-orange-100 text-orange-800 border border-orange-200', icon: <AlertTriangle className="h-3 w-3" />, label: 'High' },
      medium: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: <AlertCircle className="h-3 w-3" />, label: 'Medium' },
      low: { color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: <Shield className="h-3 w-3" />, label: 'Low' }
    };
    const cfg = config[severity?.toLowerCase()] || config.medium;
    return (
      <div className={`${cfg.color} px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5`}>
        {cfg.icon}
        <span>{cfg.label}</span>
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: <ClockIcon className="h-3 w-3" />, label: 'Pending' },
      investigating: { color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: <Search className="h-3 w-3" />, label: 'Investigating' },
      assigned: { color: 'bg-purple-100 text-purple-800 border border-purple-200', icon: <UserCheck className="h-3 w-3" />, label: 'Assigned' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: <Activity className="h-3 w-3" />, label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800 border border-green-200', icon: <CheckCircle className="h-3 w-3" />, label: 'Resolved' },
      closed: { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: <CheckCircle className="h-3 w-3" />, label: 'Closed' },
      escalated: { color: 'bg-red-100 text-red-800 border border-red-200', icon: <AlertTriangle className="h-3 w-3" />, label: 'Escalated' }
    };
    const cfg = config[status?.toLowerCase()] || config.pending;
    return (
      <div className={`${cfg.color} px-3 py-1.5 rounded-full text-xs inline-flex items-center gap-1.5`}>
        {cfg.icon}
        <span>{cfg.label}</span>
      </div>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = {
      urgent: { color: 'bg-red-100 text-red-800 border border-red-200', label: 'Urgent' },
      high: { color: 'bg-orange-100 text-orange-800 border border-orange-200', label: 'High' },
      medium: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', label: 'Medium' },
      low: { color: 'bg-blue-100 text-blue-800 border border-blue-200', label: 'Low' }
    };
    const cfg = config[priority?.toLowerCase()] || config.medium;
    return (
      <div className={`${cfg.color} px-3 py-1 rounded-full text-xs font-medium inline-block`}>
        {cfg.label}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 30) return `${diffDays}d ago`;
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      severity: '',
      priority: '',
      assigned_to: '',
      department: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      dangerZone: false,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const handleClearReportFilters = () => {
    setReportFilters({
      report_type: '',
      format: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  // Check user permissions
  const canDeleteIncident = user?.is_admin || user?.is_hr;
  const canDeleteReport = user?.is_admin || user?.is_hr;
  const canAssignIncident = user?.is_admin || user?.is_hr || user?.role === 'security_analyst';
  const canUpdateIncident = (incident) => {
    if (user?.is_admin || user?.is_hr) return true;
    if (incident.assigned_to && incident.assigned_to.id === user?.id) return true;
    return false;
  };

  const handlePageChange = (page, type = 'incidents') => {
    if (type === 'incidents') {
      setIncidentPagination({
        ...incidentPagination,
        currentPage: page
      });
    } else {
      setReportPagination({
        ...reportPagination,
        currentPage: page
      });
    }
  };

  const handlePageSizeChange = (size, type = 'incidents') => {
    if (type === 'incidents') {
      setIncidentPagination({
        ...incidentPagination,
        pageSize: size,
        currentPage: 1
      });
    } else {
      setReportPagination({
        ...reportPagination,
        pageSize: size,
        currentPage: 1
      });
    }
  };

  // Calculate pagination ranges
  const getPageRange = (currentPage, totalPages) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const createIncidentFromLog = async (logId) => {
    try {
      setLoading(true);
      const response = await apiRequest('POST', '/incidents/create-from-log/', {
        log_id: logId,
        title: `Incident from log ${logId}`,
        description: 'Auto-generated incident from danger zone log',
        severity: 'high',
        priority: 'high'
      });

      if (response.success) {
        showToast('Incident created successfully');
        fetchData();
        fetchDangerZoneLogs();
      } else {
        showToast(response.error || 'Failed to create incident', 'error');
      }
    } catch (err) {
      showToast('Failed to create incident: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get status options for dropdown
  const getStatusOptions = (currentStatus) => {
    const transitions = {
      pending: ['investigating', 'assigned'],
      investigating: ['assigned', 'in_progress', 'pending'],
      assigned: ['in_progress', 'escalated', 'investigating'],
      in_progress: ['resolved', 'escalated', 'assigned'],
      resolved: ['closed', 'in_progress'],
      escalated: ['assigned', 'in_progress'],
      closed: []
    };

    return transitions[currentStatus] || [];
  };

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading incidents and reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Incidents & Reports Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive incident management and reporting system</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openGenerateReportModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Requirements Description */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-blue-800 text-lg">AI-Enhanced Security Incident Management System</p>
              <p className="text-gray-700 text-sm leading-relaxed">
                This dashboard provides comprehensive incident tracking with real-time monitoring, automated risk assessment,
                role-based access control, SLA management, and customizable reporting. Manage incidents from detection to resolution
                with full audit trail and compliance reporting capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Incidents</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{statistics.total_incidents || 0}</h3>
                <p className="text-xs text-gray-500 mt-1">All incidents</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 border border-green-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Open Incidents</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{statistics.open_incidents || 0}</h3>
                <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Overdue</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{statistics.overdue || 0}</h3>
                <p className="text-xs text-gray-500 mt-1">Past SLA deadline</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Resolution Rate</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{statistics.resolution_rate || 0}%</h3>
                <p className="text-xs text-gray-500 mt-1">Successfully resolved</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === "incidents"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            onClick={() => setActiveTab("incidents")}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>All Incidents</span>
              {statistics?.open_incidents > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {statistics.open_incidents}
                </span>
              )}
            </div>
          </button>

          {/* <button
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === "reports"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            onClick={() => setActiveTab("reports")}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Generated Reports</span>
            </div>
          </button> */}

          <button
            className={`flex-1 px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === "danger-zone"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            onClick={() => setActiveTab("danger-zone")}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertOctagon className="h-4 w-4" />
              <span>Danger Zone</span>
              {statistics?.danger_zone_logs > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {statistics.danger_zone_logs}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "incidents" && (
          <IncidentsTab
            incidents={incidents}
            loading={loading}
            pagination={incidentPagination}
            onPageChange={(page) => handlePageChange(page, 'incidents')}
            onPageSizeChange={(size) => handlePageSizeChange(size, 'incidents')}
            getSeverityBadge={getSeverityBadge}
            getStatusBadge={getStatusBadge}
            getPriorityBadge={getPriorityBadge}
            formatDate={formatDate}
            formatTimeAgo={formatTimeAgo}
            openIncidentModal={openIncidentModal}
            openUpdateIncidentModal={openUpdateIncidentModal}
            handleUpdateIncidentStatus={handleUpdateIncidentStatus}
            handleDeleteIncident={handleDeleteIncident}
            canDeleteIncident={canDeleteIncident}
            canAssignIncident={canAssignIncident}
            canUpdateIncident={canUpdateIncident}
            user={user}
            getPageRange={getPageRange}
          />
        )}

        {activeTab === "reports" && (
          <ReportsTab
            reports={reports}
            loading={loading}
            pagination={reportPagination}
            onPageChange={(page) => handlePageChange(page, 'reports')}
            onPageSizeChange={(size) => handlePageSizeChange(size, 'reports')}
            formatDate={formatDate}
            formatTimeAgo={formatTimeAgo}
            handleDownloadReport={handleDownloadReport}
            handleDeleteReport={handleDeleteReport}
            openReportModal={openReportModal}
            canDeleteReport={canDeleteReport}
            user={user}
            getPageRange={getPageRange}
          />
        )}

        {activeTab === "danger-zone" && (
          <DangerZoneTab
            logs={dangerZoneLogs}
            incidents={incidents}  // Add this line to pass incidents
            loading={loading}
            formatDate={formatDate}
            formatTimeAgo={formatTimeAgo}
            createIncidentFromLog={createIncidentFromLog}
            user={user}
            getPageRange={getPageRange}
          />
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeModal}></div>
          {modalType === 'incident_details' && selectedIncident && (
            <IncidentDetailsModal
              incident={selectedIncident}
              onClose={closeModal}
              getSeverityBadge={getSeverityBadge}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              formatDate={formatDate}
              formatTimeAgo={formatTimeAgo}
              canAssignIncident={canAssignIncident}
              canUpdateIncident={canUpdateIncident}
              canDeleteIncident={canDeleteIncident}
              onAssign={() => openIncidentModal(selectedIncident, 'assign')}
              onUpdate={() => openUpdateIncidentModal(selectedIncident)}
              onDelete={handleDeleteIncident}
            />
          )}

          {modalType === 'assign_incident' && selectedIncident && (
            <AssignIncidentModal
              incident={selectedIncident}
              assignableUsers={assignableUsers}
              assignmentData={assignmentData}
              setAssignmentData={setAssignmentData}
              isAssigning={isAssigning}
              onAssign={handleAssignIncident}
              onClose={closeModal}
              formatDate={formatDate}
            />
          )}

          {modalType === 'generate_report' && (
            <GenerateReportModal
              reportData={reportData}
              setReportData={setReportData}
              onGenerate={handleGenerateReport}
              onClose={closeModal}
              loading={loading}
              user={user}
            />
          )}
        </>
      )}

      {/* Update Incident Modal */}
      {updateModalOpen && selectedIncident && (
        <UpdateIncidentModal
          incident={selectedIncident}
          updateData={incidentUpdateData}
          setUpdateData={setIncidentUpdateData}
          isUpdating={updatingIncident}
          onUpdate={handleUpdateIncident}
          onClose={closeUpdateModal}
          getStatusOptions={getStatusOptions}
          assignableUsers={assignableUsers}
          user={user}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

// Sub-components
function IncidentsTab({
  incidents,
  loading,
  pagination,
  onPageChange,
  onPageSizeChange,
  getSeverityBadge,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  formatTimeAgo,
  openIncidentModal,
  openUpdateIncidentModal,
  handleUpdateIncidentStatus,
  handleDeleteIncident,
  canDeleteIncident,
  canAssignIncident,
  canUpdateIncident,
  user,
  getPageRange
}) {
  const getAssignedUserName = (incident) => {
    if (!incident || !incident.assigned_to) return 'Unassigned';

    if (typeof incident.assigned_to === 'object') {
      return safeRender(incident.assigned_to.full_name, 'Assigned User');
    }

    return 'Unassigned';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Incidents Found</h3>
        <p className="text-gray-600 max-w-md mx-auto">No incidents match your current filters.</p>
      </div>
    );
  }

  const pageRange = getPageRange(pagination.currentPage, pagination.totalPages);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">All Incidents</h2>
            <p className="text-gray-600 text-sm mt-1">
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} incidents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Incident</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Severity</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Priority</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Created</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">SLA Status</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {incidents.map((incident, index) => {
              const incidentId = getIncidentId(incident);
              const isOverdue = incident.is_overdue;
              const slaDueDate = incident.sla_due_date;
              const isDueSoon = slaDueDate && !isOverdue &&
                new Date(slaDueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000);

              return (
                <tr
                  key={incidentId || index}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => openIncidentModal(incident)}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${incident.severity === 'critical' ? 'bg-red-100 text-red-600' :
                        incident.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                          incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="text-sm text-gray-500 truncate">{incident.incident_number}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getSeverityBadge(incident.severity)}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(incident.status)}
                  </td>
                  <td className="py-4 px-6">
                    {getPriorityBadge(incident.priority)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-900">{formatDate(incident.created_at)}</div>
                    <div className="text-xs text-gray-500">{formatTimeAgo(incident.created_at)}</div>
                  </td>
                  <td className="py-4 px-6">
                    {slaDueDate ? (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isOverdue
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : isDueSoon
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                        <Clock className="h-3 w-3" />
                        <span>
                          {isOverdue ? 'Overdue' : isDueSoon ? 'Due soon' : 'Due'} {formatTimeAgo(slaDueDate)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No SLA</span>
                    )}
                  </td>
                  <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openIncidentModal(incident)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {canUpdateIncident(incident) && (
                        <button
                          onClick={() => openUpdateIncidentModal(incident)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Update Incident"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}

                      {canAssignIncident && (
                        <button
                          onClick={() => openIncidentModal(incident, 'assign')}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Assign Incident"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}

                      {canDeleteIncident && (
                        <button
                          onClick={() => handleDeleteIncident(incident)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Incident"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {pageRange.map((page, index) => (
                page === '...' ? (
                  <span key={`dots-${index}`} className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-lg border transition-colors ${pagination.currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onPageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsTab({
  reports,
  loading,
  pagination,
  onPageChange,
  onPageSizeChange,
  formatDate,
  formatTimeAgo,
  handleDownloadReport,
  handleDeleteReport,
  openReportModal,
  canDeleteReport,
  user,
  getPageRange
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pageRange = getPageRange(pagination.currentPage, pagination.totalPages);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Generated Reports</h2>
            <p className="text-gray-600 text-sm mt-1">
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {(!reports || reports.length === 0) ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Generated</h3>
          <p className="text-gray-600 max-w-md mx-auto">Generate your first report using the "Generate Report" button above.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Report</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Type</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Format</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Generated</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Size</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div
                            className="font-medium text-gray-900 truncate hover:text-blue-600 cursor-pointer"
                            onClick={() => openReportModal(report)}
                          >
                            {report.title || 'Untitled Report'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">{report.report_number || 'No Number'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.report_type === 'incident' ? 'bg-blue-100 text-blue-800' :
                        report.report_type === 'security' ? 'bg-red-100 text-red-800' :
                          report.report_type === 'compliance' ? 'bg-green-100 text-green-800' :
                            report.report_type === 'user_activity' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {(report.report_type || 'Unknown')?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.format === 'pdf' ? 'bg-red-100 text-red-800' :
                        report.format === 'excel' ? 'bg-green-100 text-green-800' :
                          report.format === 'csv' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {(report.format || 'Unknown')?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">{formatDate(report.generated_at)}</div>
                      <div className="text-xs text-gray-500">{formatTimeAgo(report.generated_at)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-900">
                        {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadReport(report)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                        {canDeleteReport && (
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPageChange(1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onPageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {pageRange.map((page, index) => (
                    page === '...' ? (
                      <span key={`dots-${index}`} className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 rounded-lg border transition-colors ${pagination.currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => onPageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onPageChange(pagination.totalPages)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DangerZoneTab({
  logs,
  incidents,
  loading,
  formatDate,
  formatTimeAgo,
  createIncidentFromLog,
  user,
  getPageRange
}) {
  const canCreateIncidents = user?.is_admin || user?.is_hr ||
    user?.role === 'security_analyst' ||
    user?.role === 'compliance_officer';

  // Get high-risk incidents (critical or high severity)
  const highRiskIncidents = incidents?.filter(inc =>
    inc.severity === 'critical' || inc.severity === 'high' || inc.danger_zone === true
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasDangerZoneItems = (logs && logs.length > 0) || highRiskIncidents.length > 0;

  if (!hasDangerZoneItems) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Danger Zone</h2>
              <p className="text-gray-600 text-sm mt-1">High-risk logs and incidents requiring immediate attention</p>
            </div>
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">All Clear!</span>
            </div>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600 max-w-md mx-auto">No high-risk activities detected. System is operating normally.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Danger Zone</h2>
            <p className="text-gray-600 text-sm mt-1">High-risk logs and incidents requiring immediate attention</p>
          </div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">
              {logs?.length + highRiskIncidents.length} critical items detected
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* High-Risk Incidents Section */}
        {highRiskIncidents.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              High-Risk Incidents ({highRiskIncidents.length})
            </h3>
            <div className="space-y-4">
              {highRiskIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="border border-red-200 rounded-xl p-6 bg-gradient-to-r from-red-50 to-white hover:from-red-100 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{incident.title}</div>
                          <div className="text-sm text-gray-600">{incident.incident_number}</div>
                        </div>
                        <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          {incident.severity?.toUpperCase()}
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-4">{incident.description?.substring(0, 200)}...</p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div className="font-medium">{incident.status}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Priority:</span>
                          <div className="font-medium">{incident.priority}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <div className="font-medium">{formatDate(incident.created_at)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Assigned To:</span>
                          <div className="font-medium">{incident.assigned_to?.full_name || 'Unassigned'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger Zone Logs Section */}
        {logs && logs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-orange-600" />
              Danger Zone Logs ({logs.length})
            </h3>
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border border-orange-200 rounded-xl p-6 bg-gradient-to-r from-orange-50 to-white hover:from-orange-100 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${log.risk_score > 80 ? 'bg-red-100 text-red-600' :
                          log.risk_score > 60 ? 'bg-orange-100 text-orange-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{log.activity || 'Unknown Activity'}</div>
                          <div className="text-sm text-gray-600">{log.user_email || 'Unknown User'}</div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${log.risk_score > 80 ? 'bg-red-100 text-red-800 border border-red-200' :
                          log.risk_score > 60 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                            'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                          Risk: {log.risk_score || 0}/100
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-4">{log.description || 'No description available'}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Timestamp:</span>
                          <div className="font-medium">{formatDate(log.timestamp)}</div>
                          <div className="text-xs text-gray-500">{formatTimeAgo(log.timestamp)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">IP Address:</span>
                          <div className="font-medium">{log.ip_address || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Endpoint:</span>
                          <div className="font-medium truncate">{log.endpoint || 'N/A'}</div>
                        </div>
                      </div>

                      {log.recommended_action && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-blue-800">Recommended Action:</div>
                              <div className="text-sm text-blue-700">{log.recommended_action}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {canCreateIncidents && (
                      <div className="ml-4">
                        <button
                          onClick={() => createIncidentFromLog(log.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Create Incident
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Modal Components
function IncidentDetailsModal({
  incident,
  onClose,
  getSeverityBadge,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  formatTimeAgo,
  canAssignIncident,
  canUpdateIncident,
  canDeleteIncident,
  onAssign,
  onUpdate,
  onDelete
}) {
  const incidentId = getIncidentId(incident);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${incident.severity === 'critical' ? 'bg-red-100 text-red-600' :
                incident.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                  incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                }`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{incident.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm text-gray-600">{incident.incident_number}</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Created {formatTimeAgo(incident.created_at)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Status</div>
                <div className="flex items-center justify-between">
                  {getStatusBadge(incident.status)}
                  {canUpdateIncident && incident.status !== 'closed' && (
                    <button
                      onClick={onUpdate}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Update
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Severity & Priority</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Severity:</span>
                    {getSeverityBadge(incident.severity)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Priority:</span>
                    {getPriorityBadge(incident.priority)}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Assignment</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Assigned To:</span>
                    <div className="flex items-center gap-2">
                      {incident.assigned_to ? (
                        <>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UsersIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium">
                            {incident.assigned_to.full_name || 'Assigned User'}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </div>
                  </div>
                  {canAssignIncident && (
                    <button
                      onClick={onAssign}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      {incident.assigned_to ? 'Reassign Incident' : 'Assign Incident'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Timeline</div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Created:</span>
                    <span className="text-sm">{formatDate(incident.created_at)}</span>
                  </div>
                  {incident.assigned_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Assigned:</span>
                      <span className="text-sm">{formatDate(incident.assigned_at)}</span>
                    </div>
                  )}
                  {incident.sla_due_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">SLA Due:</span>
                      <span className={`text-sm font-medium ${incident.is_overdue ? 'text-red-600' : 'text-green-600'}`}>
                        {formatDate(incident.sla_due_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{incident.description}</p>
            </div>
          </div>

          {incident.resolution_notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Resolution Notes</h3>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 whitespace-pre-wrap">{incident.resolution_notes}</p>
              </div>
            </div>
          )}

          {incident.escalation_reason && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Escalation Reason</h3>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 whitespace-pre-wrap">{incident.escalation_reason}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {canUpdateIncident && incident.status !== 'closed' && (
                <button
                  onClick={onUpdate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Update Incident
                </button>
              )}

              {canAssignIncident && (
                <button
                  onClick={onAssign}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  {incident.assigned_to ? 'Reassign' : 'Assign'}
                </button>
              )}

              {canDeleteIncident && (
                <button
                  onClick={() => onDelete(incidentId)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Incident
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignIncidentModal({
  incident,
  assignableUsers,
  assignmentData,
  setAssignmentData,
  isAssigning,
  onAssign,
  onClose,
  formatDate
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assign Incident</h2>
              <p className="text-gray-600 text-sm mt-1">{incident.incident_number}: {incident.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To <span className="text-red-500">*</span>
              </label>
              <select
                value={assignmentData.assigned_to}
                onChange={(e) => setAssignmentData({ ...assignmentData, assigned_to: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a user...</option>
                {assignableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email}) - {user.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={assignmentData.priority || incident.priority}
                onChange={(e) => setAssignmentData({ ...assignmentData, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SLA Due Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={assignmentData.due_date}
                onChange={(e) => setAssignmentData({ ...assignmentData, due_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAssign}
              disabled={isAssigning || !assignmentData.assigned_to}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Assign Incident
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UpdateIncidentModal({
  incident,
  updateData,
  setUpdateData,
  isUpdating,
  onUpdate,
  onClose,
  getStatusOptions,
  assignableUsers,
  user,
  formatDate
}) {
  const statusOptions = getStatusOptions(incident.status);
  const requiresResolutionNotes = updateData.status === 'resolved' || updateData.status === 'closed';
  const canEscalate = user?.is_admin || user?.is_hr || user?.role === 'security_analyst';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      <div className="relative z-10 flex flex-col bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Fixed Header */}
        <div className="border-b border-gray-200 p-6 flex-shrink-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Update Incident</h2>
              <p className="text-gray-600 text-sm mt-1">
                {incident.incident_number}: {incident.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setUpdateData({ ...updateData, status })}
                    className={`p-3 border rounded-lg text-sm font-medium transition-all ${updateData.status === status
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                      : 'border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Current status: <span className="font-medium">{incident.status.toUpperCase()}</span>
              </p>
            </div>

            {/* Severity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={updateData.severity}
                onChange={(e) => setUpdateData({ ...updateData, severity: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={updateData.priority}
                onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Reassignment (for admins/HR) */}
            {(user?.is_admin || user?.is_hr) && assignableUsers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reassign To (Optional)
                </label>
                <select
                  value={updateData.assigned_to}
                  onChange={(e) => setUpdateData({ ...updateData, assigned_to: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Keep current assignee</option>
                  {assignableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SLA Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SLA Due Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={updateData.sla_due_date}
                onChange={(e) => setUpdateData({ ...updateData, sla_due_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Resolution Notes (Required for resolved/closed) */}
            {requiresResolutionNotes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">Required when resolving or closing</span>
                </label>
                <textarea
                  value={updateData.resolution_notes}
                  onChange={(e) => setUpdateData({ ...updateData, resolution_notes: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe how the incident was resolved..."
                  required
                />
              </div>
            )}

            {/* Escalation Reason */}
            {canEscalate && updateData.status === 'escalated' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={updateData.escalation_reason}
                  onChange={(e) => setUpdateData({ ...updateData, escalation_reason: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain why this incident needs escalation..."
                  required
                />
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional notes or context..."
              />
            </div>

            {/* Current Incident Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Incident Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Current Status:</span>
                  <div className="font-medium">{incident.status.toUpperCase()}</div>
                </div>
                <div>
                  <span className="text-gray-500">Risk Score:</span>
                  <div className="font-medium">{incident.risk_score}/100</div>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <div className="font-medium">{formatDate(incident.created_at)}</div>
                </div>
                <div>
                  <span className="text-gray-500">SLA Status:</span>
                  <div className={`font-medium ${incident.is_overdue ? 'text-red-600' : 'text-green-600'}`}>
                    {incident.is_overdue ? 'OVERDUE' : 'ON TRACK'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={onUpdate}
              disabled={isUpdating || !updateData.status || (requiresResolutionNotes && !updateData.resolution_notes)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Incident
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenerateReportModal({
  reportData,
  setReportData,
  onGenerate,
  onClose,
  loading,
  user
}) {
  const reportTypes = [
    { value: 'incident', label: 'Incident Report', description: 'Detailed incident analysis and statistics' },
    { value: 'security', label: 'Security Report', description: 'Security metrics and threat analysis' },
    { value: 'compliance', label: 'Compliance Report', description: 'Compliance status and audit findings' },
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF', description: 'Portable Document Format' },
    { value: 'csv', label: 'CSV', description: 'Comma Separated Values' },
    { value: 'excel', label: 'Excel', description: 'Microsoft Excel Spreadsheet' },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generate Report</h2>
              <p className="text-gray-600 text-sm mt-1">Configure and generate a new report</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {reportTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setReportData({ ...reportData, report_type: type.value, title: `${type.label} - ${new Date().toLocaleDateString()}` })}
                    className={`p-4 border rounded-xl text-left transition-all ${reportData.report_type === type.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                  >
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={reportData.title}
                onChange={(e) => setReportData({ ...reportData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter report title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportData.format}
                  onChange={(e) => setReportData({ ...reportData, format: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {formatOptions.map(format => (
                    <option key={format.value} value={format.value}>
                      {format.label} - {format.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={reportData.dateFrom}
                    onChange={(e) => setReportData({ ...reportData, dateFrom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={reportData.dateTo}
                    onChange={(e) => setReportData({ ...reportData, dateTo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="send_email"
                  checked={reportData.send_email}
                  onChange={(e) => setReportData({ ...reportData, send_email: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="send_email" className="text-sm font-medium text-gray-700">
                  Send report to my email
                </label>
              </div>

              {reportData.send_email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Recipients (Optional)
                  </label>
                  <input
                    type="text"
                    value={reportData.email_recipients || user?.email || ''}
                    onChange={(e) => setReportData({ ...reportData, email_recipients: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter comma-separated email addresses"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your email ({user?.email}) will receive the report. Add more emails separated by commas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onGenerate}
              disabled={loading || !reportData.title || !reportData.report_type}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentsReports;