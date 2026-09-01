# Ticket 01: Scaffold Boilerplate into Streaming Repo

**Type:** `wayfinder:task`  
**Status:** Closed (Resolved)  
**Resolution:** Boilerplate monorepo structure copied from `/home/respati/Projects/ai-playground/boilerplate`. Git repo initialized, `@streamerbot/client` added to backend, and all dependencies installed cleanly with Bun.  
**Parent Map:** [Wayfinder Map](../map.md)  
**Unblocked:** [Ticket 03](03-define-drizzle-database-schema.md), [Ticket 04](04-implement-streamerbot-backend-gateway-service.md), [Ticket 07](07-build-fe-obs-overlay-page.md)

---

## Question / Objective

How do we cleanly bring over the monorepo structure from `/home/respati/Projects/ai-playground/boilerplate` into the current `streaming` repository while preserving `stream-hub.pen` and tailoring dependencies for Streamer.bot integration?

## Scope & Execution Checklist

- [ ] Copy `backend/`, `frontend/`, root configuration files (`package.json`, `docker-compose.yml`, `biome.json`, `.env.example`).
- [ ] Preserve existing `stream-hub.pen` and `.scratch/` directories.
- [ ] Add `@streamerbot/client` and WebSocket packages to `backend/package.json`.
- [ ] Initialize git repository and verify clean installation via `bun install`.
