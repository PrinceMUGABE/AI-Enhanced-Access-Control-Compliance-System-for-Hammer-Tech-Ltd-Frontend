import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Public Pages
import FloatingChatButton from './components/common/FloatingChatButton';
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ResetPasswordPage from './components/auth/ResetPassword';

// Layouts
import AdminLayout from './components/admin/AdminLayout';
import HRLayout from './components/hr/HRLayout';
import MentorLayout from './components/mentor/MentorLayout';
import MenteeLayout from './components/mentee/MenteeLayout';

// Admin Pages
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/UserManagement';
import AdminOnboardingManagement from './components/admin/OnboardingManagement';
import AdminProfile from './components/admin/UserProfile';
import AdminMentorshipManagement from './components/admin/MentorshipManagement';
import MentorshipDetailPage from './components/admin/MentorshipDetailPage';
import OnboardingProgramManagement from './components/admin/ProgramManagement';
import DepartmentsManagement from './components/admin/ManageDepartments';
import AdminChatManagement from './components/admin/CommunicationCenter';
import AdminAssistanceDashboard from './components/admin/AIChatbot';

// HR Pages
import HRDashboard from './components/hr/HRDashboard';
import HRUsers from './components/hr/UserManagement';
import HROnboardingModule from './components/hr/ManageOnboardings';
import HRMentorshipManagement from './components/hr/MentorshipManagement';

// Mentee Pages
import MenteeDashboard from './components/mentee/MenteeDashboard';
import MenteeOnboardingDashboard from './components/mentee/MyOnboardings';
import MenteeMentorshipDashboard from './components/mentee/ManageMentorship';
import MenteeChatManagement from './components/mentee/My_Communications';
import UserAssistancePage from './components/mentee/AIChatbot';
import UserProfile from './components/mentee/UserProfile';

// Mentor Pages
import MentorDashboard from './components/mentor/MentorDashboard';
import MentorMentorshipDashboard from './components/mentor/ManageMentorships';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Custom Toaster Component
const Toaster = () => {
  const [toasts, setToasts] = useState([]);


  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : toast.type === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts(toasts.filter(t => t.id !== toast.id))}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple Toaster Hook (optional - can be used by components)
export const useToast = () => {
  // This would need to be connected to a global state
  // For simplicity, we'll just return placeholder functions
  return {
    success: (message) => console.log('Success:', message),
    error: (message) => console.error('Error:', message),
    warning: (message) => console.warn('Warning:', message),
    info: (message) => console.log('Info:', message),
  };
};

function App() {
  const [showChatButton, setShowChatButton] = useState(true);

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in",
      delay: 100,
    });
    AOS.refresh();

    // Check if we're on login/register pages (hide chat button)
    const path = window.location.pathname;
    const hideOnPaths = ['/login', '/register', '/reset-password'];
    setShowChatButton(!hideOnPaths.includes(path));
  }, []);

  return (
    <div className="bg-white dark:bg-black dark:text-white text-black overflow-x-hidden">
      <Router>
        <AuthProvider>
          <Routes>
            {/* ==================== PUBLIC ROUTES ==================== */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/help" element={<LandingPage />} />

            {/* ==================== ADMIN ROUTES ==================== */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="onboarding-management" element={<AdminOnboardingManagement />} />
              <Route path="mentorship" element={<AdminMentorshipManagement />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="mentorships/:id" element={<MentorshipDetailPage />} />
              <Route path="programs" element={<OnboardingProgramManagement />} />
              <Route path="departments" element={<DepartmentsManagement />} />
              <Route path="communication-center" element={<AdminChatManagement />} />
              <Route path="chatbot" element={<AdminAssistanceDashboard />} />
            </Route>

            {/* ==================== HR ROUTES ==================== */}
            <Route path="/hr" element={<HRLayout />}>
              <Route index element={<HRDashboard />} />
              <Route path="users" element={<HRUsers />} />
              <Route path='onboarding-management' element={<HROnboardingModule />} />
              <Route path='mentorship' element={<HRMentorshipManagement />} />
            </Route>

            {/* ==================== MENTOR ROUTES ==================== */}
            <Route path="/mentor" element={<MentorLayout />}>
              <Route index element={<MentorMentorshipDashboard />} />
            </Route>

            {/* ==================== MENTEE ROUTES ==================== */}
            <Route path="/mentee" element={<MenteeLayout />}>
              <Route index element={<MenteeDashboard />} />
              <Route path="dashboard" element={<MenteeDashboard />} />
              <Route path="onboarding-management" element={<MenteeOnboardingDashboard />} />
              <Route path="mentorship" element={<MenteeMentorshipDashboard />} />
              <Route path="communication" element={<MenteeChatManagement />} />
              <Route path="chatbot" element={<UserAssistancePage />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Floating Chat Button - Conditionally rendered */}
          {showChatButton && <FloatingChatButton />}
          
          <Toaster />
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;