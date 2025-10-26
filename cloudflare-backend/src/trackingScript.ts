/**
 * Tippen Visitor Tracking Script
 * This is embedded as a string to be served by the Worker
 */

export const TRACKING_SCRIPT = `/**
 * Tippen Visitor Tracking Script
 * Embed this script on client websites to track visitors
 */

(function() {
  'use strict';

  // Configuration
  const script = document.currentScript;
  const apiKey = script?.getAttribute('data-tippen-api-key') || script?.getAttribute('data-api-key');
  const backendUrl = script?.getAttribute('data-tippen-backend') || 'https://tippen-backend.benjiemalinao879557.workers.dev';
  const TIPPEN_API_URL = \`\${backendUrl}/track/visitor\`;

  if (!apiKey) {
    console.warn('[Tippen] API key not provided');
    return;
  }

  console.log('[Tippen] Tracker initialized with API key:', apiKey);

  // Generate or retrieve visitor ID
  function getVisitorId() {
    let visitorId = localStorage.getItem('tippen_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('tippen_visitor_id', visitorId);
    }
    return visitorId;
  }

  // Get visitor information
  function getVisitorInfo() {
    return {
      visitorId: getVisitorId(),
      url: window.location.href,
      referrer: document.referrer || 'direct',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: \`\${screen.width}x\${screen.height}\`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      company: null,
      ip: null
    };
  }

  // Send visitor data to Tippen
  async function sendVisitorPing(event = 'pageview') {
    try {
      const visitorData = getVisitorInfo();

      const response = await fetch(TIPPEN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tippen-API-Key': apiKey
        },
        body: JSON.stringify({
          event,
          visitor: visitorData,
          website: window.location.hostname
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Tippen] Visitor tracked:', data);

        if (data.sessionId) {
          sessionStorage.setItem('tippen_session_id', data.sessionId);
        }
      }
    } catch (error) {
      console.error('[Tippen] Tracking error:', error);
    }
  }

  // Track page views
  sendVisitorPing('pageview');

  // Track time on page (send ping every 30 seconds)
  let timeOnPage = 0;
  const heartbeatInterval = setInterval(() => {
    timeOnPage += 30;
    sendVisitorPing('heartbeat');
  }, 30000);

  // Track page exit
  window.addEventListener('beforeunload', () => {
    clearInterval(heartbeatInterval);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }

    const visitorData = getVisitorInfo();
    navigator.sendBeacon(
      TIPPEN_API_URL,
      JSON.stringify({
        event: 'exit',
        visitor: visitorData,
        timeOnPage
      })
    );
  });

  // Connect to WebSocket for real-time video invites
  let ws = null;
  function connectWebSocket() {
    const wsUrl = backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    const visitorId = getVisitorId();
    const wsConnectionUrl = \`\${wsUrl}/ws/visitor?visitorId=\${visitorId}&apiKey=\${apiKey}\`;

    console.log('[Tippen] Connecting to WebSocket:', wsConnectionUrl);

    try {
      ws = new WebSocket(wsConnectionUrl);

      ws.onopen = () => {
        console.log('[Tippen] ✅ WebSocket connected for video invites');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[Tippen] WebSocket message received:', data);

          if (data.type === 'VIDEO_INVITE' && data.guestUrl) {
            console.log('[Tippen] Video invite received, showing popup');
            showVideoCallPopup(data.guestUrl);
          }
        } catch (error) {
          console.error('[Tippen] Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[Tippen] WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('[Tippen] WebSocket closed, reconnecting in 5s...');
        setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      console.error('[Tippen] Error connecting WebSocket:', error);
    }
  }

  // Connect to WebSocket
  connectWebSocket();

  // Show video call popup (chat widget style in bottom right corner)
  function showVideoCallPopup(guestUrl) {
    const videoContainer = document.createElement('div');
    videoContainer.id = 'tippen-video-modal';
    videoContainer.style.cssText = \`
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 420px;
      height: 600px;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 999999;
      animation: slideInUp 0.3s ease-out;
    \`;

    // Add animation keyframes
    if (!document.getElementById('tippen-animations')) {
      const style = document.createElement('style');
      style.id = 'tippen-animations';
      style.textContent = \`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      \`;
      document.head.appendChild(style);
    }

    const iframe = document.createElement('iframe');
    iframe.src = guestUrl;
    iframe.style.cssText = \`
      width: 100%;
      height: 100%;
      border: none;
    \`;
    iframe.allow = 'camera; microphone; display-capture; autoplay';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = \`
      position: absolute;
      top: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      font-size: 24px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1;
    \`;
    closeBtn.onclick = () => {
      document.body.removeChild(videoContainer);
      sendVisitorPing('video_declined');
    };

    videoContainer.appendChild(iframe);
    videoContainer.appendChild(closeBtn);
    document.body.appendChild(videoContainer);

    sendVisitorPing('video_accepted');
  }

  console.log('[Tippen] Visitor tracking initialized');

  window.TippenTracker = {
    version: '1.0.0',
    visitorId: getVisitorId(),
    trackEvent: sendVisitorPing,
    initialized: true
  };
})();
`;
