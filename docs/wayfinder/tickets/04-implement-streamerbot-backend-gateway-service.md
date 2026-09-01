# Ticket 04: Implement Streamer.bot Backend Gateway Service

**Type:** `wayfinder:task`  
**Status:** Closed (Resolved)  
**Resolution:** Built `StreamerbotService` singleton with auto-reconnect, typed event handlers, `doAction()`, `triggerDonationAlert()`, REST controller at `/api/v1/streamerbot/*`, and Server-Sent Events (SSE) stream at `/api/v1/streamerbot/events/stream` for OBS overlay. 35/35 tests passing.  
**Parent Map:** [Wayfinder Map](../map.md)  
**Unblocked:** [Ticket 06](06-implement-donation-processing-and-mock-gateway.md), [Ticket 09](09-build-fe-streamer-admin-dashboard.md)

---

## Question / Objective

How to build a resilient, auto-reconnecting Streamer.bot WebSocket gateway inside Hono v4 (Bun) with an internal event bus to dispatch events to connected frontend clients?

## Checklist

- [ ] Create `StreamerbotService` singleton with connection state management (connected, disconnected, reconnecting).
- [ ] Implement `doAction(actionNameOrId, args)` wrapper.
- [ ] Implement event listeners (YouTube SuperChat, Subscriber, Message).
- [ ] Expose REST / WebSocket endpoints for frontend clients to check Streamer.bot connection status and list available actions.
