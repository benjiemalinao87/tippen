import { useState, useEffect } from 'react';
import { BarChart3, Calendar, Moon, Sun, Users, Settings, LogOut, Shield } from 'lucide-react';
import { PerformanceDashboard } from './features/dashboard';
import { Visitors } from './features/visitors';
import { Settings as SettingsPage } from './features/settings';
import { CommandCenter } from './features/command-center';
import { LandingPage } from './landing-funnel-v2/LandingPage';
import { agentApi } from './lib/api';
import type { Agent } from './shared/types';
import { ImpersonationProvider } from './shared/contexts/ImpersonationContext';
import { WorkspaceSwitcher, ImpersonationBanner } from './shared/components/ui';

type View = 'dashboard' | 'visitors' | 'settings' | 'command-center' | 'landing-funnel';

function App() {
  const [currentView, setCurrentView] = useState<View>('visitors');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const [userRole, setUserRole] = useState<string>('member');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date().toISOString()
  });

  useEffect(() => {
    loadAgents();
    loadUserRole();
  }, []);

  const loadUserRole = () => {
    const userStr = localStorage.getItem('tippen_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || 'member');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  // Set initial view based on URL path (for deep linking from Slack)
  useEffect(() => {
    const path = window.location.pathname;
    console.log('[App] Initial URL path:', path);

    if (path.startsWith('/dashboard')) {
      console.log('[App] Setting initial view to: dashboard');
      setCurrentView('dashboard');
    } else if (path.startsWith('/settings')) {
      console.log('[App] Setting initial view to: settings');
      setCurrentView('settings');
    } else if (path.startsWith('/command-center')) {
      console.log('[App] Setting initial view to: command-center');
      setCurrentView('command-center');
    } else if (path.startsWith('/funnel-v2')) {
      console.log('[App] Setting initial view to: landing-funnel');
      setCurrentView('landing-funnel');
    } else {
      // Default to visitors page
      console.log('[App] Setting initial view to: visitors (default)');
      setCurrentView('visitors');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      const BACKEND_URL = import.meta.env.VITE_VISITOR_WS_URL
        ?.replace('wss://', 'https://')
        .replace('ws://', 'http://')
        .replace('/ws/dashboard', '') || 'https://tippen-backend.benjiemalinao879557.workers.dev';

      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tippen_auth_token')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('tippen_auth_token');
      localStorage.removeItem('tippen_user');

      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
    // Update URL to match the view
    const paths = {
      dashboard: '/',
      visitors: '/visitors',
      settings: '/settings',
      'command-center': '/command-center',
      'landing-funnel': '/funnel-v2'
    };
    window.history.pushState({}, '', paths[view]);
  };

  const loadAgents = async () => {
    try {
      const data = await agentApi.getAll();
      setAgents(data);
      if (data.length > 0 && !selectedAgentId) {
        setSelectedAgentId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  // If viewing the landing funnel, render it full screen without the app layout
  if (currentView === 'landing-funnel') {
    return <LandingPage />;
  }

  return (
    <ImpersonationProvider>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Impersonation Banner - shown when viewing client workspace */}
        <ImpersonationBanner />

        {/* Fixed Header */}
        <nav className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tippen</h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Workspace Switcher - only visible for saas-owner */}
                {userRole === 'saas-owner' && <WorkspaceSwitcher />}

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {/* Dashboard button hidden - default view is Visitors */}
                  {/* <button
                    onClick={() => navigateTo('dashboard')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                      currentView === 'dashboard'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </button> */}
                  <button
                    onClick={() => navigateTo('visitors')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${currentView === 'visitors'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                  >
                    <Users className="w-4 h-4" />
                    Visitors
                  </button>
                  <button
                    onClick={() => navigateTo('settings')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${currentView === 'settings'
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  {userRole === 'saas-owner' && (
                    <button
                      onClick={() => navigateTo('command-center')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${currentView === 'command-center'
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                    >
                      <Shield className="w-4 h-4" />
                      Command Center
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Performance Metrics</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {selectedAgent ? `Viewing metrics for ${selectedAgent.name}` : 'Viewing metrics for all agents'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <select
                    defaultValue="14"
                    onChange={(e) => {
                      const days = parseInt(e.target.value);
                      setDateRange({
                        from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
                        to: new Date().toISOString()
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                  </select>
                </div>
              </div>

              <PerformanceDashboard
                selectedAgentId={selectedAgentId}
                dateRange={dateRange}
              />
            </div>
          )}

          {currentView === 'visitors' && (
            <Visitors />
          )}

          {currentView === 'settings' && (
            <SettingsPage />
          )}

          {currentView === 'command-center' && (
            <CommandCenter />
          )}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-3 rounded-full bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-110 transition-all duration-200"
          aria-label="Logout"
          type="button"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-110 transition-all duration-200"
          aria-label="Toggle dark mode"
          type="button"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
      </div>
    </ImpersonationProvider>
  );
}

export default App;

