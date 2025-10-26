import { useState, useEffect } from 'react';
import App from './App';
import { Login, Onboarding } from './features/auth/components';

export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Check if user is authenticated (for now, just check localStorage)
  const isAuthenticated = localStorage.getItem('tippen_auth_token');

  // Public routes (no authentication required)
  if (currentPath === '/login') {
    return <Login />;
  }

  if (currentPath === '/onboarding') {
    return <Onboarding />;
  }

  // Protected routes (require authentication)
  if (!isAuthenticated && currentPath !== '/login' && currentPath !== '/onboarding') {
    // Redirect to login
    window.location.href = '/login';
    return null;
  }

  // Authenticated routes
  return <App />;
}
