import { AlertTriangle, TrendingUp, TrendingDown, Shield, Target, Activity, AlertCircle } from "lucide-react";
import React, { useState } from "react";
// Mock data since imports aren't available
const mockUsers = [
  { 
    id: 1,
    name: "John Doe", 
    avatar: "JD",
    department: "IT",
    riskScore: 65
  },
  { 
    id: 2,
    name: "Jane Smith", 
    avatar: "JS",
    department: "Finance",
    riskScore: 72
  },
  { 
    id: 3,
    name: "Robert Johnson", 
    avatar: "RJ",
    department: "Marketing",
    riskScore: 42
  },
  { 
    id: 4,
    name: "Sarah Williams", 
    avatar: "SW",
    department: "HR",
    riskScore: 85
  },
  { 
    id: 5,
    name: "Mike Brown", 
    avatar: "MB",
    department: "Operations",
    riskScore: 58
  }
];

const mockDepartmentRisks = [
  { department: "IT", risk: 35 },
  { department: "Finance", risk: 65 },
  { department: "HR", risk: 28 },
  { department: "Marketing", risk: 45 },
  { department: "Operations", risk: 52 },
  { department: "Sales", risk: 38 }
];

export function RiskAssessment() {
  const riskCategories = [
    { category: "Access Control", score: 85, maxScore: 100 },
    { category: "Data Security", score: 72, maxScore: 100 },
    { category: "Network Security", score: 91, maxScore: 100 },
    { category: "Compliance", score: 88, maxScore: 100 },
    { category: "User Behavior", score: 76, maxScore: 100 },
    { category: "Incident Response", score: 94, maxScore: 100 }
  ];

  const vulnerabilities = [
    {
      id: 1,
      title: "Weak Password Policy Compliance",
      severity: "high",
      affected: 126,
      recommendation: "Enforce stricter password requirements and implement automated reminders"
    },
    {
      id: 2,
      title: "Unused Admin Accounts",
      severity: "medium",
      affected: 8,
      recommendation: "Review and deactivate dormant administrative accounts"
    },
    {
      id: 3,
      title: "MFA Not Enabled",
      severity: "critical",
      affected: 426,
      recommendation: "Mandate multi-factor authentication for all users within 30 days"
    },
    {
      id: 4,
      title: "Outdated Access Permissions",
      severity: "medium",
      affected: 53,
      recommendation: "Conduct quarterly access permission reviews"
    }
  ];

  const riskTrends = [
    { week: "Week 1", risk: 45 },
    { week: "Week 2", risk: 42 },
    { week: "Week 3", risk: 38 },
    { week: "Week 4", risk: 35 }
  ];

  const highRiskUsers = mockUsers
    .filter(user => user.riskScore > 20)
    .sort((a, b) => b.riskScore - a.riskScore);

  const COLORS = ['#DC2626', '#FF6B35', '#FFA07A', '#4ECDC4', '#45B7D1', '#98D8C8'];

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

  const getSeverityIconColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-600';
      case 'high': return 'bg-blue-100 text-blue-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const getBadge = (text, variant = "outline") => {
    const baseClass = "px-3 py-1 rounded-full text-xs";
    if (variant === "outline") {
      return <div className={`border border-gray-300 text-gray-700 ${baseClass}`}>{text}</div>;
    }
    return <div className={`bg-gray-100 text-gray-800 ${baseClass}`}>{text}</div>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Risk Assessment & Management</h1>
            <p className="text-gray-600">Comprehensive security risk analysis and mitigation</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center font-medium transition-colors">
            <Target className="h-4 w-4 mr-2" />
            Run Assessment
          </button>
        </div>
        
        {/* Requirements Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-blue-800">Module Requirements:</p>
              <p className="text-gray-700">
                <strong>Risk Assessment & Management:</strong> Comprehensive risk evaluation framework implementing 
                continuous security risk scoring across multiple dimensions including access control, data security, 
                network security, compliance, and user behavior. Features vulnerability identification, risk 
                trending analysis, department-level risk distribution, and automated mitigation recommendations. 
                Includes high-risk user identification, security posture radar charts, actionable remediation 
                strategies with impact/effort analysis, and integration with threat intelligence for proactive 
                risk management.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Risk Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Risk Score</p>
              <h3 className="text-2xl font-bold">Low (28)</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Critical Issues</p>
              <h3 className="text-2xl font-bold">3</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vulnerabilities</p>
              <h3 className="text-2xl font-bold">12</h3>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Trend</p>
              <h3 className="text-2xl font-bold">-18%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Categories Radar */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Risk Category Analysis</h2>
            <p className="text-gray-600">Security posture across key risk dimensions</p>
          </div>
          <div className="h-80">
            <div className="w-full h-full flex flex-col items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center mb-4">
                <p className="text-gray-500 mb-2">Risk Categories Radar Chart</p>
              </div>
              <div className="space-y-3 w-full max-w-xs">
                {riskCategories.map((category, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.category}</span>
                      <span>{category.score}/{category.maxScore}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(category.score/category.maxScore)*100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Department Risk Levels */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Department Risk Distribution</h2>
            <p className="text-gray-600">Risk scores by organizational unit</p>
          </div>
          <div className="h-80">
            <div className="w-full h-full flex flex-col items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center mb-4">
                <p className="text-gray-500 mb-2">Department Risk Chart</p>
              </div>
              <div className="space-y-3 w-full max-w-xs">
                {mockDepartmentRisks.map((dept, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="flex-1 text-sm">{dept.department}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{dept.risk}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${dept.risk}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerabilities */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Identified Vulnerabilities</h2>
          <p className="text-gray-600">Security weaknesses requiring immediate attention</p>
        </div>
        <div className="space-y-4">
          {vulnerabilities.map((vuln) => (
            <div key={vuln.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${getSeverityIconColor(vuln.severity)}`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{vuln.title}</h4>
                    {getSeverityBadge(vuln.severity)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Affects {vuln.affected} users
                  </p>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm">
                      <strong>Recommendation:</strong> {vuln.recommendation}
                    </p>
                  </div>
                  <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                    Create Mitigation Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Users */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">High-Risk Users</h2>
            <p className="text-gray-600">Users requiring immediate attention</p>
          </div>
          <div className="space-y-3">
            {highRiskUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{user.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">Risk: {user.riskScore}</p>
                  <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium mt-1 transition-colors">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Risk Trend Analysis</h2>
            <p className="text-gray-600">Weekly risk score progression</p>
          </div>
          <div className="h-64">
            <div className="w-full h-full flex flex-col items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center mb-4">
                <p className="text-gray-500 mb-2">Risk Trend Chart</p>
                <p className="text-sm text-gray-400">Data: {JSON.stringify(riskTrends)}</p>
              </div>
              <div className="space-y-3 w-full max-w-xs">
                {riskTrends.map((trend, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{trend.week}</span>
                      <span className="font-medium">{trend.risk}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full" 
                        style={{ width: `${(trend.risk/100)*100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <TrendingDown className="h-5 w-5" />
              <p className="text-sm font-medium">Risk Decreasing</p>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Overall security risk has decreased by 22% over the past month due to improved compliance measures.
            </p>
          </div>
        </div>
      </div>

      {/* Mitigation Strategies */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Recommended Mitigation Strategies</h2>
          <p className="text-gray-600">Actionable steps to reduce organizational risk</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "Implement Zero Trust Architecture",
              impact: "High",
              effort: "High",
              timeline: "6 months"
            },
            {
              title: "Enhance MFA Adoption",
              impact: "High",
              effort: "Low",
              timeline: "1 month"
            },
            {
              title: "Conduct Security Training",
              impact: "Medium",
              effort: "Medium",
              timeline: "3 months"
            },
            {
              title: "Update Access Policies",
              impact: "Medium",
              effort: "Low",
              timeline: "2 weeks"
            }
          ].map((strategy, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <h4 className="font-medium">{strategy.title}</h4>
              <div className="flex gap-2">
                {getBadge(`Impact: ${strategy.impact}`)}
                {getBadge(`Effort: ${strategy.effort}`)}
              </div>
              <p className="text-sm text-gray-500">Timeline: {strategy.timeline}</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                Implement Strategy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}