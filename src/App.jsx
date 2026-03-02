import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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
import { MainLayout } from "./components/layout/MainLayout";
import { useAuth } from "./context/AuthContext";
import { ResetPasswordPage } from "./components/auth/ResetPassword";
import { ManageTrainings } from "./components/ManageTrainings";
import { CreateTraining } from "./components/CreateNewTraining";
import { EditTraining } from "./components/EditTraining";
import { AdminViewTraining } from "./components/ViewTraining";
import { ManageTrainingCandidates } from "./components/ManageTrainingCandidates";
import { AdminCreateTrainingCandidate } from "./components/CreateNewTrainingCandidate";
import { AdminEditTrainingCandidate } from "./components/EditTrainingCandidate";
import { AdminViewTrainingCandidateDetails } from "./components/ViewCandidateDetails";
import { EmployeeTrainings } from "./components/ManageMyTrainings";
import { EmployeeViewTrainingDetails } from "./components/MyTrainingDetails";
import { ApplyNewTraining } from "./components/EmployeeTakeNewTraining";
import { Toaster } from 'react-hot-toast';
import { MyIncidentsReports } from "./components/MyIncidentsReport";
import { ReportPage } from "./components/ReportPage";

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isLoading } = useAuth();

  console.log('===== PROTECTED ROUTE DEBUG =====');
  console.log('isLoading:', isLoading);
  console.log('User object:', user);
  console.log('Has user?', !!user);
  console.log('User role:', user?.role);
  console.log('Allowed roles:', allowedRoles);
  console.log('Path:', window.location.pathname);
  console.log('=============================');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user found, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log(`❌ Role not allowed! User role: ${user.role}, Allowed: ${allowedRoles.join(', ')}`);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Access granted!');
  return children;
};

// AppContent component that handles routing
function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#374151',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/access-control" element={
          <ProtectedRoute allowedRoles={['admin', 'security_analyst']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <AccessControl />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/ai-monitoring" element={
          <ProtectedRoute allowedRoles={['admin', 'security_analyst']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <AIMonitoring />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/risk-assessment" element={
          <ProtectedRoute allowedRoles={['admin', 'compliance_officer', 'security_analyst']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <RiskAssessment />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/compliance-audit" element={
          <ProtectedRoute allowedRoles={['admin', 'compliance_officer']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <ComplianceAudit />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/incidents-reports" element={
          <ProtectedRoute allowedRoles={['admin', 'security_analyst', 'compliance_officer']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <IncidentsReports />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Assigned Incidents Route - Available to all users who have assigned incidents */}
        <Route path="/assigned-incidents" element={
          <ProtectedRoute allowedRoles={['admin', 'compliance_officer', 'security_analyst', 'employee', 'hr_manager']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <MyIncidentsReports />
            </MainLayout>
          </ProtectedRoute>
        } />


        <Route path="/report" element={
          <ProtectedRoute allowedRoles={['admin', 'compliance_officer', 'security_analyst', 'hr_manager']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <ReportPage />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/training" element={
          <ProtectedRoute allowedRoles={['admin', 'compliance_officer', 'hr_manager']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <ManageTrainings />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/training-candidates" element={
          <ProtectedRoute allowedRoles={['admin', 'hr_manager']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <ManageTrainingCandidates />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/createTraining" element={
          <ProtectedRoute allowedRoles={['admin', 'compliance_officer', 'hr_manager']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <CreateTraining />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/editTraining/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'compliance_officer', 'hr_manager']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <EditTraining />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/viewTraining/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'compliance_officer', 'hr_manager']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <AdminViewTraining />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/user-management" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <UserManagement />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin', 'compliance_officer', 'security_analyst']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/training" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <EmployeeTrainings />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/learner/training" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <ApplyNewTraining />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/learner/apply-training/:trainingId" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <ApplyNewTraining />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/learner/myTrainingDetails/:id" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <EmployeeViewTrainingDetails />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              showProfileMenu={showProfileMenu}
              setShowProfileMenu={setShowProfileMenu}
              onLogout={logout}
            >
              <UserProfile />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all route */}
        <Route path="*" element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </>
  );
}

// Main App component
export default function App() {
  return <AppContent />;
}