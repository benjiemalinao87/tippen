import { useEffect, useRef, useState, useCallback } from 'react';

export interface Visitor {
  visitorId: string;
  company: string;
  location: string;
  lastRole: string;
  pageViews: number;
  timestamp: string;
  lastActivity: string;
  status: 'active' | 'video_invited' | 'in_call';
  guestUrl?: string;
  website: string;
  // Enrichment fields from Enrich.so
  domain?: string;
  industry?: string;
  revenue?: string;
  staff?: number;
  employees?: number;
  enrichedLocation?: string;
  _enrichmentSource?: 'enrich_so' | 'cache' | 'fallback';
  _cached?: boolean;
}

interface WebSocketMessage {
  type: 'INITIAL_VISITORS' | 'VISITOR_UPDATE' | 'VIDEO_INVITE_SENT' | 'VISITOR_LIST' | 'PONG';
  visitors?: Visitor[];
  visitor?: Visitor;
  event?: string;
  visitorId?: string;
  guestUrl?: string;
  timestamp?: number;
}

interface UseVisitorWebSocketReturn {
  visitors: Visitor[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendVideoInvite: (visitorId: string, guestUrl: string, sessionId: string) => Promise<void>;
  refreshVisitors: () => void;
}

const WEBSOCKET_URL = import.meta.env.VITE_VISITOR_WS_URL || 'wss://tippen-backend.benjiemalinao879557.workers.dev/ws/dashboard';
const IMPERSONATION_STORAGE_KEY = 'tippen_impersonation';

/**
 * Get API key - checks for impersonation first, then falls back to user's own API key
 */
function getActiveApiKey(): string | null {
  try {
    // First check if we're impersonating another organization
    const impersonationStr = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
    if (impersonationStr) {
      const impersonation = JSON.parse(impersonationStr);
      if (impersonation.targetOrganization?.apiKey) {
        console.log('[WebSocket] Using impersonated API key for:', impersonation.targetOrganization.name);
        return impersonation.targetOrganization.apiKey;
      }
    }

    // Fall back to user's own API key
    const userStr = localStorage.getItem('tippen_user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user.apiKey || null;
  } catch (error) {
    console.error('[WebSocket] Failed to get API key:', error);
    return null;
  }
}

/**
 * Get API key from authenticated user (legacy - for backward compatibility)
 * @deprecated Use getActiveApiKey() instead
 */
function getUserApiKey(): string | null {
  return getActiveApiKey();
}

export function useVisitorWebSocket(): UseVisitorWebSocketReturn {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef<boolean>(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    // Get active API key (impersonated or user's own)
    const apiKey = getActiveApiKey();
    if (!apiKey) {
      console.error('[WebSocket] No API key found');
      setConnectionStatus('error');
      return;
    }

    console.log('[WebSocket] Connecting to:', `${WEBSOCKET_URL}?apiKey=${apiKey}`);
    setConnectionStatus('connecting');

    try {
      const ws = new WebSocket(`${WEBSOCKET_URL}?apiKey=${apiKey}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setConnectionStatus('connected');

        // Request initial visitor list
        console.log('[WebSocket] Requesting initial visitor list');
        ws.send(JSON.stringify({ type: 'GET_VISITORS' }));

        // Start ping interval to keep connection alive
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 30000); // Ping every 30 seconds
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('[WebSocket] Received message:', message.type, message);

          switch (message.type) {
            case 'INITIAL_VISITORS':
              console.log('[WebSocket] Received initial visitors:', message.visitors?.length || 0);
              if (message.visitors) {
                setVisitors(message.visitors);
              }
              break;

            case 'VISITOR_UPDATE':
              console.log('[WebSocket] Visitor update:', message.visitor?.company);
              if (message.visitor) {
                setVisitors(prev => {
                  const index = prev.findIndex(v => v.visitorId === message.visitor!.visitorId);
                  if (index >= 0) {
                    const updated = [...prev];
                    updated[index] = message.visitor!;
                    return updated;
                  } else {
                    return [message.visitor!, ...prev];
                  }
                });
              }
              break;

            case 'VIDEO_INVITE_SENT':
              if (message.visitorId && message.guestUrl) {
                setVisitors(prev =>
                  prev.map(v =>
                    v.visitorId === message.visitorId
                      ? { ...v, status: 'video_invited', guestUrl: message.guestUrl }
                      : v
                  )
                );
              }
              break;

            case 'VISITOR_LIST':
              console.log('[WebSocket] Received visitor list:', message.visitors?.length || 0);
              if (message.visitors) {
                setVisitors(message.visitors);
              }
              break;

            case 'PONG':
              // Connection is alive
              break;

            default:
              console.log('Unknown message type:', message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Closed:', event.code, event.reason);
        setConnectionStatus('disconnected');

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Only attempt to reconnect if component is still mounted
        if (!isUnmountedRef.current) {
          console.log('[WebSocket] Scheduling reconnect in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WebSocket] Attempting to reconnect...');
            connect();
          }, 3000); // Reduced from 5000ms to 3000ms
        } else {
          console.log('[WebSocket] Component unmounted, not reconnecting');
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setConnectionStatus('error');
    }
  }, []);

  const sendVideoInvite = useCallback(async (visitorId: string, guestUrl: string, sessionId: string): Promise<void> => {
    try {
      // Get active API key (impersonated or user's own)
      const apiKey = getActiveApiKey();
      if (!apiKey) {
        throw new Error('No API key found');
      }

      const response = await fetch(`${WEBSOCKET_URL.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws/dashboard', '')}/api/send-video-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,  // ← Use user's API key for multi-tenant isolation
          visitorId,
          guestUrl,
          sessionId,  // ← Add sessionId so visitor can update status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send video invite');
      }
    } catch (error) {
      console.error('Error sending video invite:', error);
      throw error;
    }
  }, []);

  const refreshVisitors = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'GET_VISITORS' }));
    }
  }, []);

  // Handle impersonation changes - reconnect with new API key
  const reconnectWithNewApiKey = useCallback(() => {
    console.log('[WebSocket] Impersonation changed, reconnecting...');
    
    // Clear visitors from old organization
    setVisitors([]);
    
    // Close existing connection
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close(1000, 'Impersonation changed');
      wsRef.current = null;
    }
    
    // Clear timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    // Small delay to let state settle, then reconnect
    setTimeout(() => {
      if (!isUnmountedRef.current) {
        connect();
      }
    }, 100);
  }, [connect]);

  // Listen for impersonation state changes
  useEffect(() => {
    const handleImpersonationChange = () => {
      reconnectWithNewApiKey();
    };

    window.addEventListener('tippen-impersonation-change', handleImpersonationChange);
    return () => window.removeEventListener('tippen-impersonation-change', handleImpersonationChange);
  }, [reconnectWithNewApiKey]);

  useEffect(() => {
    console.log('[WebSocket] useEffect - mounting component');

    // Reset unmounted flag at the START of the effect
    // This ensures StrictMode's double-mount works correctly
    isUnmountedRef.current = false;

    connect();

    return () => {
      console.log('[WebSocket] useEffect cleanup - unmounting component');
      // Mark as unmounted to prevent reconnection attempts
      isUnmountedRef.current = true;

      // Clear all timers
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Close WebSocket connection properly
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        console.log('[WebSocket] Closing connection (component unmounted)');
        // Close with code 1000 (normal closure)
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    visitors,
    connectionStatus,
    sendVideoInvite,
    refreshVisitors,
  };
}
