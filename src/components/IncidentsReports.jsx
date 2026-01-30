import { AlertTriangle, FileText, Download, Calendar, TrendingUp, Bell, AlertCircle } from "lucide-react";
import React, { useState } from "react";
// Mock data since imports aren't available
const mockIncidents = [
  { 
    id: 1001, 
    title: "Data Breach Attempt", 
    reporter: "J. Kamali", 
    severity: 'critical', 
    status: 'investigating', 
    assignedTo: "Security Team", 
    timestamp: "2025-12-29 14:30" 
  },
  { 
    id: 1002, 
    title: "Unauthorized Access", 
    reporter: "M. Uwase", 
    severity: 'high', 
    status: 'assigned', 
    assignedTo: "P. Habimana", 
    timestamp: "2025-12-28 09:15" 
  },
  { 
    id: 1003, 
    title: "Phishing Campaign Detected", 
    reporter: "System Alert", 
    severity: 'medium', 
    status: 'in-progress', 
    assignedTo: "IT Security", 
    timestamp: "2025-12-27 16:45" 
  },
  { 
    id: 1004, 
    title: "Policy Violation", 
    reporter: "G. Mukamana", 
    severity: 'low', 
    status: 'resolved', 
    assignedTo: "Compliance Dept", 
    timestamp: "2025-12-26 11:20" 
  },
  { 
    id: 1005, 
    title: "System Anomaly", 
    reporter: "AI Monitor", 
    severity: 'medium', 
    status: 'pending', 
    assignedTo: "System Admin", 
    timestamp: "2025-12-25 22:10" 
  }
];

