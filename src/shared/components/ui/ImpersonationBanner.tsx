import { Eye, X, Building2 } from 'lucide-react';
import { useImpersonation } from '../../contexts/ImpersonationContext';

export function ImpersonationBanner() {
  const { isImpersonating, targetOrganization, exitImpersonation } = useImpersonation();

  if (!isImpersonating || !targetOrganization) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              View Mode
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">
              Viewing workspace: <strong>{targetOrganization.name}</strong>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/80">
            You are viewing this workspace as a SaaS owner for troubleshooting
          </span>
          <button
            onClick={exitImpersonation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Exit View
          </button>
        </div>
      </div>
    </div>
  );
}
