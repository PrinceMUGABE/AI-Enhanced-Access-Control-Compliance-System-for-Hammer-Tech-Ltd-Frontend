import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Shield,
  Brain,
  FileCheck,
  AlertTriangle,
  Users,
  Settings as SettingsIcon,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  GraduationCap,
  Target,
  User as UserIcon,
  Globe,
  Activity,
  Zap,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = "http://127.0.0.1:8000";

export function MainLayout({
  children,
  user,
  sidebarOpen,
  setSidebarOpen,
  showProfileMenu,
  setShowProfileMenu,
  onLogout,
}) {
  const [hasAssignedIncidents, setHasAssignedIncidents] = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const { logout } = useAuth();

  // Function to check assigned incidents
  const checkAssignedIncidents = async () => {
    try {
      setIsChecking(true);
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await axios.get(
        `${BASE_URL}/incidents/assigned/check/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const { has_assigned_incidents, total_assigned, urgent } = response.data;
        setHasAssignedIncidents(has_assigned_incidents);
        setAssignedCount(total_assigned);
        setUrgentCount(urgent?.high_priority || 0);
        
        // Show toast for new assigned incidents
        if (has_assigned_incidents && total_assigned > 0) {
          const message = total_assigned === 1 
            ? "You have 1 assigned incident to handle"
            : `You have ${total_assigned} assigned incidents to handle`;
          
          if (urgent?.high_priority > 0) {
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-red-500`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        ⚠️ Urgent Incident Alert
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {message}. {urgent.high_priority} require immediate attention.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      window.location.href = '/assigned-incidents';
                    }}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                  >
                    View
                  </button>
                </div>
              </div>
            ), {
              duration: 5000,
              position: 'top-right'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking assigned incidents:', error);
      // Don't show error toast for this background check
    } finally {
      setIsChecking(false);
    }
  };

  // Check for assigned incidents on component mount and every minute
  useEffect(() => {
    if (user) {
      // Initial check
      checkAssignedIncidents();
      
      // Set up interval to check every minute
      const intervalId = setInterval(checkAssignedIncidents, 300000); // 60 seconds
      
      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [user]);

  // Also check when user logs in or route changes
  useEffect(() => {
    if (user) {
      checkAssignedIncidents();
    }
  }, [user, window.location.pathname]);

  const getNavigationForRole = (role) => {
    const baseNavigation = [
      {
        id: "dashboard",
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
        roles: ["admin", "compliance_officer", "security_analyst", "employee", "hr_manager"],
      },
      {
        id: "access",
        name: "Access Control",
        icon: Shield,
        path: "/access-control",
        roles: ["admin", "security_analyst"],
      },
      {
        id: "risk",
        name: "Risk Assessment",
        icon: Target,
        path: "/risk-assessment",
        roles: ["admin", "compliance_officer", "security_analyst"],
      },
      {
        id: "compliance",
        name: "Compliance Audit",
        icon: FileCheck,
        path: "/compliance-audit",
        roles: ["admin", "compliance_officer"],
      },
      {
        id: "incidents",
        name: "Incidents & Reports",
        icon: AlertTriangle,
        path: "/incidents-reports",
        roles: ["admin", "security_analyst", "compliance_officer"],
      },
      {
        id: "training",
        name: "Training & Awareness",
        icon: GraduationCap,
        path: user?.role === "employee" ? "/training" : "/admin/training",
        roles: ["admin", "compliance_officer", "hr_manager", "employee"],
      },
    ];

    // Add assigned incidents menu item if user has assigned incidents
    if (hasAssignedIncidents) {
      baseNavigation.splice(2, 0, {
        id: "assigned-incidents",
        name: `My Assigned Incidents ${assignedCount > 0 ? `(${assignedCount})` : ''}`,
        icon: AlertCircle,
        path: "/assigned-incidents",
        roles: ["admin", "compliance_officer", "security_analyst", "employee", "hr_manager"],
        badge: urgentCount > 0 ? {
          count: urgentCount,
          color: "bg-red-500",
          text: "text-white"
        } : null
      });
    }

    return baseNavigation.filter((item) => item.roles.includes(role));
  };

  const navigation = getNavigationForRole(user?.role || "employee");

  const roleDisplayMap = {
    admin: "System Administrator",
    compliance_officer: "Compliance Officer",
    security_analyst: "Security Analyst",
    hr_manager: "HR Manager",
    employee: "Employee",
  };

  const displayRole = roleDisplayMap[user?.role] || "Employee";

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await axios.post(
          `${BASE_URL}/auth/logout/`,
          { refresh_token: refreshToken },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      // Always clear local storage and call logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white text-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-white">
                  <h3 className="font-semibold">Hammer Tech</h3>
                  <p className="text-xs text-blue-200">Security Platform</p>
                </div>
              </div>
              <button
                className="lg:hidden text-white hover:text-blue-200"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Assigned incidents indicator */}
            {hasAssignedIncidents && (
              <div className="mt-3 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">
                    {assignedCount} assigned incident{assignedCount !== 1 ? 's' : ''}
                  </p>
                  {urgentCount > 0 && (
                    <p className="text-xs text-red-200">
                      {urgentCount} urgent
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    window.location.href = '/assigned-incidents';
                    setSidebarOpen(false);
                  }}
                  className="text-xs bg-white text-blue-600 hover:bg-blue-50 px-2 py-1 rounded font-medium transition-colors"
                >
                  View
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = item.path;
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-600 border border-transparent ${
                    window.location.pathname === item.path ? 'bg-blue-50 border-blue-200 text-blue-600' : ''
                  }`}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.badge && (
                      <span className={`absolute -top-1 -right-1 h-4 w-4 ${item.badge.color} ${item.badge.text} text-xs rounded-full flex items-center justify-center`}>
                        {item.badge.count}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{item.name}</span>
                  {item.id === "assigned-incidents" && isChecking && (
                    <div className="ml-auto">
                      <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </a>
              );
            })}

            <div className="pt-6 mt-6 border-t border-gray-200 space-y-2">
              {user?.role === "admin" && (
                <a
                  href="/user-management"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/user-management";
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-600 border border-transparent ${
                    window.location.pathname === '/user-management' ? 'bg-blue-50 border-blue-200 text-blue-600' : ''
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">User Management</span>
                </a>
              )}

              {(user?.role === "admin" || user?.role === "hr_manager" || user?.role === "compliance_officer") && (
                <a
                  href="/training-candidates"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/training-candidates";
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-600 border border-transparent ${
                    window.location.pathname === '/training-candidates' ? 'bg-blue-50 border-blue-200 text-blue-600' : ''
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Training Candidates</span>
                </a>
              )}
              
              {["admin", "compliance_officer", "security_analyst", "hr_manager"].includes(user?.role) && (
                <a
                  href="/report"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = "/report";
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-600 border border-transparent ${
                    window.location.pathname === '/report' ? 'bg-blue-50 border-blue-200 text-blue-600' : ''
                  }`}
                >
                  <SettingsIcon className="h-5 w-5" />
                  <span className="font-medium">Report</span>
                </a>
              )}
            </div>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium shadow-sm">
                    {user?.full_name?.charAt(0) || user?.name?.charAt(0) || "U"}
                  </div>
                  {hasAssignedIncidents && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name || user?.name || "User"}
                  </p>
                  <p className="text-xs text-blue-600 font-medium truncate">
                    {displayRole}
                  </p>
                  {hasAssignedIncidents && (
                    <p className="text-xs text-red-600 font-medium">
                      {assignedCount} assigned incident{assignedCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <a
                    href="/profile"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = "/profile";
                      setShowProfileMenu(false);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-gray-700 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">My Profile</span>
                  </a>
                  {hasAssignedIncidents && (
                    <a
                      href="/assigned-incidents"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = "/assigned-incidents";
                        setShowProfileMenu(false);
                        setSidebarOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        My Assigned Incidents
                        {assignedCount > 0 && (
                          <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                            {assignedCount}
                          </span>
                        )}
                      </span>
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 mt-2 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent transition-colors text-gray-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              <div className="hidden md:block">
                <h2 className="text-xl font-bold text-gray-900">
                  AI-Enhanced Access Control System
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-gray-600">
                    Powered by Hammer Group Rwanda
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Assigned Incidents Notification */}
              {hasAssignedIncidents && (
                <a
                  href="/assigned-incidents"
                  className="relative group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg hover:border-red-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                    <span className="text-sm font-medium text-red-700 group-hover:text-red-800">
                      {assignedCount} Assigned
                    </span>
                    {urgentCount > 0 && (
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {urgentCount} URGENT
                      </span>
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                </a>
              )}
              
              <button className="relative p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                <Bell className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full animate-pulse"></span>
              </button>
              <div className="hidden md:flex items-center gap-2 border border-blue-200 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                <Activity className="h-3 w-3 text-green-500" />
                <span>System Status: Active</span>
              </div>
              <div className="hidden md:flex items-center gap-2 border border-blue-200 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                <Zap className="h-3 w-3 text-blue-500" />
                <span>v2.1.0</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 px-6 py-4 mt-12 bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-700">
                © {new Date().getFullYear()} Hammer Tech Ltd. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://www.hammergp.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                About Hammer Group
              </a>
              <span className="text-gray-300">•</span>
              <span className="text-gray-700">Version 2.1.0</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                System Operational
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}