import React, { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginScreen } from "./components/auth/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { AccessControl } from "./components/AccessControl";
import { AIMonitoring } from "./components/AIMonitoring";
import { ComplianceAudit } from "./components/ComplianceAudit";
import { IncidentsReports } from "./components/IncidentsReports";
import { Training } from "./components/Training";
import { RiskAssessment } from "./components/RiskAssessment";
import { Settings } from "./components/Settings";
import { UserManagement } from "./components/UserManagement";
import { UserProfile } from "./components/UserProfile";
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
} from "lucide-react";

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("System Administrator");
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogin = (role) => {
    const roleMap = {
      admin: "System Administrator",
      compliance: "Compliance Officer",
      security: "Security Analyst",
      user: "Regular User",
    };
    setUserRole(roleMap[role] || "System Administrator");
    setIsAuthenticated(true);
    setShowLanding(false);
  };

  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLanding(true);
    setCurrentView("dashboard");
  };

  if (showLanding && !isAuthenticated) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Role-based navigation configuration
  const getNavigationForRole = (role) => {
    const allNavigation = [
      {
        id: "dashboard",
        name: "Dashboard",
        icon: LayoutDashboard,
        roles: [
          "System Administrator",
          "Compliance Officer",
          "Security Analyst",
          "Regular User",
        ],
      },
      {
        id: "access",
        name: "Access Control",
        icon: Shield,
        roles: ["System Administrator", "Security Analyst"],
      },
      {
        id: "ai",
        name: "AI Monitoring",
        icon: Brain,
        roles: ["System Administrator", "Security Analyst"],
      },
      {
        id: "risk",
        name: "Risk Assessment",
        icon: Target,
        roles: [
          "System Administrator",
          "Compliance Officer",
          "Security Analyst",
        ],
      },
      {
        id: "compliance",
        name: "Compliance Audit",
        icon: FileCheck,
        roles: ["System Administrator", "Compliance Officer"],
      },
      {
        id: "incidents",
        name: "Incidents & Reports",
        icon: AlertTriangle,
        roles: [
          "System Administrator",
          "Security Analyst",
          "Compliance Officer",
        ],
      },
      {
        id: "training",
        name: "Training & Awareness",
        icon: GraduationCap,
        roles: [
          "System Administrator",
          "Compliance Officer",
          "Regular User",
        ],
      },
    ];

    return allNavigation.filter((item) =>
      item.roles.includes(role)
    );
  };

  const navigation = getNavigationForRole(userRole);

  // Check if user has access to User Management and Settings
  const canAccessUserManagement = ["System Administrator"].includes(userRole);
  const canAccessSettings = [
    "System Administrator",
    "Compliance Officer",
    "Security Analyst",
  ].includes(userRole);

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard userRole={userRole} />;
      case "access":
        return <AccessControl />;
      case "ai":
        return <AIMonitoring />;
      case "risk":
        return <RiskAssessment />;
      case "compliance":
        return <ComplianceAudit />;
      case "incidents":
        return <IncidentsReports />;
      case "training":
        return <Training />;
      case "settings":
        return <Settings />;
      case "users":
        return <UserManagement />;
      case "profile":
        return <UserProfile userRole={userRole} />;
      default:
        return <Dashboard userRole={userRole} />;
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
                  <p className="text-xs text-blue-200">
                    Security Platform
                  </p>
                </div>
              </div>
              <button
                className="lg:hidden text-white hover:text-blue-200"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                      : "hover:bg-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-600"
                  } border border-transparent`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}

            <div className="pt-6 mt-6 border-t border-gray-200 space-y-2">
              {canAccessUserManagement && (
                <button
                  onClick={() => {
                    setCurrentView("users");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === "users"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                      : "hover:bg-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-600"
                  } border border-transparent`}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">User Management</span>
                </button>
              )}
              {canAccessSettings && (
                <button
                  onClick={() => {
                    setCurrentView("settings");
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === "settings"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                      : "hover:bg-blue-50 hover:border-blue-300 text-gray-700 hover:text-blue-600"
                  } border border-transparent`}
                >
                  <SettingsIcon className="h-5 w-5" />
                  <span className="font-medium">Settings</span>
                </button>
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
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-medium shadow-sm">
                  HJ
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Habineza Josue
                  </p>
                  <p className="text-xs text-blue-600 font-medium truncate">
                    {userRole}
                  </p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setCurrentView("profile");
                      setShowProfileMenu(false);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-gray-700 transition-colors"
                  >
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">My Profile</span>
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
        <main className="p-6">{renderContent()}</main>

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