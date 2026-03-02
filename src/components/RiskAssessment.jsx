import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Activity,
  AlertCircle,
  Users,
  Building,
  CheckCircle,
  BarChart,
  RefreshCw,
  Loader2,
  Clock,
  FileText,
  AlertOctagon
} from "lucide-react";

const BASE_URL = 'http://127.0.0.1:8000';

export function RiskAssessment() {
  const [loading, setLoading] = useState({
    dashboard: true,
    departments: false,
    users: false,
    metrics: false,
    vulnerabilities: false
  });
  const [error, setError] = useState(null);
  const [riskData, setRiskData] = useState({
    // Dashboard summary
    overallRiskScore: null,
    riskLevel: null,
    departmentsAtRisk: null,
    highRiskUsers: null,
    criticalIncidents: null,
    mttrHours: null,
    complianceRate: null,
    
    // Detailed data
    departmentAssessments: [],
    userRiskProfiles: [],
    securityMetrics: null,
    riskTrends: [],
    vulnerabilityAssessments: [],
    
    // Recommendations
    recommendations: []
  });

  // Fetch all risk assessment data
  const fetchRiskData = async () => {
    try {
      setLoading({ 
        dashboard: true, 
        departments: true, 
        users: true, 
        metrics: true,
        vulnerabilities: true 
      });
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 1. Fetch security metrics (contains overall stats)
      const metricsResponse = await axios.get(
        `${BASE_URL}/risk-assessment/metrics/`,
        { headers, params: { timeframe: 90 } }
      );

      if (metricsResponse.data.success) {
        const metrics = metricsResponse.data;
        setRiskData(prev => ({
          ...prev,
          overallRiskScore: metrics.metrics.total_risk_score,
          riskLevel: metrics.risk_level,
          departmentsAtRisk: metrics.metrics.departments_at_risk,
          highRiskUsers: metrics.metrics.high_risk_users,
          criticalIncidents: metrics.metrics.critical_incidents,
          mttrHours: metrics.metrics.mttr_hours,
          complianceRate: metrics.metrics.compliance_rate,
          securityMetrics: metrics,
          recommendations: metrics.recommendations || []
        }));
      }

      // 2. Fetch department risk assessments
      const departmentsResponse = await axios.get(
        `${BASE_URL}/risk-assessment/departments/`,
        { headers, params: { timeframe: 90 } }
      );

      if (departmentsResponse.data.success) {
        setRiskData(prev => ({
          ...prev,
          departmentAssessments: departmentsResponse.data.assessments
        }));
      }

      // 3. Fetch user risk profiles
      const usersResponse = await axios.get(
        `${BASE_URL}/risk-assessment/users/profiles/`,
        { headers, params: { timeframe: 30, limit: 10, min_risk: 50 } }
      );

      if (usersResponse.data.success) {
        setRiskData(prev => ({
          ...prev,
          userRiskProfiles: usersResponse.data.profiles
        }));
      }

      // 4. Fetch risk trends
      const trendsResponse = await axios.get(
        `${BASE_URL}/risk-assessment/trends/`,
        { headers, params: { timeframe: 90, period: 'weekly' } }
      );

      if (trendsResponse.data.success) {
        setRiskData(prev => ({
          ...prev,
          riskTrends: trendsResponse.data.trends
        }));
      }

      // 5. Fetch vulnerability assessment
      const vulnResponse = await axios.get(
        `${BASE_URL}/risk-assessment/vulnerabilities/`,
        { headers }
      );

      if (vulnResponse.data.success) {
        setRiskData(prev => ({
          ...prev,
          vulnerabilityAssessments: vulnResponse.data.vulnerabilities
        }));
      }

      // 6. Fetch dashboard data (additional consolidated view)
      try {
        const dashboardResponse = await axios.get(
          `${BASE_URL}/risk-assessment/dashboard-data/`,
          { headers }
        );

        if (dashboardResponse.data.success) {
          const dashboard = dashboardResponse.data.dashboard_data;
          // Merge dashboard data if needed
          setRiskData(prev => ({
            ...prev,
            // Use dashboard data to fill any missing fields
          }));
        }
      } catch (dashboardError) {
        console.warn('Dashboard data not available, using individual endpoints');
      }

    } catch (err) {
      console.error('Error fetching risk data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load risk assessment data');
    } finally {
      setLoading({ 
        dashboard: false, 
        departments: false, 
        users: false, 
        metrics: false,
        vulnerabilities: false 
      });
    }
  };

  // Run comprehensive risk assessment
  const runAssessment = async () => {
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      setError(null);

      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.post(
        `${BASE_URL}/risk-assessment/run-assessment/`,
        {
          timeframe_days: 90,
          include_departments: true,
          include_users: true,
          generate_report: true
        },
        { headers }
      );

      if (response.data.success) {
        alert(`Assessment completed! Overall Risk Score: ${response.data.results.overall_risk_score}`);
        // Refresh all data
        await fetchRiskData();
      }

    } catch (err) {
      console.error('Error running assessment:', err);
      setError(err.response?.data?.error || err.message || 'Failed to run assessment');
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  // Helper functions
  const getRiskLevel = (score) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Very Low';
  };

  const getRiskLevelColor = (score) => {
    if (score >= 80) return { bg: 'bg-red-100', text: 'text-red-800', icon: 'text-red-600' };
    if (score >= 60) return { bg: 'bg-orange-100', text: 'text-orange-800', icon: 'text-orange-600' };
    if (score >= 40) return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-600' };
    return { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'text-blue-600' };
  };

  const getSeverityBadge = (score) => {
    const colors = getRiskLevelColor(score);
    return (
      <div className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-xs font-medium`}>
        {getRiskLevel(score)}
      </div>
    );
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (trend === 'decreasing') {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    } else {
      return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUserAvatar = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  // Loading state
  if (loading.dashboard && riskData.overallRiskScore === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading risk assessment data...</p>
          <p className="text-sm text-gray-400 mt-1">This may take a few moments</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Error Loading Risk Assessment</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchRiskData}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Risk Assessment & Management</h1>
            <p className="text-gray-600">Comprehensive security risk analysis and mitigation</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRiskData}
              disabled={loading.dashboard}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg flex items-center font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading.dashboard ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={runAssessment}
              disabled={loading.dashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center font-medium transition-colors disabled:opacity-50"
            >
              <Target className="h-4 w-4 mr-2" />
              Run Assessment
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

      {/* Overall Risk Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Risk Score Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${getRiskLevelColor(riskData.overallRiskScore || 0).bg} ${getRiskLevelColor(riskData.overallRiskScore || 0).icon}`}>
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Risk Score</p>
              <h3 className="text-2xl font-bold">
                {riskData.overallRiskScore !== null ? 
                  `${getRiskLevel(riskData.overallRiskScore)} (${riskData.overallRiskScore.toFixed(1)})` : 
                  'Loading...'}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Critical Issues Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Critical Incidents</p>
              <h3 className="text-2xl font-bold">
                {riskData.criticalIncidents !== null ? riskData.criticalIncidents : '...'}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Vulnerabilities Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Vulnerabilities</p>
              <h3 className="text-2xl font-bold">
                {riskData.vulnerabilityAssessments.length > 0 ? 
                  riskData.vulnerabilityAssessments.filter(v => v.score < 50).length : 
                  '...'}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Departments at Risk Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Depts at Risk</p>
              <h3 className="text-2xl font-bold">
                {riskData.departmentsAtRisk !== null ? riskData.departmentsAtRisk : '...'}
              </h3>
            </div>
          </div>
        </div>
        
        {/* High Risk Users Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Risk Users</p>
              <h3 className="text-2xl font-bold">
                {riskData.highRiskUsers !== null ? riskData.highRiskUsers : '...'}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Compliance Rate Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Compliance</p>
              <h3 className="text-2xl font-bold">
                {riskData.complianceRate !== null ? `${riskData.complianceRate.toFixed(1)}%` : '...'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Categories Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Risk Category Analysis</h2>
                <p className="text-gray-600">Security posture across key risk dimensions</p>
              </div>
              {riskData.riskLevel && (
                <div className="text-sm font-medium">
                  Overall: <span className={getRiskLevelColor(riskData.overallRiskScore || 0).text}>
                    {riskData.riskLevel}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {loading.vulnerabilities ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : riskData.vulnerabilityAssessments.length > 0 ? (
            <div className="h-80 overflow-y-auto pr-2">
              <div className="space-y-3">
                {riskData.vulnerabilityAssessments.map((category, index) => {
                  const score = category.score || 0;
                  const riskColors = getRiskLevelColor(score);
                  return (
                    <div key={index} className="space-y-2 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{score.toFixed(1)}/{category.max_score}</span>
                          {getSeverityBadge(score)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(score/category.max_score)*100}%`,
                            backgroundColor: score < 50 ? '#DC2626' : 
                                           score < 70 ? '#FF6B35' : '#4ECDC4'
                          }}
                        ></div>
                      </div>
                      {category.recommendations && category.recommendations.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          <strong>Recommendations:</strong> {category.recommendations[0]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <BarChart className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">No vulnerability data available</p>
              <p className="text-sm text-gray-400 mt-1">Run an assessment to generate data</p>
            </div>
          )}
        </div>

        {/* Department Risk Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Department Risk Distribution</h2>
                <p className="text-gray-600">Risk scores by organizational unit</p>
              </div>
              <div className="text-sm text-gray-500">
                {riskData.departmentAssessments.length} departments
              </div>
            </div>
          </div>
          
          {loading.departments ? (
            <div className="h-80 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : riskData.departmentAssessments.length > 0 ? (
            <div className="h-80 overflow-y-auto pr-2">
              <div className="space-y-3">
                {riskData.departmentAssessments.slice(0, 10).map((dept, index) => {
                  const riskScore = dept.overall_risk_score || 0;
                  const riskColors = getRiskLevelColor(riskScore);
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: riskScore >= 80 ? '#DC2626' : 
                                          riskScore >= 60 ? '#FF6B35' : 
                                          riskScore >= 40 ? '#FFA07A' : '#4ECDC4'
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{dept.department_name}</span>
                          <span className="font-bold">{riskScore.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="h-1.5 rounded-full" 
                            style={{ 
                              width: `${riskScore}%`,
                              backgroundColor: riskScore >= 80 ? '#DC2626' : 
                                             riskScore >= 60 ? '#FF6B35' : 
                                             riskScore >= 40 ? '#FFA07A' : '#4ECDC4'
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{dept.incident_count} incidents</span>
                          <span>{dept.user_count} users</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <Building className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">No department risk data available</p>
              <p className="text-sm text-gray-400 mt-1">Run an assessment to generate data</p>
            </div>
          )}
        </div>
      </div>

      {/* Vulnerabilities Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Identified Vulnerabilities</h2>
          <p className="text-gray-600">Security weaknesses requiring immediate attention</p>
        </div>
        
        {loading.vulnerabilities ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : riskData.vulnerabilityAssessments.length > 0 ? (
          <div className="space-y-4">
            {riskData.vulnerabilityAssessments
              .filter(v => v.score < 70)  // Only show vulnerabilities with score < 70
              .map((vuln, index) => {
                const riskColors = getRiskLevelColor(vuln.score);
                return (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${riskColors.bg} ${riskColors.icon}`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{vuln.category} Vulnerability</h4>
                          {getSeverityBadge(vuln.score)}
                        </div>
                        <p className="text-sm text-gray-600">{vuln.description}</p>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm">
                            <strong>Recommendations:</strong> {vuln.recommendations && vuln.recommendations.length > 0 
                              ? vuln.recommendations[0] 
                              : 'No specific recommendations available'}
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No critical vulnerabilities identified</p>
            <p className="text-sm text-gray-400 mt-1">All security categories are within acceptable limits</p>
          </div>
        )}
      </div>

      {/* High Risk Users and Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Risk Users */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">High-Risk Users</h2>
              <span className="text-sm text-gray-500">
                {riskData.userRiskProfiles.length} users
              </span>
            </div>
            <p className="text-gray-600">Users requiring immediate attention</p>
          </div>
          
          {loading.users ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : riskData.userRiskProfiles.length > 0 ? (
            <div className="space-y-3">
              {riskData.userRiskProfiles.slice(0, 5).map((user, index) => {
                const riskColors = getRiskLevelColor(user.risk_score);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {getUserAvatar(user.full_name)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-gray-500">
                          {user.department_name || 'No department'}
                          {user.role && ` • ${user.role}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${riskColors.text}`}>
                        Risk: {user.risk_score.toFixed(1)}
                      </p>
                      <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium mt-1 transition-colors">
                        Review
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No high-risk users identified</p>
              <p className="text-sm text-gray-400 mt-1">All users are within acceptable risk limits</p>
            </div>
          )}
        </div>

        {/* Risk Trend Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Risk Trend Analysis</h2>
            <p className="text-gray-600">Weekly risk score progression</p>
          </div>
          
          {loading.metrics ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : riskData.riskTrends.length > 0 ? (
            <>
              <div className="h-64">
                <div className="space-y-3">
                  {riskData.riskTrends.slice(0, 8).map((trend, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{trend.period}</span>
                        <span className="font-medium">{trend.risk_score.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full" 
                          style={{ width: `${trend.risk_score}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{trend.incident_count} incidents</span>
                        <span>{trend.user_count} users</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Trend Analysis */}
              {riskData.securityMetrics?.trend_direction && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  riskData.securityMetrics.trend_direction === 'increasing' ? 'bg-red-50 border-red-200' :
                  riskData.securityMetrics.trend_direction === 'decreasing' ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 ${
                    riskData.securityMetrics.trend_direction === 'increasing' ? 'text-red-700' :
                    riskData.securityMetrics.trend_direction === 'decreasing' ? 'text-green-700' :
                    'text-gray-700'
                  }">
                    {getTrendIcon(riskData.securityMetrics.trend_direction)}
                    <p className="text-sm font-medium">
                      Risk {riskData.securityMetrics.trend_direction === 'increasing' ? 'Increasing' :
                           riskData.securityMetrics.trend_direction === 'decreasing' ? 'Decreasing' : 'Stable'}
                    </p>
                  </div>
                  {riskData.securityMetrics.analysis && (
                    <p className={`text-sm mt-1 ${
                      riskData.securityMetrics.trend_direction === 'increasing' ? 'text-red-600' :
                      riskData.securityMetrics.trend_direction === 'decreasing' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {riskData.securityMetrics.analysis}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <Activity className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-500">No trend data available</p>
              <p className="text-sm text-gray-400 mt-1">Run an assessment to generate trend data</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      {riskData.recommendations && riskData.recommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Action Recommendations</h2>
            <p className="text-gray-600">Based on current risk assessment</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskData.recommendations.map((recommendation, index) => {
              // Categorize recommendations by severity
              let bgColor = 'bg-blue-50';
              let borderColor = 'border-blue-200';
              let iconColor = 'text-blue-600';
              
              if (recommendation.toLowerCase().includes('critical') || recommendation.toLowerCase().includes('immediate')) {
                bgColor = 'bg-red-50';
                borderColor = 'border-red-200';
                iconColor = 'text-red-600';
              } else if (recommendation.toLowerCase().includes('high') || recommendation.toLowerCase().includes('urgent')) {
                bgColor = 'bg-orange-50';
                borderColor = 'border-orange-200';
                iconColor = 'text-orange-600';
              } else if (recommendation.toLowerCase().includes('medium') || recommendation.toLowerCase().includes('significant')) {
                bgColor = 'bg-yellow-50';
                borderColor = 'border-yellow-200';
                iconColor = 'text-yellow-600';
              }
              
              return (
                <div key={index} className={`p-4 ${borderColor} border rounded-lg ${bgColor}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${bgColor.replace('50', '100')} ${iconColor}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Data Status Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>Data last updated: {new Date().toLocaleString()}</p>
        <p className="mt-1">
          {riskData.departmentAssessments.length} departments assessed • 
          {riskData.userRiskProfiles.length} users analyzed • 
          {riskData.vulnerabilityAssessments.length} categories evaluated
        </p>
      </div>
    </div>
  );
}