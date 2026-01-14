import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Award,
  LayoutDashboard,
  Users,
  BookOpen,
  Bot,
  BarChart3,
  UserCog,
  MessageSquare,
  GraduationCap,
  Target,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Globe,
  HelpCircle,
  Plus,
  Search,
  Star,
} from "lucide-react";

export default function AdminLayout() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "User Management", path: "/admin/users" },
    { icon: Users, label: "Department Management", path: "/admin/departments" },
    { icon: GraduationCap, label: "Onboarding Management", path: "/admin/onboarding-management" },
    { icon: Users, label: "Programs", path: "/admin/programs" },
    { icon: Users, label: "Mentorship", path: "/admin/mentorship" },
    { icon: MessageSquare, label: "Communication", path: "/admin/communication-center" },
    { icon: Bot, label: "AI Assistant", path: "/admin/chatbot" },
    { icon: FileText, label: "Reports", path: "/admin/reports" },

  ];

  const quickActions = [
    { label: 'Create Program', icon: <Plus className="w-4 h-4" />, onClick: () => navigate('/admin/mentorship?action=create-program') },
    { label: 'Manage Users', icon: <Users className="w-4 h-4" />, onClick: () => navigate('/admin/users') },
    { label: 'View Reports', icon: <FileText className="w-4 h-4" />, onClick: () => navigate('/admin/reports') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b sticky top-0 z-40 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-semibold text-gray-900">Admin Portal</span>
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Shield className="w-3 h-3" />
                  <span>Administrator</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {action.icon}
                <span className="hidden lg:inline">{action.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 lg:w-64"
              />
            </div>

            <button className="relative inline-flex items-center justify-center p-2 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{user.full_name?.charAt(0) || 'A'}</span>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium">{user.full_name || user.name}</div>
                  <div className="text-xs text-gray-500">{user.work_mail_address || user.email}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">{user.full_name?.charAt(0) || 'A'}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.full_name || user.name}</div>
                        <div className="text-xs text-gray-500">{user.work_mail_address || user.email}</div>
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          <Shield className="w-3 h-3" />
                          Administrator
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 py-2">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/admin/profile");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      <UserCog className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/help");
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 rounded"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help & Support
                    </button>
                  </div>

                  <div className="border-t my-1"></div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-5 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r overflow-y-auto transition-transform duration-200 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 font-medium border-l-4 border-blue-500"
                      : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 mt-8 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-pink-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-medium text-blue-900">Admin Access</h3>
              </div>
              <p className="text-xs text-blue-700">You have full system control. Manage programs, users, and all settings.</p>
            </div>
          </div>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}