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
            console.log('[Tippen] Video invite received with sessionId:', data.sessionId);
            showVideoCallPopup(data.guestUrl, data.sessionId, data.visitorId);
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
  function showVideoCallPopup(guestUrl, sessionId, visitorId) {
    const videoContainer = document.createElement('div');
    videoContainer.id = 'tippen-video-modal';
    videoContainer.style.cssText = \`
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 420px;
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

    // Get site name from hostname
    const siteName = window.location.hostname.replace('www.', '');

    // Create invitation prompt
    const invitationPrompt = document.createElement('div');
    invitationPrompt.style.cssText = \`
      padding: 32px 24px;
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    \`;

    invitationPrompt.innerHTML = \`
      <div style="margin-bottom: 20px;">
        <div style="width: 64px; height: 64px; background: white; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2">
            <path d="M23 7l-7 5 7 5V7z"></path>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </div>
        <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: white;">Video Call Request</h3>
        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.5; color: rgba(255,255,255,0.9);">
          A representative from <strong>\${siteName}</strong> would like to speak with you via video.
        </p>
        <p style="margin: 0 0 24px 0; font-size: 14px; color: rgba(255,255,255,0.8);">
          Click "Join Call" to connect now.
        </p>
      </div>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="tippen-reject-btn" style="
          flex: 1;
          padding: 14px 24px;
          background: rgba(255,255,255,0.2);
          color: white;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">
          Reject
        </button>
        <button id="tippen-join-btn" style="
          flex: 1;
          padding: 14px 24px;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">
          Join Call
        </button>
      </div>
    \`;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = \`
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(0, 0, 0, 0.2);
      color: white;
      font-size: 24px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1;
      line-height: 1;
      transition: background 0.2s;
    \`;
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(0, 0, 0, 0.4)';
    closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(0, 0, 0, 0.2)';
    closeBtn.onclick = () => {
      document.body.removeChild(videoContainer);
      sendVisitorPing('video_declined');
    };

    videoContainer.appendChild(invitationPrompt);
    videoContainer.appendChild(closeBtn);
    document.body.appendChild(videoContainer);

    // Handle Reject button
    document.getElementById('tippen-reject-btn').onclick = async () => {
      document.body.removeChild(videoContainer);
      sendVisitorPing('video_rejected');

      // Update video session status to 'declined'
      try {
        await fetch(\`\${backendUrl}/api/visitors/video-status\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey,
            visitorId,
            videoData: { sessionId },
            status: 'declined'
          })
        });
        console.log('[Tippen] Video session marked as declined');
      } catch (error) {
        console.error('[Tippen] Failed to update video status:', error);
      }
    };

    // Handle Join button
    document.getElementById('tippen-join-btn').onclick = async () => {
      // Remove invitation prompt
      invitationPrompt.remove();

      // Resize container for video
      videoContainer.style.height = '600px';

      // Create and load video iframe
      const iframe = document.createElement('iframe');
      iframe.src = guestUrl;
      iframe.style.cssText = \`
        width: 100%;
        height: 100%;
        border: none;
      \`;
      iframe.allow = 'camera; microphone; display-capture; autoplay';

      videoContainer.appendChild(iframe);
      sendVisitorPing('video_accepted');

      // Update video session status to 'accepted'
      try {
        await fetch(\`\${backendUrl}/api/visitors/video-status\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey,
            visitorId,
            videoData: { sessionId },
            status: 'accepted'
          })
        });
        console.log('[Tippen] Video session marked as accepted/connected');
      } catch (error) {
        console.error('[Tippen] Failed to update video status:', error);
      }

      // Update close button to end the call properly when video is active
      closeBtn.onclick = async () => {
        document.body.removeChild(videoContainer);
        sendVisitorPing('video_ended');

        // Update video session status to 'completed' and calculate duration
        try {
          await fetch(\`\${backendUrl}/api/visitors/video-status\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey,
              visitorId,
              videoData: { sessionId },
              status: 'completed'
            })
          });
          console.log('[Tippen] Video session marked as completed');
        } catch (error) {
          console.error('[Tippen] Failed to update video status:', error);
        }
      };
    };
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
