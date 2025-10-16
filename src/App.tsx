import { useState, useEffect } from 'react';
import { BarChart3, Calendar, Moon, Sun, Users } from 'lucide-react';
import { PerformanceDashboard } from './features/dashboard';
import { Visitors } from './features/visitors';
import { agentApi } from './lib/api';
import type { Agent } from './shared/types';

type View = 'dashboard' | 'visitors';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
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
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
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

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
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
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('visitors')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    currentView === 'visitors'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Visitors
                </button>
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
        </div>
      </main>

      {/* Floating Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-110 transition-all duration-200 z-50"
        aria-label="Toggle dark mode"
        type="button"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  );
}

export default App;
