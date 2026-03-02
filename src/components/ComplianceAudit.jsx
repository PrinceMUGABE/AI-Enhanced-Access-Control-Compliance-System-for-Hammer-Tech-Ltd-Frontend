import React, { useState, useEffect } from 'react';
import {
  Shield, FileText, AlertTriangle, CheckCircle, XCircle,
  Search, Download, Eye, Edit, Trash2, Plus,
  Calendar, Users, TrendingUp, TrendingDown, Clock,
  BarChart, ChevronLeft, ChevronRight, RefreshCw,
  Building, Target, Award, Flag, Layers, PieChart,
  Save, X, FileBarChart, CheckSquare, Database,
  UserCheck, ShieldAlert, ClipboardCheck, Gauge,
  Percent, ListChecks, FileSearch, BarChart3
} from "lucide-react";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Utility Components
const StatusBadge = ({ status, size = "sm" }) => {
  const statusConfig = {
    'draft': { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    'planned': { color: 'bg-blue-100 text-blue-800', label: 'Planned' },
    'in_progress': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
    'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
    'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
    'open': { color: 'bg-red-100 text-red-800', label: 'Open' },
    'resolved': { color: 'bg-green-100 text-green-800', label: 'Resolved' },
    'closed': { color: 'bg-gray-100 text-gray-800', label: 'Closed' },
  };

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  const sizeClass = size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
};

const SeverityBadge = ({ severity, size = "sm" }) => {
  const severityConfig = {
    'critical': { color: 'bg-red-500 text-white', label: 'Critical' },
    'high': { color: 'bg-orange-500 text-white', label: 'High' },
    'medium': { color: 'bg-yellow-500 text-black', label: 'Medium' },
    'low': { color: 'bg-green-500 text-white', label: 'Low' },
  };

  const config = severityConfig[severity] || { color: 'bg-gray-500 text-white', label: severity };
  const sizeClass = size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`rounded-full font-medium ${config.color} ${sizeClass}`}>
      {config.label}
    </span>
  );
};

const ProgressBar = ({ percentage, color = "blue", showLabel = true, label = null }) => {
  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    yellow: "bg-yellow-600",
    red: "bg-red-600",
    purple: "bg-purple-600",
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label || 'Progress'}</span>
        {showLabel && <span>{percentage}%</span>}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color, description }) => {
  const iconColors = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    red: "text-red-600 bg-red-50",
    yellow: "text-yellow-600 bg-yellow-50",
    purple: "text-purple-600 bg-purple-50",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconColors[color]}`}>
          {icon}
        </div>
        {change && (
          <span className={`inline-flex items-center text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700 mt-1">{title}</p>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
};

