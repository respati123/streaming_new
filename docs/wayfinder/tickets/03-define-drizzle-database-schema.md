# Ticket 03: Define Drizzle Database Schema

**Type:** `wayfinder:task`  
**Status:** Closed (Resolved)  
**Resolution:** Defined production Drizzle schemas for `users` (OAuth/YouTube metadata), `donations`, `streamGoals`, `streamSettings`, and `streamerbotActions` with relations and typed inference in `backend/src/core/database/schema.ts`. Initial seed data configured and 32 unit/integration tests passing.  
**Parent Map:** [Wayfinder Map](../map.md)  
**Unblocked:** [Ticket 05](05-implement-google-oauth-youtube-channel-fetch.md), [Ticket 06](06-implement-donation-processing-and-mock-gateway.md)

---

## Question / Objective

What is the optimal Drizzle ORM schema for storing stream settings, user credentials (Google OAuth / YouTube channel metadata), donation transactions, sub goals, and alert logs?

## Schema Specs

- `users` (id, google_id, email, display_name, youtube_channel_id, youtube_handle, youtube_avatar, role: 'admin' | 'viewer', created_at)
- `donations` (id, user_id, donor_name, donor_email, amount, currency, message, status: 'pending' | 'completed' | 'failed', payment_method, streamerbot_triggered_at, created_at)
- `stream_goals` (id, title, target_amount, current_amount, goal_type: 'donation' | 'sub', is_active, created_at, updated_at)
- `streamerbot_actions` (id, action_id, name, description, trigger_type, enabled)
