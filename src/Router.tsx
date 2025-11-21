import { useState, useEffect } from 'react';
import App from './App';
import { Login, Onboarding } from './features/auth/components';

export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('tippen_auth_token');

      // Public routes don't need auth check
      if (currentPath === '/login' || currentPath === '/onboarding') {
        setIsAuthChecking(false);
        return;
      }

      if (!token) {
        setIsAuthChecking(false);
        setIsAuthenticated(false);
        return;
      }

      // Verify token with backend
      try {
        const BACKEND_URL = import.meta.env.VITE_VISITOR_WS_URL?.replace('wss://', 'https://').replace('ws://', 'http://').replace('/ws/dashboard', '') || 'https://tippen-backend.benjiemalinao879557.workers.dev';

        const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const result = await response.json();

        if (result.success && result.user) {
          // Update user info in localStorage
          localStorage.setItem('tippen_user', JSON.stringify(result.user));
          setIsAuthenticated(true);
        } else {
          // Invalid token, clear storage
          localStorage.removeItem('tippen_auth_token');
          localStorage.removeItem('tippen_user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, [currentPath]);

  // Public routes (no authentication required)
  if (currentPath === '/login') {
    return <Login />;
  }

  if (currentPath === '/onboarding') {
    return <Onboarding />;
  }

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Protected routes (require authentication)
  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = '/login';
    return null;
  }

  // Authenticated routes
  return <App />;
}