export function IncidentsReports() {
  const incidentTrends = [
    { month: "Jul", critical: 2, high: 5, medium: 12, low: 8 },
    { month: "Aug", critical: 1, high: 8, medium: 15, low: 10 },
    { month: "Sep", critical: 3, high: 6, medium: 10, low: 7 },
    { month: "Oct", critical: 1, high: 4, medium: 9, low: 6 },
    { month: "Nov", critical: 0, high: 3, medium: 8, low: 5 },
    { month: "Dec", critical: 1, high: 2, medium: 5, low: 4 }
  ];

  const reports = [
    {
      id: 1,
      name: "Monthly Security Report - December 2025",
      type: "Security",
      generatedBy: "Uwimana Jean Claude",
      date: "2025-12-28",
      size: "2.4 MB"
    },
    {
      id: 2,
      name: "Compliance Audit Report Q4 2025",
      type: "Compliance",
      generatedBy: "Mukamana Grace",
      date: "2025-12-27",
      size: "3.1 MB"
    },
    {
      id: 3,
      name: "Access Control Analysis",
      type: "Access Control",
      generatedBy: "Ingabire Marie",
      date: "2025-12-26",
      size: "1.8 MB"
    },
    {
      id: 4,
      name: "AI Behavioral Analytics Report",
      type: "AI Analytics",
      generatedBy: "System AI",
      date: "2025-12-25",
      size: "4.2 MB"
    }
  ];

  const scheduledReports = [
    { name: "Weekly Security Digest", frequency: "Weekly", nextRun: "2026-01-05", recipients: 12 },
    { name: "Monthly Compliance Summary", frequency: "Monthly", nextRun: "2026-01-31", recipients: 8 },
    { name: "Daily Access Logs", frequency: "Daily", nextRun: "2025-12-30", recipients: 5 }
  ];

  const [activeTab, setActiveTab] = useState("incidents");

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'critical':
        return <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Critical</div>;
      case 'high':
        return <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">High</div>;
      case 'medium':
        return <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">Medium</div>;
      default:
        return <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Low</div>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'investigating':
        return <div className="border border-blue-300 text-blue-700 px-3 py-1 rounded-full text-xs">Investigating</div>;
      case 'assigned':
        return <div className="border border-blue-300 text-blue-700 px-3 py-1 rounded-full text-xs">Assigned</div>;
      case 'in-progress':
        return <div className="border border-yellow-300 text-yellow-700 px-3 py-1 rounded-full text-xs">In Progress</div>;
      case 'resolved':
        return <div className="border border-green-300 text-green-700 px-3 py-1 rounded-full text-xs">Resolved</div>;
      default:
        return <div className="border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs">Pending</div>;
    }
  };

  const getTypeBadge = (type) => {
    return <div className="border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs">{type}</div>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Incidents & Reports</h1>
            <p className="text-gray-600">Manage security incidents and generate compliance reports</p>
          </div>
          <div className="flex gap-2">
            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg flex items-center font-medium transition-colors">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center font-medium transition-colors">
              <FileText className="h-4 w-4 mr-2" />
              New Report
            </button>
          </div>
        </div>
        
        {/* Requirements Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-800">Module Requirements:</p>
              <p className="text-gray-700">
                <strong>Incident Response & Reporting System:</strong> Comprehensive incident management workflow 
                supporting creation, tracking, assignment, and resolution of security incidents. Features automated 
                incident classification by severity, real-time incident trending analytics, assignment workflows, 
                status tracking, and SLA monitoring. Includes customizable reporting engine for security, compliance, 
                access control, and AI analytics reports with scheduling capabilities. Implements response time 
                metrics, resolution tracking, automated report distribution, downloadable PDF/CSV exports, and 
                incident trend visualization for proactive threat management.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Open Incidents</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reports Generated</p>
              <h3 className="text-2xl font-bold">147</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved This Month</p>
              <h3 className="text-2xl font-bold">34</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <h3 className="text-2xl font-bold">8</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Trends */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Incident Trends</h2>
          <p className="text-gray-600">Security incident distribution over the last 6 months</p>
        </div>
        <div className="h-80">
          <div className="w-full h-full flex flex-col items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-center mb-4">
              <p className="text-gray-500 mb-2">Incident Trends Chart</p>
              <p className="text-sm text-gray-400">Data: {JSON.stringify(incidentTrends.slice(0, 3))}...</p>
            </div>
            <div className="space-y-3 w-full max-w-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-sm">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Incidents and Reports */}
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${activeTab === "incidents" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("incidents")}
          >
            Security Incidents
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "reports" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("reports")}
          >
            Generated Reports
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === "scheduled" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"}`}
            onClick={() => setActiveTab("scheduled")}
          >
            Scheduled Reports
          </button>
        </div>

        {activeTab === "incidents" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Active Security Incidents</h2>
                <p className="text-gray-600">Current incidents requiring attention</p>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Incident ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Reporter</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Severity</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned To</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockIncidents.map((incident) => (
                        <tr key={incident.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">INC-{String(incident.id).padStart(4, '0')}</td>
                          <td className="py-3 px-4 font-medium">{incident.title}</td>
                          <td className="py-3 px-4">{incident.reporter}</td>
                          <td className="py-3 px-4">
                            {getSeverityBadge(incident.severity)}
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(incident.status)}
                          </td>
                          <td className="py-3 px-4">{incident.assignedTo}</td>
                          <td className="py-3 px-4">{incident.timestamp}</td>
                          <td className="py-3 px-4">
                            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold">Generated Reports</h2>
                <p className="text-gray-600">Recently generated compliance and security reports</p>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Report Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Generated By</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Size</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{report.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getTypeBadge(report.type)}
                          </td>
                          <td className="py-3 px-4">{report.generatedBy}</td>
                          <td className="py-3 px-4">{report.date}</td>
                          <td className="py-3 px-4">{report.size}</td>
                          <td className="py-3 px-4">
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              <Download className="h-4 w-4 text-gray-600" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "scheduled" && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Scheduled Reports</h2>
                <p className="text-gray-600">Automated report generation schedules</p>
              </div>
              <div className="space-y-4">
                {scheduledReports.map((schedule, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">{schedule.name}</h4>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Frequency: {schedule.frequency}</span>
                          <span>•</span>
                          <span>Next Run: {schedule.nextRun}</span>
                          <span>•</span>
                          <span>Recipients: {schedule.recipients}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                          Edit
                        </button>
                        <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                          Pause
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Response Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-2">
            <h2 className="text-xl font-bold">Avg Response Time</h2>
            <p className="text-gray-600">Mean time to incident response</p>
          </div>
          <h3 className="text-3xl font-bold text-blue-600">2.3 hrs</h3>
          <p className="text-sm text-green-600 mt-2">-15% from last month</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-2">
            <h2 className="text-xl font-bold">Avg Resolution Time</h2>
            <p className="text-gray-600">Mean time to resolve incidents</p>
          </div>
          <h3 className="text-3xl font-bold text-blue-600">8.5 hrs</h3>
          <p className="text-sm text-green-600 mt-2">-22% from last month</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-2">
            <h2 className="text-xl font-bold">Success Rate</h2>
            <p className="text-gray-600">Incidents resolved successfully</p>
          </div>
          <h3 className="text-3xl font-bold text-blue-600">96.8%</h3>
          <p className="text-sm text-green-600 mt-2">+2% from last month</p>
        </div>
      </div>
    </div>
  );
}