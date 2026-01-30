import { Shield, AlertTriangle, Users, Activity, CheckCircle, XCircle, TrendingDown, InfoIcon, BookOpen, Award, Clock, Zap, Globe, Lock, Smartphone } from "lucide-react";
import React, { useState } from "react";
// Mock data since imports aren't available
const mockAccessTrends = [
  { day: "Mon", success: 1200, failed: 45, flagged: 12 },
  { day: "Tue", success: 1350, failed: 38, flagged: 8 },
  { day: "Wed", success: 1420, failed: 52, flagged: 15 },
  { day: "Thu", success: 1280, failed: 41, flagged: 10 },
  { day: "Fri", success: 950, failed: 28, flagged: 6 },
  { day: "Sat", success: 420, failed: 12, flagged: 3 },
  { day: "Sun", success: 380, failed: 9, flagged: 2 }
];

const mockRiskTrends = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 58 },
  { month: "Mar", score: 52 },
  { month: "Apr", score: 48 },
  { month: "May", score: 42 },
  { month: "Jun", score: 38 },
  { month: "Jul", score: 35 },
  { month: "Aug", score: 32 }
];

const mockDepartmentRisks = [
  { department: "IT", risk: 35 },
  { department: "Finance", risk: 25 },
  { department: "HR", risk: 15 },
  { department: "Marketing", risk: 20 },
  { department: "Operations", risk: 5 }
];

