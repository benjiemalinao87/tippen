import { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown, Check, Loader2, LogOut } from 'lucide-react';
import { useImpersonation } from '../../contexts/ImpersonationContext';

export function WorkspaceSwitcher() {
  const {
    isImpersonating,
    targetOrganization,
    originalUser,
    organizations,
    isLoading,
    startImpersonation,
    exitImpersonation,
    getActiveOrganizationName,
    loadOrganizations
  } = useImpersonation();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only show for saas-owner
  if (originalUser?.role !== 'saas-owner') {
    return null;
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh organizations when dropdown opens
  const handleToggle = () => {
    if (!isOpen && organizations.length === 0) {
      loadOrganizations();
    }
    setIsOpen(!isOpen);
  };

  const handleSelectOrg = async (org: { id: number; name: string; apiKey: string }) => {
    await startImpersonation(org);
    setIsOpen(false);
  };

  const handleExitImpersonation = () => {
    exitImpersonation();
    setIsOpen(false);
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isImpersonating
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        <Building2 className="w-4 h-4" />
        <span className="text-sm font-medium max-w-[150px] truncate">
          {getActiveOrganizationName()}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Switch Workspace
            </p>
          </div>

          {/* Current workspace indicator */}
          {isImpersonating && targetOrganization && (
            <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm text-amber-800 dark:text-amber-200">
                    Viewing: <strong>{targetOrganization.name}</strong>
                  </span>
                </div>
                <button
                  onClick={handleExitImpersonation}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  Exit
                </button>
              </div>
            </div>
          )}

          {/* Tippen HQ Option (return to own workspace) */}
          <button
            onClick={handleExitImpersonation}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
              !isImpersonating ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">T</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Tippen HQ
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your workspace
                </p>
              </div>
            </div>
            {!isImpersonating && (
              <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Organizations List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  Loading organizations...
                </span>
              </div>
            ) : organizations.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No client organizations found
              </div>
            ) : (
              organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSelectOrg(org)}
                  className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    isImpersonating && targetOrganization?.id === org.id
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      org.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <span className={`text-xs font-bold ${
                        org.status === 'active'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {org.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {org.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {org.totalVisitors || 0} visitors • {formatTimeAgo(org.lastActivity)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      org.status === 'active' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    {isImpersonating && targetOrganization?.id === org.id && (
                      <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {organizations.length} organization{organizations.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
