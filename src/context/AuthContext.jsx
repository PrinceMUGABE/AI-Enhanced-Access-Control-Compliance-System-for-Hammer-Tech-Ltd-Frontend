// AuthContext.jsx - JavaScript version
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const hasInitialized = useRef(false);
  const isNavigating = useRef(false);

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

  // Initial load effect - runs only once on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    
    console.log("=== AuthContext: Initial Load ===");
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('access_token');

        console.log("Checking localStorage:", { 
          hasUser: !!storedUser, 
          hasToken: !!accessToken,
          currentPath: location.pathname 
        });

        if (storedUser && accessToken) {
          const parsedUser = JSON.parse(storedUser);
          
          // Map the user data to the expected format
          const mappedUser = {
            id: parsedUser.id?.toString() || '',
            name: parsedUser.name || parsedUser.full_name || '',
            full_name: parsedUser.full_name || '',
            email: parsedUser.email || '',
            work_mail_address: parsedUser.work_mail_address || '',
            role: parsedUser.role || 'mentee',
            department: parsedUser.department || '',
            phone_number: parsedUser.phone_number || '',
            avatar: parsedUser.avatar
          };

          console.log("User loaded from localStorage:", mappedUser);
          setUserState(mappedUser);

          // Only redirect if we're on a public route
          if (publicRoutes.includes(location.pathname)) {
            const roleRoute = getRoleRoute(mappedUser.role);
            console.log("User on public route, redirecting to:", roleRoute);
            navigate(roleRoute, { replace: true });
          }
          // If user is on wrong role route, redirect to correct one
          else if (!isOnCorrectRoute(mappedUser.role, location.pathname)) {
            const roleRoute = getRoleRoute(mappedUser.role);
            console.log("User on wrong role route, redirecting to:", roleRoute);
            navigate(roleRoute, { replace: true });
          }
        } else {
          console.log("No user/token found");
          // No user found, redirect to login if on protected route
          if (!publicRoutes.includes(location.pathname)) {
            console.log("On protected route without auth, redirecting to login");
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
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

    loadUser();
  }, []); // Empty dependency array - only run once

  // Watch for user changes and handle navigation - THIS IS THE KEY FIX
  useEffect(() => {
    // Skip if not initialized yet or already navigating
    if (!hasInitialized.current || isNavigating.current) return;
    
    console.log("=== User State Changed Effect ===");
    console.log("Current user:", user);
    console.log("Current path:", location.pathname);

    if (user) {
      // User is logged in, check if they're on the right route
      if (publicRoutes.includes(location.pathname)) {
        const roleRoute = getRoleRoute(user.role);
        console.log("User logged in but on public route, navigating to:", roleRoute);
        isNavigating.current = true;
        navigate(roleRoute, { replace: true });
        setTimeout(() => { isNavigating.current = false; }, 100);
      } else if (!isOnCorrectRoute(user.role, location.pathname)) {
        const roleRoute = getRoleRoute(user.role);
        console.log("User on wrong role route, navigating to:", roleRoute);
        isNavigating.current = true;
        navigate(roleRoute, { replace: true });
        setTimeout(() => { isNavigating.current = false; }, 100);
      }
    } else {
      // No user, redirect to login if on protected route
      if (!publicRoutes.includes(location.pathname)) {
        console.log("No user and on protected route, navigating to login");
        isNavigating.current = true;
        navigate('/login', { replace: true });
        setTimeout(() => { isNavigating.current = false; }, 100);
      }
    }
  }, [user, location.pathname]); // Watch user and location changes

  // Update user function that also saves to localStorage
  const setUser = (newUser) => {
    console.log("=== AuthContext: setUser called ===");
    console.log("New user:", newUser);
    
    setUserState(newUser);
    
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      console.log("User saved to localStorage");
    } else {
      localStorage.removeItem('user');
      console.log("User removed from localStorage");
    }
  };

  // Logout function
  const logout = () => {
    console.log("=== AuthContext: Logout ===");
    setUserState(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};