const mockAlerts = [
  { 
    id: 1, 
    title: "Multiple Failed Login Attempts", 
    description: "User account j.doe@company.com has 5 failed login attempts in 10 minutes",
    user: "j.doe@company.com", 
    severity: 'critical', 
    timestamp: "10 minutes ago",
    category: "Authentication"
  },
  { 
    id: 2, 
    title: "Unusual Data Access Pattern", 
    description: "Contractor account accessed sensitive financial data outside working hours",
    user: "contractor@company.com", 
    severity: 'high', 
    timestamp: "2 hours ago",
    category: "Data Access"
  },
  { 
    id: 3, 
    title: "Security Policy Violation", 
    description: "User downloaded confidential files to personal device",
    user: "m.smith@company.com", 
    severity: 'medium', 
    timestamp: "5 hours ago",
    category: "Policy"
  },
  { 
    id: 4, 
    title: "System Configuration Change", 
    description: "Unauthorized change to firewall configuration detected",
    user: "system@infra", 
    severity: 'high', 
    timestamp: "1 day ago",
    category: "Infrastructure"
  }
];

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export function Dashboard({ userRole }) {
  // Role-specific stats configuration
  const getStatsForRole = (role) => {
    if (role === "Regular User") {
      return [
        {
          title: "My Active Sessions",
          value: "2",
          change: "+1",
          icon: Activity,
          color: "bg-green-100 text-green-600"
        },
        {
          title: "Training Courses",
          value: "8/12",
          change: "+2 completed",
          icon: BookOpen,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Compliance Status",
          value: "100%",
          change: "Up to date",
          icon: CheckCircle,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Certifications",
          value: "5",
          change: "2 expiring soon",
          icon: Award,
          color: "bg-blue-100 text-blue-600"
        }
      ];
    } else if (role === "Compliance Officer") {
      return [
        {
          title: "Total Users",
          value: "2,847",
          change: "+12%",
          icon: Users,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Compliance Score",
          value: "94%",
          change: "+3%",
          icon: Shield,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Pending Audits",
          value: "7",
          change: "-2 from last week",
          icon: AlertTriangle,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Risk Assessment",
          value: "Medium",
          change: "Stable",
          icon: Activity,
          color: "bg-green-100 text-green-600"
        }
      ];
    } else if (role === "Security Analyst") {
      return [
        {
          title: "Active Sessions",
          value: "1,234",
          change: "+5%",
          icon: Activity,
          color: "bg-green-100 text-green-600"
        },
        {
          title: "Security Alerts",
          value: "23",
          change: "-15%",
          icon: AlertTriangle,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Threat Detection",
          value: "98.5%",
          change: "+1.2%",
          icon: Shield,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Incidents Resolved",
          value: "156",
          change: "+12%",
          icon: CheckCircle,
          color: "bg-blue-100 text-blue-600"
        }
      ];
    } else {
      // System Administrator
      return [
        {
          title: "Total Users",
          value: "2,847",
          change: "+12%",
          icon: Users,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Active Sessions",
          value: "1,234",
          change: "+5%",
          icon: Activity,
          color: "bg-green-100 text-green-600"
        },
        {
          title: "Security Alerts",
          value: "23",
          change: "-15%",
          icon: AlertTriangle,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Compliance Score",
          value: "94%",
          change: "+3%",
          icon: Shield,
          color: "bg-blue-100 text-blue-600"
        }
      ];
    }
  };

  const stats = getStatsForRole(userRole);

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'critical':
        return <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium border border-red-200">Critical</div>;
      case 'high':
        return <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">High</div>;
      case 'medium':
        return <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium border border-yellow-200">Medium</div>;
      default:
        return <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">Low</div>;
    }
  };

  const getSeverityIconColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-600';
      case 'high': return 'bg-blue-100 text-blue-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  // Regular User Dashboard - Simplified view
  if (userRole === "Regular User") {
    return (
      <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600">Welcome to Hammer Tech Security Platform</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-sm">
              <Globe className="h-4 w-4" />
              <span>Employee View</span>
            </div>
          </div>
          
          {/* Requirements Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-blue-800">Employee Dashboard:</p>
                <p className="text-gray-700">
                  Access your personal security profile, track training progress, view compliance status, 
                  and manage your certifications. Stay up-to-date with company security policies and complete 
                  required training modules to maintain organizational security standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <h3 className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-sm text-green-600 mt-1 font-medium">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Training Progress */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Training Progress</h2>
              <p className="text-gray-600">Complete required security training modules</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">Security Awareness Basics</span>
                  <span className="text-blue-600 font-medium">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">Data Protection Compliance</span>
                  <span className="text-blue-600 font-medium">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">Phishing Prevention</span>
                  <span className="text-blue-600 font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">Incident Reporting</span>
                  <span className="text-blue-600 font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* My Recent Activities */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Recent Activities</h2>
              <p className="text-gray-600">Your recent security-related actions</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">Completed Training Module</p>
                  <p className="text-xs text-gray-500">Data Protection Compliance - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">Password Updated</p>
                  <p className="text-xs text-gray-500">Successfully changed account password - 3 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">Certification Expiring</p>
                  <p className="text-xs text-gray-500">Security Awareness Certificate - Expires in 15 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Quick Access</h2>
            <p className="text-gray-600">Frequently used resources and actions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Training Portal</h4>
                <p className="text-sm text-gray-500">Continue learning</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Security Policies</h4>
                <p className="text-sm text-gray-500">View guidelines</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all">
              <AlertTriangle className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Report Issue</h4>
                <p className="text-sm text-gray-500">Security concerns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Dashboard for System Admin, Security Analyst, and Compliance Officer
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {userRole === "System Administrator" ? "Security Dashboard" : 
                userRole === "Compliance Officer" ? "Compliance Dashboard" : 
                "Security Operations Dashboard"}
            </h1>
            <p className="text-gray-600">Real-time monitoring and analytics for Hammer Tech Ltd</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-sm">
            <Shield className="h-4 w-4" />
            <span>{userRole}</span>
          </div>
        </div>
        
        {/* Requirements Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-800">Module Requirements:</p>
              <p className="text-gray-700">
                <strong>Real-Time Security Dashboard:</strong> Centralized command center displaying critical 
                security metrics, access activity trends, risk assessments, and compliance scores. Features 
                interactive charts and graphs for access patterns, failed login attempts, department-wise risk 
                distribution, and real-time security alerts. Implements predictive analytics for threat detection, 
                system health monitoring, and customizable widgets for role-based dashboard views. Provides instant 
                visibility into organizational security posture with drill-down capabilities for detailed analysis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-green-600 mt-1 font-medium">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show full charts only for Security Analyst and System Administrator */}
      {(userRole === "System Administrator" || userRole === "Security Analyst") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Access Trends */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Access Activity Trends</h2>
              <p className="text-gray-600">Weekly access patterns and anomalies</p>
            </div>
            <div className="h-80">
              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-blue-100 rounded-xl bg-blue-50">
                <div className="text-center p-4">
                  <Activity className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Access Trends Visualization</p>
                  <p className="text-sm text-gray-500">Data visualization would appear here</p>
                  <div className="mt-4 text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
                    {mockAccessTrends.length} data points available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Trends */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Risk Score Trends</h2>
              <p className="text-gray-600">Organization-wide risk assessment over time</p>
            </div>
            <div className="h-80">
              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-blue-100 rounded-xl bg-blue-50">
                <div className="text-center p-4">
                  <TrendingDown className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Risk Trend Visualization</p>
                  <p className="text-sm text-gray-500">Risk score trending downward</p>
                  <div className="mt-4 text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block">
                    Risk reduced by 50% since January
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show compliance-focused charts for Compliance Officer */}
      {userRole === "Compliance Officer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Trends */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Compliance Score Trends</h2>
              <p className="text-gray-600">Monthly compliance performance</p>
            </div>
            <div className="h-80">
              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-blue-100 rounded-xl bg-blue-50">
                <div className="text-center p-4">
                  <CheckCircle className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Compliance Trends Visualization</p>
                  <p className="text-sm text-gray-500">Compliance improving month-over-month</p>
                  <div className="mt-4 text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block">
                    Compliance up by 16% since January
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Trends */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">Risk Assessment Overview</h2>
              <p className="text-gray-600">Organization-wide risk levels</p>
            </div>
            <div className="h-80">
              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-blue-100 rounded-xl bg-blue-50">
                <div className="text-center p-4">
                  <Shield className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium mb-1">Risk Assessment Dashboard</p>
                  <p className="text-sm text-gray-500">Comprehensive risk visualization</p>
                  <div className="mt-4 text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
                    {mockDepartmentRisks.length} departments assessed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Risk Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Department Risk Levels</h2>
            <p className="text-gray-600">Risk distribution across departments</p>
          </div>
          <div className="h-80">
            <div className="w-full h-full flex flex-col items-center justify-center border border-blue-200 rounded-lg bg-blue-50 p-6">
              <div className="text-center mb-6">
                <p className="text-gray-700 font-medium mb-1">Department Risk Distribution</p>
                <p className="text-sm text-gray-500">Lower scores indicate lower risk</p>
              </div>
              <div className="space-y-4 w-full max-w-xs">
                {mockDepartmentRisks.map((dept, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900">{dept.department}</span>
                        <span className="font-medium text-blue-600">{dept.risk}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ 
                          width: `${dept.risk}%`, 
                          backgroundColor: COLORS[index % COLORS.length] 
                        }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Security Alerts</h2>
            <p className="text-gray-600">Latest security events requiring attention</p>
          </div>
          <div className="space-y-4">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
                <div className={`p-2 rounded-lg ${getSeverityIconColor(alert.severity)}`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{alert.user}</span>
                    <span className="text-gray-300">•</span>
                    <span>{alert.timestamp}</span>
                    <span className="text-gray-300">•</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{alert.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">System Health</h2>
          <p className="text-gray-600">Current status of security components</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Authentication System</h4>
              <p className="text-sm text-gray-500">Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">AI Monitoring Engine</h4>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingDown className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Compliance Scanner</h4>
              <p className="text-sm text-gray-500">Running Audit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}