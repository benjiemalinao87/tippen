/**
 * Tippen - Visitor Coordinator Durable Object
 * Uses WebSocket Hibernation API for real-time visitor tracking
 * Each admin dashboard gets its own instance
 */

export class VisitorCoordinator {
  private state: DurableObjectState;
  private visitors: Map<string, any>;
  private visitorSockets: Map<string, WebSocket>; // Map visitor IDs to their WebSocket connections

  constructor(state: DurableObjectState) {
    this.state = state;
    this.visitors = new Map();
    this.visitorSockets = new Map();

    // Load visitors from storage on initialization
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<Map<string, any>>('visitors');
      if (stored) {
        this.visitors = new Map(stored);
      }

      // Initialize alarm for automatic visitor cleanup if not already set
      const currentAlarm = await this.state.storage.getAlarm();
      if (currentAlarm === null) {
        console.log('[VisitorCoordinator] Starting cleanup alarm (runs every 30 seconds)');
        await this.state.storage.setAlarm(Date.now() + 30 * 1000);
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle WebSocket upgrade from admin dashboard
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade(request);
    }

    // Handle visitor tracking POST
    if (request.method === 'POST') {
      return this.handleMessage(request);
    }

    return new Response('VisitorCoordinator', { status: 200 });
  }

  /**
   * Handle WebSocket upgrade from admin dashboard or visitor
   */
  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const connectionType = url.searchParams.get('connectionType') || 'dashboard';
    const visitorId = url.searchParams.get('visitorId');

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Use WebSocket Hibernation API
    this.state.acceptWebSocket(server);

    if (connectionType === 'visitor' && visitorId) {
      console.log('[VisitorCoordinator] New visitor WebSocket connection:', visitorId);

      // Attach metadata to track this as a visitor connection
      (server as any).serializeAttachment({
        connectedAt: Date.now(),
        type: 'visitor',
        visitorId,
      });

      // Store visitor WebSocket for direct messaging
      this.visitorSockets.set(visitorId, server);

      // Send confirmation
      server.send(JSON.stringify({
        type: 'CONNECTED',
        visitorId,
      }));
    } else {
      console.log('[VisitorCoordinator] New dashboard connection, current visitors:', this.visitors.size);

      // Attach metadata to track this as a dashboard connection
      (server as any).serializeAttachment({
        connectedAt: Date.now(),
        type: 'dashboard',
      });

      // Send current visitors to newly connected dashboard
      const visitorList = Array.from(this.visitors.values());
      console.log('[VisitorCoordinator] Sending INITIAL_VISITORS:', visitorList.length, 'visitors');
      server.send(JSON.stringify({
        type: 'INITIAL_VISITORS',
        visitors: visitorList,
      }));
    }

    // Ensure alarm is running when there are active connections
    const currentAlarm = await this.state.storage.getAlarm();
    if (currentAlarm === null) {
      console.log('[VisitorCoordinator] Starting cleanup alarm due to new connection');
      await this.state.storage.setAlarm(Date.now() + 30 * 1000);
    }

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  /**
   * Handle incoming messages (visitor tracking, video invites)
   */
  private async handleMessage(request: Request): Promise<Response> {
    try {
      const data = await request.json() as any;

      if (data.type === 'NEW_VISITOR') {
        await this.handleNewVisitor(data.visitor, data.event, data.website);
      } else if (data.type === 'SEND_VIDEO_INVITE') {
        await this.handleSendVideoInvite(data.visitorId, data.guestUrl, data.sessionId);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Handle new visitor event
   */
  private async handleNewVisitor(visitor: any, event: string, website: string) {
    const visitorId = visitor.visitorId;
    console.log('[VisitorCoordinator] New visitor event:', visitorId, visitor.company);

    // Update or add visitor
    if (this.visitors.has(visitorId)) {
      const existing = this.visitors.get(visitorId);
      existing.lastActivity = visitor.timestamp;
      existing.pageViews = (existing.pageViews || 1) + 1;
      this.visitors.set(visitorId, existing);
    } else {
      this.visitors.set(visitorId, {
        ...visitor,
        website,
        lastActivity: visitor.timestamp,
        pageViews: 1,
        status: 'active',
      });
    }

    // Persist to storage
    await this.state.storage.put('visitors', Array.from(this.visitors.entries()));

    // Broadcast to all connected dashboards
    this.broadcastToAll({
      type: 'VISITOR_UPDATE',
      visitor: this.visitors.get(visitorId),
      event,
    });
  }

  /**
   * Handle sending video invite to visitor
   */
  private async handleSendVideoInvite(visitorId: string, guestUrl: string, sessionId: string) {
    const visitor = this.visitors.get(visitorId);

    if (!visitor) {
      throw new Error('Visitor not found');
    }

    // Update visitor status
    visitor.status = 'video_invited';
    visitor.guestUrl = guestUrl;
    this.visitors.set(visitorId, visitor);

    // Persist
    await this.state.storage.put('visitors', Array.from(this.visitors.entries()));

    // Debug: Check all stored visitor sockets
    console.log('[VisitorCoordinator] Total visitor sockets stored:', this.visitorSockets.size);
    console.log('[VisitorCoordinator] Looking for visitor:', visitorId);
    console.log('[VisitorCoordinator] Available visitor IDs:', Array.from(this.visitorSockets.keys()));

    // Send video invite directly to visitor's WebSocket if connected
    const visitorSocket = this.visitorSockets.get(visitorId);
    if (visitorSocket) {
      console.log('[VisitorCoordinator] Found visitor socket, sending VIDEO_INVITE');
      try {
        visitorSocket.send(JSON.stringify({
          type: 'VIDEO_INVITE',
          guestUrl,
          visitorId,
          sessionId,  // Include sessionId so visitor can update status
        }));
        console.log('[VisitorCoordinator] VIDEO_INVITE sent successfully with sessionId:', sessionId);
      } catch (error) {
        console.error('[VisitorCoordinator] Error sending video invite to visitor:', error);
      }
    } else {
      console.log('[VisitorCoordinator] ⚠️ Visitor WebSocket NOT found in map!');
      console.log('[VisitorCoordinator] Trying to broadcast to all sockets as fallback...');

      // Fallback: Try to find visitor socket from Hibernation API
      const allSockets = this.state.getWebSockets();
      console.log('[VisitorCoordinator] Total active WebSockets:', allSockets.length);

      for (const ws of allSockets) {
        try {
          const attachment = (ws as any).deserializeAttachment();
          console.log('[VisitorCoordinator] Socket attachment:', attachment);

          if (attachment && attachment.type === 'visitor' && attachment.visitorId === visitorId) {
            console.log('[VisitorCoordinator] Found visitor socket via Hibernation API!');
            ws.send(JSON.stringify({
              type: 'VIDEO_INVITE',
              guestUrl,
              visitorId,
              sessionId,  // Include sessionId
            }));
            console.log('[VisitorCoordinator] VIDEO_INVITE sent via fallback method with sessionId:', sessionId);
            break;
          }
        } catch (error) {
          console.error('[VisitorCoordinator] Error in fallback method:', error);
        }
      }
    }

    // Broadcast to dashboards
    this.broadcastToDashboards({
      type: 'VIDEO_INVITE_SENT',
      visitorId,
      guestUrl,
    });
  }

  /**
   * WebSocket Hibernation API: Handle incoming WebSocket messages
   */
  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const data = JSON.parse(message as string);
      console.log('[VisitorCoordinator] WebSocket message:', data.type);

      // Handle ping/pong for keeping connection alive
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }

      // Admin can request current visitors
      if (data.type === 'GET_VISITORS') {
        const visitorList = Array.from(this.visitors.values());
        console.log('[VisitorCoordinator] Sending VISITOR_LIST:', visitorList.length, 'visitors');
        ws.send(JSON.stringify({
          type: 'VISITOR_LIST',
          visitors: visitorList,
        }));
      }
    } catch (error) {
      console.error('[VisitorCoordinator] WebSocket message error:', error);
    }
  }

