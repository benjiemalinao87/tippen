import { useState } from 'react';
import { Users, Video, X, MessageSquare, Mic, MicOff, VideoOff, Phone, Copy, Check } from 'lucide-react';

interface Visitor {
  id: string;
  company: string;
  revenue: string;
  staff: number;
  lastSignedRole: string;
  lastActivity: string;
  videoCallUrl?: string;
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
    company: 'Acme Corporation',
    revenue: '$2.5M',
    staff: 150,
    lastSignedRole: 'Operations Manager',
    lastActivity: 'Oct 16, 08:22 PM',
    videoCallUrl: '#'
  },
  {
    id: '2',
    company: 'TechStart Inc',
    revenue: '$1.2M',
    staff: 45,
    lastSignedRole: 'Sales Director',
    lastActivity: 'Oct 15, 08:22 PM',
    videoCallUrl: '#'
  },
  {
    id: '3',
    company: 'Global Solutions Ltd',
    revenue: '$5.8M',
    staff: 320,
    lastSignedRole: 'CEO',
    lastActivity: 'Oct 14, 08:22 PM',
    videoCallUrl: '#'
  },
  {
    id: '4',
    company: 'Innovation Labs',
    revenue: '$3.1M',
    staff: 89,
    lastSignedRole: 'Product Manager',
    lastActivity: 'Oct 13, 08:22 PM',
    videoCallUrl: '#'
  },
  {
    id: '5',
    company: 'Enterprise Systems',
    revenue: '$12.5M',
    staff: 650,
    lastSignedRole: 'VP of Engineering',
    lastActivity: 'Oct 12, 08:22 PM',
    videoCallUrl: '#'
  },
  {
    id: '6',
    company: 'Digital Ventures',
    revenue: '$890K',
    staff: 28,
    lastSignedRole: 'Founder',
    lastActivity: 'Oct 11, 08:22 PM',
    videoCallUrl: '#'
  },
  {
    id: '7',
    company: 'Cloud Services Pro',
    revenue: '$4.2M',
    staff: 180,
    lastSignedRole: 'CTO',
    lastActivity: 'Oct 10, 08:22 PM',
    videoCallUrl: '#'
  },
  {
    id: '8',
    company: 'Smart Analytics',
    revenue: '$1.8M',
    staff: 55,
    lastSignedRole: 'Data Scientist',
    lastActivity: 'Oct 9, 08:22 PM',
    videoCallUrl: '#'
  },
  {
    id: '9',
    company: 'Future Tech Holdings',
    revenue: '$8.9M',
    staff: 420,
    lastSignedRole: 'Head of Sales',
    lastActivity: 'Oct 8, 08:22 PM',
    videoCallUrl: '#'
  },
  {
    id: '10',
    company: 'Synergy Partners',
    revenue: '$2.9M',
    staff: 95,
    lastSignedRole: 'Marketing Director',
    lastActivity: 'Oct 7, 08:22 PM',
    videoCallUrl: '#'
  }
];

export function Visitors() {
  const [visitors] = useState<Visitor[]>(mockVisitors);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [videoSession, setVideoSession] = useState<VideoSession | null>(null);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'waiting'>('connecting');
  const [message, setMessage] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Handle toggle switch for video call
  const handleCallToggle = async (visitorId: string, enabled: boolean) => {
    if (enabled) {
      const visitor = visitors.find(v => v.id === visitorId);
      if (!visitor) return;

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
        } else {
          console.error('Failed to create session:', data);
          setCallStatus('waiting');
        }
      } catch (error) {
        console.error('Error creating video session:', error);
        setCallStatus('waiting');
      }
    } else {
      setActiveCall(null);
      setVideoSession(null);
      setCallStatus('connecting');
      setMessage('');
      setCopiedUrl(false);
    }
  };

  // Copy guest URL to clipboard
  const copyGuestUrl = async () => {
    if (videoSession?.guestUrl) {
      try {
        await navigator.clipboard.writeText(videoSession.guestUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  };

  // Function to get badge color based on role type
  const getRoleBadgeColor = (role: string): string => {
    const roleLower = role.toLowerCase();

    // Executive roles - Purple
    if (roleLower.includes('ceo') || roleLower.includes('cto') || roleLower.includes('cfo') ||
        roleLower.includes('vp') || roleLower.includes('chief')) {
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
    }

    // Engineering/Technical - Green
    if (roleLower.includes('engineer') || roleLower.includes('developer') ||
        roleLower.includes('tech') || roleLower.includes('scientist')) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    }

    // Product/Manager - Blue
    if (roleLower.includes('product') || roleLower.includes('manager')) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    }

    // Sales/Marketing - Orange
    if (roleLower.includes('sales') || roleLower.includes('marketing') ||
        roleLower.includes('director')) {
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
    }

    // Operations - Cyan
    if (roleLower.includes('operations') || roleLower.includes('ops')) {
      return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400';
    }

    // Design/Creative - Pink
    if (roleLower.includes('design') || roleLower.includes('creative')) {
      return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400';
    }

    // Founder/Owner - Amber
    if (roleLower.includes('founder') || roleLower.includes('owner')) {
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    }

    // Default - Gray
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const activeVisitor = visitors.find(v => v.id === activeCall);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Visitors</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage company visitors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {visitors.length} total visitors
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                  Company
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                  Revenue
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                  Staff
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                  Last Signed Role
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                  Last Activity
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                  Video Call
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {visitors.map((visitor) => (
                <tr key={visitor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {visitor.company}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {visitor.revenue}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {visitor.staff.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor(visitor.lastSignedRole)}`}>
                      {visitor.lastSignedRole}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {visitor.lastActivity}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <button
                        onClick={() => handleCallToggle(visitor.id, activeCall !== visitor.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          activeCall === visitor.id
                            ? 'bg-blue-600 dark:bg-blue-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            activeCall === visitor.id ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                {callStatus === 'waiting' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    Connected
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-gray-600 dark:text-gray-400">⋯</span>
                </button>
                <button
                  onClick={() => handleCallToggle(activeCall, false)}
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

