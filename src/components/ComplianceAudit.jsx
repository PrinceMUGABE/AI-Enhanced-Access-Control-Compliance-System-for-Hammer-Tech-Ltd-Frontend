import { CheckCircle, XCircle, AlertTriangle, FileText, Download, Shield, AlertCircle } from "lucide-react";
import React, { useState } from "react";
// Mock data since imports aren't available
const mockComplianceMetrics = [
  { category: "Data Protection", score: 95, status: "compliant" },
  { category: "Access Control", score: 92, status: "compliant" },
  { category: "Incident Response", score: 88, status: "warning" },
  { category: "Risk Management", score: 85, status: "warning" },
  { category: "Third-Party Security", score: 78, status: "warning" },
  { category: "Physical Security", score: 96, status: "compliant" }
];

const mockPolicies = [
  { id: 1, name: "Data Protection Policy", version: "3.1", department: "Company-wide", lastUpdated: "2025-12-15", compliance: 95, status: "active" },
  { id: 2, name: "Access Control Policy", version: "2.4", department: "IT", lastUpdated: "2025-11-30", compliance: 92, status: "active" },
  { id: 3, name: "Incident Response Plan", version: "1.8", department: "Security", lastUpdated: "2025-10-20", compliance: 88, status: "draft" },
  { id: 4, name: "Remote Work Security", version: "2.0", department: "HR", lastUpdated: "2025-09-15", compliance: 76, status: "active" },
  { id: 5, name: "Vendor Risk Management", version: "1.5", department: "Procurement", lastUpdated: "2025-08-10", compliance: 82, status: "review" }
];

export function ComplianceAudit() {
  const overallCompliance = 89;

  const auditHistory = [
    { id: 1, name: "Q4 2025 Security Audit", date: "2025-12-15", score: 92, status: "completed" },
    { id: 2, name: "Q3 2025 Compliance Review", date: "2025-09-30", score: 88, status: "completed" },
    { id: 3, name: "GDPR Compliance Check", date: "2025-08-20", score: 95, status: "completed" },
    { id: 4, name: "ISO 27001 Assessment", date: "2025-07-10", score: 87, status: "completed" }
  ];

  const upcomingAudits = [
    { id: 1, name: "Annual Security Assessment", date: "2026-01-15", type: "Internal" },
    { id: 2, name: "SOC 2 Compliance Audit", date: "2026-02-01", type: "External" },
    { id: 3, name: "Data Protection Review", date: "2026-02-20", type: "Internal" }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Active</div>;
      case 'draft':
        return <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Draft</div>;
      case 'review':
        return <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">Review</div>;
      default:
        return <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">{status}</div>;
    }
  };

  const getChecklistStatusIcon = (status) => {
    switch(status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getChecklistStatusBadge = (status) => {
    switch(status) {
      case "complete":
        return <div className="border border-green-300 text-green-700 px-2 py-1 rounded-full text-xs">Complete</div>;
      case "in-progress":
        return <div className="border border-yellow-300 text-yellow-700 px-2 py-1 rounded-full text-xs">In Progress</div>;
      default:
        return <div className="border border-red-300 text-red-700 px-2 py-1 rounded-full text-xs">Pending</div>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compliance Audit & Management</h1>
            <p className="text-gray-600">Regulatory compliance monitoring and audit tracking</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center font-medium transition-colors">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
        
        {/* Requirements Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-800">Module Requirements:</p>
              <p className="text-gray-700">
                <strong>Compliance Audit & Regulatory Management:</strong> Automated compliance monitoring system 
                supporting GDPR, ISO 27001, SOC 2, and local Rwandan regulations. Features include continuous 
                compliance scoring, policy management, automated audit trails, evidence collection, control 
                assessment tracking, and regulatory mapping. Implements scheduled audit workflows, compliance 
                gap analysis, remediation tracking, certification management, and automated compliance reporting. 
                Provides audit history, upcoming audit scheduling, and downloadable compliance documentation for 
                regulatory submissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Overall Compliance</h2>
            <p className="text-gray-600">Organization-wide compliance score</p>
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative">
              <div className="text-center">
                <h1 className="text-5xl text-blue-600">{overallCompliance}%</h1>
                <p className="text-sm text-gray-500 mt-2">Compliant</p>
              </div>
            </div>
            <div className="mt-6 w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Compliant: 94%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Warning: 5%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Non-Compliant: 1%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 md:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Compliance Metrics by Category</h2>
            <p className="text-gray-600">Detailed compliance scores across key areas</p>
          </div>
          <div className="space-y-4">
            {mockComplianceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{metric.category}</h4>
                    {metric.status === "compliant" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <span className="font-medium">{metric.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${metric.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Policy Management */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Active Policies</h2>
          <p className="text-gray-600">Current security and compliance policies</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Policy Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Version</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Last Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Compliance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPolicies.map((policy) => (
                  <tr key={policy.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{policy.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{policy.version}</td>
                    <td className="py-3 px-4">{policy.department}</td>
                    <td className="py-3 px-4">{policy.lastUpdated}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${policy.compliance}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{policy.compliance}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(policy.status)}
                    </td>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audit History */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Audit History</h2>
            <p className="text-gray-600">Previously completed audits and assessments</p>
          </div>
          <div className="space-y-3">
            {auditHistory.map((audit) => (
              <div key={audit.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{audit.name}</h4>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    {audit.score}%
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{audit.date}</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {audit.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Audits */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Upcoming Audits</h2>
            <p className="text-gray-600">Scheduled compliance reviews and assessments</p>
          </div>
          <div className="space-y-3">
            {upcomingAudits.map((audit) => (
              <div key={audit.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">{audit.name}</h4>
                  <div className="border border-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {audit.type}
                  </div>
                </div>
                <p className="text-sm text-gray-500">{audit.date}</p>
                <button className="border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium mt-3 transition-colors">
                  Prepare Audit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Compliance Checklist</h2>
          <p className="text-gray-600">Key compliance requirements and status</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { item: "Data Encryption at Rest", status: "complete" },
            { item: "Regular Security Training", status: "complete" },
            { item: "Incident Response Plan", status: "complete" },
            { item: "Access Control Review", status: "complete" },
            { item: "Password Policy Update", status: "pending" },
            { item: "Vendor Risk Assessment", status: "complete" },
            { item: "Backup and Recovery Testing", status: "in-progress" },
            { item: "Third-Party Audit", status: "pending" }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              {getChecklistStatusIcon(item.status)}
              <div className="flex-1">
                <p className="text-sm font-medium">{item.item}</p>
                <div className="mt-1">
                  {getChecklistStatusBadge(item.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}