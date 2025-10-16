# Tippen Cloudflare Backend

Real-time visitor tracking backend powered by Cloudflare Workers and Durable Objects with WebSocket Hibernation.

## Architecture

- **Cloudflare Worker**: Edge-deployed serverless functions handling HTTP requests
- **Durable Objects**: Stateful coordination for real-time visitor tracking
- **WebSocket Hibernation**: Cost-effective persistent connections to admin dashboards

## Features

- Real-time visitor detection and tracking
- WebSocket connections for live dashboard updates
- Video invite delivery to visitor browsers
- Automatic visitor cleanup (inactive after 30 minutes)
- Company data enrichment via IP lookup

## Endpoints

### 1. Visitor Tracking
```
POST /track/visitor
Content-Type: application/json
X-Tippen-API-Key: your_api_key

{
  "event": "pageview",
  "visitor": {
    "visitorId": "visitor_123",
    "url": "https://example.com/page",
    "referrer": "https://google.com",
    "userAgent": "...",
    "timestamp": "2025-10-16T..."
  },
  "website": "example.com"
}
```

### 2. WebSocket Connection (Admin Dashboard)
```
GET /ws/dashboard?apiKey=your_api_key
Upgrade: websocket
```

**Incoming Messages:**
- `INITIAL_VISITORS` - List of all active visitors when dashboard connects
- `VISITOR_UPDATE` - Real-time visitor activity updates
- `VIDEO_INVITE_SENT` - Confirmation when video invite is delivered

**Outgoing Messages:**
- `PING` - Keep-alive ping (dashboard → worker)
- `GET_VISITORS` - Request current visitor list

### 3. Video Invite
```
POST /api/send-video-invite
Content-Type: application/json

{
  "apiKey": "your_api_key",
  "visitorId": "visitor_123",
  "guestUrl": "https://app.customerconnect.live/..."
}
```

## Setup

### 1. Install Dependencies
```bash
cd cloudflare-backend
npm install
```

### 2. Configure Wrangler
Create `wrangler.toml`:
```toml
name = "tippen-backend"
main = "src/index.ts"
compatibility_date = "2025-01-16"

[[durable_objects.bindings]]
name = "VISITOR_COORDINATOR"
class_name = "VisitorCoordinator"
script_name = "tippen-backend"

[[migrations]]
tag = "v1"
new_classes = ["VisitorCoordinator"]

[env.production]
vars = { ENVIRONMENT = "production" }
```

### 3. Development
```bash
# Start local development server
npm run dev

# Runs on http://localhost:8787
```

### 4. Deploy
```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## Environment Variables

Set via Cloudflare Dashboard or `wrangler secret`:

```bash
# Optional: Clearbit API key for company enrichment
wrangler secret put CLEARBIT_API_KEY
```

## Durable Object: VisitorCoordinator

Each API key gets its own Durable Object instance for isolated visitor tracking.

### State Management
- Visitors stored in memory (`Map<string, Visitor>`)
- Persisted to Durable Object storage
- Automatic cleanup via alarm handler (every 5 minutes)

### WebSocket Hibernation
Uses Cloudflare's WebSocket Hibernation API for cost-effective real-time connections:

```typescript
// Accept WebSocket connection
this.state.acceptWebSocket(server);

// Handler methods
webSocketMessage(ws: WebSocket, message: string | ArrayBuffer)
webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean)
webSocketError(ws: WebSocket, error: any)

// Broadcast to all connected dashboards
const sockets = this.state.getWebSockets();
sockets.forEach(ws => ws.send(JSON.stringify(message)));
```

## Testing Locally

### 1. Start Backend
```bash
cd cloudflare-backend
npm run dev
# Running on localhost:8787
```

### 2. Test Visitor Tracking
```bash
curl -X POST http://localhost:8787/track/visitor \
  -H "Content-Type: application/json" \
  -H "X-Tippen-API-Key: demo_api_key" \
  -d '{
    "event": "pageview",
    "visitor": {
      "visitorId": "test_visitor_1",
      "url": "https://example.com/products",
      "timestamp": "2025-10-16T12:00:00Z"
    },
    "website": "example.com"
  }'
```

### 3. Connect Dashboard WebSocket
Open browser console and connect:
```javascript
const ws = new WebSocket('ws://localhost:8787/ws/dashboard?apiKey=demo_api_key');

ws.onopen = () => {
  console.log('Connected to Tippen backend');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// Send ping to keep connection alive
setInterval(() => {
  ws.send(JSON.stringify({ type: 'PING' }));
}, 30000);
```

### 4. Test Video Invite
```bash
curl -X POST http://localhost:8787/api/send-video-invite \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "demo_api_key",
    "visitorId": "test_visitor_1",
    "guestUrl": "https://app.customerconnect.live/public/demo/guest/..."
  }'
```

## Integration with Frontend

Update [.env.example](../.env.example) in the Tippen React app:

```bash
# Local development
VITE_VISITOR_WS_URL=ws://localhost:8787/ws/dashboard
VITE_TIPPEN_API_KEY=demo_api_key

# Production
VITE_VISITOR_WS_URL=wss://tippen-backend.your-subdomain.workers.dev/ws/dashboard
VITE_TIPPEN_API_KEY=your_production_api_key
```

The React app will automatically connect to the WebSocket and display real-time visitors.

## Tracking Script Deployment

Embed the tracking script on client websites:

```html
<script src="https://your-cdn.com/tippen-tracker.js" data-tippen-api-key="client_api_key"></script>
```

The tracking script ([../public/tippen-tracker.js](../public/tippen-tracker.js)):
1. Detects visitor activity
2. Sends pings to `/track/visitor` endpoint
3. Listens for video invite messages via `postMessage`
4. Shows video popup when invite received

## Cost Optimization

### WebSocket Hibernation Benefits
- **Reduced GB-seconds**: Connections are "hibernated" when idle
- **Automatic scaling**: No connection limits
- **Global edge network**: Low latency worldwide

### Best Practices
- Use single Durable Object per API key (not per visitor)
- Leverage alarm handler for batch cleanup
- Set appropriate WebSocket ping intervals (30 seconds recommended)

## Monitoring

View logs in Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select `tippen-backend`
3. Click "Logs" tab
4. Real-time tail: `wrangler tail`

## Security

- API key validation on all requests
- CORS headers for web client access
- Rate limiting (configure in Cloudflare Dashboard)
- Input validation and sanitization

## Troubleshooting

### WebSocket Not Connecting
- Check CORS headers are set correctly
- Verify API key matches
- Ensure WebSocket upgrade header is present

### Visitors Not Appearing
- Check tracking script is loaded on client website
- Verify API key in tracking script matches backend
- Check browser console for CORS errors
- Review Cloudflare Worker logs

### Video Invite Not Showing
- Confirm visitor's WebSocket connection is active
- Check postMessage origin validation in tracking script
- Verify guestUrl is valid from Customer Connect API

## Further Reading

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/durable-objects/)
- [WebSocket Hibernation](https://developers.cloudflare.com/durable-objects/api/websockets/)
