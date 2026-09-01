# Streamer.bot WebSocket Client Protocol & Integration Guide

**Status:** Completed  
**Target:** Node.js / Bun backend (Hono v4) & Frontend overlays  
**Package:** `@streamerbot/client` (v1.x / v2 WebSocket protocol compatible)  
**Ticket:** [Ticket 02](file:///home/respati/Projects/ai-playground/streaming/docs/wayfinder/tickets/02-research-streamerbot-websocket-client-protocol.md)

---

## 1. Overview & Protocol Architecture

Streamer.bot exposes a full-duplex WebSocket server (default: `127.0.0.1:8080`) that allows external applications to:
1. **Execute actions** dynamically with custom variables/arguments.
2. **Subscribe to live broadcast events** across streaming platforms (YouTube, Twitch, Discord, OBS, MIDI, etc.).
3. **Query internal state** (actions, events, broadcaster profile, credits, variables).

The official `@streamerbot/client` package is an isomorphic TypeScript library running on both Node.js/Bun and modern browsers. It wraps Streamer.bot's JSON-RPC-style WebSocket protocol, handles authentication handshakes, manages auto-reconnection, and provides typed event subscriptions and action execution methods.

---

## 2. Installation & Client Initialization

### 2.1 Package Installation
```bash
# Bun Monorepo in backend/
bun add @streamerbot/client
```

### 2.2 Client Initialization Options

```typescript
import { StreamerbotClient } from '@streamerbot/client';

export const streamerbot = new StreamerbotClient({
  host: '127.0.0.1',        // Streamer.bot WebSocket host (default: '127.0.0.1')
  port: 8080,               // Streamer.bot WebSocket port (default: 8080)
  endpoint: '/',            // WebSocket endpoint path (default: '/')
  password: process.env.STREAMERBOT_PASSWORD || undefined, // Required if auth is enabled in Streamer.bot
  autoReconnect: true,      // Automatically attempt reconnection on disconnect (default: true)
  retries: -1,              // Max reconnection attempts (-1 = infinite)
  immediate: true,          // Automatically establish connection upon instantiation (default: true)
  subscribe: '*',           // Optional initial subscription ('*' for all or custom object)
  onConnect: (info) => {
    console.log('[StreamerbotClient] Connected to Streamer.bot WebSocket server', info);
  },
  onDisconnect: () => {
    console.warn('[StreamerbotClient] Disconnected from Streamer.bot');
  },
  onError: (error) => {
    console.error('[StreamerbotClient] WebSocket Error:', error);
  }
});
```

---

## 3. Event Subscription Model & Payload Shapes

```typescript
// Specific YouTube events
client.on('YouTube.SuperChat', (eventPayload) => {
  console.log('SuperChat received:', eventPayload.data);
});

// YouTube Chat Messages
client.on('YouTube.Message', (eventPayload) => {
  console.log('Live Chat Message:', eventPayload.data);
});
```

---

## 4. Action Execution (`doAction`) & Argument Passing

```typescript
// Execute by Action Name or UUID with custom arguments
await client.doAction('Alert_Donation', {
  donorName: 'Budi Santoso',
  amount: 50000,
  currency: 'IDR',
  message: 'Semangat live-nya kak!'
});
```

Arguments are injected into Streamer.bot as `%donorName%`, `%amount%`, `%currency%`, `%message%`.
