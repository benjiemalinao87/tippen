import { useState, useEffect } from 'react';
import { Video, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getUserApiKey } from '../../../shared/utils/auth';

interface VideoSession {
  id: number;
  visitor_id: string;
  session_id: string;
  company: string;
  visitor_role: string;
  status: 'invited' | 'connecting' | 'connected' | 'completed' | 'failed' | 'declined';
  invited_at: string;
  connected_at: string | null;
  ended_at: string | null;
  duration_seconds: number;
  connection_time_seconds: number | null;
  is_qualified_lead: number;
  lead_quality_score: number | null;
  lead_quality: string | null;
  notes: string | null;
}

export function VideoSessionsHistory() {
  const [sessions, setSessions] = useState<VideoSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchSessions();
  }, [filterStatus]);

  const fetchSessions = async () => {
    try {
      setLoading(true);

      // Get authenticated user's API key for multi-tenant isolation
      const apiKey = getUserApiKey();

      if (!apiKey) {
        console.error('[VideoSessions] No API key found - user not authenticated');
        setLoading(false);
        return;
      }

      const backendUrl = import.meta.env.VITE_VISITOR_WS_URL
        ?.replace('ws://', 'http://')
        .replace('wss://', 'https://')
        .replace('/ws/dashboard', '') || 'https://tippen-backend.benjiemalinao879557.workers.dev';

      const url = `${backendUrl}/api/analytics/video-sessions?api_key=${apiKey}&limit=50${filterStatus !== 'all' ? `&status=${filterStatus}` : ''}`;

      console.log('[VideoSessions] Fetching sessions with API key:', apiKey.substring(0, 20) + '...');

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSessions(data.sessions || []);
        console.log('[VideoSessions] Loaded', data.sessions?.length || 0, 'sessions');
      }
    } catch (error) {
      console.error('Failed to fetch video sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'declined':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'connected':
        return <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'declined':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'connected':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'invited':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getLeadQualityColor = (quality: string | null) => {
    if (!quality) return '';

    switch (quality.toLowerCase()) {
      case 'hot':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'warm':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'cold':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'not-qualified':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Video Sessions History</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recent video call attempts and outcomes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="connected">Connected</option>
              <option value="declined">Declined</option>
              <option value="failed">Failed</option>
              <option value="invited">Invited</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading video sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center">
            <Video className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No video sessions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Start a video call with a visitor to see it here
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Invited At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lead Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session.company}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {session.visitor_role || '--'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(session.status)}
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {formatDuration(session.duration_seconds)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(session.invited_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {session.lead_quality ? (
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getLeadQualityColor(session.lead_quality)}`}>
                          {session.lead_quality.charAt(0).toUpperCase() + session.lead_quality.slice(1).replace('-', ' ')}
                        </span>
                        {session.lead_quality_score && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({session.lead_quality_score}/5)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {session.notes ? (
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={session.notes}>
                        {session.notes}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {!loading && sessions.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {sessions.length} video session{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
