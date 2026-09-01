# Wayfinder Map: Personal Stream Dashboard & Streamer.bot Integration

**Label:** `wayfinder:map`  
**Status:** Charted (Active)  
**Corpus / Project:** `streaming`

---

## Destination

A production-grade fullstack streaming web application built on Bun Monorepo (Hono v4 + Drizzle ORM + React 18 Vite) integrating with a local **Streamer.bot** WebSocket instance. The app provides:
1. **Streamer Admin Dashboard** (`/admin`): Live monitoring, action triggers, goal manager, and donation logs.
2. **Viewer Donation Portal** (`/donate`): Google OAuth / YouTube channel identity login with mock/live payment flows.
3. **Real-time OBS Overlay** (`/overlay`): 100% transparent browser source reflecting live chat, donation toasts, goal bars, and webcam frames designed in `stream-hub.pen`.

---

## Notes

- **Boilerplate Base:** Derived from `/home/respati/Projects/ai-playground/boilerplate` (Bun, Hono v4 Clean Architecture, Drizzle ORM, React 18 MVVM, Tailwind CSS, Biome).
- **Core Integrations:**
  - Streamer.bot WebSocket API via `@streamerbot/client` (or standard WS).
  - Google OAuth 2.0 + YouTube Data API v3 (`channels.list?part=snippet&mine=true`).
  - WebSockets / SSE for real-time OBS alert broadcasting.
  - Modular Payment Gateway adapter (starting with Sandbox/Mock simulator).
- **Relevant Skills:** `wayfinder`, `impeccable`, `hono`, `backend-rules-typescript`, `frontend-rules-typescript`.

---

## Decisions so far

- **[Dual Interface Architecture](tickets/00-decision-dual-interface.md)** — Settled on combined Admin Control + Viewer Portal + OBS Overlay.
- **[Backend Gateway Model](tickets/00-decision-backend-gateway.md)** — Backend Hono acts as central hub connecting to Streamer.bot WebSocket, DB, and OAuth.
- **[Monorepo Tech Stack](tickets/00-decision-tech-stack.md)** — Bun Monorepo + Hono v4 (Clean Architecture) + Drizzle ORM + React 18 Vite + Tailwind.
- **[Sandbox Payment Simulator](tickets/00-decision-payment-gateway.md)** — Start with Mock QRIS/Payment Simulator before hooking live third-party merchant APIs.
- **[Ticket 01: Scaffold Boilerplate Monorepo](tickets/01-scaffold-boilerplate-into-streaming-repo.md)** — Successfully set up Bun monorepo (`backend` + `frontend`) with `@streamerbot/client`.
- **[Ticket 02: Streamerbot WebSocket Protocol](tickets/02-research-streamerbot-websocket-client-protocol.md)** — Completed deep-dive research into `@streamerbot/client` event subscription, action triggers, and payload structures.
- **[Ticket 03: Define Drizzle Database Schema](tickets/03-define-drizzle-database-schema.md)** — Defined typed schemas for `users` (OAuth/YouTube metadata), `donations`, `streamGoals`, `streamSettings`, and `streamerbotActions`.
- **[Ticket 04: Streamer.bot Backend Gateway Service](tickets/04-implement-streamerbot-backend-gateway-service.md)** — Built singleton `StreamerbotService` with auto-reconnect, action execution, REST controller, and SSE event streaming.

---

## Frontier (Open & Unblocked Tickets)

- ⏳ **[06-implement-donation-processing-and-mock-gateway](tickets/06-implement-donation-processing-and-mock-gateway.md)** (`wayfinder:task`) — Implement donation submission, sandbox QRIS simulator, goal progress increment, and alert broadcasting.
- ⏳ **[05-implement-google-oauth-youtube-channel-fetch](tickets/05-implement-google-oauth-youtube-channel-fetch.md)** (`wayfinder:task`) — Implement Google OAuth login endpoint + YouTube Data API channel lookup fallback.
- ⏳ **[09-build-fe-streamer-admin-dashboard](tickets/09-build-fe-streamer-admin-dashboard.md)** (`wayfinder:task`) — Build `/admin` streamer control deck (Streamer.bot connection widget, action deck buttons, alert replay).

---

## Blocked Tickets

- 🔒 **[07-build-fe-obs-overlay-page](tickets/07-build-fe-obs-overlay-page.md)** (`wayfinder:task`) — Blocked by `06-implement-donation-processing-and-mock-gateway`.
- 🔒 **[08-build-fe-viewer-donation-portal](tickets/08-build-fe-viewer-donation-portal.md)** (`wayfinder:task`) — Blocked by `05-implement-google-oauth-youtube-channel-fetch`, `06-implement-donation-processing-and-mock-gateway`.

---

## Not yet specified (Fog of War)

- Twitch / Multi-platform account linking if expanding beyond YouTube.
- Live Chat sentiment analysis or AI TTS voice synthesis integration via Streamer.bot.
- Automated VOD / Clip bookmarking triggers.

---

## Out of scope

- Video encoding / RTMP transcoding inside the web app (handled natively by OBS Studio).
- Direct credit card PCI-DSS vaulting (handled strictly via external payment gateways/simulators).
