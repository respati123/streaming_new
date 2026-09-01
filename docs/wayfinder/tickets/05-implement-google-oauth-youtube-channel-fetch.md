# Ticket 05: Implement Google OAuth & YouTube Channel Fetch

**Type:** `wayfinder:task`  
**Status:** Blocked (by [Ticket 03](03-define-drizzle-database-schema.md))  
**Parent Map:** [Wayfinder Map](../map.md)  
**Blocks:** [Ticket 08](08-build-fe-viewer-donation-portal.md)

---

## Question / Objective

How to implement Google OAuth 2.0 with YouTube Data API v3 integration to seamlessly authenticate viewers and automatically extract their YouTube handle (`@username`) or channel title?

## Checklist

- [ ] Google OAuth URL generation with scopes: `openid`, `email`, `profile`, `https://www.googleapis.com/auth/youtube.readonly`.
- [ ] OAuth Callback handler: Exchange code for tokens, fetch Google Profile.
- [ ] Call `GET https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true` with access token.
- [ ] Fallback: If `items` array is empty (user has no channel), use Google Display Name.
- [ ] Issue JWT session cookie/token to client.
