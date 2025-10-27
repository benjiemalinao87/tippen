import { useState, useEffect, useRef } from 'react';
import { Video, X, Wifi, WifiOff } from 'lucide-react';
import { useVisitorWebSocket } from '../../../shared/hooks';
import type { Visitor as VisitorType } from '../../../shared/hooks';
import { VisitorStatsCards } from './VisitorStatsCards';
import { VisitorActivityChart } from './VisitorActivityChart';
import { TopCompaniesWidget } from './TopCompaniesWidget';
import { VisitorMapWidget } from './VisitorMapWidget';
import { VisitorTable } from './VisitorTable';
import { VisitorDetailsModal } from './VisitorDetailsModal';
import { DateRangePicker, type DateRangeType } from './DateRangePicker';
import { VideoSessionsHistory } from '../../dashboard/components/VideoSessionsHistory';
import { slackService } from '../../../services/slackService';
import { getVisitorAnalytics, type VisitorAnalytics } from '../../../services/dashboardApi';

// Extended visitor interface for display purposes
interface Visitor extends VisitorType {
  id?: string; // For backwards compatibility
  revenue?: string;
  staff?: number;
  lastSignedRole?: string;
}

interface VideoSession {
  sessionId: string;
  roomId: string;
  hostUrl: string;
  guestUrl: string;
}

// Mock visitors data
const mockVisitors: Visitor[] = [
  {
    id: '1',
    visitorId: 'visitor_1',
    company: 'Acme Corporation',
    location: 'San Francisco, CA',
    lastRole: 'Operations Manager',
    pageViews: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    lastActivity: 'Oct 16, 08:22 PM',
    status: 'active',
    website: 'acmecorp.com',
    revenue: '$2.5M',
    staff: 150,
    lastSignedRole: 'Operations Manager'
  },
  {
    id: '2',
    visitorId: 'visitor_2',
    company: 'TechStart Inc',
    location: 'New York, NY',
    lastRole: 'Sales Director',
    pageViews: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    lastActivity: 'Oct 15, 08:22 PM',
    status: 'active',
    website: 'techstart.io',
    revenue: '$1.2M',
    staff: 45,
    lastSignedRole: 'Sales Director'
  },
  {
    id: '3',
    visitorId: 'visitor_3',
    company: 'Global Solutions Ltd',
    location: 'London, UK',
    lastRole: 'CEO',
    pageViews: 8,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    lastActivity: 'Oct 14, 08:22 PM',
    status: 'active',
    website: 'globalsolutions.co.uk',
    revenue: '$5.8M',
    staff: 320,
    lastSignedRole: 'CEO'
  },
  {
    id: '4',
    visitorId: 'visitor_4',
    company: 'Innovation Labs',
    location: 'Austin, TX',
    lastRole: 'Product Manager',
    pageViews: 6,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    lastActivity: 'Oct 13, 08:22 PM',
    status: 'active',
    website: 'innovationlabs.com',
    revenue: '$3.1M',
    staff: 89,
    lastSignedRole: 'Product Manager'
  },
  {
    id: '5',
    visitorId: 'visitor_5',
    company: 'Enterprise Systems',
    location: 'Seattle, WA',
    lastRole: 'VP of Engineering',
    pageViews: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    lastActivity: 'Oct 12, 08:22 PM',
    status: 'active',
    website: 'enterprisesystems.com',
    revenue: '$12.5M',
    staff: 650,
    lastSignedRole: 'VP of Engineering'
  },
  {
    id: '6',
    visitorId: 'visitor_6',
    company: 'Digital Ventures',
    location: 'Miami, FL',
    lastRole: 'Founder',
    pageViews: 4,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    lastActivity: 'Oct 11, 08:22 PM',
    status: 'active',
    website: 'digitalventures.io',
    revenue: '$890K',
    staff: 28,
    lastSignedRole: 'Founder'
  },
  {
    id: '7',
    visitorId: 'visitor_7',
    company: 'Cloud Services Pro',
    location: 'Toronto, Canada',
    lastRole: 'CTO',
    pageViews: 7,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(), // 6 days ago
    lastActivity: 'Oct 10, 08:22 PM',
    status: 'active',
    website: 'cloudservicespro.com',
    revenue: '$4.2M',
    staff: 180,
    lastSignedRole: 'CTO'
  },
  {
    id: '8',
    visitorId: 'visitor_8',
    company: 'Smart Analytics',
    location: 'Boston, MA',
    lastRole: 'Data Scientist',
    pageViews: 9,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), // 7 days ago
    lastActivity: 'Oct 9, 08:22 PM',
    status: 'active',
    website: 'smartanalytics.ai',
    revenue: '$1.8M',
    staff: 55,
    lastSignedRole: 'Data Scientist'
  },
  {
    id: '9',
    visitorId: 'visitor_9',
    company: 'Future Tech Holdings',
    location: 'Singapore',
    lastRole: 'Head of Sales',
    pageViews: 11,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(), // 8 days ago
    lastActivity: 'Oct 8, 08:22 PM',
    status: 'active',
    website: 'futuretechholdings.sg',
    revenue: '$8.9M',
    staff: 420,
    lastSignedRole: 'Head of Sales'
  },
  {
    id: '10',
    visitorId: 'visitor_10',
    company: 'Synergy Partners',
    location: 'Chicago, IL',
    lastRole: 'Marketing Director',
    pageViews: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 216).toISOString(), // 9 days ago
    lastActivity: 'Oct 7, 08:22 PM',
    status: 'active',
    website: 'synergypartners.com',
    revenue: '$2.9M',
    staff: 95,
    lastSignedRole: 'Marketing Director'
  }
];

