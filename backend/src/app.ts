import { env } from '@core/config/env';
import { ErrorCode } from '@core/constants/error-codes.constant';
import { checkDatabaseHealth } from '@core/database';
import { t } from '@core/i18n/i18n';
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@core/i18n/i18n.types';
import { corsMiddleware } from '@core/middlewares/cors.middleware';
import { errorHandler } from '@core/middlewares/error.middleware';
import { i18nMiddleware } from '@core/middlewares/i18n.middleware';
import { requestLoggerMiddleware } from '@core/middlewares/logger.middleware';
import { rateLimiter } from '@core/middlewares/rate-limit.middleware';
import { requestIdMiddleware } from '@core/middlewares/request-id.middleware';
import type { AppEnvironment } from '@core/types/context.types';
import { sendSuccess } from '@core/utils/response.util';
import { authController } from '@modules/auth/auth.controller';
import { streamerbotController } from '@modules/streamerbot/streamerbot.controller';
import { streamsController } from '@modules/streams/streams.controller';
import { handleWebSocket } from '@core/ws/websocket.server';
import { wsHub } from '@core/ws/websocket.hub';
import { auth } from '@core/auth/better-auth';
import { apiReference } from '@scalar/hono-api-reference';
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';

export function createApp() {
  const app = new Hono<AppEnvironment>();

  app.use('*', requestIdMiddleware);
  app.use('*', i18nMiddleware);
  app.use('*', secureHeaders());
  app.use('*', corsMiddleware);
  app.use('*', requestLoggerMiddleware);

  app.use('*', rateLimiter({ windowMs: 60 * 1000, max: 120 }));

  app.use(
    '/api/v1/auth/*',
    rateLimiter({
      windowMs: 60 * 1000,
      max: 25,
      message: 'Too many authentication attempts. Please try again after 1 minute.',
    })
  );

  // ─── BETTER AUTH (Google OAuth & Audience Social Auth) ───────────────────
  app.all('/api/auth/*', (c) => auth.handler(c.req.raw));

  app.onError(errorHandler);
  app.notFound((c) => {
    const requestId = c.get('requestId') || 'unknown';
    const language: SupportedLanguage = c.get('language') || DEFAULT_LANGUAGE;

    return c.json(
      {
        success: false,
        message: t(language, 'errors.routeNotFound', { method: c.req.method, path: c.req.path }),
        statusCode: 404,
        code: ErrorCode.NOT_FOUND,
        requestId,
      },
      404
    );
  });

  app.get('/health', async (c) => {
    const dbHealth = await checkDatabaseHealth();

    const isHealthy = dbHealth.isHealthy;
    const statusCode = isHealthy ? 200 : 503;

    return sendSuccess(
      c,
      {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        database: {
          status: dbHealth.isHealthy ? 'connected' : 'disconnected',
          latencyMs: dbHealth.latencyMs,
        },
        environment: env.NODE_ENV,
        appName: env.APP_NAME,
      },
      isHealthy ? 'success.healthCheck' : 'errors.databaseUnavailable',
      statusCode
    );
  });

  app.get(
    '/docs',
    apiReference({
      theme: 'saturn',
      layout: 'modern',
      spec: {
        content: {
          openapi: '3.1.0',
          info: {
            title: 'Enterprise Hono + Bun API Reference',
            version: '1.0.0',
            description:
              'Comprehensive REST API documentation for authentication, user management, and product catalog.',
          },
          paths: {
            '/health': {
              get: {
                summary: 'Service Health Check',
                responses: {
                  '200': {
                    description: 'System health metrics & database ping',
                  },
                },
              },
            },
            '/api/v1/auth/register': {
              post: {
                summary: 'Register New Account',
                responses: {
                  '201': {
                    description: 'User account created with access/refresh tokens',
                  },
                },
              },
            },
            '/api/v1/auth/login': {
              post: {
                summary: 'User Login',
                responses: {
                  '200': { description: 'Authenticated with token pair' },
                },
              },
            },
            '/api/v1/auth/refresh': {
              post: {
                summary: 'Refresh Token Rotation',
                responses: { '200': { description: 'New token pair issued' } },
              },
            },
            '/api/v1/auth/me': {
              get: {
                summary: 'Get Current Profile (Bearer Auth)',
                responses: {
                  '200': { description: 'Authenticated user profile' },
                },
              },
            },
          },
        },
      },
    })
  );

  const apiRouter = new Hono<AppEnvironment>();
  apiRouter.route('/auth', authController);
  apiRouter.route('/streamerbot', streamerbotController);
  apiRouter.route('/streams', streamsController);

  apiRouter.get('/ws/stats', (c) => sendSuccess(c, wsHub.getStats(), 'WebSocket stats retrieved successfully'));

  app.route(env.API_PREFIX, apiRouter);

  // WebSocket Endpoints for Frontend Dashboard & OBS Overlay
  app.get('/ws', handleWebSocket);
  app.get(`${env.API_PREFIX}/ws`, handleWebSocket);

  return app;
}

export const app = createApp();
