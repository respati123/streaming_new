# Ticket 02: Research Streamer.bot WebSocket Client Protocol

**Type:** `wayfinder:research`  
**Status:** Closed (Resolved)  
**Resolution Findings:** Detailed API reference, event shapes, action triggers, and reconnect patterns documented at [streamerbot-client-protocol.md](../research/streamerbot-client-protocol.md).  
**Parent Map:** [Wayfinder Map](../map.md)  
**Unblocked:** [Ticket 04](04-implement-streamerbot-backend-gateway-service.md)

---

## Question

What is the exact API, event subscription model, payload format, and best practice for interacting with a local Streamer.bot instance via `@streamerbot/client` (or raw WebSocket) in a Node.js/Bun TypeScript backend?

## Areas of Investigation

1. How `@streamerbot/client` initializes (`new StreamerbotClient({ host: '127.0.0.1', port: 8080 })`).
2. How to subscribe to YouTube events (e.g. `YouTube.SuperChat`, `YouTube.NewSponsor`, `YouTube.Message`, `Twitch.Cheer`).
3. How to trigger/execute actions in Streamer.bot programmatically (`client.doAction(...)` or `client.executeAction(...)`) and pass arguments (e.g. `donorName`, `amount`, `message`).
4. Reconnection handling and health checking when Streamer.bot is closed or reloaded on Windows.