  /**
   * WebSocket Hibernation API: Handle WebSocket close
   */
  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    console.log('WebSocket closed:', { code, reason, wasClean });

    // Check if this was a visitor WebSocket and remove it
    const attachment = (ws as any).deserializeAttachment();
    if (attachment && attachment.type === 'visitor' && attachment.visitorId) {
      console.log('[VisitorCoordinator] Removing visitor WebSocket:', attachment.visitorId);
      this.visitorSockets.delete(attachment.visitorId);
    }

    // Get remaining active connections
    const activeSockets = this.state.getWebSockets();
    console.log('Active WebSocket connections remaining:', activeSockets.length);

    // Cleanup if needed (e.g., stop broadcasting if no more connections)
    if (activeSockets.length === 0) {
      console.log('No more active connections, can pause updates');
    }
  }

  /**
   * WebSocket Hibernation API: Handle WebSocket error
   */
  webSocketError(ws: WebSocket, error: any) {
    console.error('WebSocket error:', error);
  }

  /**
   * Broadcast message to all connected dashboards
   */
  private broadcastToAll(message: any) {
    const sockets = this.state.getWebSockets();

    sockets.forEach((ws) => {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Broadcast error:', error);
      }
    });
  }

  /**
   * Broadcast message only to dashboard connections
   */
  private broadcastToDashboards(message: any) {
    const sockets = this.state.getWebSockets();

    sockets.forEach((ws) => {
      try {
        const attachment = (ws as any).deserializeAttachment();
        if (attachment && attachment.type === 'dashboard') {
          ws.send(JSON.stringify(message));
        }
      } catch (error) {
        console.error('Broadcast error:', error);
      }
    });
  }

  /**
   * Alarm handler for cleanup
   * Removes inactive visitors after 1 minute (visitors who left the site)
   */
  async alarm() {
    const now = Date.now();
    const oneMinute = 60 * 1000; // 1 minute in milliseconds
    let removedCount = 0;

    console.log('[VisitorCoordinator] Running cleanup alarm, checking', this.visitors.size, 'visitors');

    for (const [visitorId, visitor] of this.visitors.entries()) {
      const lastActivity = new Date(visitor.lastActivity).getTime();
      const inactiveTime = now - lastActivity;

      if (inactiveTime > oneMinute) {
        console.log('[VisitorCoordinator] Removing inactive visitor:', visitor.company, 'inactive for', Math.round(inactiveTime / 1000), 'seconds');
        this.visitors.delete(visitorId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log('[VisitorCoordinator] Removed', removedCount, 'inactive visitors');

      // Broadcast updated visitor list to all connected dashboards
      this.broadcastToAll({
        type: 'VISITOR_LIST',
        visitors: Array.from(this.visitors.values()),
      });
    }

    // Persist updated visitors
    await this.state.storage.put('visitors', Array.from(this.visitors.entries()));

    // Only reschedule alarm if there are active connections or visitors
    const activeSockets = this.state.getWebSockets();
    if (activeSockets.length > 0 || this.visitors.size > 0) {
      console.log('[VisitorCoordinator] Rescheduling alarm - Active connections:', activeSockets.length, 'Visitors:', this.visitors.size);
      await this.state.storage.setAlarm(Date.now() + 30 * 1000);
    } else {
      console.log('[VisitorCoordinator] No active connections or visitors - stopping alarm');
      // Alarm will restart when new connection is made
    }
  }
}
