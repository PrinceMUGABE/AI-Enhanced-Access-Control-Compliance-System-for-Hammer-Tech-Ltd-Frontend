// AuthContext.jsx - Fixed version
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();
const BASE_URL = "http://127.0.0.1:8000";

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const hasInitialized = useRef(false);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/reset-password', '/help'];

  // Helper function to get role-based route
  const getRoleRoute = (role) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'hr': return '/hr';
      case 'mentor': return '/mentor';
      case 'mentee': return '/mentee';
      default: return '/mentee';
    }
  };

  // Check if user is on the correct role-based route
  const isOnCorrectRoute = (userRole, currentPath) => {
    const roleRoute = getRoleRoute(userRole);
    return currentPath.startsWith(roleRoute);
  };

  // Verify token with backend
  const verifyToken = async (accessToken) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-token/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { valid: true, user: data.user };
      }
      return { valid: false };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false };
    }
  };

  // Initial load effect - runs only once on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initializeAuth = async () => {
      console.log("=== AuthContext: Initializing ===");
      
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');

        console.log("Stored data check:", { 
          hasUser: !!storedUser, 
          hasToken: !!accessToken,
          currentPath: location.pathname 
        });

        if (storedUser && accessToken) {
          // Verify token with backend
          const { valid, user: verifiedUser } = await verifyToken(accessToken);

          if (valid && verifiedUser) {
            console.log("Token valid, user authenticated:", verifiedUser.work_mail_address);
            
            const mappedUser = {
              id: verifiedUser.id?.toString() || '',
              name: verifiedUser.name || verifiedUser.full_name || '',
              full_name: verifiedUser.full_name || '',
              email: verifiedUser.email || '',
              work_mail_address: verifiedUser.work_mail_address || '',
              role: verifiedUser.role || 'mentee',
              department: verifiedUser.department || '',
              phone_number: verifiedUser.phone_number || '',
              avatar: verifiedUser.avatar
            };

            setUserState(mappedUser);

            // Only redirect if on public route
            if (publicRoutes.includes(location.pathname)) {
              const roleRoute = getRoleRoute(mappedUser.role);
              console.log("On public route, redirecting to:", roleRoute);
              navigate(roleRoute, { replace: true });
            }
            // Check if on wrong role route
            else if (!isOnCorrectRoute(mappedUser.role, location.pathname)) {
              const roleRoute = getRoleRoute(mappedUser.role);
              console.log("On wrong role route, redirecting to:", roleRoute);
              navigate(roleRoute, { replace: true });
            }
          } else {
            // Token invalid, clear everything
            console.log("Token invalid, clearing auth data");
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            
            if (!publicRoutes.includes(location.pathname)) {
              console.log("On protected route without valid token, redirecting to login");
              navigate('/login', { replace: true });
            }
          }
        } else {
          console.log("No stored auth data");
          
          // No auth data, redirect to login if on protected route
          if (!publicRoutes.includes(location.pathname)) {
            console.log("On protected route without auth, redirecting to login");
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        if (!publicRoutes.includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
      } finally {
        setIsLoading(false);
        hasInitialized.current = true;
        console.log("=== AuthContext: Initialization Complete ===");
      }
    };

    initializeAuth();
  }, []); // Only run once on mount

  // Update user function that also saves to localStorage
  const setUser = (newUser) => {
    console.log("=== AuthContext: setUser called ===");
    console.log("New user:", newUser);
    
    setUserState(newUser);
    
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      console.log("User saved to localStorage");
      
      // Navigate to role-based route
      const roleRoute = getRoleRoute(newUser.role);
      navigate(roleRoute, { replace: true });
    } else {
      localStorage.removeItem('user');
      console.log("User removed from localStorage");
    }
  };

  // Logout function with backend call
  const logout = async () => {
    console.log("=== AuthContext: Logout ===");
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const accessToken = localStorage.getItem('access_token');
      
      // Call backend logout endpoint to blacklist token
      if (refreshToken && accessToken) {
        await fetch(`${BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken
          }),
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    }
    
    // Clear all auth data
    setUserState(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Navigate to login
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};