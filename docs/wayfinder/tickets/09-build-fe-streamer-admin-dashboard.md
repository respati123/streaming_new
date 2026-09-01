# Ticket 09: Build Frontend Streamer Admin Dashboard

**Type:** `wayfinder:task`  
**Status:** Blocked (by [Ticket 04](04-implement-streamerbot-backend-gateway-service.md), [Ticket 06](06-implement-donation-processing-and-mock-gateway.md))  
**Parent Map:** [Wayfinder Map](../map.md)

---

## Question / Objective

How to build a dense, high-utility streamer control panel at `/admin` to monitor Streamer.bot connectivity, trigger actions on demand, replay alerts, and manage goals/donation logs?

## Key Panels

- **Connection Status Widget:** Live indicator for Streamer.bot WS (`127.0.0.1:8080`), backend API, and connected overlay clients.
- **Action Deck Grid:** Interactive buttons to trigger any Streamer.bot Action manually (Sound effects, Scene Switch, Shoutout).
- **Recent Donations Feed:** Real-time table of incoming donations with "Replay Alert" and "Mark as Read" actions.
- **Goal Manager:** Create and update active Sub Goals / Donation Goals live.
