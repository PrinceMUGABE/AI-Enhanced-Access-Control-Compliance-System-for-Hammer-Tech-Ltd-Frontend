import React, { useState, useEffect, useRef } from 'react';
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
  Navigate
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
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
  Briefcase,
  Star,
  Globe,
  HelpCircle,
  Plus,
  Search,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default function DashboardLayout() {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
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

  // Show loading screen
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

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'hr': return <Briefcase className="w-4 h-4" />;
      case 'mentor': return <Star className="w-4 h-4" />;
      case 'mentee': return <GraduationCap className="w-4 h-4" />;
      default: return <UserCog className="w-4 h-4" />;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-300';
      case 'hr': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'mentor': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'mentee': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get role name
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'hr': return 'HR Manager';
      case 'mentor': return 'Mentor';
      case 'mentee': return 'Mentee';
      default: return 'User';
    }
  };

  // FIXED: Navigation items based on role
  const getNavigationItems = () => {
    const commonItems = [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/dashboard",
      },
      {
        icon: Users,
        label: "Mentorship",
        path: "/dashboard/mentorship",
      },
      {
        icon: MessageSquare,
        label: "Communication",
        path: "/dashboard/communication",
      },
      {
        icon: Target,
        label: "Skills & Competencies",
        path: "/dashboard/skills",
      },
      {
        icon: Star,
        label: "Feedback",
        path: "/dashboard/feedback",
      },
      {
        icon: BookOpen,
        label: "Knowledge Base",
        path: "/dashboard/knowledge",
      },
      {
        icon: Bot,
        label: "AI Assistant",
        path: "/dashboard/chatbot",
      },
    ];

    // FIXED: Admin items now include Onboarding Management
    const adminItems = [
      ...commonItems,
      {
        icon: UserCog,
        label: "User Management",
        path: "/dashboard/users",
      },
      {
        icon: GraduationCap,
        label: "Onboarding Management",
        path: "/dashboard/onboarding_management",
      },
      {
        icon: BarChart3,
        label: "Analytics",
        path: "/dashboard/analytics",
      },
      {
        icon: FileText,
        label: "Reports",
        path: "/dashboard/reports",
      },
      {
        icon: Globe,
        label: "Integrations",
        path: "/dashboard/integrations",
      },
    ];

    const hrItems = [
      ...commonItems,
      {
        icon: UserCog,
        label: "User Management",
        path: "/dashboard/users",
      },
      {
        icon: GraduationCap,
        label: "Onboarding",
        path: "/dashboard/onboarding",
      },
      {
        icon: BarChart3,
        label: "Analytics",
        path: "/dashboard/analytics",
      },
      {
        icon: FileText,
        label: "Reports",
        path: "/dashboard/reports",
      },
    ];

    const mentorItems = [
      ...commonItems,
      {
        icon: BarChart3,
        label: "My Analytics",
        path: "/dashboard/analytics",
      },
      {
        icon: Calendar,
        label: "My Schedule",
        path: "/dashboard/schedule",
      },
    ];

    const menteeItems = [
      ...commonItems,
      {
        icon: GraduationCap,
        label: "My Onboarding",
        path: "/dashboard/onboarding",
      },
      {
        icon: BarChart3,
        label: "My Progress",
        path: "/dashboard/analytics",
      },
    ];

    if (user.role === "admin") return adminItems;
    if (user.role === "hr") return hrItems;
    if (user.role === "mentor") return mentorItems;
    if (user.role === "mentee") return menteeItems;
    return commonItems;
  };

  const navigationItems = getNavigationItems();

  const handleDropdownItemClick = (action: any) => {
    setIsDropdownOpen(false);
    action();
  };

  // Quick actions based on role
  const getQuickActions = () => {
    if (!user) return [];
    
    if (user.role === 'admin') {
      return [
        { label: 'Create Program', icon: <Plus className="w-4 h-4" />, onClick: () => navigate('/dashboard/mentorship?action=create-program') },
        { label: 'Manage Users', icon: <Users className="w-4 h-4" />, onClick: () => navigate('/dashboard/users') },
        { label: 'View Reports', icon: <FileText className="w-4 h-4" />, onClick: () => navigate('/dashboard/reports') },
      ];
    }
    
    if (user.role === 'hr') {
      return [
        { label: 'Create Mentorship', icon: <Plus className="w-4 h-4" />, onClick: () => navigate('/dashboard/mentorship?action=create-mentorship') },
        { label: 'Approve Users', icon: <Users className="w-4 h-4" />, onClick: () => navigate('/dashboard/users?filter=pending') },
        { label: 'Monitor Progress', icon: <TrendingUp className="w-4 h-4" />, onClick: () => navigate('/dashboard/analytics') },
      ];
    }
    
    if (user.role === 'mentor') {
      return [
        { label: 'Schedule Session', icon: <Calendar className="w-4 h-4" />, onClick: () => navigate('/dashboard/mentorship?action=schedule') },
        { label: 'View Mentees', icon: <Users className="w-4 h-4" />, onClick: () => navigate('/dashboard/mentorship') },
        { label: 'Give Feedback', icon: <Star className="w-4 h-4" />, onClick: () => navigate('/dashboard/feedback') },
      ];
    }
    
    if (user.role === 'mentee') {
      return [
        { label: 'Book Session', icon: <Calendar className="w-4 h-4" />, onClick: () => navigate('/dashboard/mentorship?action=schedule') },
        { label: 'Complete Onboarding', icon: <GraduationCap className="w-4 h-4" />, onClick: () => navigate('/dashboard/onboarding') },
        { label: 'View Progress', icon: <BarChart3 className="w-4 h-4" />, onClick: () => navigate('/dashboard/analytics') },
      ];
    }
    
    return [];
  };

  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation - FIXED: Consistent height */}
      <header className="bg-white border-b sticky top-0 z-40 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
            <Link
              to="/dashboard"
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-semibold text-blue-900">
                  Big Tech Solutions
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {getRoleIcon(user.role)}
                  <span className="capitalize">{getRoleName(user.role)}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions for Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="flex items-center gap-2"
              >
                {action.icon}
                <span className="hidden lg:inline">{action.label}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-64"
              />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.full_name?.charAt(0) || user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium">
                    {user.full_name || user.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.work_mail_address || user.email}
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.full_name?.charAt(0) || user.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name || user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.work_mail_address || user.email}
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-xs ${getRoleColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {getRoleName(user.role)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="px-2 py-2">
                    <button
                      onClick={() => handleDropdownItemClick(() => navigate("/dashboard/profile"))}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <UserCog className="w-4 h-4" />
                      Profile Settings
                    </button>

                    <button
                      onClick={() => handleDropdownItemClick(() => navigate("/dashboard/settings"))}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Preferences
                    </button>

                    <button
                      onClick={() => handleDropdownItemClick(() => navigate("/help"))}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help & Support
                    </button>

                    {/* Role-specific links */}
                    {(user.role === 'admin' || user.role === 'hr') && (
                      <button
                        onClick={() => handleDropdownItemClick(() => navigate("/dashboard/users"))}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        User Management
                      </button>
                    )}

                    {user.role === 'mentor' && (
                      <button
                        onClick={() => handleDropdownItemClick(() => navigate("/dashboard/mentorship"))}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        My Mentees
                      </button>
                    )}

                    {user.role === 'mentee' && (
                      <button
                        onClick={() => handleDropdownItemClick(() => navigate("/dashboard/onboarding"))}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        <GraduationCap className="w-4 h-4" />
                        My Onboarding
                      </button>
                    )}
                  </div>

                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Quick Actions for Mobile */}
                  <div className="px-2 py-2 md:hidden">
                    <div className="text-xs font-medium text-gray-500 px-3 py-1">
                      Quick Actions
                    </div>
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleDropdownItemClick(action.onClick)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => handleDropdownItemClick(handleLogout)}
                    className="w-full flex items-center gap-2 px-5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
        {/* Sidebar - FIXED: Consistent positioning */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)]
            w-64 bg-white border-r overflow-y-auto
            transition-transform duration-200 ease-in-out
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 font-medium border-l-4 border-blue-500"
                        : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Role-based tips */}
          <div className="px-4 mt-8 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                {getRoleIcon(user.role)}
                <h3 className="text-sm font-medium text-blue-900">
                  {getRoleName(user.role)} Tips
                </h3>
              </div>
              
              {user.role === 'admin' && (
                <p className="text-xs text-blue-700">
                  You have full access to all features. Manage programs, users, and system settings.
                </p>
              )}
              
              {user.role === 'hr' && (
                <p className="text-xs text-purple-700">
                  You can create mentorships and manage users. Program management is read-only.
                </p>
              )}
              
              {user.role === 'mentor' && (
                <p className="text-xs text-blue-700">
                  Focus on your mentees' progress. Schedule sessions and provide feedback regularly.
                </p>
              )}
              
              {user.role === 'mentee' && (
                <p className="text-xs text-green-700">
                  Complete your onboarding and engage with your mentor. Track your skill development.
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}