# Ticket 06: Implement Donation Processing & Mock Payment Gateway

**Type:** `wayfinder:task`  
**Status:** Blocked (by [Ticket 04](04-implement-streamerbot-backend-gateway-service.md), [Ticket 03](03-define-drizzle-database-schema.md))  
**Parent Map:** [Wayfinder Map](../map.md)  
**Blocks:** [Ticket 07](07-build-fe-obs-overlay-page.md), [Ticket 08](08-build-fe-viewer-donation-portal.md), [Ticket 09](09-build-fe-streamer-admin-dashboard.md)

---

## Question / Objective

How to build a flexible donation transaction pipeline that supports sandbox simulation (instant pay trigger) and modular live gateway adapters, automatically dispatching alerts to Streamer.bot and OBS WebSocket clients upon payment success?

## Checklist

- [ ] Create `POST /api/donations` (donor name, amount, message, payment method).
- [ ] Create `POST /api/donations/:id/simulate-pay` (sandbox trigger for testing).
- [ ] On completion:
  1. Update donation status to `completed` in Drizzle DB.
  2. Increment active Sub/Donation Goal.
  3. Call `StreamerbotService.doAction("Donation Alert", { donorName, amount, message })`.
  4. Broadcast event payload to connected `/overlay` WebSocket/SSE clients.