// Modals
const CreateStandardModal = ({ isOpen, onClose, onSubmit, standard = null }) => {
  const [formData, setFormData] = useState({
    name: standard?.name || '',
    standard_type: standard?.standard_type || 'gdpr',
    version: standard?.version || '',
    description: standard?.description || '',
    is_active: standard?.is_active ?? true,
    total_controls: standard?.total_controls || 0,
    mandatory_controls: standard?.mandatory_controls || 0,
  });

  const [loading, setLoading] = useState(false);

  const standardTypes = [
    { value: 'gdpr', label: 'GDPR' },
    { value: 'iso27001', label: 'ISO 27001' },
    { value: 'soc2', label: 'SOC 2' },
    { value: 'hipaa', label: 'HIPAA' },
    { value: 'pci_dss', label: 'PCI DSS' },
    { value: 'rwanda_dpa', label: 'Rwanda Data Protection Act' },
    { value: 'nist', label: 'NIST Cybersecurity Framework' },
    { value: 'custom', label: 'Custom Standard' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData, standard?.id);
      onClose();
    } catch (error) {
      console.error('Error saving standard:', error);
      alert(error.response?.data?.error || 'Failed to save standard');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {standard ? 'Edit Compliance Standard' : 'Create New Compliance Standard'}
              </h2>
              <p className="text-gray-600 mt-1">
                {standard ? 'Update standard details' : 'Add a new compliance standard to the system'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="e.g., General Data Protection Regulation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard Type *
                </label>
                <select
                  required
                  value={formData.standard_type}
                  onChange={(e) => setFormData({ ...formData, standard_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {standardTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version *
                </label>
                <input
                  type="text"
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="e.g., v2.1, 2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={() => setFormData({ ...formData, is_active: true })}
                      className="h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_active"
                      checked={!formData.is_active}
                      onChange={() => setFormData({ ...formData, is_active: false })}
                      className="h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={4}
                placeholder="Describe the compliance standard requirements, scope, and objectives..."
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {standard ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {standard ? 'Update Standard' : 'Create Standard'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreateFindingModal = ({ isOpen, onClose, onSubmit, audit, finding = null }) => {
  const [formData, setFormData] = useState({
    title: finding?.title || '',
    description: finding?.description || '',
    finding_type: finding?.finding_type || 'minor',
    risk_level: finding?.risk_level || 'medium',
    status: finding?.status || 'open',
    target_completion_date: finding?.target_completion_date || '',
  });

  const [loading, setLoading] = useState(false);

  const findingTypes = [
    { value: 'major', label: 'Major Finding' },
    { value: 'minor', label: 'Minor Finding' },
    { value: 'observation', label: 'Observation' },
    { value: 'incident_related', label: 'Incident-Related' },
  ];

  const riskLevels = [
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical' },
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        audit: audit.id,
      };
      await onSubmit(data, finding?.id);
      onClose();
    } catch (error) {
      console.error('Error saving finding:', error);
      alert(error.response?.data?.error || 'Failed to save finding');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {finding ? 'Edit Audit Finding' : 'Create New Audit Finding'}
              </h2>
              <p className="text-gray-600 mt-1">
                {finding ? 'Update finding details' : 'Add a new finding for audit ' + (audit?.audit_id || '')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Finding Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="e.g., Inadequate access control for sensitive data"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Finding Type *
                </label>
                <select
                  required
                  value={formData.finding_type}
                  onChange={(e) => setFormData({ ...formData, finding_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {findingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level *
                </label>
                <select
                  required
                  value={formData.risk_level}
                  onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {riskLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={4}
                placeholder="Describe the finding in detail, including what was discovered and why it's an issue..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Completion Date
              </label>
              <input
                type="date"
                value={formData.target_completion_date}
                onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {finding ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Flag className="h-4 w-4" />
                    {finding ? 'Update Finding' : 'Create Finding'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ControlAssessmentModal = ({ isOpen, onClose, onSubmit, audit, control = null }) => {
  const [formData, setFormData] = useState({
    control_name: control?.control_name || '',
    control_description: control?.control_description || '',
    status: control?.status || 'not_assessed',
    notes: control?.notes || '',
    remediation_required: control?.remediation_required || false,
    remediation_status: control?.remediation_status || 'not_required',
    remediation_deadline: control?.remediation_deadline || '',
  });

  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'not_assessed', label: 'Not Assessed' },
    { value: 'compliant', label: 'Compliant' },
    { value: 'non_compliant', label: 'Non-Compliant' },
    { value: 'partially_compliant', label: 'Partially Compliant' },
  ];

  const remediationStatusOptions = [
    { value: 'not_required', label: 'Not Required' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        audit: audit.id,
      };
      await onSubmit(data, control?.id);
      onClose();
    } catch (error) {
      console.error('Error saving control:', error);
      alert(error.response?.data?.error || 'Failed to save control');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {control ? 'Edit Control Assessment' : 'Add Control Assessment'}
              </h2>
              <p className="text-gray-600 mt-1">
                {control ? 'Update control assessment' : 'Assess a control for audit ' + (audit?.audit_id || '')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Control Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.control_name}
                  onChange={(e) => setFormData({ ...formData, control_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="e.g., Access Control Policy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Control Description *
              </label>
              <textarea
                required
                value={formData.control_description}
                onChange={(e) => setFormData({ ...formData, control_description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={3}
                placeholder="Describe the control requirements and implementation..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={2}
                  placeholder="Additional assessment notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remediation Status
                </label>
                <select
                  value={formData.remediation_status}
                  onChange={(e) => setFormData({ ...formData, remediation_status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {remediationStatusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.remediation_required}
                    onChange={(e) => setFormData({ ...formData, remediation_required: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Remediation Required</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remediation Deadline
                </label>
                <input
                  type="date"
                  value={formData.remediation_deadline}
                  onChange={(e) => setFormData({ ...formData, remediation_deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {control ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    {control ? 'Update Control' : 'Add Control Assessment'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ReportGeneratorModal = ({ isOpen, onClose, onSubmit, audits = [] }) => {
  const [formData, setFormData] = useState({
    title: `Audit Report ${new Date().toLocaleDateString()}`,
    format: 'pdf',
  });

  const [loading, setLoading] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState('');

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: <FileText /> },
    { value: 'excel', label: 'Excel Spreadsheet', icon: <FileBarChart /> },
    { value: 'csv', label: 'CSV File', icon: <Database /> },
    { value: 'html', label: 'HTML Report', icon: <FileText /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedAuditId) {
      alert('Please select an audit to generate a report for');
      setLoading(false);
      return;
    }

    try {
      const reportData = {
        ...formData,
        audit_ids: [parseInt(selectedAuditId)],
        parameters: JSON.stringify({
          date_from: '',
          date_to: '',
          include_findings: true,
          include_controls: true,
        }),
      };

      console.log('Submitting report data:', reportData);
      await onSubmit(reportData);
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      alert(error.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generate Audit Report</h2>
              <p className="text-gray-600 mt-1">Create detailed audit reports in various formats</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="e.g., Annual GDPR Compliance Audit Report"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Audit *
              </label>
              <select
                required
                value={selectedAuditId}
                onChange={(e) => setSelectedAuditId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Choose an audit...</option>
                {audits.map(audit => (
                  <option key={audit.id} value={audit.id}>
                    {audit.audit_id} - {audit.title}
                  </option>
                ))}
              </select>
              {selectedAuditId && (
                <div className="mt-2 text-xs text-gray-500">
                  Selected: {audits.find(a => a.id === parseInt(selectedAuditId))?.title}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Format *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {formatOptions.map(format => (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, format: format.value })}
                    className={`p-4 border rounded-xl text-left transition-all ${formData.format === format.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-30'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${formData.format === format.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        {format.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{format.label}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {format.value === 'pdf' ? 'Best for printing' :
                            format.value === 'excel' ? 'For data analysis' :
                              format.value === 'csv' ? 'For data import' :
                                'For web viewing'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedAuditId}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileBarChart className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreateAuditModal = ({ isOpen, onClose, onSubmit, standards = [], incidents = [], user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    standard_id: '',
    audit_type: 'internal',
    incident_ids: [],
    planned_start_date: '',
    planned_end_date: '',
    lead_auditor_id: user?.id || '',
    priority: 'medium',
  });

  const [loading, setLoading] = useState(false);
  const [selectedIncidents, setSelectedIncidents] = useState([]);

  const auditTypes = [
    { value: 'internal', label: 'Internal Audit' },
    { value: 'external', label: 'External Audit' },
    { value: 'regulatory', label: 'Regulatory Audit' },
    { value: 'certification', label: 'Certification Audit' },
    { value: 'incident_response', label: 'Incident Response Audit' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        incident_ids: selectedIncidents.map(inc => inc.id),
      };
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error creating audit:', error);
      alert(error.response?.data?.error || 'Failed to create audit');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Compliance Audit</h2>
              <p className="text-gray-600 mt-1">Schedule a new compliance audit</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audit Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="e.g., Annual GDPR Compliance Audit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compliance Standard *
                </label>
                <select
                  required
                  value={formData.standard_id}
                  onChange={(e) => setFormData({ ...formData, standard_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select standard</option>
                  {standards.map(standard => (
                    <option key={standard.id} value={standard.id}>
                      {standard.name} ({standard.standard_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audit Type *
                </label>
                <select
                  required
                  value={formData.audit_type}
                  onChange={(e) => setFormData({ ...formData, audit_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {auditTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planned Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.planned_start_date}
                  onChange={(e) => setFormData({ ...formData, planned_start_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planned End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.planned_end_date}
                  onChange={(e) => setFormData({ ...formData, planned_end_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={3}
                placeholder="Describe the audit scope and objectives..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Incidents (Optional)
              </label>
              <div className="border border-gray-300 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                {incidents.map(incident => (
                  <label
                    key={incident.id}
                    className={`flex items-center gap-3 p-3 border-b border-gray-200 last:border-b-0 cursor-pointer hover:bg-gray-50 ${selectedIncidents.some(inc => inc.id === incident.id) ? 'bg-blue-50' : ''
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIncidents.some(inc => inc.id === incident.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIncidents([...selectedIncidents, incident]);
                        } else {
                          setSelectedIncidents(selectedIncidents.filter(inc => inc.id !== incident.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">{incident.incident_number}</div>
                      <div className="text-xs text-gray-500">{incident.title}</div>
                    </div>
                    <SeverityBadge severity={incident.severity} size="sm" />
                  </label>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {selectedIncidents.length} incident(s) selected
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Create Audit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AuditDetailModal = ({ isOpen, onClose, audit, user, onUpdate, onDelete, onAddFinding, onAddControl, findings = [], controls = [] }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !audit) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateAuditProgress = () => {
    if (!controls || controls.length === 0) return 0;
    const completedControls = controls.filter(control =>
      control.status === 'compliant' || control.status === 'non_compliant'
    ).length;
    return Math.round((completedControls / controls.length) * 100);
  };

  const calculateComplianceScore = () => {
    if (!controls || controls.length === 0) return 0;
    const compliantControls = controls.filter(control =>
      control.status === 'compliant'
    ).length;
    return Math.round((compliantControls / controls.length) * 100);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(audit.id);
      onClose();
    } catch (error) {
      console.error('Error deleting audit:', error);
      alert('Failed to delete audit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="border-b border-gray-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{audit.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-medium text-gray-700">{audit.audit_id}</span>
                    <StatusBadge status={audit.status} size="lg" />
                    {audit.overall_score && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${audit.overall_score >= 90 ? 'bg-green-100 text-green-800' :
                        audit.overall_score >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        Score: {audit.overall_score}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{audit.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-8 flex space-x-6 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: <BarChart3 /> },
              { key: 'findings', label: 'Findings', icon: <Flag />, count: findings.length },
              { key: 'controls', label: 'Controls', icon: <CheckSquare />, count: controls.length },
            ].map(({ key, label, icon, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`pb-3 px-1 font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {icon}
                {label}
                {count !== undefined && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Audit Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Standard:</span>
                      <span className="font-medium">{audit.standard_details?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{audit.audit_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lead Auditor:</span>
                      <span className="font-medium">{audit.lead_auditor_details?.full_name || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className="font-medium capitalize">{audit.priority}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planned Start:</span>
                      <span className="font-medium">{formatDate(audit.planned_start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planned End:</span>
                      <span className="font-medium">{formatDate(audit.planned_end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual Start:</span>
                      <span className="font-medium">{formatDate(audit.actual_start_date) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Actual End:</span>
                      <span className="font-medium">{formatDate(audit.actual_end_date) || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Audit Progress</h3>
                  <ProgressBar
                    percentage={calculateAuditProgress()}
                    color="blue"
                    label={`${controls.filter(c => c.status === 'compliant' || c.status === 'non_compliant').length} of ${controls.length} controls assessed`}
                  />
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {controls.filter(c => c.status === 'compliant').length}
                      </div>
                      <div className="text-sm text-gray-600">Compliant</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {controls.filter(c => c.status === 'partially_compliant').length}
                      </div>
                      <div className="text-sm text-gray-600">Partial</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {controls.filter(c => c.status === 'non_compliant').length}
                      </div>
                      <div className="text-sm text-gray-600">Non-Compliant</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Compliance Score</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {calculateComplianceScore()}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Compliance</div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-medium text-gray-700 mb-4">Findings Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Findings:</span>
                      <span className="font-medium">{findings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Open Findings:</span>
                      <span className="font-medium text-yellow-600">
                        {findings.filter(f => f.status === 'open').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolved Findings:</span>
                      <span className="font-medium text-green-600">
                        {findings.filter(f => f.status === 'resolved' || f.status === 'closed').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'findings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Audit Findings</h3>
                <button
                  onClick={() => onAddFinding(audit)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Finding
                </button>
              </div>

              {findings.length === 0 ? (
                <div className="text-center py-12">
                  <Flag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No findings added yet</p>
                  <p className="text-sm text-gray-400 mt-2">Add findings discovered during the audit</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Title</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Type/Risk</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Due Date</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {findings.map(finding => (
                        <tr key={finding.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="max-w-xs">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {finding.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {finding.description?.substring(0, 50)}...
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <span className={`text-xs px-2 py-1 rounded-full w-fit ${finding.finding_type === 'major' ? 'bg-red-100 text-red-800' :
                                finding.finding_type === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                {finding.finding_type}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full w-fit ${finding.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                                finding.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                {finding.risk_level}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={finding.status} />
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-sm ${finding.target_completion_date &&
                              new Date(finding.target_completion_date) < new Date() &&
                              ['open', 'in_progress'].includes(finding.status) ?
                              'text-red-600 font-medium' : 'text-gray-600'
                              }`}>
                              {formatDate(finding.target_completion_date)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onAddFinding(audit, finding)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this finding?')) {
                                    try {
                                      const token = localStorage.getItem('access_token');
                                      await axios.delete(
                                        `${API_BASE_URL}/compliance-audit/findings/${finding.id}/`,
                                        { headers: { Authorization: `Bearer ${token}` } }
                                      );
                                      onUpdate(); // Refresh data
                                    } catch (error) {
                                      console.error('Error deleting finding:', error);
                                    }
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
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
          )}

          {activeTab === 'controls' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Control Assessments</h3>
                <button
                  onClick={() => onAddControl(audit)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Control
                </button>
              </div>

              {controls.length === 0 ? (
                <div className="text-center py-12">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No controls assessed yet</p>
                  <p className="text-sm text-gray-400 mt-2">Add control assessments for this audit</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Control Name</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Remediation</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {controls.map(control => (
                        <tr key={control.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="max-w-xs">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {control.control_name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {control.control_description?.substring(0, 50)}...
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${control.status === 'compliant' ? 'bg-green-100 text-green-800' :
                              control.status === 'non_compliant' ? 'bg-red-100 text-red-800' :
                                control.status === 'partially_compliant' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                              {control.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {control.remediation_required ? (
                              <div className="space-y-1">
                                <span className={`px-2 py-1 rounded text-xs ${control.remediation_status === 'completed' ? 'bg-green-100 text-green-800' :
                                  control.remediation_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                  {control.remediation_status}
                                </span>
                                {control.remediation_deadline && (
                                  <div className="text-xs text-gray-500">
                                    Due: {formatDate(control.remediation_deadline)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Not required</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onAddControl(audit, control)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this control assessment?')) {
                                    try {
                                      const token = localStorage.getItem('access_token');
                                      await axios.delete(
                                        `${API_BASE_URL}/compliance-audit/controls/${control.id}/`,
                                        { headers: { Authorization: `Bearer ${token}` } }
                                      );
                                      onUpdate(); // Refresh data
                                    } catch (error) {
                                      console.error('Error deleting control:', error);
                                    }
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
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
          )}
        </div>

        <div className="border-t border-gray-200 p-8 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {(user?.role === 'admin' || user?.role === 'compliance_officer') && (
                <>
                  {audit.status !== 'completed' && (
                    <button
                      onClick={() => {
                        onUpdate(audit.id, { status: 'completed' });
                        onClose();
                      }}
                      disabled={loading}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Complete
                    </button>
                  )}
                </>
              )}
            </div>

            {(user?.role === 'admin' || user?.role === 'compliance_officer') && (
              <div className="relative">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Audit
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-red-200">
                    <span className="text-sm text-red-700 font-medium">Confirm deletion?</span>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
export function ComplianceAudit() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: {},
    audits: [],
    standards: [],
    findings: [],
    controls: [],
    incidents: [],
    reports: [],
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    page_size: 10,
  });

  const [activeView, setActiveView] = useState('audits');
  const [showCreateAuditModal, setShowCreateAuditModal] = useState(false);
  const [showAuditDetailModal, setShowAuditDetailModal] = useState(false);
  const [showCreateStandardModal, setShowCreateStandardModal] = useState(false);
  const [showCreateFindingModal, setShowCreateFindingModal] = useState(false);
  const [showControlAssessmentModal, setShowControlAssessmentModal] = useState(false);
  const [showReportGeneratorModal, setShowReportGeneratorModal] = useState(false);

  const [selectedAudit, setSelectedAudit] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState(null);

  const token = localStorage.getItem('access_token');

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch standards
      const standardsRes = await axios.get(`${API_BASE_URL}/compliance-audit/standards/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const standards = standardsRes.data?.results?.standards || standardsRes.data;
      console.log("Standards endpoint - Full response:", standardsRes.data);
      console.log("Standards endpoint - Parsed data:", standards);
      console.log("Standards endpoint - Array length:", Array.isArray(standards) ? standards.length : 'Not an array');

      // Fetch audits
      const auditsRes = await axios.get(`${API_BASE_URL}/compliance-audit/audits/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      const audits = auditsRes.data.audits || auditsRes.data?.results?.audits || auditsRes.data;
      console.log("Audits endpoint - Full response:", auditsRes.data);
      console.log("Audits endpoint - Parsed data:", audits);
      console.log("Audits endpoint - Array length:", Array.isArray(audits) ? audits.length : 'Not an array');

      // Fetch findings
      const findingsRes = await axios.get(`${API_BASE_URL}/compliance-audit/findings/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 100 }
      });
      const findings = findingsRes.data.findings || findingsRes.data?.results?.findings || findingsRes.data;
      console.log("Findings endpoint - Full response:", findingsRes.data);
      console.log("Findings endpoint - Parsed data:", findings);
      console.log("Findings endpoint - Array length:", Array.isArray(findings) ? findings.length : 'Not an array');

      // Fetch controls
      const controlsRes = await axios.get(`${API_BASE_URL}/compliance-audit/controls/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 100 }
      }).catch((error) => {
        console.log("Controls endpoint - Error:", error.message);
        return { data: [] };
      });
      const controls = controlsRes.data.control_assessments || controlsRes.data?.results?.control_assessments || controlsRes.data || [];
      console.log("Controls endpoint - Full response:", controlsRes.data);
      console.log("Controls endpoint - Parsed data:", controls);
      console.log("Controls endpoint - Array length:", Array.isArray(controls) ? controls.length : 'Not an array');

      // Fetch incidents
      const incidentsRes = await axios.get(`${API_BASE_URL}/incidents/my/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page_size: 50 }
      }).catch((error) => {
        console.log("Incidents endpoint - Error:", error.message);
        return { data: [] };
      });
      const incidents = incidentsRes.data.incidents || incidentsRes.data.results || incidentsRes.data || [];
      console.log("Incidents endpoint - Full response:", incidentsRes.data);
      console.log("Incidents endpoint - Parsed data:", incidents);
      console.log("Incidents endpoint - Array length:", Array.isArray(incidents) ? incidents.length : 'Not an array');

      // Fetch reports
      const reportsRes = await axios.get(`${API_BASE_URL}/compliance-audit/reports/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch((error) => {
        console.log("Reports endpoint - Error:", error.message);
        return { data: [] };
      });
      const reports = reportsRes.data.reports || reportsRes.data?.results?.reports || reportsRes.data || [];
      console.log("Reports endpoint - Full response:", reportsRes.data);
      console.log("Reports endpoint - Parsed data:", reports);
      console.log("Reports endpoint - Array length:", Array.isArray(reports) ? reports.length : 'Not an array');

      // Fetch dashboard overview
      const overviewRes = await axios.get(`${API_BASE_URL}/compliance-audit/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch((error) => {
        console.log("Dashboard endpoint - Error:", error.message);
        return { data: {} };
      });
      const overview = overviewRes.data.dashboard || overviewRes.data || {};
      console.log("Dashboard endpoint - Full response:", overviewRes.data);
      console.log("Dashboard endpoint - Parsed data:", overview);

      setData({
        overview,
        audits: Array.isArray(audits) ? audits : [],
        standards: Array.isArray(standards) ? standards : [],
        findings: Array.isArray(findings) ? findings : [],
        controls: Array.isArray(controls) ? controls : [],
        incidents: Array.isArray(incidents) ? incidents : [],
        reports: Array.isArray(reports) ? reports : [],
      });

      console.log("Final state data:", {
        overview,
        audits: Array.isArray(audits) ? audits : [],
        standards: Array.isArray(standards) ? standards : [],
        findings: Array.isArray(findings) ? findings : [],
        controls: Array.isArray(controls) ? controls : [],
        incidents: Array.isArray(incidents) ? incidents : [],
        reports: Array.isArray(reports) ? reports : [],
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setData({
        overview: {},
        audits: [],
        standards: [],
        findings: [],
        controls: [],
        incidents: [],
        reports: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token, filters.page, filters.status]);

  const handleCreateStandard = async (standardData, standardId = null) => {
    try {
      if (standardId) {
        await axios.patch(
          `${API_BASE_URL}/compliance-audit/standards/${standardId}/`,
          standardData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/compliance-audit/standards/`,
          standardData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchAllData();
      alert(`Standard ${standardId ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving standard:', error);
      alert(error.response?.data?.error || 'Failed to save standard');
    }
  };

  const handleDeleteStandard = async (standardId) => {
    if (!window.confirm('Are you sure you want to delete this standard? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/compliance-audit/standards/${standardId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
      alert('Standard deleted successfully!');
    } catch (error) {
      console.error('Error deleting standard:', error);
      alert('Failed to delete standard');
    }
  };

  const handleCreateFinding = async (findingData, findingId = null) => {
    try {
      if (findingId) {
        await axios.patch(
          `${API_BASE_URL}/compliance-audit/findings/${findingId}/`,
          findingData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/compliance-audit/findings/`,
          findingData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchAllData();
      alert(`Finding ${findingId ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving finding:', error);
      alert(error.response?.data?.error || 'Failed to save finding');
    }
  };

  const handleCreateControl = async (controlData, controlId = null) => {
    try {
      if (controlId) {
        await axios.patch(
          `${API_BASE_URL}/compliance-audit/controls/${controlId}/`,
          controlData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/compliance-audit/controls/`,
          controlData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchAllData();
      alert(`Control assessment ${controlId ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error saving control:', error);
      alert(error.response?.data?.error || 'Failed to save control');
    }
  };


  const handleGenerateReport = async (reportData) => {
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      console.log('Generating report with data:', reportData);
      console.log('Using token:', token.substring(0, 20) + '...');

      const response = await axios.post(
        `${API_BASE_URL}/compliance-audit/reports/generate/`,
        reportData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Report generation response:', response.data);

      if (response.data.success) {
        alert('Report generated successfully!');
        fetchAllData(); // Refresh the reports list

        // Automatically download the report
        if (response.data.report?.id) {
          console.log('Initiating download for report ID:', response.data.report.id);
          await downloadReport(response.data.report.id);
        }
      } else {
        alert('Report generation failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating report:', error);
      console.error('Error response:', error.response?.data);

      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else {
        alert(error.response?.data?.error || 'Failed to generate report');
      }
    }
  };

  const downloadReport = async (reportId) => {
  try {
    const token = localStorage.getItem('access_token');

    if (!token) {
      alert('Authentication required. Please log in again.');
      return;
    }

    console.log('Downloading report ID:', reportId);
    console.log('Using token:', token.substring(0, 20) + '...');

    const downloadUrl = `${API_BASE_URL}/compliance-audit/reports/${reportId}/download/`;
    console.log('Download URL:', downloadUrl);

    // Use fetch instead of axios for better file download handling
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Download response status:', response.status);
    console.log('Download response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Download error data:', errorData);

      if (response.status === 401) {
        alert('Session expired. Please log in again.');
        return;
      }

      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'report.pdf'; // Default filename
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }

    // Get report format from custom header or infer from filename
    const reportFormat = response.headers.get('X-Report-Format') || 
                        filename.split('.').pop().toLowerCase() || 
                        'pdf';
    
    console.log('Downloading as filename:', filename);
    console.log('Report format:', reportFormat);

    // Convert response to blob
    const blob = await response.blob();
    console.log('Downloaded blob size:', blob.size, 'bytes');
    console.log('Blob type:', blob.type);

    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    // Validate blob type matches expected format
    const expectedTypes = {
      'pdf': 'application/pdf',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'csv': 'text/csv',
      'html': 'text/html'
    };

    const expectedType = expectedTypes[reportFormat];
    if (expectedType && blob.type && blob.type !== expectedType && blob.type !== 'application/octet-stream') {
      console.warn(`Unexpected content type: ${blob.type}, expected: ${expectedType}`);
    }

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log('Download completed successfully');
    
    // Show success message
    setTimeout(() => {
      alert(`Report downloaded successfully as ${filename}`);
    }, 300);

  } catch (error) {
    console.error('Error downloading report:', error);
    
    // Show user-friendly error message
    let errorMessage = `Failed to download report: ${error.message}`;
    
    if (error.message.includes('empty')) {
      errorMessage = 'The report file is empty. Please try generating the report again.';
    } else if (error.message.includes('permission') || error.message.includes('401')) {
      errorMessage = 'You do not have permission to download this report or your session has expired. Please log in again.';
    } else if (error.message.includes('404')) {
      errorMessage = 'Report file not found. Please generate the report again.';
    }
    
    alert(errorMessage);
  }
};

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(
        `${API_BASE_URL}/compliance-audit/reports/delete/${reportId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Report deleted successfully!');
        fetchAllData(); // Refresh the reports list
      } else {
        alert('Failed to delete report: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert(error.response?.data?.error || 'Failed to delete report');
    }
  };


  const handleDeleteAudit = async (auditId) => {
    if (!window.confirm('Are you sure you want to delete this audit?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/compliance-audit/audits/${auditId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
      alert('Audit deleted successfully!');
    } catch (error) {
      console.error('Error deleting audit:', error);
      alert('Failed to delete audit');
    }
  };

  const handleUpdateAudit = async (auditId, updateData) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/compliance-audit/audits/${auditId}/`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllData();
      alert('Audit updated successfully!');
    } catch (error) {
      console.error('Error updating audit:', error);
      alert('Failed to update audit');
    }
  };

  const handleCreateAudit = async (auditData) => {
    try {
      await axios.post(
        `${API_BASE_URL}/compliance-audit/audits/`,
        auditData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowCreateAuditModal(false);
      fetchAllData();
      alert('Audit created successfully!');
    } catch (error) {
      console.error('Error creating audit:', error);
      alert(error.response?.data?.error || 'Failed to create audit');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statistics = {
    totalAudits: data.audits.length,
    completedAudits: data.audits.filter(a => a.status === 'completed').length,
    incidentAudits: data.audits.filter(a => a.audit_type === 'incident_response').length,
    openFindings: data.findings.filter(f => f.status === 'open').length,
    highRiskFindings: data.findings.filter(f => f.risk_level === 'high' || f.risk_level === 'critical').length,
    totalStandards: data.standards.length,
    activeStandards: data.standards.filter(s => s.is_active).length,
    totalControls: data.controls.length,
    compliantControls: data.controls.filter(c => c.status === 'compliant').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Compliance Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-8 w-8" />
                <h1 className="text-3xl font-bold">Compliance Audit Management</h1>
              </div>
              <p className="text-blue-100 max-w-3xl">
                Comprehensive compliance auditing system with standards management,
                findings tracking, control assessments, and detailed reporting.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCreateAuditModal(true)}
                disabled={!user || !(user.role === 'admin' || user.role === 'compliance_officer')}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                <Plus className="h-4 w-4" />
                New Audit
              </button>
              <button
                onClick={() => setShowReportGeneratorModal(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                <FileBarChart className="h-4 w-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Audits"
            value={statistics.totalAudits}
            icon={<Shield className="h-6 w-6" />}
            color="blue"
            description="Across all standards"
          />
          <StatCard
            title="Active Standards"
            value={statistics.activeStandards}
            icon={<Award className="h-6 w-6" />}
            color="green"
            description="Compliance frameworks"
          />
          <StatCard
            title="Open Findings"
            value={statistics.openFindings}
            icon={<Flag className="h-6 w-6" />}
            color="yellow"
            description="Requiring action"
          />
          <StatCard
            title="Controls Assessed"
            value={statistics.totalControls}
            icon={<CheckSquare className="h-6 w-6" />}
            color="purple"
            description="Across all audits"
          />
        </div>

        {/* View Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8 overflow-x-auto">
              {[
                { key: 'audits', label: 'Audits', count: statistics.totalAudits, icon: <Shield /> },
                { key: 'standards', label: 'Standards', count: statistics.totalStandards, icon: <Award /> },
                { key: 'findings', label: 'Findings', count: data.findings.length, icon: <Flag /> },
                { key: 'controls', label: 'Controls', count: data.controls.length, icon: <CheckSquare /> },
                { key: 'incidents', label: 'Incidents', count: data.incidents.length, icon: <AlertTriangle /> },
                { key: 'reports', label: 'Reports', count: data.reports.length, icon: <FileText /> },
              ].map(({ key, label, count, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveView(key)}
                  className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeView === key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {icon}
                  {label}
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                    {count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {activeView === 'audits' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search audits..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange({ search: e.target.value })}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange({ status: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={fetchAllData}
                      className="p-2 text-gray-600 hover:text-gray-900"
                      title="Refresh"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Audit ID</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Title</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Standard</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Progress</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.audits.map(audit => {
                        const auditControls = data.controls.filter(c => c.audit === audit.id);
                        const completedControls = auditControls.filter(c =>
                          c.status === 'compliant' || c.status === 'non_compliant'
                        ).length;
                        const progress = auditControls.length > 0
                          ? Math.round((completedControls / auditControls.length) * 100)
                          : 0;

                        return (
                          <tr key={audit.id} className="hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="font-medium text-sm text-gray-900">
                                {audit.audit_id}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="max-w-xs">
                                <div className="font-medium text-sm text-gray-900 truncate">
                                  {audit.title}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {audit.description?.substring(0, 50)}...
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm text-gray-700">
                                {audit.standard_details?.name || audit.standard?.name || 'N/A'}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <StatusBadge status={audit.status} />
                            </td>
                            <td className="py-4 px-6">
                              <ProgressBar
                                percentage={progress}
                                color={
                                  progress >= 90 ? 'green' :
                                    progress >= 70 ? 'blue' :
                                      progress >= 50 ? 'yellow' : 'red'
                                }
                                showLabel={false}
                              />
                              <div className="text-xs text-gray-500 mt-1">
                                {completedControls} of {auditControls.length} controls
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedAudit(audit);
                                    setShowAuditDetailModal(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {(user?.role === 'admin' || user?.role === 'compliance_officer') && (
                                  <>
                                    <button
                                      onClick={() => handleDeleteAudit(audit.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'standards' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Compliance Standards</h3>
                  <button
                    onClick={() => {
                      setSelectedStandard(null);
                      setShowCreateStandardModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Standard
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.standards.map(standard => (
                    <div key={standard.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <Award className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{standard.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">{standard.standard_type}</span>
                              <span className="text-sm text-gray-500">v{standard.version}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${standard.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {standard.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{standard.description}</p>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total Controls:</span>
                          <span className="font-medium">{standard.total_controls || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Mandatory Controls:</span>
                          <span className="font-medium">{standard.mandatory_controls || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Compliance Score:</span>
                          <span className="font-medium">{standard.compliance_score || 0}%</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => {
                            handleFilterChange({ standard_id: standard.id });
                            setActiveView('audits');
                          }}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Audits
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStandard(standard);
                            setShowCreateStandardModal(true);
                          }}
                          className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStandard(standard.id)}
                          className="px-3 border border-red-300 hover:bg-red-50 text-red-700 py-2 rounded-lg text-sm font-medium transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'findings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">Audit Findings</h3>
                    <p className="text-sm text-gray-600">Findings discovered during compliance audits</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFinding(null);
                      setShowCreateFindingModal(true);
                    }}
                    disabled={!data.audits.length}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Finding
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-gray-900">{data.findings.length}</div>
                    <div className="text-sm text-gray-600">Total Findings</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {data.findings.filter(f => f.finding_type === 'major').length}
                    </div>
                    <div className="text-sm text-gray-600">Major Findings</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {data.findings.filter(f => f.risk_level === 'high' || f.risk_level === 'critical').length}
                    </div>
                    <div className="text-sm text-gray-600">High Risk</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.findings.filter(f => f.status === 'closed').length}
                    </div>
                    <div className="text-sm text-gray-600">Resolved</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Title</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Audit</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Type/Risk</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.findings.map(finding => (
                        <tr key={finding.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="max-w-xs">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {finding.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {finding.description?.substring(0, 50)}...
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-700">
                              {finding.audit_details?.audit_id || finding.audit?.audit_id || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <span className={`text-xs px-2 py-1 rounded-full w-fit ${finding.finding_type === 'major' ? 'bg-red-100 text-red-800' :
                                finding.finding_type === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                {finding.finding_type}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full w-fit ${finding.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                                finding.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                {finding.risk_level}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={finding.status} />
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedFinding(finding);
                                  setShowCreateFindingModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this finding?')) {
                                    try {
                                      await axios.delete(
                                        `${API_BASE_URL}/compliance-audit/findings/${finding.id}/`,
                                        { headers: { Authorization: `Bearer ${token}` } }
                                      );
                                      fetchAllData();
                                    } catch (error) {
                                      console.error('Error deleting finding:', error);
                                    }
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'controls' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">Control Assessments</h3>
                    <p className="text-sm text-gray-600">Security controls assessed during audits</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedControl(null);
                      setShowControlAssessmentModal(true);
                    }}
                    disabled={!data.audits.length}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Control
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-gray-900">{data.controls.length}</div>
                    <div className="text-sm text-gray-600">Total Controls</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.controls.filter(c => c.status === 'compliant').length}
                    </div>
                    <div className="text-sm text-gray-600">Compliant</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {data.controls.filter(c => c.status === 'partially_compliant').length}
                    </div>
                    <div className="text-sm text-gray-600">Partial</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {data.controls.filter(c => c.status === 'non_compliant').length}
                    </div>
                    <div className="text-sm text-gray-600">Non-Compliant</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Control Name</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Audit</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Remediation</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.controls.map(control => (
                        <tr key={control.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="max-w-xs">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {control.control_name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {control.control_description?.substring(0, 50)}...
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-700">
                              {control.audit_details?.audit_id || control.audit?.audit_id || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${control.status === 'compliant' ? 'bg-green-100 text-green-800' :
                              control.status === 'non_compliant' ? 'bg-red-100 text-red-800' :
                                control.status === 'partially_compliant' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                              }`}>
                              {control.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {control.remediation_required ? (
                              <div className="space-y-1">
                                <span className={`px-2 py-1 rounded text-xs ${control.remediation_status === 'completed' ? 'bg-green-100 text-green-800' :
                                  control.remediation_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                  {control.remediation_status}
                                </span>
                                {control.remediation_deadline && (
                                  <div className="text-xs text-gray-500">
                                    Due: {formatDate(control.remediation_deadline)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Not required</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedControl(control);
                                  setShowControlAssessmentModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this control assessment?')) {
                                    try {
                                      await axios.delete(
                                        `${API_BASE_URL}/compliance-audit/controls/${control.id}/`,
                                        { headers: { Authorization: `Bearer ${token}` } }
                                      );
                                      fetchAllData();
                                    } catch (error) {
                                      console.error('Error deleting control:', error);
                                    }
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'incidents' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-gray-900">{data.incidents.length}</div>
                    <div className="text-sm text-gray-600">Total Incidents</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {data.incidents.filter(i => i.severity === 'critical').length}
                    </div>
                    <div className="text-sm text-gray-600">Critical</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {data.incidents.filter(i => i.status === 'pending' || i.status === 'investigating').length}
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.incidents.filter(i => i.compliance_audits?.length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">With Audits</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Incident ID</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Title</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Severity</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.incidents.slice(0, 10).map(incident => (
                        <tr key={incident.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="font-medium text-sm text-gray-900">
                              {incident.incident_number}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="max-w-xs">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {incident.title}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <SeverityBadge severity={incident.severity} />
                          </td>
                          <td className="py-4 px-6">
                            <StatusBadge status={incident.status} />
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {formatDate(incident.created_at)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'reports' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">Generated Reports</h3>
                    <p className="text-sm text-gray-600">Audit reports available for download</p>
                  </div>
                  <button
                    onClick={() => setShowReportGeneratorModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Generate New Report
                  </button>
                </div>

                {/* Filter Controls */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        onChange={(e) => {/* Add filter logic */ }}
                      >
                        <option value="">All Formats</option>
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                        <option value="html">HTML</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        onChange={(e) => {/* Add filter logic */ }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search reports..."
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                          onChange={(e) => {/* Add filter logic */ }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reports Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Report ID</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Title</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Audit</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Format</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Generated By</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Date</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Downloads</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-700 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.reports.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-gray-500">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="font-medium">No reports generated yet</p>
                            <p className="text-sm text-gray-400 mt-2">
                              Generate your first audit report using the button above
                            </p>
                          </td>
                        </tr>
                      ) : (
                        data.reports.map(report => {
                          const audit = data.audits.find(a => a.id === report.audit);

                          return (
                            <tr key={report.id} className="hover:bg-gray-50">
                              <td className="py-4 px-6">
                                <div className="font-mono text-sm text-gray-900 font-medium">
                                  {report.report_id}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="max-w-xs">
                                  <div className="font-medium text-sm text-gray-900 truncate">
                                    {report.title}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                {audit ? (
                                  <div className="max-w-xs">
                                    <div className="text-sm text-gray-900 truncate">
                                      {audit.audit_id}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {audit.title.substring(0, 30)}...
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">N/A</span>
                                )}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${report.format === 'pdf' ? 'bg-red-100 text-red-800' :
                                  report.format === 'excel' ? 'bg-green-100 text-green-800' :
                                    report.format === 'csv' ? 'bg-blue-100 text-blue-800' :
                                      'bg-purple-100 text-purple-800'
                                  }`}>
                                  {report.format.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm text-gray-700">
                                  {report.generated_by_details?.full_name ||
                                    report.generated_by?.full_name || 'System'}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm text-gray-600">
                                  {formatDate(report.generated_at)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(report.generated_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="text-sm text-gray-700 font-medium">
                                  {report.download_count}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => downloadReport(report.id)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Download Report"
                                  >
                                    <Download className="h-4 w-4" />
                                  </button>
                                  {(user?.role === 'admin' || user?.role === 'compliance_officer') && (
                                    <button
                                      onClick={() => handleDeleteReport(report.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Delete Report"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Statistics Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{data.reports.length}</div>
                    <div className="text-sm text-gray-600">Total Reports</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data.reports.filter(r => r.format === 'pdf').length}
                    </div>
                    <div className="text-sm text-gray-600">PDF Reports</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {data.reports.reduce((sum, report) => sum + (report.download_count || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Downloads</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {data.reports.filter(r => new Date(r.generated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                    </div>
                    <div className="text-sm text-gray-600">Last 30 Days</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateAuditModal
        isOpen={showCreateAuditModal}
        onClose={() => setShowCreateAuditModal(false)}
        onSubmit={handleCreateAudit}
        standards={data.standards}
        incidents={data.incidents}
        user={user}
      />

      <AuditDetailModal
        isOpen={showAuditDetailModal}
        onClose={() => {
          setShowAuditDetailModal(false);
          setSelectedAudit(null);
        }}
        audit={selectedAudit}
        user={user}
        onUpdate={handleUpdateAudit}
        onDelete={handleDeleteAudit}
        onAddFinding={(audit, finding = null) => {
          setSelectedFinding(finding);
          setSelectedAudit(audit);
          setShowCreateFindingModal(true);
        }}
        onAddControl={(audit, control = null) => {
          setSelectedControl(control);
          setSelectedAudit(audit);
          setShowControlAssessmentModal(true);
        }}
        findings={data.findings.filter(f => f.audit === selectedAudit?.id)}
        controls={data.controls.filter(c => c.audit === selectedAudit?.id)}
      />

      <CreateStandardModal
        isOpen={showCreateStandardModal}
        onClose={() => {
          setShowCreateStandardModal(false);
          setSelectedStandard(null);
        }}
        onSubmit={handleCreateStandard}
        standard={selectedStandard}
      />

      <CreateFindingModal
        isOpen={showCreateFindingModal}
        onClose={() => {
          setShowCreateFindingModal(false);
          setSelectedFinding(null);
        }}
        onSubmit={handleCreateFinding}
        audit={selectedAudit}
        finding={selectedFinding}
      />

      <ControlAssessmentModal
        isOpen={showControlAssessmentModal}
        onClose={() => {
          setShowControlAssessmentModal(false);
          setSelectedControl(null);
        }}
        onSubmit={handleCreateControl}
        audit={selectedAudit}
        control={selectedControl}
      />

      <ReportGeneratorModal
        isOpen={showReportGeneratorModal}
        onClose={() => setShowReportGeneratorModal(false)}
        onSubmit={handleGenerateReport}
        audits={data.audits}
        standards={data.standards}
      />
    </div>
  );
}