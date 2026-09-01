# Ticket 08: Build Frontend Viewer Donation Portal

**Type:** `wayfinder:task`  
**Status:** Blocked (by [Ticket 05](05-implement-google-oauth-youtube-channel-fetch.md), [Ticket 06](06-implement-donation-processing-and-mock-gateway.md))  
**Parent Map:** [Wayfinder Map](../map.md)

---

## Question / Objective

How to build a clean, engaging viewer-facing `/donate` web page where viewers can log in with Google, see their YouTube handle/avatar, choose donation amounts, write messages, and complete payments?

## Key Features

- Clean Hero with Streamer Banner & Active Goal progress.
- "Sign in with Google" button with profile pill showing `@youtube_handle` once authenticated.
- Quick preset buttons (Rp 10.000, Rp 25.000, Rp 50.000, Rp 100.000, Custom).
- Message text area with character counter and emoji picker.
- Payment modal showing QRIS / Sandbox simulator button with instant live feedback.
