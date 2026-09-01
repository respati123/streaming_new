# 03 - JWT Authentication & Security Architecture

Security is central to enterprise architecture. This boilerplate implements an industry-standard **Dual-Token (Access + Refresh Token Rotation)** architecture and **Argon2id** password hashing.

---

## 🔐 Dual-Token Architecture

```
┌─────────────────┐                                  ┌─────────────────┐
│     CLIENT      │                                  │     SERVER      │
└────────┬────────┘                                  └────────┬────────┘
         │                                                    │
         │  1. POST /login (email, password)                  │
         ├───────────────────────────────────────────────────►│
         │  2. Return: { accessToken (15m), refreshToken (7d) }│
         │◄───────────────────────────────────────────────────┤ (Stores Refresh Token Hash in DB)
         │                                                    │
         │  3. GET /protected (Authorization: Bearer <token>) │
         ├───────────────────────────────────────────────────►│
         │  4. Returns protected resource                     │
         │◄───────────────────────────────────────────────────┤
         │                                                    │
         │  5. Access Token Expires (401 Unauthorized)        │
         ├───────────────────────────────────────────────────►│
         │                                                    │
         │  6. POST /refresh { refreshToken }                 │
         ├───────────────────────────────────────────────────►│
         │  7. Old Token Revoked -> New Token Pair Issued     │
         │◄───────────────────────────────────────────────────┤ (Token Rotation Protection)
```

---

## 1. Access Token (Short-Lived: 15 minutes)
- Encoded using **Web Crypto `jose`** with `HS256`.
- Contains identity payload: `id`, `email`, `name`, `role`.
- Stateless: Verified using CPU signature checks without database lookups on every single request.

---

## 2. Refresh Token Rotation (Long-Lived: 7 days)
- Long-lived random cryptographic token.
- Stored as a **SHA-256 hash** in PostgreSQL (`refresh_tokens` table).
- **Rotation Rule**: When a refresh token is used, it is immediately revoked (`is_revoked = true`) and a new pair is issued.
- **Reuse Detection**: If a revoked refresh token is presented, the system detects a token theft attempt and invalidates **all** active tokens for that user account.

---

## 3. Password Hashing (Argon2id)
Passwords are never stored in plaintext. Bun's native `Bun.password.hash` uses **Argon2id** (winner of the Password Hashing Competition):

```typescript
const hash = await Bun.password.hash(password, {
  algorithm: 'argon2id',
  memoryCost: 65536,
  timeCost: 2,
});
```