export function Visitors() {
  // Use WebSocket hook for real-time visitor data
  const { visitors: liveVisitors, connectionStatus, sendVideoInvite, refreshVisitors } = useVisitorWebSocket();

  // Use only real visitors (no mock data fallback)
  const visitors = liveVisitors;

  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [videoSession, setVideoSession] = useState<VideoSession | null>(null);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'waiting'>('connecting');
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const previousVisitorCountRef = useRef<number>(0);
  const [hasCheckedUrlParam, setHasCheckedUrlParam] = useState(false);

  // Date range and analytics state
  const [selectedRange, setSelectedRange] = useState<DateRangeType>('active');
  const [analytics, setAnalytics] = useState<VisitorAnalytics>({
    totalVisitors: 0,
    activeVisitors: 0,
    totalPageViews: 0,
    avgPageViewsPerVisitor: 0,
    engagementRate: 0,
    avgTimeOnSite: 0,
    topVisitors: [],
    visitorActivityByHour: [],
    locationBreakdown: []
  });

  // Fetch analytics when date range changes
  useEffect(() => {
    const fetchAnalytics = async () => {
      const data = await getVisitorAnalytics(selectedRange);
      setAnalytics(data);
    };

    fetchAnalytics();
  }, [selectedRange]);

  // Handle date range change
  const handleRangeChange = async (range: DateRangeType, startDate?: string, endDate?: string) => {
    setSelectedRange(range);
    const data = await getVisitorAnalytics(range, startDate, endDate);
    setAnalytics(data);
  };

  // Auto-open visitor details modal if visitorId is in URL
  useEffect(() => {
    // Only check once when visitors are loaded
    if (hasCheckedUrlParam || visitors.length === 0) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const visitorId = urlParams.get('visitorId');

    if (visitorId) {
      console.log('[Visitors] Searching for visitor:', visitorId, 'in', visitors.length, 'visitors');

      const visitor = visitors.find(v =>
        (v.id === visitorId) || (v.visitorId === visitorId)
      );

      if (visitor) {
        console.log('[Visitors] Found visitor, opening modal:', visitor);
        setSelectedVisitor(visitor);
        setHasCheckedUrlParam(true);

        // Clear URL parameter after a delay (to ensure modal opens first)
        setTimeout(() => {
          window.history.replaceState({}, '', '/visitors');
        }, 500);
      } else {
        console.log('[Visitors] Visitor not found in list');
        // Still mark as checked to avoid infinite loop
        setHasCheckedUrlParam(true);
      }
    }
  }, [visitors, hasCheckedUrlParam]);

  // Send Slack notification for new visitors
  useEffect(() => {
    if (previousVisitorCountRef.current > 0 && visitors.length > previousVisitorCountRef.current) {
      // New visitor(s) detected
      const newVisitors = visitors.slice(previousVisitorCountRef.current);
      newVisitors.forEach(visitor => {
        if (slackService.isEnabled()) {
          slackService.sendNewVisitorNotification({
            id: visitor.id || visitor.visitorId,
            company: visitor.company,
            revenue: visitor.revenue || 'N/A',
            staff: visitor.staff || 0,
            lastSignedRole: visitor.lastRole,
            lastActivity: visitor.lastActivity || new Date().toLocaleString()
          });
        }
      });
    }
    previousVisitorCountRef.current = visitors.length;
  }, [visitors]);

  // Handle start video call
  const handleStartCall = async (visitor: Visitor) => {
    const visitorId = visitor.id || visitor.visitorId;
    setActiveCall(visitorId);
    setCallStatus('connecting');

    try {
      // Call the API to create a session
      const response = await fetch('https://dev-platform-api-dev.benjiemalinao879557.workers.dev/public/video-connect/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostName: 'Tippen Agent',
          guestName: visitor.company,
          isAdmin: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setVideoSession({
          sessionId: data.sessionId,
          roomId: data.roomId,
          hostUrl: data.urls.host,
          guestUrl: data.urls.guest
        });
        setCallStatus('connected');

        // Send video invite to visitor's browser via WebSocket
        try {
          await sendVideoInvite(visitor.visitorId, data.urls.guest, data.sessionId);
          console.log('Video invite sent to visitor with sessionId:', data.sessionId);
        } catch (error) {
          console.error('Failed to send video invite:', error);
        }

        // Save video session details to D1 database
        try {
          const backendUrl = import.meta.env.VITE_VISITOR_WS_URL?.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws/dashboard', '') || 
                           'https://tippen-backend.benjiemalinao879557.workers.dev';
          const apiKey = import.meta.env.VITE_TIPPEN_API_KEY || 'demo_tippen_2025_live_k8m9n2p4q7r1';
          
          await fetch(`${backendUrl}/api/visitors/video-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apiKey,
              visitorId: visitor.visitorId,
              videoData: {
                sessionId: data.sessionId,
                roomId: data.roomId,
                hostUrl: data.urls.host,
                guestUrl: data.urls.guest
              },
              status: 'invited'
            })
          });
          console.log('Video session saved to D1');
        } catch (error) {
          console.error('Failed to save video session to D1:', error);
          // Continue anyway - video session still works
        }

        // Send Slack notification about video call request
        if (slackService.isEnabled()) {
          await slackService.sendVideoCallRequestNotification({
            visitorCompany: visitor.company,
            adminName: 'Tippen Agent',
            hostUrl: data.urls.host,
            guestUrl: data.urls.guest
          });
        }
      } else {
        console.error('Failed to create session:', data);
        setCallStatus('waiting');
      }
    } catch (error) {
      console.error('Error creating video session:', error);
      setCallStatus('waiting');
    }
  };

  // Handle end video call
  const handleEndCall = () => {
    setActiveCall(null);
    setVideoSession(null);
    setCallStatus('connecting');
  };

  const activeVisitor = visitors.find(v => (v.id || v.visitorId) === activeCall);

  // Connection status indicator
  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'connecting':
        return <Wifi className="w-4 h-4 text-yellow-600 dark:text-yellow-400 animate-pulse" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Visitors</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time visitor tracking and engagement
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            selectedRange={selectedRange}
            onRangeChange={handleRangeChange}
          />
          <div className="flex items-center gap-2">
            {getConnectionStatusIcon()}
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {connectionStatus}
            </span>
          </div>
          <button
            onClick={refreshVisitors}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <VisitorStatsCards visitors={visitors} analytics={analytics} />

      {/* Charts and Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorActivityChart visitors={visitors} analytics={analytics} />
        <TopCompaniesWidget visitors={visitors} />
      </div>

      {/* Location Map Widget */}
      <VisitorMapWidget visitors={visitors} analytics={analytics} />

      {/* Video Sessions History */}
      <VideoSessionsHistory />

      {/* Visitor Table */}
      <VisitorTable 
        visitors={visitors}
        onViewDetails={setSelectedVisitor}
        onStartCall={handleStartCall}
        activeCall={activeCall}
        onToggleCall={(visitorId, enabled) => {
          if (enabled) {
            const visitor = visitors.find(v => (v.id || v.visitorId) === visitorId);
            if (visitor) handleStartCall(visitor);
          } else {
            handleEndCall();
          }
        }}
      />

      {/* Visitor Details Modal */}
      {selectedVisitor && (
        <VisitorDetailsModal
          visitor={selectedVisitor}
          onClose={() => setSelectedVisitor(null)}
          onStartVideoCall={handleStartCall}
        />
      )}

      {/* Video Call Modal */}
      {activeCall && activeVisitor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[700px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Video Call with {activeVisitor.company}
                </h3>
                {callStatus === 'connecting' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                    Connecting...
                  </span>
                )}
                {callStatus === 'connected' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    Connected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={handleEndCall}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Video Area - Full Width */}
              <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
                {videoSession && callStatus === 'connected' ? (
                  <iframe
                    src={videoSession.hostUrl}
                    className="w-full h-full"
                    allow="camera; microphone; display-capture; autoplay"
                    allowFullScreen
                  />
                ) : (
                  // Show placeholder while connecting
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Video className="w-16 h-16 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-semibold text-white mb-2">
                      {activeVisitor.company}
                    </h4>
                    <p className="text-gray-400">
                      {callStatus === 'connecting' ? 'Setting up video session...' : 'Waiting to join...'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

