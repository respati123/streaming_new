# 04 - Structured Logging & Request ID Tracing

Observability and distributed tracing require structured logs with correlated Request IDs across all layers.

---

## 🔍 Request ID Tracing Flow

```
Client Request  ────────► [request-id.middleware]
                              │ (Reads or generates UUID v4)
                              ▼
                         Sets c.set('requestId', uuid)
                         Sets X-Request-Id Response Header
                              │
                              ▼
                         [requestLoggerMiddleware] ──► Logs { requestId, method, path, ... }
                              │
                              ▼
                         [Controllers & Services] ────► logger.info("Event", { requestId })
                              │
                              ▼
                         [errorHandler] ──────────────► Returns { success: false, requestId, ... }
```

---

## 📊 Structured JSON Format (Production)

In production (`NODE_ENV=production`), logs are emitted as single-line valid JSON objects parsed easily by Datadog, AWS CloudWatch, Grafana Loki, or GCP Cloud Logging:

```json
{
  "timestamp": "2026-08-28T10:50:00.123Z",
  "level": "INFO",
  "appName": "Enterprise-Hono-Backend",
  "environment": "production",
  "message": "POST /api/v1/auth/login -> 200 (12.4ms)",
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "method": "POST",
  "path": "/api/v1/auth/login",
  "statusCode": 200,
  "durationMs": 12.4,
  "clientIp": "192.168.1.1"
}
```

---

## 💻 Developer Mode Formatting (Development)

In development (`NODE_ENV=development`), logs are colorized and formatted for human readability while preserving Request ID tags:

```text
2026-08-28T10:50:00.123Z [INFO] [9b1deb4d] POST /api/v1/auth/login -> 200 (12.4ms)
```

---

## 🛠️ Using the Logger in Services

```typescript
import { logger } from '@core/logger/logger';

// Info with context
logger.info('User created successfully', { userId: user.id, email: user.email });

// Error with stack trace
logger.error('Database connection failed', { databaseUrl }, err);
```
