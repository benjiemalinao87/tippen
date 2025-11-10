import { X, Globe, MapPin, Monitor, Clock, Eye, User, Link as LinkIcon, Calendar, Sparkles, Database, Building2, DollarSign, Users as UsersIcon, Briefcase } from 'lucide-react';
import type { Visitor } from '../../../shared/types';

interface VisitorDetailsModalProps {
  visitor: Visitor;
  onClose: () => void;
  onStartVideoCall: (visitor: Visitor) => void;
}

export function VisitorDetailsModal({ visitor, onClose, onStartVideoCall }: VisitorDetailsModalProps) {
  const isEnriched = visitor.enrichmentSource === 'enrich_so' || visitor.enrichmentSource === 'cache';

  const getRoleBadgeColor = (role: string | undefined): string => {
    if (!role) return 'bg-gray-50/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    const roleLower = role.toLowerCase();

    if (roleLower.includes('ceo') || roleLower.includes('cto') || roleLower.includes('cfo') ||
        roleLower.includes('vp') || roleLower.includes('chief')) {
      return 'bg-purple-50/80 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700';
    }

    if (roleLower.includes('engineer') || roleLower.includes('developer') ||
        roleLower.includes('tech') || roleLower.includes('scientist')) {
      return 'bg-green-50/80 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700';
    }

    if (roleLower.includes('product') || roleLower.includes('manager')) {
      return 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
    }

    if (roleLower.includes('sales') || roleLower.includes('marketing') ||
        roleLower.includes('director')) {
      return 'bg-orange-50/80 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
    }

    if (roleLower.includes('design') || roleLower.includes('creative')) {
      return 'bg-pink-50/80 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-700';
    }

    if (roleLower.includes('founder') || roleLower.includes('owner')) {
      return 'bg-amber-50/80 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700';
    }

    return 'bg-gray-50/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'video_invited':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'in_call':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {visitor.company}
              </h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visitor.status)}`}>
                {visitor.status ? visitor.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company Intelligence Section (if enriched) */}
          {isEnriched && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                {visitor.isCached ? (
                  <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Company Intelligence
                </h3>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                  visitor.isCached
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {visitor.isCached ? '💾 Cached (0 credits)' : '🔍 Fresh (1 credit)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visitor.companyDomain && (
                  <InfoItem
                    icon={Globe}
                    label="Company Domain"
                    value={visitor.companyDomain}
                    link={visitor.companyDomain}
                  />
                )}
                {visitor.industry && (
                  <InfoItem
                    icon={Briefcase}
                    label="Industry"
                    value={visitor.industry}
                  />
                )}
                {visitor.revenue && (
                  <InfoItem
                    icon={DollarSign}
                    label="Revenue"
                    value={visitor.revenue}
                  />
                )}
                {visitor.employees && (
                  <InfoItem
                    icon={UsersIcon}
                    label="Employees"
                    value={`~${visitor.employees.toLocaleString()}`}
                  />
                )}
                {visitor.enrichedLocation && (
                  <InfoItem
                    icon={Building2}
                    label="HQ Location"
                    value={visitor.enrichedLocation}
                  />
                )}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Page Views</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{visitor.pageViews || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Time on Site</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {visitor.timestamp ? Math.floor((Date.now() - new Date(visitor.timestamp).getTime()) / 60000) : 0}m
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Location</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{visitor.location}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Role</span>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getRoleBadgeColor(visitor.lastRole)}`}>
                {visitor.lastRole}
              </span>
            </div>
          </div>

          {/* Visitor Information */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Visitor Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem 
                icon={Globe} 
                label="Website" 
                value={visitor.website || 'Unknown'}
                link={visitor.website}
              />
              <InfoItem 
                icon={MapPin} 
                label="Location" 
                value={visitor.location || 'Unknown'} 
              />
              <InfoItem 
                icon={Calendar} 
                label="First Seen" 
                value={visitor.timestamp ? new Date(visitor.timestamp).toLocaleString() : 'Unknown'}
              />
              <InfoItem 
                icon={Clock} 
                label="Last Activity" 
                value={visitor.lastActivity || 'Unknown'}
              />
              <InfoItem 
                icon={User} 
                label="Last Role" 
                value={visitor.lastRole || 'Unknown'}
              />
              <InfoItem 
                icon={Eye} 
                label="Page Views" 
                value={visitor.pageViews !== undefined ? visitor.pageViews.toString() : '0'}
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Technical Details</h3>
            
            <div className="space-y-2">
              <DetailRow label="Visitor ID" value={visitor.visitorId || visitor.id || 'Unknown'} />
              <DetailRow label="Status" value={visitor.status || 'Unknown'} />
              {visitor.guestUrl && (
                <DetailRow label="Video URL" value={visitor.guestUrl} link={visitor.guestUrl} />
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Activity Timeline</h3>
            <div className="space-y-3">
              <TimelineItem 
                time={visitor.lastActivity}
                title="Last Activity"
                description="Most recent interaction"
                color="blue"
              />
              <TimelineItem 
                time={new Date(visitor.timestamp).toLocaleString()}
                title="First Visit"
                description="Initial page load"
                color="green"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <button
            onClick={() => onStartVideoCall(visitor)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Start Video Call
          </button>
          <button className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors">
            View Full History
          </button>
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  link?: string;
}

function InfoItem({ icon: Icon, label, value, link }: InfoItemProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        {link ? (
          <a 
            href={link.startsWith('http') ? link : `https://${link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  link?: string;
}

function DetailRow({ label, value, link }: DetailRowProps) {
  return (
    <div className="flex justify-between items-start gap-4 py-1">
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      {link ? (
        <a 
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline text-right truncate max-w-xs"
        >
          {value}
        </a>
      ) : (
        <span className="text-xs text-gray-900 dark:text-gray-100 text-right truncate max-w-xs">{value}</span>
      )}
    </div>
  );
}

interface TimelineItemProps {
  time: string;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple';
}

function TimelineItem({ time, title, description, color }: TimelineItemProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-2 h-2 rounded-full ${colorClasses[color]}`} />
        <div className="w-px h-full bg-gray-300 dark:bg-gray-600 mt-1" />
      </div>
      <div className="flex-1 pb-3">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
          <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

